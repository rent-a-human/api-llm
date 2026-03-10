const express = require('express');
const { mockDB, uuidv4 } = require('../data/mockData');
const { optionalAuth, requireRole } = require('../middleware/auth');
const router = express.Router();

// Get all human profiles (public with optional auth)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      skills, 
      location, 
      minRate, 
      maxRate, 
      rating,
      availability,
      search 
    } = req.query;
    
    let humans = Array.from(mockDB.humanProfiles.values());
    
    // Apply filters
    if (category) {
      humans = humans.filter(human => 
        human.skills.some(skill => skill.category === category)
      );
    }
    
    if (skills) {
      const skillList = skills.split(',').map(s => s.toLowerCase());
      humans = humans.filter(human =>
        human.skills.some(skill => 
          skillList.includes(skill.name.toLowerCase())
        )
      );
    }
    
    if (location) {
      const searchLower = location.toLowerCase();
      humans = humans.filter(human => 
        human.location.city.toLowerCase().includes(searchLower) ||
        human.location.country.toLowerCase().includes(searchLower)
      );
    }
    
    if (minRate) {
      humans = humans.filter(human => human.hourlyRateMin >= parseFloat(minRate));
    }
    
    if (maxRate) {
      humans = humans.filter(human => human.hourlyRateMax <= parseFloat(maxRate));
    }
    
    if (rating) {
      humans = humans.filter(human => human.ratingAverage >= parseFloat(rating));
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      humans = humans.filter(human => 
        human.displayName.toLowerCase().includes(searchLower) ||
        human.bio.toLowerCase().includes(searchLower) ||
        human.skills.some(skill => skill.name.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort by rating (highest first), then by rating count
    humans.sort((a, b) => {
      if (b.ratingAverage !== a.ratingAverage) {
        return b.ratingAverage - a.ratingAverage;
      }
      return b.ratingCount - a.ratingCount;
    });
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedHumans = humans.slice(startIndex, endIndex);
    
    // Add user data to human profiles
    const enrichedHumans = paginatedHumans.map(humanProfile => {
      const user = mockDB.users.get(humanProfile.userId);
      return {
        ...user,
        profile: humanProfile
      };
    });
    
    res.json({
      success: true,
      data: enrichedHumans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: humans.length,
        pages: Math.ceil(humans.length / limit),
        hasNext: endIndex < humans.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get humans error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get human profile by ID
router.get('/:humanId', async (req, res) => {
  try {
    const { humanId } = req.params;
    
    let humanProfile = mockDB.humanProfiles.get(humanId);
    
    // If not found by humanId, try finding by userId
    if (!humanProfile) {
      for (const profile of mockDB.humanProfiles.values()) {
        if (profile.userId === humanId) {
          humanProfile = profile;
          break;
        }
      }
    }
    
    if (!humanProfile) {
      return res.status(404).json({
        success: false,
        message: 'Human profile not found'
      });
    }
    
    const user = mockDB.users.get(humanProfile.userId);
    
    const enrichedHuman = {
      ...user,
      profile: humanProfile
    };
    
    res.json({
      success: true,
      data: enrichedHuman
    });
  } catch (error) {
    console.error('Get human error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update human profile (humans only, own profile)
router.put('/:humanId', requireRole(['human']), async (req, res) => {
  try {
    const { humanId } = req.params;
    const updates = req.body;
    
    let humanProfile = mockDB.humanProfiles.get(humanId);
    
    // If not found by humanId, try finding by userId
    if (!humanProfile) {
      for (const profile of mockDB.humanProfiles.values()) {
        if (profile.userId === humanId) {
          humanProfile = profile;
          break;
        }
      }
    }
    
    if (!humanProfile) {
      return res.status(404).json({
        success: false,
        message: 'Human profile not found'
      });
    }
    
    // Check if user is updating their own profile
    if (humanProfile.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }
    
    // Update allowed fields
    const allowedFields = [
      'displayName', 'bio', 'hourlyRateMin', 'hourlyRateMax', 'timezone',
      'languages', 'location', 'availability'
    ];
    
    const filteredUpdates = {};
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });
    
    filteredUpdates.updatedAt = new Date().toISOString();
    
    const updatedProfile = { ...humanProfile, ...filteredUpdates };
    mockDB.humanProfiles.set(humanProfile.userId, updatedProfile);
    
    // Also update in map by ID if it was found by userId
    if (humanProfile.id) {
      mockDB.humanProfiles.set(humanProfile.id, updatedProfile);
    }
    
    const user = mockDB.users.get(humanProfile.userId);
    const enrichedHuman = {
      ...user,
      profile: updatedProfile
    };
    
    res.json({
      success: true,
      data: enrichedHuman,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update human profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add skill to human profile
router.post('/:humanId/skills', requireRole(['human']), async (req, res) => {
  try {
    const { humanId } = req.params;
    const { name, level, category, yearsOfExperience, certification } = req.body;
    
    let humanProfile = mockDB.humanProfiles.get(humanId);
    
    if (!humanProfile) {
      for (const profile of mockDB.humanProfiles.values()) {
        if (profile.userId === humanId) {
          humanProfile = profile;
          break;
        }
      }
    }
    
    if (!humanProfile) {
      return res.status(404).json({
        success: false,
        message: 'Human profile not found'
      });
    }
    
    if (humanProfile.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }
    
    // Check if skill already exists
    const existingSkill = humanProfile.skills.find(skill => 
      skill.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Skill already exists'
      });
    }
    
    const newSkill = {
      id: uuidv4(),
      name,
      level: level || 'beginner',
      category: category || 'other',
      verified: false,
      yearsOfExperience,
      certification
    };
    
    humanProfile.skills.push(newSkill);
    humanProfile.updatedAt = new Date().toISOString();
    
    mockDB.humanProfiles.set(humanProfile.userId, humanProfile);
    
    const user = mockDB.users.get(humanProfile.userId);
    const enrichedHuman = {
      ...user,
      profile: humanProfile
    };
    
    res.status(201).json({
      success: true,
      data: enrichedHuman,
      message: 'Skill added successfully'
    });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Remove skill from human profile
router.delete('/:humanId/skills/:skillId', requireRole(['human']), async (req, res) => {
  try {
    const { humanId, skillId } = req.params;
    
    let humanProfile = mockDB.humanProfiles.get(humanId);
    
    if (!humanProfile) {
      for (const profile of mockDB.humanProfiles.values()) {
        if (profile.userId === humanId) {
          humanProfile = profile;
          break;
        }
      }
    }
    
    if (!humanProfile) {
      return res.status(404).json({
        success: false,
        message: 'Human profile not found'
      });
    }
    
    if (humanProfile.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }
    
    const skillIndex = humanProfile.skills.findIndex(skill => skill.id === skillId);
    
    if (skillIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }
    
    humanProfile.skills.splice(skillIndex, 1);
    humanProfile.updatedAt = new Date().toISOString();
    
    mockDB.humanProfiles.set(humanProfile.userId, humanProfile);
    
    const user = mockDB.users.get(humanProfile.userId);
    const enrichedHuman = {
      ...user,
      profile: humanProfile
    };
    
    res.json({
      success: true,
      data: enrichedHuman,
      message: 'Skill removed successfully'
    });
  } catch (error) {
    console.error('Remove skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get recommended jobs for human
router.get('/:humanId/recommended-jobs', async (req, res) => {
  try {
    const { humanId } = req.params;
    const { limit = 10 } = req.query;
    
    const humanProfile = mockDB.humanProfiles.get(humanId) || 
      Array.from(mockDB.humanProfiles.values()).find(p => p.userId === humanId);
    
    if (!humanProfile) {
      return res.status(404).json({
        success: false,
        message: 'Human profile not found'
      });
    }
    
    // Get all active jobs
    const activeJobs = Array.from(mockDB.jobs.values())
      .filter(job => job.status === 'active')
      .filter(job => {
        // Check if job skills match human skills
        const humanSkillNames = humanProfile.skills.map(skill => skill.name.toLowerCase());
        return job.skillsRequired.some(requiredSkill => 
          humanSkillNames.includes(requiredSkill.toLowerCase())
        );
      })
      .filter(job => {
        // Check if budget matches human's rate
        return job.budget.max >= humanProfile.hourlyRateMin;
      })
      .sort((a, b) => {
        // Score jobs based on skill match and recency
        const aSkills = humanProfile.skills.filter(skill =>
          job.skillsRequired.some(required => 
            skill.name.toLowerCase() === required.toLowerCase()
          )
        ).length;
        const bSkills = b.skillsRequired.filter(required =>
          humanProfile.skills.some(skill => 
            skill.name.toLowerCase() === required.toLowerCase()
          )
        ).length;
        
        if (aSkills !== bSkills) return bSkills - aSkills;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: activeJobs
    });
  } catch (error) {
    console.error('Get recommended jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;