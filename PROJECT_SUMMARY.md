# 🛡️ SafeMap - Women's Safety Platform

> **Complete production-ready women's safety platform for India**

## 📋 Project Overview

SafeMap is an industry-grade emergency response platform specifically designed for women's safety in India, featuring deep integration with Indian carriers, emergency services, and regional compliance requirements.

## 🎯 Repository Structure

### **Main Repository** (Production Platform)
**Repository:** https://github.com/byprathamesh/safemap.git
```
safemap/                 # Complete production system
├── backend/              # Node.js API server with emergency orchestration
├── mobile/              # Flutter mobile app with panic features
├── dashboard/           # React admin dashboard for monitoring
├── scripts/             # Deployment and utility scripts
├── docs/               # Documentation and compliance guides
├── infrastructure/      # Docker, Kubernetes, deployment configs
├── shared/             # Common types and utilities
└── tests/              # Integration and end-to-end tests
```

### **Prototype Repository** (Demo/Testing)
**Repository:** https://github.com/byprathamesh/safemapprototye.git
```
safemapprototye/         # Web prototype for quick demos
├── pages/              # Next.js pages with emergency interface
├── components/         # React components for emergency features
├── README.md          # Prototype-specific documentation
└── package.json       # Web app dependencies
```

## 🚀 Key Components

### 🔗 **Backend API** (`backend/`)
- **Emergency orchestration** with sub-1-second response
- **Indian carrier integration** (Jio, Airtel, VI, BSNL)
- **112 India services** integration
- **Real-time WebSocket** communication
- **Multi-database architecture** (PostgreSQL, Redis, MongoDB)

### 📱 **Mobile App** (`mobile/`)
- **Flutter-based** native Android/iOS app
- **Panic button** with biometric authentication
- **Background services** for always-on protection
- **Voice commands** in 10 Indian languages
- **Stealth mode** for discreet operation

### 🖥️ **Admin Dashboard** (`dashboard/`)
- **Real-time emergency monitoring**
- **Response coordination** for police/NGOs
- **Analytics and reporting**
- **Evidence management** system

### 🌐 **Web Prototype** (Separate Repository)
- **Browser-based demo** for quick testing
- **Emergency features** accessible without app installation
- **Perfect for stakeholder demos**

## 🇮🇳 Indian Market Integration

### Carrier APIs
```javascript
// Jio Emergency USSD Integration
POST https://api.jio.com/ussd/emergency
Authorization: Bearer JIO_API_KEY
{
  "code": "*555#",
  "phoneNumber": "+919876543210",
  "emergencyType": "PERSONAL_SAFETY",
  "location": { "lat": 28.6139, "lng": 77.2090 }
}
```

### Emergency Services
- **112 India** - National emergency number
- **1091** - Women's helpline
- **100** - Police services
- **State-specific** emergency numbers

### Compliance
- **IT Act 2000** - Full compliance implemented
- **TRAI regulations** - Carrier integration compliance
- **Data localization** - All data stored in India
- **Privacy controls** - GDPR-equivalent protections

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │  Admin Dashboard │    │   Emergency     │
│   (Flutter)     │    │     (React)      │    │   Services      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼───────────────┐
                    │        Backend API          │
                    │    (Node.js + Socket.IO)    │
                    └─────────────┬───────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
┌───────▼────┐           ┌────────▼────┐           ┌────────▼────┐
│PostgreSQL  │           │   Redis     │           │  MongoDB    │
│(Main DB)   │           │  (Cache)    │           │   (Logs)    │
└────────────┘           └─────────────┘           └─────────────┘
```

## 🔧 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Backend** | Node.js + TypeScript | API server with emergency orchestration |
| **Database** | PostgreSQL + Prisma | Main database with emergency data |
| **Cache** | Redis | Real-time data and session management |
| **Logs** | MongoDB | Emergency logs and audit trails |
| **Mobile** | Flutter 3.10+ | Native Android/iOS emergency app |
| **Dashboard** | Next.js + React | Admin interface for monitoring |
| **Real-time** | Socket.IO | Live emergency communication |
| **Security** | AES-256 + TLS 1.3 | End-to-end encryption |

## 🚨 Emergency Features

### Multi-Modal Activation
- **USSD codes** (`*555#`, `112`) via carrier networks
- **Panic button** with biometric authentication
- **Voice commands** in Hindi, English + 8 regional languages
- **Secret gestures** (shake, double-tap, custom patterns)
- **Wearable integration** (smartwatch support)

### Real-time Response
- **Live location** streaming with GPS + cell tower triangulation
- **Evidence capture** (auto-record audio/video/photos)
- **Blockchain storage** for tamper-proof evidence
- **Multi-channel alerts** (SMS, WhatsApp, voice calls, push notifications)

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Flutter 3.10+
- Docker & Docker Compose
- PostgreSQL, Redis, MongoDB

### Quick Start
```bash
# Clone main repository
git clone https://github.com/byprathamesh/safemap.git
cd safemap

# Start production demo
npm run demo:start

# Or step by step
npm run setup              # Install all dependencies
npm run dev               # Start backend + dashboard
npm run dev:mobile        # Start mobile app
```

### Prototype Setup
```bash
# Clone prototype repository
git clone https://github.com/byprathamesh/safemapprototye.git
cd safemapprototye

# Run prototype
npm install
npm run dev
# Open http://localhost:3000
```

## 🚀 Deployment Options

### Production Deployment
| Platform | Component | Cost | Best For |
|----------|-----------|------|----------|
| **Railway** | Backend + Databases | $10-20/month | Development/Testing |
| **DigitalOcean** | Complete platform | $50-100/month | Production |
| **AWS/GCP** | Enterprise scale | $100-500/month | Large scale |

### Free Deployment
| Platform | Component | Cost | Limitations |
|----------|-----------|------|-------------|
| **Vercel** | Prototype web app | FREE | Demo only |
| **Netlify** | Admin dashboard | FREE | Static hosting |
| **Railway** | Backend (trial) | $5 credit | 2-3 weeks |
| **Local** | Full development | FREE | Local only |

## 📊 Features Comparison

| Feature | Main Platform | Web Prototype |
|---------|---------------|---------------|
| **Emergency Button** | ✅ Native + Web | ✅ Web only |
| **Location Tracking** | ✅ Native GPS | ✅ Browser GPS |
| **Voice Commands** | ✅ 10 languages | ✅ Browser API |
| **Real Notifications** | ✅ Production | ⚠️ Simulated |
| **Carrier Integration** | ✅ Live APIs | ⚠️ Demo mode |
| **112 India** | ✅ Real integration | ⚠️ Simulated |
| **Admin Dashboard** | ✅ Full featured | ❌ Separate |
| **Mobile App** | ✅ Native Flutter | ❌ Web only |
| **Production Ready** | ✅ Industry-grade | ❌ Demo/Testing |

## 🧪 Testing

### Emergency Simulation
```bash
# Test complete emergency flow
npm run emergency:simulate

# Test carrier integration
npm run carriers:test

# Check compliance
npm run compliance:check
```

### Quality Assurance
- **Unit tests** - Backend services and utilities
- **Integration tests** - API endpoints and database
- **E2E tests** - Complete emergency workflows
- **Security tests** - Penetration testing and vulnerability scanning

## 📈 Roadmap

### Phase 1: Core Platform ✅
- ✅ Emergency response system
- ✅ Indian carrier integration
- ✅ Mobile app with panic features
- ✅ Admin dashboard

### Phase 2: Enhanced Features 🚧
- 🚧 AI-powered threat detection
- 🚧 Blockchain evidence storage
- 🚧 Wearable device integration
- 🚧 Multi-language voice commands

### Phase 3: Scale & Expansion 📋
- 📋 Multi-state deployment
- 📋 NGO partnership network
- 📋 Government integration
- 📋 International expansion

## 🤝 Contributing

### Main Platform
- Focus on **production features**
- **Security and compliance** critical
- **Indian market integration**
- **Enterprise-grade** quality

### Prototype
- Focus on **demo experience**
- **Quick feature testing**
- **Stakeholder presentations**
- **User feedback** collection

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 🔐 Security & Compliance

### Security Features
- **End-to-end encryption** (AES-256)
- **Transport security** (TLS 1.3)
- **Biometric authentication**
- **Role-based access control**

### Indian Compliance
- **IT Act 2000** - Full compliance
- **TRAI regulations** - Carrier integration
- **Data localization** - India-only storage
- **Privacy controls** - User consent management

## 📄 License

MIT License - Open source for community safety

## 🆘 Emergency Contacts

- **India Emergency**: 112
- **Women Helpline**: 1091
- **Police**: 100
- **Medical Emergency**: 108

---

**SafeMap** - *Complete women's safety platform for India* 🛡️

**Main Platform:** Production-ready system for real emergencies
**Web Prototype:** Quick demo for testing and presentations 