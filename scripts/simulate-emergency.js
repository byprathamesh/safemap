#!/usr/bin/env node

/**
 * Safe Map Emergency Simulation Script
 * 
 * This script simulates various emergency scenarios to test the Safe Map system
 * including USSD triggers, voice commands, panic button, and carrier integration.
 */

const axios = require('axios');
const WebSocket = require('ws');
const readline = require('readline');

// Configuration
const config = {
  apiBaseUrl: process.env.SAFEMAP_API_URL || 'http://localhost:3000/api/v1',
  socketUrl: process.env.SAFEMAP_SOCKET_URL || 'ws://localhost:3000',
  testUserId: process.env.TEST_USER_ID || 'test-user-123',
  testPhoneNumber: process.env.TEST_PHONE_NUMBER || '+919876543210',
  carrierTestMode: process.env.CARRIER_TEST_MODE === 'true',
};

// Test scenarios
const scenarios = {
  1: 'USSD Emergency (*555#)',
  2: 'Voice Command (Hindi)',
  3: 'Voice Command (English)',
  4: 'Panic Button Press',
  5: 'Gesture Detection (Shake)',
  6: 'Wearable Trigger',
  7: 'Auto-Detection (AI)',
  8: 'Carrier Network Emergency',
  9: 'Multiple Simultaneous Alerts',
  10: 'False Alarm Scenario',
};

// Indian coordinates for testing
const testLocations = {
  mumbai: { latitude: 19.0760, longitude: 72.8777, address: 'Mumbai, Maharashtra' },
  delhi: { latitude: 28.6139, longitude: 77.2090, address: 'Delhi' },
  bangalore: { latitude: 12.9716, longitude: 77.5946, address: 'Bangalore, Karnataka' },
  chennai: { latitude: 13.0827, longitude: 80.2707, address: 'Chennai, Tamil Nadu' },
  kolkata: { latitude: 22.5726, longitude: 88.3639, address: 'Kolkata, West Bengal' },
};

// Voice commands in Indian languages
const voiceCommands = {
  english: ['I need help', 'help me', 'emergency', 'danger'],
  hindi: ['मुझे मदद चाहिए', 'बचाओ', 'खतरा', 'आपातकाल'],
  tamil: ['எனக்கு உதவி வேண்டும்', 'காப்பாற்று', 'ஆபத்து'],
  bengali: ['আমার সাহায্য দরকার', 'বাঁচান', 'বিপদ'],
};

class EmergencySimulator {
  constructor() {
    this.ws = null;
    this.activeAlerts = new Map();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async init() {
    console.log('🚨 Safe Map Emergency Simulation Tool');
    console.log('=====================================\n');
    
    try {
      // Test API connection
      await this.testConnection();
      
      // Connect to WebSocket
      await this.connectWebSocket();
      
      // Show menu
      this.showMenu();
      
    } catch (error) {
      console.error('❌ Failed to initialize simulator:', error.message);
      process.exit(1);
    }
  }

  async testConnection() {
    console.log('🔍 Testing API connection...');
    
    try {
      const response = await axios.get(`${config.apiBaseUrl}/health`);
      console.log('✅ API connection successful');
      console.log(`📊 Server status: ${response.data.status}`);
      console.log(`🕐 Server time: ${response.data.timestamp}\n`);
    } catch (error) {
      throw new Error(`API connection failed: ${error.message}`);
    }
  }

  async connectWebSocket() {
    console.log('🔌 Connecting to WebSocket...');
    
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(config.socketUrl);
      
      this.ws.on('open', () => {
        console.log('✅ WebSocket connected\n');
        resolve();
      });
      
      this.ws.on('message', (data) => {
        this.handleWebSocketMessage(JSON.parse(data));
      });
      
      this.ws.on('error', (error) => {
        reject(new Error(`WebSocket connection failed: ${error.message}`));
      });
    });
  }

  handleWebSocketMessage(message) {
    switch (message.type) {
      case 'emergency_triggered':
        console.log(`🚨 Emergency Alert Created: ${message.data.id}`);
        this.activeAlerts.set(message.data.id, message.data);
        break;
      
      case 'location_updated':
        console.log(`📍 Location Updated: ${message.data.location.address}`);
        break;
      
      case 'emergency_resolved':
        console.log(`✅ Emergency Resolved: ${message.data.id}`);
        this.activeAlerts.delete(message.data.id);
        break;
      
      case 'emergency_escalated':
        console.log(`🔴 Emergency Escalated: ${message.data.id}`);
        break;
      
      default:
        console.log(`📨 Received: ${message.type}`);
    }
  }

  showMenu() {
    console.log('📋 Available Emergency Scenarios:');
    console.log('================================');
    
    Object.entries(scenarios).forEach(([key, value]) => {
      console.log(`${key}. ${value}`);
    });
    
    console.log('\n0. Exit');
    console.log('99. Show Active Alerts');
    console.log('\nOther commands:');
    console.log('- "location <city>" - Change test location');
    console.log('- "resolve <alertId>" - Resolve emergency');
    console.log('- "status" - Show system status\n');
    
    this.promptUser();
  }

  promptUser() {
    this.rl.question('Enter scenario number or command: ', (input) => {
      this.handleUserInput(input.trim());
    });
  }

  async handleUserInput(input) {
    try {
      if (input === '0') {
        console.log('👋 Exiting simulator...');
        process.exit(0);
      }
      
      if (input === '99') {
        this.showActiveAlerts();
        return this.promptUser();
      }
      
      if (input === 'status') {
        await this.showSystemStatus();
        return this.promptUser();
      }
      
      if (input.startsWith('location ')) {
        const city = input.split(' ')[1];
        this.changeLocation(city);
        return this.promptUser();
      }
      
      if (input.startsWith('resolve ')) {
        const alertId = input.split(' ')[1];
        await this.resolveEmergency(alertId);
        return this.promptUser();
      }
      
      const scenario = parseInt(input);
      if (scenarios[scenario]) {
        await this.runScenario(scenario);
      } else {
        console.log('❌ Invalid option. Please try again.\n');
      }
      
      this.promptUser();
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      this.promptUser();
    }
  }

  async runScenario(scenarioNumber) {
    console.log(`\n🎬 Running Scenario ${scenarioNumber}: ${scenarios[scenarioNumber]}`);
    console.log('='.repeat(50));
    
    switch (scenarioNumber) {
      case 1:
        await this.simulateUSSDTrigger();
        break;
      case 2:
        await this.simulateVoiceCommand('hindi');
        break;
      case 3:
        await this.simulateVoiceCommand('english');
        break;
      case 4:
        await this.simulatePanicButton();
        break;
      case 5:
        await this.simulateGestureDetection();
        break;
      case 6:
        await this.simulateWearableTrigger();
        break;
      case 7:
        await this.simulateAutoDetection();
        break;
      case 8:
        await this.simulateCarrierEmergency();
        break;
      case 9:
        await this.simulateMultipleAlerts();
        break;
      case 10:
        await this.simulateFalseAlarm();
        break;
      default:
        console.log('❌ Scenario not implemented yet');
    }
  }

  async simulateUSSDTrigger() {
    const location = this.getRandomLocation();
    
    const ussdData = {
      phoneNumber: config.testPhoneNumber,
      ussdCode: '*555#',
      sessionId: this.generateSessionId(),
      operator: 'jio',
      circle: 'mumbai',
      timestamp: new Date().toISOString(),
    };
    
    console.log('📱 Simulating USSD dial:', ussdData.ussdCode);
    console.log('📞 Phone number:', ussdData.phoneNumber);
    console.log('🏢 Operator:', ussdData.operator);
    
    try {
      const response = await axios.post(`${config.apiBaseUrl}/carrier/ussd-trigger`, ussdData);
      console.log('✅ USSD trigger sent successfully');
      console.log('📍 Location:', location.address);
    } catch (error) {
      console.error('❌ USSD trigger failed:', error.message);
    }
  }

  async simulateVoiceCommand(language) {
    const commands = voiceCommands[language];
    const command = commands[Math.floor(Math.random() * commands.length)];
    
    console.log(`🎤 Simulating voice command in ${language}`);
    console.log(`🗣️  Command: "${command}"`);
    
    const voiceData = {
      userId: config.testUserId,
      command: command,
      language: language,
      confidence: 0.85 + Math.random() * 0.15,
      timestamp: new Date().toISOString(),
    };
    
    try {
      const response = await axios.post(`${config.apiBaseUrl}/emergency/voice-trigger`, voiceData);
      console.log('✅ Voice command processed successfully');
      console.log(`🎯 Confidence: ${(voiceData.confidence * 100).toFixed(1)}%`);
    } catch (error) {
      console.error('❌ Voice command failed:', error.message);
    }
  }

  async simulatePanicButton() {
    console.log('🔴 Simulating panic button press');
    console.log('📱 Device: Mobile app');
    
    const buttonData = {
      userId: config.testUserId,
      type: 'panic_button',
      location: this.getRandomLocation(),
      deviceInfo: {
        platform: 'android',
        model: 'Pixel 7',
        version: '14',
      },
      timestamp: new Date().toISOString(),
    };
    
    try {
      const response = await axios.post(`${config.apiBaseUrl}/emergency/trigger`, buttonData);
      console.log('✅ Panic button trigger successful');
      console.log('⚡ Haptic feedback simulated');
    } catch (error) {
      console.error('❌ Panic button trigger failed:', error.message);
    }
  }

  async simulateGestureDetection() {
    console.log('📳 Simulating shake gesture detection');
    console.log('📊 Accelerometer data threshold exceeded');
    
    const gestureData = {
      userId: config.testUserId,
      type: 'gesture',
      gestureType: 'shake',
      intensity: 8.5,
      duration: 2.3,
      location: this.getRandomLocation(),
      sensorData: {
        accelerometer: { x: 12.5, y: -8.7, z: 15.2 },
        timestamp: new Date().toISOString(),
      },
    };
    
    try {
      const response = await axios.post(`${config.apiBaseUrl}/emergency/trigger`, gestureData);
      console.log('✅ Gesture detection successful');
      console.log(`📈 Shake intensity: ${gestureData.intensity}/10`);
    } catch (error) {
      console.error('❌ Gesture detection failed:', error.message);
    }
  }

  async simulateWearableTrigger() {
    console.log('⌚ Simulating wearable device trigger');
    console.log('🏃‍♀️ Device: Samsung Galaxy Watch');
    
    const wearableData = {
      userId: config.testUserId,
      type: 'wearable',
      deviceType: 'smartwatch',
      deviceModel: 'Samsung Galaxy Watch 6',
      triggerMethod: 'sos_button',
      location: this.getRandomLocation(),
      healthData: {
        heartRate: 120,
        stressLevel: 'high',
        movement: 'running',
      },
    };
    
    try {
      const response = await axios.post(`${config.apiBaseUrl}/emergency/trigger`, wearableData);
      console.log('✅ Wearable trigger successful');
      console.log(`💓 Heart rate: ${wearableData.healthData.heartRate} BPM`);
    } catch (error) {
      console.error('❌ Wearable trigger failed:', error.message);
    }
  }

  async simulateAutoDetection() {
    console.log('🤖 Simulating AI auto-detection');
    console.log('🧠 Analyzing user behavior patterns');
    
    const aiData = {
      userId: config.testUserId,
      type: 'auto_detected',
      detectionType: 'behavior_anomaly',
      confidence: 0.92,
      indicators: [
        'unusual_movement_pattern',
        'elevated_heart_rate',
        'location_deviation',
        'time_anomaly',
      ],
      location: this.getRandomLocation(),
      riskScore: 8.7,
    };
    
    try {
      const response = await axios.post(`${config.apiBaseUrl}/emergency/trigger`, aiData);
      console.log('✅ AI detection successful');
      console.log(`🎯 Confidence: ${(aiData.confidence * 100).toFixed(1)}%`);
      console.log(`⚠️  Risk score: ${aiData.riskScore}/10`);
    } catch (error) {
      console.error('❌ AI detection failed:', error.message);
    }
  }

  async simulateCarrierEmergency() {
    console.log('📡 Simulating carrier network emergency');
    console.log('🏢 Carrier: Jio Network');
    
    const carrierData = {
      phoneNumber: config.testPhoneNumber,
      carrier: 'jio',
      networkLocation: this.getRandomLocation(),
      cellTowerInfo: {
        cellId: 'JIO_MH_001_' + Math.floor(Math.random() * 9999),
        lac: '2001',
        signalStrength: -75,
      },
      emergencyType: 'network_detected',
    };
    
    try {
      const response = await axios.post(`${config.apiBaseUrl}/carrier/network-emergency`, carrierData);
      console.log('✅ Carrier emergency processed');
      console.log(`📶 Signal strength: ${carrierData.cellTowerInfo.signalStrength} dBm`);
    } catch (error) {
      console.error('❌ Carrier emergency failed:', error.message);
    }
  }

  async simulateMultipleAlerts() {
    console.log('🔥 Simulating multiple simultaneous alerts');
    console.log('⚡ Testing system load and coordination');
    
    const alerts = [
      { type: 'panic_button', userId: config.testUserId + '_1' },
      { type: 'voice_command', userId: config.testUserId + '_2' },
      { type: 'gesture', userId: config.testUserId + '_3' },
    ];
    
    try {
      const promises = alerts.map(alert => 
        axios.post(`${config.apiBaseUrl}/emergency/trigger`, {
          ...alert,
          location: this.getRandomLocation(),
          timestamp: new Date().toISOString(),
        })
      );
      
      await Promise.all(promises);
      console.log('✅ Multiple alerts processed successfully');
      console.log(`📊 ${alerts.length} simultaneous emergencies created`);
    } catch (error) {
      console.error('❌ Multiple alerts failed:', error.message);
    }
  }

  async simulateFalseAlarm() {
    console.log('🚫 Simulating false alarm scenario');
    console.log('👤 User will cancel within 30 seconds');
    
    // First trigger emergency
    const emergencyData = {
      userId: config.testUserId,
      type: 'panic_button',
      location: this.getRandomLocation(),
      timestamp: new Date().toISOString(),
    };
    
    try {
      const response = await axios.post(`${config.apiBaseUrl}/emergency/trigger`, emergencyData);
      const alertId = response.data.alertId;
      
      console.log('✅ Emergency triggered');
      console.log('⏳ Waiting 5 seconds before cancellation...');
      
      // Wait and then cancel
      setTimeout(async () => {
        try {
          await axios.post(`${config.apiBaseUrl}/emergency/cancel`, {
            alertId: alertId,
            userId: config.testUserId,
            reason: 'false_alarm',
            authMethod: 'biometric',
          });
          console.log('✅ False alarm cancelled successfully');
          console.log('👤 User authentication verified');
        } catch (error) {
          console.error('❌ False alarm cancellation failed:', error.message);
        }
      }, 5000);
      
    } catch (error) {
      console.error('❌ False alarm simulation failed:', error.message);
    }
  }

  async resolveEmergency(alertId) {
    console.log(`🔧 Resolving emergency: ${alertId}`);
    
    try {
      const response = await axios.post(`${config.apiBaseUrl}/emergency/resolve`, {
        alertId: alertId,
        resolvedBy: 'simulator',
        reason: 'Manual resolution via simulator',
      });
      
      console.log('✅ Emergency resolved successfully');
    } catch (error) {
      console.error('❌ Emergency resolution failed:', error.message);
    }
  }

  showActiveAlerts() {
    console.log('\n📋 Active Emergency Alerts');
    console.log('==========================');
    
    if (this.activeAlerts.size === 0) {
      console.log('✅ No active alerts');
    } else {
      this.activeAlerts.forEach((alert, id) => {
        console.log(`🚨 Alert ID: ${id}`);
        console.log(`   Type: ${alert.type}`);
        console.log(`   Status: ${alert.status}`);
        console.log(`   Location: ${alert.location?.address || 'Unknown'}`);
        console.log(`   Created: ${new Date(alert.createdAt).toLocaleString()}`);
        console.log('');
      });
    }
  }

  async showSystemStatus() {
    console.log('\n📊 System Status');
    console.log('================');
    
    try {
      const healthResponse = await axios.get(`${config.apiBaseUrl}/health`);
      const health = healthResponse.data;
      
      console.log(`🟢 API Status: ${health.status}`);
      console.log(`⏰ Uptime: ${health.uptime || 'Unknown'}`);
      console.log(`💾 Memory Usage: ${health.memory || 'Unknown'}`);
      console.log(`🔌 Database: ${health.database || 'Unknown'}`);
      console.log(`📡 Redis: ${health.redis || 'Unknown'}`);
      console.log(`🔥 Active Alerts: ${this.activeAlerts.size}`);
      
    } catch (error) {
      console.error('❌ Failed to get system status:', error.message);
    }
  }

  getRandomLocation() {
    const cities = Object.keys(testLocations);
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const location = testLocations[randomCity];
    
    // Add some random variation to coordinates
    return {
      latitude: location.latitude + (Math.random() - 0.5) * 0.01,
      longitude: location.longitude + (Math.random() - 0.5) * 0.01,
      accuracy: 10 + Math.random() * 20,
      address: location.address,
    };
  }

  changeLocation(city) {
    if (testLocations[city.toLowerCase()]) {
      console.log(`📍 Test location changed to: ${testLocations[city.toLowerCase()].address}`);
    } else {
      console.log('❌ Unknown city. Available cities:', Object.keys(testLocations).join(', '));
    }
  }

  generateSessionId() {
    return 'SIM_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Run the simulator
if (require.main === module) {
  const simulator = new EmergencySimulator();
  simulator.init().catch(console.error);
}

module.exports = EmergencySimulator; 