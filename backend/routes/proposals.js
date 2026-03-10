const express = require('express');
const { mockDB, uuidv4 } = require('../data/mockData');
const { requireRole } = require('../middleware/auth');
const router = express.Router();

// Create new proposal (humans only)
router.post('/', requireRole(['human']), async (req, res) => {
  try {
    const { jobId, message, proposedRate, estimatedDuration, portfolioLinks = [] } = req.body;
    
    // Validate required fields
    if (!jobId || !message || proposedRate === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Job ID, message, and proposed rate are required'
      });
    }
    
    const job = mockDB.jobs.get(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot submit proposal for inactive job'
      });
    }
    
    // Check if user already has a proposal for this job
    for (const proposal of mockDB.proposals.values()) {
      if (proposal.jobId === jobId && proposal.workerId === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted a proposal for this job'
        });
      }
    }
    
    const humanProfile = mockDB.humanProfiles.get(req.user.id);
    if (!humanProfile) {
      return res.status(404).json({
        success: false,
        message: 'Human profile not found'
      });
    }
    
    const newProposal = {
      id: uuidv4(),
      jobId,
      workerId: req.user.id,
      worker: {
        ...req.user,
        profile: humanProfile
      },
      proposedRate: parseFloat(proposedRate),
      estimatedDuration: estimatedDuration ? parseFloat(estimatedDuration) : null,
      coverLetter: message,
      portfolioLinks,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      respondedAt: null
    };
    
    mockDB.proposals.set(newProposal.id, newProposal);
    
    // Update job proposals count
    job.proposalsCount += 1;
    mockDB.jobs.set(jobId, job);
    
    res.status(201).json({
      success: true,
      data: newProposal,
      message: 'Proposal submitted successfully'
    });
  } catch (error) {
    console.error('Create proposal error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get proposals for a job (agents only, own jobs)
router.get('/job/:jobId', requireRole(['agent']), async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = mockDB.jobs.get(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Check if user owns this job
    if (job.agentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view proposals for this job'
      });
    }
    
    const jobProposals = Array.from(mockDB.proposals.values())
      .filter(proposal => proposal.jobId === jobId)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    res.json({
      success: true,
      data: jobProposals
    });
  } catch (error) {
    console.error('Get job proposals error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get proposal by ID
router.get('/:proposalId', async (req, res) => {
  try {
    const { proposalId } = req.params;
    const proposal = mockDB.proposals.get(proposalId);
    
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }
    
    // Check authorization
    const job = mockDB.jobs.get(proposal.jobId);
    const isJobOwner = job && job.agentId === req.user.id;
    const isProposalOwner = proposal.workerId === req.user.id;
    
    if (!isJobOwner && !isProposalOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this proposal'
      });
    }
    
    res.json({
      success: true,
      data: proposal
    });
  } catch (error) {
    console.error('Get proposal error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update proposal status (agents only)
router.patch('/:proposalId/status', requireRole(['agent']), async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
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
        message: 'Not authorized to update this proposal'
      });
    }
    
    proposal.status = status;
    proposal.respondedAt = new Date().toISOString();
    mockDB.proposals.set(proposalId, proposal);
    
    res.json({
      success: true,
      data: proposal,
      message: `Proposal ${status} successfully`
    });
  } catch (error) {
    console.error('Update proposal status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get proposals by human (humans only, own proposals)
router.get('/human/:humanId', requireRole(['human']), async (req, res) => {
  try {
    const { humanId } = req.params;
    
    if (humanId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these proposals'
      });
    }
    
    const humanProposals = Array.from(mockDB.proposals.values())
      .filter(proposal => proposal.workerId === humanId)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    res.json({
      success: true,
      data: humanProposals
    });
  } catch (error) {
    console.error('Get human proposals error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;