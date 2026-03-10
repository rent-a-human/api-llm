const jwt = require('jsonwebtoken');
const { mockDB } = require('../data/mockData');

const setupSocketIO = (io) => {
  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = mockDB.users.get(decoded.userId);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user.id})`);
    
    // Join user to their personal room
    socket.join(`user_${socket.user.id}`);
    
    // Join role-based rooms
    if (socket.user.role === 'agent') {
      socket.join('agents');
    } else {
      socket.join('humans');
    }

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId) => {
      try {
        const conversation = mockDB.conversations.get(conversationId);
        
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }
        
        // Check if user is participant
        if (conversation.participants.agentId !== socket.user.id && 
            conversation.participants.workerId !== socket.user.id) {
          socket.emit('error', { message: 'Not authorized to join this conversation' });
          return;
        }
        
        socket.join(`conversation_${conversationId}`);
        socket.emit('joined_conversation', { conversationId });
      } catch (error) {
        console.error('Join conversation error:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      socket.emit('left_conversation', { conversationId });
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { recipientId, conversationId, text, attachments = [] } = data;
        
        if (!text || !recipientId) {
          socket.emit('error', { message: 'Recipient ID and message text are required' });
          return;
        }
        
        // Check if recipient exists
        const recipient = mockDB.users.get(recipientId);
        if (!recipient) {
          socket.emit('error', { message: 'Recipient not found' });
          return;
        }
        
        // Find or create conversation
        let conversation = null;
        
        if (conversationId) {
          conversation = mockDB.conversations.get(conversationId);
          if (!conversation) {
            socket.emit('error', { message: 'Conversation not found' });
            return;
          }
        } else {
          // Create new conversation
          const participantIds = [socket.user.id, recipientId].sort();
          
          // Look for existing conversation
          for (const conv of mockDB.conversations.values()) {
            const convParticipants = [conv.participants.agentId, conv.participants.workerId].sort();
            if (JSON.stringify(convParticipants) === JSON.stringify(participantIds)) {
              conversation = conv;
              break;
            }
          }
          
          if (!conversation) {
            conversation = {
              id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              participants: {
                agentId: recipient.role === 'agent' ? recipientId : socket.user.id,
                workerId: recipient.role === 'human' ? recipientId : socket.user.id
              },
              lastMessage: null,
              unreadCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            mockDB.conversations.set(conversation.id, conversation);
          }
        }
        
        // Check if user is participant
        if (conversation.participants.agentId !== socket.user.id && 
            conversation.participants.workerId !== socket.user.id) {
          socket.emit('error', { message: 'Not authorized to send message to this conversation' });
          return;
        }
        
        // Create message
        const message = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          conversationId: conversation.id,
          senderId: socket.user.id,
          senderType: socket.user.role,
          text,
          attachments,
          timestamp: new Date().toISOString()
        };
        
        mockDB.messages.set(message.id, message);
        
        // Update conversation
        conversation.lastMessage = message;
        conversation.updatedAt = new Date().toISOString();
        mockDB.conversations.set(conversation.id, conversation);
        
        // Send message to all participants in the conversation
        io.to(`conversation_${conversation.id}`).emit('new_message', {
          message,
          conversationId: conversation.id
        });
        
        // Send notification to recipient
        socket.to(`user_${recipientId}`).emit('message_notification', {
          messageId: message.id,
          conversationId: conversation.id,
          senderId: socket.user.id,
          senderName: socket.user.name,
          senderType: socket.user.role,
          text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
          timestamp: message.timestamp
        });
        
        socket.emit('message_sent', {
          messageId: message.id,
          conversationId: conversation.id,
          timestamp: message.timestamp
        });
        
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.user.id,
        userName: socket.user.name,
        conversationId
      });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
        userId: socket.user.id,
        conversationId
      });
    });

    // Handle message read receipts
    socket.on('mark_messages_read', (data) => {
      const { conversationId } = data;
      
      try {
        const conversation = mockDB.conversations.get(conversationId);
        
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }
        
        if (conversation.participants.agentId !== socket.user.id && 
            conversation.participants.workerId !== socket.user.id) {
          socket.emit('error', { message: 'Not authorized to update this conversation' });
          return;
        }
        
        // Mark messages as read
        for (const message of mockDB.messages.values()) {
          if (message.conversationId === conversationId && 
              message.senderId !== socket.user.id && 
              !message.readAt) {
            message.readAt = new Date().toISOString();
            mockDB.messages.set(message.id, message);
          }
        }
        
        // Reset unread count
        conversation.unreadCount = 0;
        mockDB.conversations.set(conversationId, conversation);
        
        // Notify other participant
        socket.to(`conversation_${conversationId}`).emit('messages_read', {
          conversationId,
          readBy: socket.user.id,
          readAt: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('Mark messages read error:', error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    // Handle job status updates
    socket.on('job_status_update', (data) => {
      const { jobId, status } = data;
      
      try {
        const job = mockDB.jobs.get(jobId);
        
        if (!job) {
          socket.emit('error', { message: 'Job not found' });
          return;
        }
        
        // Only job owner can update status
        if (job.agentId !== socket.user.id) {
          socket.emit('error', { message: 'Not authorized to update this job' });
          return;
        }
        
        job.status = status;
        job.updatedAt = new Date().toISOString();
        mockDB.jobs.set(jobId, job);
        
        // Broadcast to relevant users
        io.emit('job_updated', {
          jobId,
          status,
          updatedBy: socket.user.id,
          updatedAt: job.updatedAt
        });
        
      } catch (error) {
        console.error('Job status update error:', error);
        socket.emit('error', { message: 'Failed to update job status' });
      }
    });

    // Handle proposal notifications
    socket.on('proposal_notification', (data) => {
      const { jobId, proposalId } = data;
      
      try {
        const job = mockDB.jobs.get(jobId);
        
        if (!job) {
          socket.emit('error', { message: 'Job not found' });
          return;
        }
        
        const proposal = mockDB.proposals.get(proposalId);
        if (!proposal) {
          socket.emit('error', { message: 'Proposal not found' });
          return;
        }
        
        // Notify job owner
        socket.to(`user_${job.agentId}`).emit('new_proposal', {
          jobId,
          proposalId,
          jobTitle: job.title,
          workerName: socket.user.name,
          submittedAt: proposal.submittedAt
        });
        
        // Notify other potential users
        socket.broadcast.emit('proposal_activity', {
          jobId,
          type: 'submitted',
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('Proposal notification error:', error);
        socket.emit('error', { message: 'Failed to send proposal notification' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.user.name} (${socket.user.id}) - Reason: ${reason}`);
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to you-work realtime service',
      userId: socket.user.id,
      userName: socket.user.name,
      timestamp: new Date().toISOString()
    });
  });

  console.log('Socket.IO setup complete');
};

module.exports = { setupSocketIO };