const express = require('express');
const { mockDB, uuidv4 } = require('../data/mockData');
const { requireRole } = require('../middleware/auth');
const router = express.Router();

// Send message
router.post('/send', async (req, res) => {
  try {
    const { recipientId, jobId, contractId, text, attachments = [] } = req.body;
    
    if (!recipientId || !text) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID and message text are required'
      });
    }
    
    // Check if recipient exists
    const recipient = mockDB.users.get(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }
    
    // Find or create conversation
    let conversation = null;
    const participantIds = [req.user.id, recipientId].sort();
    
    // Look for existing conversation
    for (const conv of mockDB.conversations.values()) {
      const convParticipants = [conv.participants.agentId, conv.participants.workerId].sort();
      if (JSON.stringify(convParticipants) === JSON.stringify(participantIds) &&
          (conv.jobId === jobId || (!conv.jobId && !jobId))) {
        conversation = conv;
        break;
      }
    }
    
    // Create new conversation if not found
    if (!conversation) {
      conversation = {
        id: uuidv4(),
        participants: {
          agentId: recipient.role === 'agent' ? recipientId : req.user.id,
          workerId: recipient.role === 'human' ? recipientId : req.user.id
        },
        jobId,
        contractId,
        lastMessage: null,
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockDB.conversations.set(conversation.id, conversation);
    }
    
    // Create message
    const newMessage = {
      id: uuidv4(),
      conversationId: conversation.id,
      senderId: req.user.id,
      senderType: req.user.role,
      text,
      attachments,
      timestamp: new Date().toISOString()
    };
    
    mockDB.messages.set(newMessage.id, newMessage);
    
    // Update conversation
    conversation.lastMessage = newMessage;
    conversation.updatedAt = new Date().toISOString();
    mockDB.conversations.set(conversation.id, conversation);
    
    res.status(201).json({
      success: true,
      data: newMessage,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get conversations for user
router.get('/conversations', async (req, res) => {
  try {
    const userConversations = Array.from(mockDB.conversations.values())
      .filter(conv => 
        conv.participants.agentId === req.user.id || 
        conv.participants.workerId === req.user.id
      )
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    // Enrich conversations with participant info and job data
    const enrichedConversations = userConversations.map(conv => {
      const agent = mockDB.users.get(conv.participants.agentId);
      const worker = mockDB.users.get(conv.participants.workerId);
      const job = conv.jobId ? mockDB.jobs.get(conv.jobId) : null;
      
      return {
        ...conv,
        agent,
        worker,
        job
      };
    });
    
    res.json({
      success: true,
      data: enrichedConversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get messages for conversation
router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = mockDB.conversations.get(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Check if user is participant
    if (conversation.participants.agentId !== req.user.id && 
        conversation.participants.workerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation'
      });
    }
    
    const messages = Array.from(mockDB.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Mark messages as read
router.patch('/conversations/:conversationId/read', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = mockDB.conversations.get(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Check if user is participant
    if (conversation.participants.agentId !== req.user.id && 
        conversation.participants.workerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this conversation'
      });
    }
    
    // Mark messages as read
    const messages = Array.from(mockDB.messages.values())
      .filter(msg => 
        msg.conversationId === conversationId && 
        msg.senderId !== req.user.id && 
        !msg.readAt
      );
    
    messages.forEach(msg => {
      msg.readAt = new Date().toISOString();
      mockDB.messages.set(msg.id, msg);
    });
    
    // Reset unread count
    conversation.unreadCount = 0;
    mockDB.conversations.set(conversationId, conversation);
    
    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;