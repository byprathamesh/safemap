import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { NotificationService } from './notificationService';
import { LocationService } from './locationService';
import { CarrierService } from './carrierService';
import { EvidenceService } from './evidenceService';
import { VoiceAnalysisService } from './voiceAnalysisService';
import { AIService } from './aiService';

export interface EmergencyAlert {
  id: string;
  userId: string;
  type: 'panic_button' | 'voice_command' | 'gesture' | 'ussd' | 'wearable' | 'auto_detected';
  status: 'active' | 'resolved' | 'false_alarm' | 'escalated';
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;
    timestamp: Date;
  };
  metadata: {
    deviceInfo?: any;
    carrierInfo?: any;
    voiceCommand?: string;
    language?: string;
    stressLevel?: number;
    confidence?: number;
  };
  evidence: {
    audioFiles: string[];
    videoFiles: string[];
    images: string[];
    blockchainHashes: string[];
  };
  contacts: {
    emergency: string[];
    trusted: string[];
    authorities: string[];
  };
  timeline: Array<{
    timestamp: Date;
    event: string;
    details: any;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export class EmergencyService extends EventEmitter {
  private activeAlerts: Map<string, EmergencyAlert> = new Map();
  private notificationService: NotificationService;
  private locationService: LocationService;
  private carrierService: CarrierService;
  private evidenceService: EvidenceService;
  private voiceAnalysisService: VoiceAnalysisService;
  private aiService: AIService;

  constructor() {
    super();
    this.notificationService = new NotificationService();
    this.locationService = new LocationService();
    this.carrierService = new CarrierService();
    this.evidenceService = new EvidenceService();
    this.voiceAnalysisService = new VoiceAnalysisService();
    this.aiService = new AIService();
  }

  /**
   * Trigger emergency alert from various sources
   */
  async triggerEmergency(params: {
    userId: string;
    type: EmergencyAlert['type'];
    location?: { latitude: number; longitude: number; accuracy: number };
    metadata?: any;
  }): Promise<EmergencyAlert> {
    const alertId = uuidv4();
    
    logger.info(`Emergency triggered for user ${params.userId}, type: ${params.type}, alert: ${alertId}`);

    try {
      // Get current location if not provided
      let location = params.location;
      if (!location) {
        location = await this.locationService.getCurrentLocation(params.userId);
      }

      // Get address from coordinates
      const address = await this.locationService.getAddressFromCoordinates(
        location.latitude,
        location.longitude
      );

      // Create emergency alert
      const alert: EmergencyAlert = {
        id: alertId,
        userId: params.userId,
        type: params.type,
        status: 'active',
        location: {
          ...location,
          address,
          timestamp: new Date(),
        },
        metadata: params.metadata || {},
        evidence: {
          audioFiles: [],
          videoFiles: [],
          images: [],
          blockchainHashes: [],
        },
        contacts: {
          emergency: [],
          trusted: [],
          authorities: [],
        },
        timeline: [{
          timestamp: new Date(),
          event: 'emergency_triggered',
          details: { type: params.type, location },
        }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store active alert
      this.activeAlerts.set(alertId, alert);

      // Start emergency response workflow
      await this.initiateEmergencyResponse(alert);

      // Emit emergency event
      this.emit('emergency_triggered', alert);

      return alert;

    } catch (error) {
      logger.error(`Failed to trigger emergency for user ${params.userId}:`, error);
      throw new Error('Failed to trigger emergency alert');
    }
  }

  /**
   * Handle voice command emergency trigger
   */
  async handleVoiceCommand(userId: string, audioData: Buffer, language: string = 'en'): Promise<boolean> {
    try {
      // Analyze voice for emergency keywords
      const voiceAnalysis = await this.voiceAnalysisService.analyzeEmergencyCommand(
        audioData,
        language
      );

      if (voiceAnalysis.isEmergency) {
        // Detect stress level in voice
        const stressAnalysis = await this.voiceAnalysisService.analyzeStressLevel(audioData);

        // Trigger emergency with voice metadata
        await this.triggerEmergency({
          userId,
          type: 'voice_command',
          metadata: {
            voiceCommand: voiceAnalysis.detectedCommand,
            language,
            stressLevel: stressAnalysis.stressLevel,
            confidence: voiceAnalysis.confidence,
          },
        });

        return true;
      }

      return false;
    } catch (error) {
      logger.error(`Voice command analysis failed for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Handle USSD emergency trigger from carriers
   */
  async handleUSSDTrigger(phoneNumber: string, carrierInfo: any): Promise<void> {
    try {
      // Find user by phone number
      const userId = await this.getUserByPhoneNumber(phoneNumber);
      
      if (!userId) {
        logger.warn(`USSD trigger received for unknown phone number: ${phoneNumber}`);
        return;
      }

      // Get location from carrier network data
      const networkLocation = await this.carrierService.getNetworkLocation(
        phoneNumber,
        carrierInfo
      );

      await this.triggerEmergency({
        userId,
        type: 'ussd',
        location: networkLocation,
        metadata: {
          carrierInfo,
          phoneNumber,
          networkBased: true,
        },
      });

    } catch (error) {
      logger.error(`USSD trigger failed for phone ${phoneNumber}:`, error);
    }
  }

  /**
   * Update emergency alert location
   */
  async updateLocation(alertId: string, location: { latitude: number; longitude: number; accuracy: number }): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      throw new Error('Emergency alert not found');
    }

    // Get address for new location
    const address = await this.locationService.getAddressFromCoordinates(
      location.latitude,
      location.longitude
    );

    // Update alert location
    alert.location = {
      ...location,
      address,
      timestamp: new Date(),
    };

    alert.timeline.push({
      timestamp: new Date(),
      event: 'location_updated',
      details: { location: alert.location },
    });

    alert.updatedAt = new Date();

    // Notify all connected services
    await this.notificationService.broadcastLocationUpdate(alert);

    // Emit location update event
    this.emit('location_updated', alert);
  }

  /**
   * Add evidence to emergency alert
   */
  async addEvidence(alertId: string, evidenceData: {
    type: 'audio' | 'video' | 'image';
    data: Buffer;
    timestamp: Date;
  }): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      throw new Error('Emergency alert not found');
    }

    try {
      // Store evidence securely
      const evidenceUrl = await this.evidenceService.storeEvidence(
        evidenceData.data,
        evidenceData.type,
        alertId
      );

      // Store on blockchain for tamper-proofing
      const blockchainHash = await this.evidenceService.storeOnBlockchain(
        evidenceUrl,
        evidenceData.timestamp,
        alertId
      );

      // Update alert evidence
      switch (evidenceData.type) {
        case 'audio':
          alert.evidence.audioFiles.push(evidenceUrl);
          break;
        case 'video':
          alert.evidence.videoFiles.push(evidenceUrl);
          break;
        case 'image':
          alert.evidence.images.push(evidenceUrl);
          break;
      }

      alert.evidence.blockchainHashes.push(blockchainHash);

      alert.timeline.push({
        timestamp: new Date(),
        event: 'evidence_added',
        details: { 
          type: evidenceData.type, 
          url: evidenceUrl,
          blockchainHash 
        },
      });

      alert.updatedAt = new Date();

      logger.info(`Evidence added to alert ${alertId}: ${evidenceData.type}`);

    } catch (error) {
      logger.error(`Failed to add evidence to alert ${alertId}:`, error);
      throw error;
    }
  }

  /**
   * Resolve emergency alert
   */
  async resolveEmergency(alertId: string, resolvedBy: string, reason: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      throw new Error('Emergency alert not found');
    }

    alert.status = 'resolved';
    alert.timeline.push({
      timestamp: new Date(),
      event: 'emergency_resolved',
      details: { resolvedBy, reason },
    });
    alert.updatedAt = new Date();

    // Stop all active monitoring and notifications
    await this.stopEmergencyResponse(alert);

    // Remove from active alerts
    this.activeAlerts.delete(alertId);

    // Emit resolved event
    this.emit('emergency_resolved', alert);

    logger.info(`Emergency alert ${alertId} resolved by ${resolvedBy}: ${reason}`);
  }

  /**
   * Get active alerts for admin dashboard
   */
  getActiveAlerts(): EmergencyAlert[] {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Get specific alert details
   */
  getAlert(alertId: string): EmergencyAlert | undefined {
    return this.activeAlerts.get(alertId);
  }

  /**
   * Private method to initiate emergency response workflow
   */
  private async initiateEmergencyResponse(alert: EmergencyAlert): Promise<void> {
    try {
      // 1. Get user's emergency contacts
      alert.contacts = await this.getEmergencyContacts(alert.userId);

      // 2. Send immediate notifications to trusted contacts
      await this.notificationService.sendEmergencyAlerts(alert);

      // 3. Notify authorities (112, police, NGOs)
      await this.notificationService.notifyAuthorities(alert);

      // 4. Start continuous location tracking
      await this.locationService.startContinuousTracking(alert.id, alert.userId);

      // 5. Begin evidence collection (audio/video recording)
      await this.evidenceService.startRecording(alert.id, alert.userId);

      // 6. Schedule automated escalation
      setTimeout(async () => {
        if (this.activeAlerts.has(alert.id)) {
          await this.escalateEmergency(alert.id);
        }
      }, config.emergency.responseTimeout * 1000);

      alert.timeline.push({
        timestamp: new Date(),
        event: 'emergency_response_initiated',
        details: { 
          contactsNotified: alert.contacts.trusted.length + alert.contacts.authorities.length 
        },
      });

    } catch (error) {
      logger.error(`Failed to initiate emergency response for alert ${alert.id}:`, error);
      throw error;
    }
  }

  /**
   * Private method to escalate emergency
   */
  private async escalateEmergency(alertId: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert || alert.status !== 'active') {
      return;
    }

    alert.status = 'escalated';
    alert.timeline.push({
      timestamp: new Date(),
      event: 'emergency_escalated',
      details: { reason: 'no_response_timeout' },
    });

    // Escalate to higher authorities
    await this.notificationService.escalateToAuthorities(alert);

    // Make emergency calls
    await this.carrierService.makeEmergencyCalls(alert);

    this.emit('emergency_escalated', alert);

    logger.warn(`Emergency alert ${alertId} escalated due to no response`);
  }

  /**
   * Private method to stop emergency response
   */
  private async stopEmergencyResponse(alert: EmergencyAlert): Promise<void> {
    try {
      // Stop location tracking
      await this.locationService.stopContinuousTracking(alert.id);

      // Stop evidence recording
      await this.evidenceService.stopRecording(alert.id);

      // Send resolution notifications
      await this.notificationService.sendResolutionNotifications(alert);

    } catch (error) {
      logger.error(`Failed to stop emergency response for alert ${alert.id}:`, error);
    }
  }

  /**
   * Helper method to get user by phone number
   */
  private async getUserByPhoneNumber(phoneNumber: string): Promise<string | null> {
    // This would typically query the database
    // Implementation depends on your user model
    return null; // Placeholder
  }

  /**
   * Helper method to get emergency contacts
   */
  private async getEmergencyContacts(userId: string): Promise<EmergencyAlert['contacts']> {
    // This would typically query the database for user's emergency contacts
    // Implementation depends on your user model
    return {
      emergency: [],
      trusted: [],
      authorities: ['112', 'police'],
    };
  }
} 