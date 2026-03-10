const express = require('express');
const { mockDB, uuidv4 } = require('../data/mockData');
const { optionalAuth, requireRole } = require('../middleware/auth');
const router = express.Router();

// Get all jobs (public with optional auth)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status, urgent, search } = req.query;
    
    let jobs = Array.from(mockDB.jobs.values());
    
    // Apply filters
    if (category) {
      jobs = jobs.filter(job => job.category === category);
    }
    
    if (status) {
      jobs = jobs.filter(job => job.status === status);
    }
    
    if (urgent === 'true') {
      jobs = jobs.filter(job => job.urgent === true);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.skillsRequired.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort by creation date (newest first)
    jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedJobs = jobs.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedJobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: jobs.length,
        pages: Math.ceil(jobs.length / limit),
        hasNext: endIndex < jobs.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get job by ID
router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = mockDB.jobs.get(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Increment view count
    job.viewsCount += 1;
    mockDB.jobs.set(jobId, job);
    
    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new job (agents only)
router.post('/', requireRole(['agent']), async (req, res) => {
  try {
    const jobData = req.body;
    const agentId = req.user.id;
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'budget', 'duration'];
    const missingFields = requiredFields.filter(field => !jobData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    const newJob = {
      id: uuidv4(),
      agentId,
      title: jobData.title,
      description: jobData.description,
      category: jobData.category,
      subcategory: jobData.subcategory || '',
      skillsRequired: jobData.skillsRequired || [],
      experienceLevel: jobData.experienceLevel || 'mid',
      budget: {
        min: jobData.budget.min,
        max: jobData.budget.max,
        type: jobData.budget.type || 'fixed',
        currency: jobData.budget.currency || 'USD',
      },
      duration: jobData.duration,
      deadline: jobData.deadline,
      locationType: jobData.locationType || 'remote',
      locationDetails: jobData.locationDetails,
      status: 'active',
      urgent: jobData.urgent || false,
      confidential: jobData.confidential || false,
      attachments: jobData.attachments || [],
      proposalsCount: 0,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockDB.jobs.set(newJob.id, newJob);
    
    res.status(201).json({
      success: true,
      data: newJob,
      message: 'Job created successfully'
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update job (agents only, own jobs)
router.put('/:jobId', requireRole(['agent']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const updates = req.body;
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
        message: 'Not authorized to update this job'
      });
    }
    
    // Only allow certain fields to be updated
    const allowedFields = [
      'title', 'description', 'category', 'subcategory', 'skillsRequired',
      'experienceLevel', 'budget', 'duration', 'deadline', 'locationType',
      'locationDetails', 'urgent', 'confidential', 'attachments'
    ];
    
    const filteredUpdates = {};
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });
    
    filteredUpdates.updatedAt = new Date().toISOString();
    
    const updatedJob = { ...job, ...filteredUpdates };
    mockDB.jobs.set(jobId, updatedJob);
    
    res.json({
      success: true,
      data: updatedJob,
      message: 'Job updated successfully'
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete job (agents only, own jobs)
router.delete('/:jobId', requireRole(['agent']), async (req, res) => {
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
        message: 'Not authorized to delete this job'
      });
    }
    
    mockDB.jobs.delete(jobId);
    
    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get agent's jobs
router.get('/agent/:agentId/jobs', requireRole(['agent']), async (req, res) => {
  try {
    const { agentId } = req.params;
    
    // Check if user is accessing their own jobs
    if (agentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these jobs'
      });
    }
    
    const agentJobs = Array.from(mockDB.jobs.values())
      .filter(job => job.agentId === agentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      data: agentJobs
    });
  } catch (error) {
    console.error('Get agent jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;