const express = require('express');
const { mockDB, uuidv4 } = require('../data/mockData');
const router = express.Router();

// Create new review
router.post('/', async (req, res) => {
  try {
    const { contractId, rating, title, comment, workQuality, communication, professionalism, wouldRecommend } = req.body;
    
    if (!contractId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Contract ID and rating are required'
      });
    }
    
    const contract = mockDB.contracts.get(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }
    
    // Check if user is part of this contract
    if (contract.agentId !== req.user.id && contract.workerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this contract'
      });
    }
    
    // Check if review already exists
    for (const review of mockDB.reviews.values()) {
      if (review.contractId === contractId && review.reviewerId === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this contract'
        });
      }
    }
    
    const newReview = {
      id: uuidv4(),
      contractId,
      reviewerId: req.user.id,
      revieweeId: req.user.id === contract.agentId ? contract.workerId : contract.agentId,
      rating: parseInt(rating),
      title: title || '',
      comment: comment || '',
      workQuality: workQuality ? parseInt(workQuality) : rating,
      communication: communication ? parseInt(communication) : rating,
      professionalism: professionalism ? parseInt(professionalism) : rating,
      wouldRecommend: wouldRecommend !== undefined ? wouldRecommend : true,
      createdAt: new Date().toISOString()
    };
    
    mockDB.reviews.set(newReview.id, newReview);
    
    // Update reviewee's rating
    const revieweeProfile = mockDB.humanProfiles.get(newReview.revieweeId);
    if (revieweeProfile) {
      const userReviews = Array.from(mockDB.reviews.values())
        .filter(r => r.revieweeId === newReview.revieweeId);
      
      const totalRating = userReviews.reduce((sum, r) => sum + r.rating, 0);
      revieweeProfile.ratingAverage = totalRating / userReviews.length;
      revieweeProfile.ratingCount = userReviews.length;
      
      // Calculate success rate
      const successfulContracts = userReviews.filter(r => r.rating >= 4).length;
      revieweeProfile.jobSuccessRate = (successfulContracts / userReviews.length) * 100;
      
      mockDB.humanProfiles.set(newReview.revieweeId, revieweeProfile);
    }
    
    res.status(201).json({
      success: true,
      data: newReview,
      message: 'Review created successfully'
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get reviews for user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    let userReviews = Array.from(mockDB.reviews.values())
      .filter(review => review.revieweeId === userId);
    
    // Sort by creation date (newest first)
    userReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedReviews = userReviews.slice(startIndex, endIndex);
    
    // Enrich with reviewer info
    const enrichedReviews = paginatedReviews.map(review => {
      const reviewer = mockDB.users.get(review.reviewerId);
      return {
        ...review,
        reviewer: reviewer ? {
          id: reviewer.id,
          name: reviewer.name,
          role: reviewer.role,
          avatar: reviewer.avatar
        } : null
      };
    });
    
    res.json({
      success: true,
      data: enrichedReviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: userReviews.length,
        pages: Math.ceil(userReviews.length / limit),
        hasNext: endIndex < userReviews.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get review by ID
router.get('/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = mockDB.reviews.get(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check authorization
    if (review.reviewerId !== req.user.id && review.revieweeId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this review'
      });
    }
    
    const reviewer = mockDB.users.get(review.reviewerId);
    const reviewee = mockDB.users.get(review.revieweeId);
    
    const enrichedReview = {
      ...review,
      reviewer: reviewer ? {
        id: reviewer.id,
        name: reviewer.name,
        role: reviewer.role,
        avatar: reviewer.avatar
      } : null,
      reviewee: reviewee ? {
        id: reviewee.id,
        name: reviewee.name,
        role: reviewee.role,
        avatar: reviewee.avatar
      } : null
    };
    
    res.json({
      success: true,
      data: enrichedReview
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get reviews for contract
router.get('/contract/:contractId', async (req, res) => {
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
    if (contract.agentId !== req.user.id && contract.workerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view reviews for this contract'
      });
    }
    
    const contractReviews = Array.from(mockDB.reviews.values())
      .filter(review => review.contractId === contractId);
    
    // Enrich with user info
    const enrichedReviews = contractReviews.map(review => {
      const reviewer = mockDB.users.get(review.reviewerId);
      return {
        ...review,
        reviewer: reviewer ? {
          id: reviewer.id,
          name: reviewer.name,
          role: reviewer.role,
          avatar: reviewer.avatar
        } : null
      };
    });
    
    res.json({
      success: true,
      data: enrichedReviews
    });
  } catch (error) {
    console.error('Get contract reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update review (reviewer only, within 30 days)
router.put('/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment, workQuality, communication, professionalism, wouldRecommend } = req.body;
    
    const review = mockDB.reviews.get(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user is the reviewer
    if (review.reviewerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }
    
    // Check if review is within 30 days
    const reviewAge = new Date() - new Date(review.createdAt);
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    if (reviewAge > thirtyDaysInMs) {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be updated within 30 days of creation'
      });
    }
    
    // Update allowed fields
    const allowedFields = ['rating', 'title', 'comment', 'workQuality', 'communication', 'professionalism', 'wouldRecommend'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = field === 'rating' || field === 'workQuality' || field === 'communication' || field === 'professionalism'
          ? parseInt(req.body[field])
          : req.body[field];
      }
    });
    
    const updatedReview = { ...review, ...updates };
    mockDB.reviews.set(reviewId, updatedReview);
    
    // Update reviewee's rating if rating changed
    if (updates.rating !== undefined) {
      const revieweeProfile = mockDB.humanProfiles.get(review.revieweeId);
      if (revieweeProfile) {
        const userReviews = Array.from(mockDB.reviews.values())
          .filter(r => r.revieweeId === review.revieweeId);
        
        const totalRating = userReviews.reduce((sum, r) => sum + r.rating, 0);
        revieweeProfile.ratingAverage = totalRating / userReviews.length;
        
        const successfulContracts = userReviews.filter(r => r.rating >= 4).length;
        revieweeProfile.jobSuccessRate = (successfulContracts / userReviews.length) * 100;
        
        mockDB.humanProfiles.set(review.revieweeId, revieweeProfile);
      }
    }
    
    res.json({
      success: true,
      data: updatedReview,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete review (reviewer only)
router.delete('/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = mockDB.reviews.get(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user is the reviewer
    if (review.reviewerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }
    
    mockDB.reviews.delete(reviewId);
    
    // Update reviewee's rating
    const revieweeProfile = mockDB.humanProfiles.get(review.revieweeId);
    if (revieweeProfile) {
      const userReviews = Array.from(mockDB.reviews.values())
        .filter(r => r.revieweeId === review.revieweeId);
      
      if (userReviews.length > 0) {
        const totalRating = userReviews.reduce((sum, r) => sum + r.rating, 0);
        revieweeProfile.ratingAverage = totalRating / userReviews.length;
        revieweeProfile.ratingCount = userReviews.length;
        
        const successfulContracts = userReviews.filter(r => r.rating >= 4).length;
        revieweeProfile.jobSuccessRate = (successfulContracts / userReviews.length) * 100;
      } else {
        // Reset to zero if no reviews left
        revieweeProfile.ratingAverage = 0;
        revieweeProfile.ratingCount = 0;
        revieweeProfile.jobSuccessRate = 0;
      }
      
      mockDB.humanProfiles.set(review.revieweeId, revieweeProfile);
    }
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;