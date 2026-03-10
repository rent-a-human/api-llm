/**
 * CAD Collaboration Manager
 * Handles real-time collaboration, document sharing, and change tracking
 */

import { OnShapeClient } from './onshape-client';
import { EventEmitter } from 'events';

export interface UserPermissions {
  userId: string;
  email: string;
  permissionLevel: 'view' | 'edit' | 'admin';
  grantedBy: string;
  grantedAt: string;
}

export interface DocumentShare {
  documentId: string;
  userPermissions: UserPermissions[];
  isPublic: boolean;
  publicLink?: string;
}

export interface ChangeEvent {
  id: string;
  type: 'feature_created' | 'feature_modified' | 'feature_deleted' | 'part_created' | 'part_modified' | 'assembly_created' | 'assembly_modified';
  userId: string;
  userName: string;
  timestamp: string;
  documentId: string;
  featureId?: string;
  partId?: string;
  assemblyId?: string;
  description: string;
  metadata?: any;
}

export interface CollaborationSession {
  sessionId: string;
  documentId: string;
  participants: Array<{
    userId: string;
    userName: string;
    joinedAt: string;
    isActive: boolean;
    cursor?: {
      x: number;
      y: number;
      z: number;
    };
  }>;
  startTime: string;
  isActive: boolean;
}

export interface Comment {
  id: string;
  documentId: string;
  featureId?: string;
  userId: string;
  userName: string;
  content: string;
  position?: [number, number, number];
  timestamp: string;
  resolved: boolean;
  replies?: Comment[];
}

export class CADCollaborationManager extends EventEmitter {
  private onshapeClient: OnShapeClient;
  private activeSessions: Map<string, CollaborationSession> = new Map();
  private changeEvents: Map<string, ChangeEvent[]> = new Map();
  private comments: Map<string, Comment[]> = new Map();
  private eventCounter = 0;
  private commentCounter = 0;
  private sessionCounter = 0;

  constructor(onshapeClient: OnShapeClient) {
    super();
    this.onshapeClient = onshapeClient;

    // Simulate real-time events
    this.startEventSimulation();
  }

  /**
   * Share a document with specific users
   */
  async shareDocument(documentId: string, options: {
    userEmails: string[];
    permissionLevel: 'view' | 'edit' | 'admin';
    message?: string;
  }): Promise<DocumentShare> {
    const { userEmails, permissionLevel, message } = options;
    
    try {
      // Validate document access
      const document = await this.onshapeClient.getDocument(documentId);
      if (!document) {
        throw new Error(`Document ${documentId} not found or access denied`);
      }

      // Simulate sharing process
      const userPermissions: UserPermissions[] = [];
      
      for (const email of userEmails) {
        // In real implementation, this would call OnShape API to add user permissions
        const permission: UserPermissions = {
          userId: `user_${email.replace(/@/g, '_at_')}`,
          email,
          permissionLevel,
          grantedBy: 'current_user',
          grantedAt: new Date().toISOString()
        };
        userPermissions.push(permission);

        // Emit event for email notification
        this.emit('user_invited', {
          documentId,
          email,
          permissionLevel,
          inviter: 'current_user',
          message
        });
      }

      const shareInfo: DocumentShare = {
        documentId,
        userPermissions,
        isPublic: false
      };

      // Track sharing event
      this.recordChangeEvent({
        type: 'assembly_modified', // Using as general document modification
        documentId,
        userId: 'current_user',
        userName: 'Current User',
        description: `Shared document with ${userEmails.length} users with ${permissionLevel} permissions`,
        metadata: {
          sharedWith: userEmails,
          permissionLevel
        }
      });

      this.emit('document_shared', { documentId, shareInfo });
      
      return shareInfo;
    } catch (error: any) {
      throw new Error(`Failed to share document: ${error.message}`);
    }
  }

  /**
   * Get current document permissions
   */
  async getDocumentPermissions(documentId: string): Promise<UserPermissions[]> {
    try {
      // In real implementation, this would query OnShape API
      // For now, return mock data
      const mockPermissions: UserPermissions[] = [
        {
          userId: 'current_user',
          email: 'current@user.com',
          permissionLevel: 'admin',
          grantedBy: 'system',
          grantedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        },
        {
          userId: 'user_team_member',
          email: 'teammate@project.com',
          permissionLevel: 'edit',
          grantedBy: 'current_user',
          grantedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        }
      ];

      return mockPermissions;
    } catch (error: any) {
      throw new Error(`Failed to get document permissions: ${error.message}`);
    }
  }

  /**
   * Start real-time change tracking for a document
   */
  startChangeTracking(documentId: string, options: {
    eventTypes?: string[];
    includeComments?: boolean;
  } = {}): Promise<{ trackingId: string }> {
    const { eventTypes = ['feature', 'part', 'assembly'], includeComments = true } = options;
    
    // Initialize tracking data structure
    if (!this.changeEvents.has(documentId)) {
      this.changeEvents.set(documentId, []);
    }

    // Emit tracking started event
    this.emit('change_tracking_started', {
      documentId,
      trackingId: `tracking_${Date.now()}`,
      eventTypes,
      includeComments
    });

    return Promise.resolve({
      trackingId: `tracking_${Date.now()}`
    });
  }

  /**
   * Record a change event
   */
  private recordChangeEvent(event: Omit<ChangeEvent, 'id' | 'timestamp'>): void {
    const changeEvent: ChangeEvent = {
      id: `event_${++this.eventCounter}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...event
    };

    const documentEvents = this.changeEvents.get(event.documentId) || [];
    documentEvents.push(changeEvent);
    this.changeEvents.set(event.documentId, documentEvents);

    // Emit real-time event
    this.emit('change_recorded', changeEvent);
  }

  /**
   * Get change events for a document
   */
  getChangeEvents(documentId: string, options: {
    startTime?: string;
    endTime?: string;
    eventType?: string;
    userId?: string;
    limit?: number;
  } = {}): ChangeEvent[] {
    let events = this.changeEvents.get(documentId) || [];
    
    // Apply filters
    if (options.startTime) {
      events = events.filter(e => new Date(e.timestamp) >= new Date(options.startTime!));
    }
    if (options.endTime) {
      events = events.filter(e => new Date(e.timestamp) <= new Date(options.endTime!));
    }
    if (options.eventType) {
      events = events.filter(e => e.type === options.eventType);
    }
    if (options.userId) {
      events = events.filter(e => e.userId === options.userId);
    }

    // Sort by timestamp (newest first) and apply limit
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (options.limit) {
      events = events.slice(0, options.limit);
    }

    return events;
  }

  /**
   * Start a collaboration session
   */
  startCollaborationSession(documentId: string, userId: string, userName: string): string {
    const sessionId = `session_${++this.sessionCounter}_${Date.now()}`;
    
    const session: CollaborationSession = {
      sessionId,
      documentId,
      participants: [{
        userId,
        userName,
        joinedAt: new Date().toISOString(),
        isActive: true
      }],
      startTime: new Date().toISOString(),
      isActive: true
    };

    this.activeSessions.set(sessionId, session);

    // Record session start event
    this.recordChangeEvent({
      type: 'assembly_modified', // Using as general document modification
      documentId,
      userId,
      userName,
      description: `Started collaboration session`
    });

    this.emit('collaboration_started', { sessionId, documentId, userId, userName });

    return sessionId;
  }

  /**
   * Join an existing collaboration session
   */
  joinCollaborationSession(sessionId: string, userId: string, userName: string): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (!session.isActive) {
      throw new Error(`Session ${sessionId} is not active`);
    }

    // Check if user is already in session
    const existingParticipant = session.participants.find(p => p.userId === userId);
    if (existingParticipant) {
      existingParticipant.isActive = true;
      existingParticipant.joinedAt = new Date().toISOString();
    } else {
      session.participants.push({
        userId,
        userName,
        joinedAt: new Date().toISOString(),
        isActive: true
      });
    }

    this.emit('user_joined_session', { sessionId, userId, userName });
  }

  /**
   * Leave a collaboration session
   */
  leaveCollaborationSession(sessionId: string, userId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return; // Session doesn't exist, nothing to do
    }

    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.isActive = false;
    }

    // Check if session should be closed
    const activeParticipants = session.participants.filter(p => p.isActive);
    if (activeParticipants.length === 0) {
      session.isActive = false;
      this.emit('collaboration_ended', { sessionId });
    }

    this.emit('user_left_session', { sessionId, userId });
  }

  /**
   * Get active collaboration sessions for a document
   */
  getActiveSessions(documentId: string): CollaborationSession[] {
    return Array.from(this.activeSessions.values()).filter(
      session => session.documentId === documentId && session.isActive
    );
  }

  /**
   * Add a comment to a document or feature
   */
  addComment(documentId: string, options: {
    content: string;
    userId: string;
    userName: string;
    featureId?: string;
    position?: [number, number, number];
  }): Comment {
    const { content, userId, userName, featureId, position } = options;
    
    const comment: Comment = {
      id: `comment_${++this.commentCounter}_${Date.now()}`,
      documentId,
      featureId,
      userId,
      userName,
      content,
      position,
      timestamp: new Date().toISOString(),
      resolved: false,
      replies: []
    };

    // Add to document comments
    const documentComments = this.comments.get(documentId) || [];
    documentComments.push(comment);
    this.comments.set(documentId, documentComments);

    // Record comment event
    this.recordChangeEvent({
      type: 'feature_modified', // Using as general modification
      documentId,
      userId,
      userName,
      description: `Added comment: ${content.substring(0, 50)}...`,
      metadata: {
        commentId: comment.id,
        featureId
      }
    });

    this.emit('comment_added', { documentId, comment });

    return comment;
  }

  /**
   * Get comments for a document
   */
  getComments(documentId: string, options: {
    featureId?: string;
    includeResolved?: boolean;
    limit?: number;
  } = {}): Comment[] {
    let comments = this.comments.get(documentId) || [];
    
    if (!options.includeResolved) {
      comments = comments.filter(c => !c.resolved);
    }
    
    if (options.featureId) {
      comments = comments.filter(c => c.featureId === options.featureId);
    }

    // Sort by timestamp (newest first)
    comments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (options.limit) {
      comments = comments.slice(0, options.limit);
    }

    return comments;
  }

  /**
   * Reply to a comment
   */
  replyToComment(documentId: string, parentCommentId: string, options: {
    content: string;
    userId: string;
    userName: string;
  }): Comment {
    const { content, userId, userName } = options;
    
    const reply: Comment = {
      id: `comment_${++this.commentCounter}_${Date.now()}`,
      documentId,
      userId,
      userName,
      content,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    // Add reply to parent comment
    const documentComments = this.comments.get(documentId) || [];
    const parentComment = documentComments.find(c => c.id === parentCommentId);
    
    if (parentComment) {
      if (!parentComment.replies) {
        parentComment.replies = [];
      }
      parentComment.replies.push(reply);
    }

    // Record reply event
    this.recordChangeEvent({
      type: 'feature_modified',
      documentId,
      userId,
      userName,
      description: `Replied to comment`,
      metadata: {
        replyTo: parentCommentId,
        commentId: reply.id
      }
    });

    this.emit('comment_replied', { documentId, parentCommentId, reply });

    return reply;
  }

  /**
   * Resolve a comment
   */
  resolveComment(documentId: string, commentId: string, userId: string, userName: string): void {
    const documentComments = this.comments.get(documentId) || [];
    const comment = documentComments.find(c => c.id === commentId);
    
    if (comment) {
      comment.resolved = true;

      // Record resolution event
      this.recordChangeEvent({
        type: 'feature_modified',
        documentId,
        userId,
        userName,
        description: `Resolved comment: ${comment.content.substring(0, 30)}...`,
        metadata: {
          commentId,
          action: 'resolved'
        }
      });

      this.emit('comment_resolved', { documentId, commentId });
    }
  }

  /**
   * Get collaboration statistics for a document
   */
  getCollaborationStats(documentId: string): {
    totalSessions: number;
    activeSessions: number;
    totalComments: number;
    unresolvedComments: number;
    totalChanges: number;
    mostActiveUsers: Array<{ userId: string; userName: string; changeCount: number }>;
  } {
    const sessions = this.getActiveSessions(documentId);
    const comments = this.getComments(documentId, { includeResolved: true });
    const changes = this.getChangeEvents(documentId);

    // Calculate user activity
    const userActivity = new Map<string, { userName: string; count: number }>();
    changes.forEach(event => {
      const existing = userActivity.get(event.userId);
      if (existing) {
        existing.count++;
      } else {
        userActivity.set(event.userId, { userName: event.userName, count: 1 });
      }
    });

    const mostActiveUsers = Array.from(userActivity.entries())
      .map(([userId, data]) => ({ userId, userName: data.userName, changeCount: data.count }))
      .sort((a, b) => b.changeCount - a.changeCount)
      .slice(0, 5);

    return {
      totalSessions: this.activeSessions.size,
      activeSessions: sessions.length,
      totalComments: comments.length,
      unresolvedComments: comments.filter(c => !c.resolved).length,
      totalChanges: changes.length,
      mostActiveUsers
    };
  }

  /**
   * Start simulated real-time events for demonstration
   */
  private startEventSimulation(): void {
    // Simulate user activity every 30 seconds
    setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of event
        this.simulateRandomEvent();
      }
    }, 30000);
  }

  private simulateRandomEvent(): void {
    const eventTypes: Array<'feature_created' | 'feature_modified' | 'part_created'> = [
      'feature_created', 'feature_modified', 'part_created'
    ];
    
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const users = ['user1', 'user2', 'user3'];
    const userName = users[Math.floor(Math.random() * users.length)];
    
    this.recordChangeEvent({
      type: eventType,
      documentId: 'demo_document',
      userId: users[Math.floor(Math.random() * users.length)],
      userName,
      description: `Simulated ${eventType.replace('_', ' ')} event`
    });
  }
}

export default CADCollaborationManager;