const express = require('express');
const { mockDB, uuidv4 } = require('../data/mockData');
const { requireRole } = require('../middleware/auth');
const router = express.Router();

// Create new contract (agents only, when accepting proposal)
router.post('/', requireRole(['agent']), async (req, res) => {
  try {
    const { proposalId, terms } = req.body;
    
    if (!proposalId) {
      return res.status(400).json({
        success: false,
        message: 'Proposal ID is required'
      });
    }
    
    const proposal = mockDB.proposals.get(proposalId);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }
    
    const job = mockDB.jobs.get(proposal.jobId);
    if (!job || job.agentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create contract for this proposal'
      });
    }
    
    // Update proposal status to accepted
    proposal.status = 'accepted';
    proposal.respondedAt = new Date().toISOString();
    mockDB.proposals.set(proposalId, proposal);
    
    const newContract = {
      id: uuidv4(),
      jobId: proposal.jobId,
      workerId: proposal.workerId,
      agentId: req.user.id,
      status: 'active',
      terms: {
        scope: terms?.scope || job.description,
        deliverables: terms?.deliverables || [job.title],
        revisionLimit: terms?.revisionLimit || 3,
        paymentSchedule: terms?.paymentSchedule || 'completion',
        cancellationPolicy: terms?.cancellationPolicy || 'Standard cancellation policy applies'
      },
      milestones: terms?.milestones || [{
        id: uuidv4(),
        title: 'Project Completion',
        description: 'Complete project according to specifications',
        amount: job.budget.type === 'fixed' ? job.budget.max : 0,
        dueDate: job.deadline,
        status: 'pending'
      }],
      startDate: new Date().toISOString(),
      endDate: null,
      totalAmount: job.budget.type === 'fixed' ? job.budget.max : (proposal.proposedRate * proposal.estimatedDuration),
      paidAmount: 0,
      createdAt: new Date().toISOString()
    };
    
    mockDB.contracts.set(newContract.id, newContract);
    
    // Update job status
    job.status = 'assigned';
    mockDB.jobs.set(job.id, job);
    
    res.status(201).json({
      success: true,
      data: newContract,
      message: 'Contract created successfully'
    });
  } catch (error) {
    console.error('Create contract error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get contract by ID
router.get('/:contractId', async (req, res) => {
  try {
    const { contractId } = req.params;
    const contract = mockDB.contracts.get(contractId);
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }
    
    // Check authorization
    const isAgent = contract.agentId === req.user.id;
    const isWorker = contract.workerId === req.user.id;
    
    if (!isAgent && !isWorker) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this contract'
      });
    }
    
    const job = mockDB.jobs.get(contract.jobId);
    
    res.json({
      success: true,
      data: {
        ...contract,
        job
      }
    });
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update contract status
router.patch('/:contractId/status', async (req, res) => {
  try {
    const { contractId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['active', 'completed', 'cancelled', 'disputed', 'paused'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const contract = mockDB.contracts.get(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }
    
    // Check authorization (both agent and worker can update status)
    const isAgent = contract.agentId === req.user.id;
    const isWorker = contract.workerId === req.user.id;
    
    if (!isAgent && !isWorker) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this contract'
      });
    }
    
    contract.status = status;
    
    if (status === 'completed') {
      contract.endDate = new Date().toISOString();
    }
    
    mockDB.contracts.set(contractId, contract);
    
    // Update job status
    const job = mockDB.jobs.get(contract.jobId);
    if (job) {
      job.status = status;
      mockDB.jobs.set(job.id, job);
    }
    
    res.json({
      success: true,
      data: contract,
      message: `Contract ${status} successfully`
    });
  } catch (error) {
    console.error('Update contract status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's contracts
router.get('/user/:userId/contracts', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check authorization
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these contracts'
      });
    }
    
    const userContracts = Array.from(mockDB.contracts.values())
      .filter(contract => contract.agentId === userId || contract.workerId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Enrich contracts with job data
    const enrichedContracts = userContracts.map(contract => {
      const job = mockDB.jobs.get(contract.jobId);
      return {
        ...contract,
        job
      };
    });
    
    res.json({
      success: true,
      data: enrichedContracts
    });
  } catch (error) {
    console.error('Get user contracts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add milestone to contract
router.post('/:contractId/milestones', async (req, res) => {
  try {
    const { contractId } = req.params;
    const { title, description, amount, dueDate } = req.body;
    
    const contract = mockDB.contracts.get(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }
    
    // Only agent can add milestones
    if (contract.agentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add milestones to this contract'
      });
    }
    
    const newMilestone = {
      id: uuidv4(),
      title,
      description,
      amount: parseFloat(amount),
      dueDate,
      status: 'pending'
    };
    
    contract.milestones.push(newMilestone);
    mockDB.contracts.set(contractId, contract);
    
    res.status(201).json({
      success: true,
      data: newMilestone,
      message: 'Milestone added successfully'
    });
  } catch (error) {
    console.error('Add milestone error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update milestone status
router.patch('/:contractId/milestones/:milestoneId', async (req, res) => {
  try {
    const { contractId, milestoneId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'in_progress', 'submitted', 'approved', 'paid', 'revision_requested'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const contract = mockDB.contracts.get(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }
    
    const milestone = contract.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }
    
    milestone.status = status;
    
    if (status === 'approved') {
      milestone.approvedAt = new Date().toISOString();
    }
    
    if (status === 'paid') {
      milestone.paidAt = new Date().toISOString();
      contract.paidAmount += milestone.amount;
    }
    
    mockDB.contracts.set(contractId, contract);
    
    res.json({
      success: true,
      data: milestone,
      message: 'Milestone updated successfully'
    });
  } catch (error) {
    console.error('Update milestone error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;