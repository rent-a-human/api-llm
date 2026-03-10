const express = require('express');
const { mockDB, uuidv4 } = require('../data/mockData');
const { requireRole } = require('../middleware/auth');
const router = express.Router();

// Mock payment processing (replace with actual Stripe integration)
router.post('/process', async (req, res) => {
  try {
    const { contractId, milestoneId, amount, currency = 'USD', description } = req.body;
    
    if (!contractId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Contract ID and amount are required'
      });
    }
    
    const contract = mockDB.contracts.get(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }
    
    // Check if user is the agent (paying party)
    if (contract.agentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the agent can make payments for this contract'
      });
    }
    
    const newPayment = {
      id: uuidv4(),
      contractId,
      milestoneId,
      fromUserId: req.user.id,
      toUserId: contract.workerId,
      amount: parseFloat(amount),
      currency,
      type: 'escrow',
      status: 'completed', // Mock as completed
      stripePaymentIntentId: `pi_mock_${uuidv4()}`,
      description: description || `Payment for contract ${contractId}`,
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString()
    };
    
    mockDB.payments.set(newPayment.id, newPayment);
    
    // Update contract paid amount
    contract.paidAmount += newPayment.amount;
    mockDB.contracts.set(contractId, contract);
    
    // Update worker earnings
    const workerProfile = mockDB.humanProfiles.get(contract.workerId);
    if (workerProfile) {
      workerProfile.totalEarnings = (workerProfile.totalEarnings || 0) + newPayment.amount;
      mockDB.humanProfiles.set(contract.workerId, workerProfile);
    }
    
    res.status(201).json({
      success: true,
      data: newPayment,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get payments for user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check authorization
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these payments'
      });
    }
    
    const userPayments = Array.from(mockDB.payments.values())
      .filter(payment => payment.fromUserId === userId || payment.toUserId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Enrich with contract and milestone data
    const enrichedPayments = userPayments.map(payment => {
      const contract = mockDB.contracts.get(payment.contractId);
      let milestone = null;
      
      if (payment.milestoneId) {
        milestone = contract?.milestones.find(m => m.id === payment.milestoneId);
      }
      
      return {
        ...payment,
        contract,
        milestone
      };
    });
    
    res.json({
      success: true,
      data: enrichedPayments
    });
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get payment by ID
router.get('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = mockDB.payments.get(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check authorization
    const isParty = payment.fromUserId === req.user.id || payment.toUserId === req.user.id;
    if (!isParty) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment'
      });
    }
    
    const contract = mockDB.contracts.get(payment.contractId);
    let milestone = null;
    
    if (payment.milestoneId) {
      milestone = contract?.milestones.find(m => m.id === payment.milestoneId);
    }
    
    res.json({
      success: true,
      data: {
        ...payment,
        contract,
        milestone
      }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create refund (agents only)
router.post('/refund', requireRole(['agent']), async (req, res) => {
  try {
    const { paymentId, reason } = req.body;
    
    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }
    
    const originalPayment = mockDB.payments.get(paymentId);
    if (!originalPayment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check if user is the paying agent
    if (originalPayment.fromUserId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to refund this payment'
      });
    }
    
    const refundPayment = {
      id: uuidv4(),
      contractId: originalPayment.contractId,
      milestoneId: originalPayment.milestoneId,
      fromUserId: originalPayment.toUserId, // Worker refunds to agent
      toUserId: originalPayment.fromUserId,
      amount: -originalPayment.amount, // Negative amount for refund
      currency: originalPayment.currency,
      type: 'refund',
      status: 'completed',
      stripePaymentIntentId: `refund_mock_${uuidv4()}`,
      description: reason || `Refund for payment ${paymentId}`,
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString()
    };
    
    mockDB.payments.set(refundPayment.id, refundPayment);
    
    // Update contract paid amount
    const contract = mockDB.contracts.get(originalPayment.contractId);
    if (contract) {
      contract.paidAmount += refundPayment.amount;
      mockDB.contracts.set(contract.id, contract);
    }
    
    // Update worker earnings
    const workerProfile = mockDB.humanProfiles.get(originalPayment.toUserId);
    if (workerProfile) {
      workerProfile.totalEarnings = (workerProfile.totalEarnings || 0) + refundPayment.amount;
      mockDB.humanProfiles.set(originalPayment.toUserId, workerProfile);
    }
    
    res.status(201).json({
      success: true,
      data: refundPayment,
      message: 'Refund processed successfully'
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get payment statistics for user
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check authorization
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these statistics'
      });
    }
    
    const userPayments = Array.from(mockDB.payments.values())
      .filter(payment => payment.fromUserId === userId || payment.toUserId === userId);
    
    const stats = {
      totalPaid: userPayments
        .filter(p => p.fromUserId === userId)
        .reduce((sum, p) => sum + p.amount, 0),
      totalReceived: userPayments
        .filter(p => p.toUserId === userId)
        .reduce((sum, p) => sum + p.amount, 0),
      totalTransactions: userPayments.length,
      refunds: userPayments.filter(p => p.type === 'refund').length
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;