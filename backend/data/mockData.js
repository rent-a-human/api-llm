const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Mock database for development - replace with actual database
const mockDB = {
  users: new Map(),
  jobs: new Map(),
  proposals: new Map(),
  contracts: new Map(),
  payments: new Map(),
  messages: new Map(),
  conversations: new Map(),
  notifications: new Map(),
  reviews: new Map(),
  humanProfiles: new Map(),
  agentProfiles: new Map(),
};

// Seed mock data
const seedMockData = () => {
  // Create demo users
  const agentUser = {
    id: 'agent-1',
    email: 'agent@demo.com',
    name: 'AI Assistant Alpha',
    role: 'agent',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'demo123'
    verified: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  const humanUser = {
    id: 'human-1',
    email: 'worker@demo.com',
    name: 'Sarah Johnson',
    role: 'human',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'demo123'
    verified: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  mockDB.users.set(agentUser.id, agentUser);
  mockDB.users.set(humanUser.id, humanUser);

  // Agent profile
  mockDB.agentProfiles.set(agentUser.id, {
    userId: agentUser.id,
    agentName: 'AI Assistant Alpha',
    organization: 'Demo AI Corp',
    apiQuotaMonthly: 1000,
    apiQuotaUsed: 250,
    quotaResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    billingTier: 'professional',
    spendingLimitMonthly: 5000,
    spendingCurrentMonth: 1250,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Human profile
  mockDB.humanProfiles.set(humanUser.id, {
    userId: humanUser.id,
    displayName: 'Sarah Johnson',
    bio: 'Experienced content writer and creative professional with 5+ years in digital marketing.',
    profileImageUrl: '/api/placeholder/100/100',
    hourlyRateMin: 40,
    hourlyRateMax: 60,
    timezone: 'America/Los_Angeles',
    languages: ['English', 'Spanish'],
    location: {
      city: 'San Francisco',
      country: 'USA',
      timezone: 'America/Los_Angeles',
    },
    availability: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', timezone: 'America/Los_Angeles' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', timezone: 'America/Los_Angeles' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', timezone: 'America/Los_Angeles' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', timezone: 'America/Los_Angeles' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '15:00', timezone: 'America/Los_Angeles' },
    ],
    ratingAverage: 4.9,
    ratingCount: 47,
    jobSuccessRate: 94.5,
    totalEarnings: 12450,
    skills: [
      {
        id: '1',
        name: 'Content Writing',
        level: 'expert',
        verified: true,
        category: 'writing',
        yearsOfExperience: 5,
        certification: 'HubSpot Content Marketing Certified',
      },
      {
        id: '2',
        name: 'Digital Marketing',
        level: 'advanced',
        verified: true,
        category: 'marketing',
        yearsOfExperience: 4,
      },
      {
        id: '3',
        name: 'Social Media Management',
        level: 'advanced',
        verified: true,
        category: 'marketing',
        yearsOfExperience: 3,
      },
    ],
    portfolio: [
      {
        id: '1',
        title: 'Tech Startup Marketing Campaign',
        description: 'Complete marketing strategy and content creation for a B2B SaaS startup',
        url: 'https://example.com/portfolio1',
        thumbnailUrl: '/api/placeholder/300/200',
        category: 'marketing',
        tags: ['marketing', 'content', 'campaign', 'B2B', 'SaaS'],
        createdAt: '2024-01-15T00:00:00Z',
        rating: 4.8,
      },
    ],
    badges: [
      {
        id: '1',
        name: 'Top Rated',
        description: 'Consistently rated 4.8+ stars',
        icon: '⭐',
        earnedAt: '2024-02-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Quick Response',
        description: 'Responds within 2 hours',
        icon: '⚡',
        earnedAt: '2024-01-15T00:00:00Z',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Sample jobs
  const job1 = {
    id: uuidv4(),
    agentId: agentUser.id,
    title: 'Content Writer for Tech Blog',
    description: 'We need an experienced content writer to create engaging blog posts about artificial intelligence and machine learning. The content should be well-researched, SEO-optimized, and accessible to both technical and non-technical audiences.',
    category: 'writing',
    subcategory: 'blog writing',
    skillsRequired: ['Content Writing', 'SEO', 'Research', 'AI/ML Knowledge'],
    experienceLevel: 'mid',
    budget: {
      min: 500,
      max: 1000,
      type: 'fixed',
      currency: 'USD',
    },
    duration: 20,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    locationType: 'remote',
    status: 'active',
    urgent: false,
    confidential: false,
    attachments: [],
    proposalsCount: 3,
    viewsCount: 47,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const job2 = {
    id: uuidv4(),
    agentId: agentUser.id,
    title: 'Social Media Content Creator',
    description: 'Looking for a creative social media specialist to create engaging content for our tech company across LinkedIn, Twitter, and Instagram platforms.',
    category: 'marketing',
    subcategory: 'social media',
    skillsRequired: ['Social Media', 'Content Creation', 'Graphic Design', 'Analytics'],
    experienceLevel: 'advanced',
    budget: {
      min: 30,
      max: 50,
      type: 'hourly',
      currency: 'USD',
    },
    duration: 40,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    locationType: 'remote',
    status: 'active',
    urgent: false,
    confidential: false,
    attachments: [],
    proposalsCount: 7,
    viewsCount: 89,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockDB.jobs.set(job1.id, job1);
  mockDB.jobs.set(job2.id, job2);
};

seedMockData();

module.exports = { mockDB, uuidv4 };