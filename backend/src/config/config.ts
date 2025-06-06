import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'DATABASE_URL',
  'ENCRYPTION_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  // Application settings
  app: {
    name: process.env.APP_NAME || 'SafeMap',
    version: process.env.API_VERSION || 'v1',
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
  },

  // Database configuration
  database: {
    url: process.env.DATABASE_URL!,
    mongodb: process.env.MONGODB_URI || 'mongodb://localhost:27017/safemap',
    redis: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // Security configuration
  security: {
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    encryptionKey: process.env.ENCRYPTION_KEY!,
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // CORS configuration
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://safemap.in', 'https://admin.safemap.in']
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:19006'],
  },

  // Indian Map Services
  maps: {
    mapMyIndia: {
      apiKey: process.env.MAPMY_INDIA_API_KEY,
      clientId: process.env.MAPMY_INDIA_CLIENT_ID,
    },
    googleMaps: {
      apiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
  },

  // Communication services (Indian providers)
  communication: {
    gupshup: {
      apiKey: process.env.GUPSHUP_API_KEY,
      appName: process.env.GUPSHUP_APP_NAME,
      baseUrl: 'https://enterprise.smsgupshup.com/GatewayAPI/rest',
    },
    exotel: {
      apiKey: process.env.EXOTEL_API_KEY,
      apiToken: process.env.EXOTEL_API_TOKEN,
      sid: process.env.EXOTEL_SID,
      baseUrl: 'https://api.exotel.com/v1/Accounts',
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    },
  },

  // Voice and AI services
  ai: {
    googleCloud: {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      privateKey: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    },
    speechToText: {
      apiKey: process.env.SPEECH_TO_TEXT_API_KEY,
    },
  },

  // Cloud storage
  storage: {
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'ap-south-1',
      bucket: process.env.AWS_S3_BUCKET || 'safemap-evidence-bucket',
    },
    gcp: {
      bucket: process.env.GCP_STORAGE_BUCKET || 'safemap-evidence-bucket',
    },
  },

  // Push notifications
  notifications: {
    fcm: {
      serverKey: process.env.FCM_SERVER_KEY,
      senderId: process.env.FCM_SENDER_ID,
    },
    apns: {
      keyId: process.env.APNS_KEY_ID,
      teamId: process.env.APNS_TEAM_ID,
    },
  },

  // Emergency services integration
  emergency: {
    india112: {
      apiKey: process.env.INDIA_112_API_KEY,
      endpoint: process.env.POLICE_API_ENDPOINT || 'https://api.police.gov.in/emergency',
    },
    ngo: {
      webhookUrl: process.env.NGO_WEBHOOK_URL,
    },
    responseTimeout: parseInt(process.env.EMERGENCY_RESPONSE_TIMEOUT || '30', 10),
    autoCallDelay: parseInt(process.env.AUTO_CALL_DELAY || '10', 10),
    locationUpdateInterval: parseInt(process.env.LOCATION_UPDATE_INTERVAL || '5', 10),
  },

  // Indian carrier integration
  carriers: {
    jio: {
      apiKey: process.env.JIO_API_KEY,
      baseUrl: 'https://api.jio.com/v1',
    },
    airtel: {
      apiKey: process.env.AIRTEL_API_KEY,
      baseUrl: 'https://api.airtel.in/v1',
    },
    vi: {
      apiKey: process.env.VI_API_KEY,
      baseUrl: 'https://api.myvi.in/v1',
    },
    bsnl: {
      apiKey: process.env.BSNL_API_KEY,
      baseUrl: 'https://api.bsnl.co.in/v1',
    },
  },

  // USSD configuration
  ussd: {
    emergencyCode: process.env.USSD_EMERGENCY_CODE || '*555#',
    serviceCode: process.env.USSD_SERVICE_CODE || '112',
  },

  // Blockchain settings
  blockchain: {
    network: process.env.ETHEREUM_NETWORK || 'mumbai-testnet',
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
    contractAddress: process.env.CONTRACT_ADDRESS,
    privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY,
  },

  // Monitoring and analytics
  monitoring: {
    sentry: {
      dsn: process.env.SENTRY_DSN,
    },
    analytics: {
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
      mixpanelToken: process.env.MIXPANEL_TOKEN,
    },
  },

  // File upload limits
  upload: {
    maxVideoSizeMB: parseInt(process.env.MAX_VIDEO_SIZE_MB || '50', 10),
    maxAudioSizeMB: parseInt(process.env.MAX_AUDIO_SIZE_MB || '10', 10),
    maxImageSizeMB: parseInt(process.env.MAX_IMAGE_SIZE_MB || '5', 10),
  },

  // Compliance settings
  compliance: {
    dataRetentionDays: parseInt(process.env.DATA_RETENTION_DAYS || '90', 10),
    gdprEnabled: process.env.GDPR_ENABLED === 'true',
    ccpaEnabled: process.env.CCPA_ENABLED === 'true',
    indianItActCompliance: process.env.INDIAN_IT_ACT_COMPLIANCE === 'true',
  },

  // Development settings
  development: {
    debugMode: process.env.DEBUG_MODE === 'true',
    logLevel: process.env.LOG_LEVEL || 'info',
    mockCarriers: process.env.MOCK_CARRIERS === 'true',
    simulateEmergency: process.env.SIMULATE_EMERGENCY === 'true',
  },

  // Supported languages for India
  languages: [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  ],

  // Emergency voice commands in Indian languages
  emergencyCommands: {
    en: ['i need help', 'help me', 'emergency', 'danger'],
    hi: ['मुझे मदद चाहिए', 'बचाओ', 'खतरा', 'आपातकाल'],
    mr: ['मला मदत हवी', 'वाचवा', 'धोका'],
    ta: ['எனக்கு உதவி வேண்டும்', 'காப்பாற்று', 'ஆபத்து'],
    te: ['నాకు సహాయం కావాలి', 'రక్షించు', 'ప్రమాదం'],
    bn: ['আমার সাহায্য দরকার', 'বাঁচান', 'বিপদ'],
    kn: ['ನನಗೆ ಸಹಾಯ ಬೇಕು', 'ರಕ್ಷಿಸಿ', 'ಅಪಾಯ'],
    ml: ['എനിക്ക് സഹായം വേണം', 'രക്ഷിക്കൂ', 'അപകടം'],
    pa: ['ਮੈਨੂੰ ਮਦਦ ਚਾਹੀਦੀ ਹੈ', 'ਬਚਾਓ', 'ਖ਼ਤਰਾ'],
    gu: ['મને મદદ જોઈએ છે', 'બચાવો', 'ખતરો'],
  },
}; 