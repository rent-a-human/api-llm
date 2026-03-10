const express = require('express');
const { mockDB } = require('../data/mockData');
const { requireRole } = require('../middleware/auth');
const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    let profile = null;
    if (user.role === 'agent') {
      profile = mockDB.agentProfiles.get(user.id);
    } else if (user.role === 'human') {
      profile = mockDB.humanProfiles.get(user.id);
    }
    
    res.json({
      success: true,
      data: {
        ...user,
        profile
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const user = req.user;
    const updates = req.body;
    
    // Update user basic info
    const allowedUserFields = ['name', 'avatar', 'verified'];
    const filteredUpdates = {};
    
    allowedUserFields.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });
    
    const updatedUser = { ...user, ...filteredUpdates };
    mockDB.users.set(user.id, updatedUser);
    
    // Update role-specific profile
    if (user.role === 'agent' && updates.profile) {
      const agentProfile = mockDB.agentProfiles.get(user.id) || {};
      const updatedProfile = { ...agentProfile, ...updates.profile, updatedAt: new Date().toISOString() };
      mockDB.agentProfiles.set(user.id, updatedProfile);
    } else if (user.role === 'human' && updates.profile) {
      const humanProfile = mockDB.humanProfiles.get(user.id) || {};
      const updatedProfile = { ...humanProfile, ...updates.profile, updatedAt: new Date().toISOString() };
      mockDB.humanProfiles.set(user.id, updatedProfile);
    }
    
    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const user = req.user;
    let stats = {};
    
    if (user.role === 'agent') {
      // Agent statistics
      const agentJobs = Array.from(mockDB.jobs.values()).filter(job => job.agentId === user.id);
      const activeJobs = agentJobs.filter(job => job.status === 'active' || job.status === 'in_progress');
      const completedJobs = agentJobs.filter(job => job.status === 'completed');
      const totalProposals = Array.from(mockDB.proposals.values()).filter(p => 
        agentJobs.some(job => job.id === p.jobId)
      ).length;
      
      stats = {
        totalJobs: agentJobs.length,
        activeJobs: activeJobs.length,
        completedJobs: completedJobs.length,
        totalProposals,
        averageBudget: agentJobs.length > 0 
          ? agentJobs.reduce((sum, job) => sum + job.budget.max, 0) / agentJobs.length 
          : 0,
        totalSpent: agentJobs.reduce((sum, job) => sum + job.budget.max, 0)
      };
    } else {
      // Human statistics
      const humanProposals = Array.from(mockDB.proposals.values()).filter(p => p.workerId === user.id);
      const acceptedProposals = humanProposals.filter(p => p.status === 'accepted');
      const activeContracts = Array.from(mockDB.contracts.values()).filter(c => 
        c.workerId === user.id && c.status === 'active'
      );
      
      const humanProfile = mockDB.humanProfiles.get(user.id);
      
      stats = {
        totalProposals: humanProposals.length,
        acceptedProposals: acceptedProposals.length,
        activeContracts: activeContracts.length,
        totalEarnings: humanProfile?.totalEarnings || 0,
        averageRating: humanProfile?.ratingAverage || 0,
        ratingCount: humanProfile?.ratingCount || 0,
        successRate: humanProfile?.jobSuccessRate || 0
      };
    }
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;