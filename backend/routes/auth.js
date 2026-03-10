const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { mockDB } = require('../data/mockData');
const { v4: uuidv4 } = require('../data/mockData');
const router = express.Router();

// Mock login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    let foundUser = null;
    for (const user of mockDB.users.values()) {
      if (user.email === email) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // For demo purposes, accept 'demo123' as password for all users
    if (password !== 'demo123') {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    foundUser.lastLogin = new Date().toISOString();
    mockDB.users.set(foundUser.id, foundUser);

    // Generate JWT token
    const token = jwt.sign(
      { userId: foundUser.id, email: foundUser.email, role: foundUser.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Get additional profile data based on role
    let profile = null;
    if (foundUser.role === 'agent') {
      profile = mockDB.agentProfiles.get(foundUser.id);
    } else if (foundUser.role === 'human') {
      profile = mockDB.humanProfiles.get(foundUser.id);
    }

    const userResponse = {
      ...foundUser,
      profile
    };

    res.json({
      success: true,
      data: {
        user: userResponse,
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Mock register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, userData = {} } = req.body;

    // Check if user already exists
    for (const user of mockDB.users.values()) {
      if (user.email === email) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }
    }

    // Hash password (for demo, we'll use a simple hash)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: uuidv4(),
      email,
      name: name || email.split('@')[0],
      role,
      password: hashedPassword,
      verified: false,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };

    mockDB.users.set(newUser.id, newUser);

    // Create profile based on role
    if (role === 'agent') {
      const agentProfile = {
        userId: newUser.id,
        agentName: name || email.split('@')[0],
        organization: userData.organization || 'Personal',
        apiQuotaMonthly: 100,
        apiQuotaUsed: 0,
        quotaResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        billingTier: 'free',
        spendingLimitMonthly: 0,
        spendingCurrentMonth: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockDB.agentProfiles.set(newUser.id, agentProfile);
    } else if (role === 'human') {
      const humanProfile = {
        userId: newUser.id,
        displayName: name || email.split('@')[0],
        bio: userData.bio || '',
        profileImageUrl: '/api/placeholder/100/100',
        hourlyRateMin: userData.hourlyRate || 25,
        hourlyRateMax: (userData.hourlyRate || 25) + 10,
        timezone: 'UTC',
        languages: [],
        location: userData.location || { city: '', country: '', timezone: 'UTC' },
        availability: [],
        ratingAverage: 0,
        ratingCount: 0,
        jobSuccessRate: 0,
        totalEarnings: 0,
        skills: [],
        portfolio: [],
        badges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockDB.humanProfiles.set(newUser.id, humanProfile);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const userResponse = {
      ...newUser,
      profile: role === 'agent' 
        ? mockDB.agentProfiles.get(newUser.id)
        : mockDB.humanProfiles.get(newUser.id)
    };

    res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        token
      },
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = mockDB.users.get(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new token
    const newToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: { token: newToken }
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

module.exports = router;