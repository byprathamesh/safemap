# 🛡️ SafeMap - India's Premier Women's Safety Platform

> **Industry-grade, real-time emergency response system with deep Indian carrier integration**

[![Build Status](https://github.com/your-username/safemap/workflows/CI%2FCD/badge.svg)](https://github.com/your-username/safemap/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Indian Compliance](https://img.shields.io/badge/compliance-IT%20Act%202000-green.svg)](docs/compliance-checklist.md)

## 🚀 **Production-Ready Status**

✅ **Complete Project Scaffold** - All components implemented  
✅ **Indian Carrier Integration** - Jio, Airtel, VI, BSNL APIs  
✅ **Emergency Services** - 112 India integration  
✅ **Multi-platform** - Backend API, Mobile App, Admin Dashboard  
✅ **Database Schema** - Production-ready with Prisma  
✅ **Docker Support** - Containerized deployment  
✅ **CI/CD Pipeline** - GitHub Actions with security scanning  
✅ **Compliance Documentation** - Indian law compliance  
✅ **Deployment Guides** - Multiple platform options  

## 📋 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Clone the repository
git clone https://github.com/your-username/safemap.git
cd safemap

# Run automated setup (Linux/Mac)
./setup-dev.sh

# For Windows, run manually:
npm install
cd backend && npm install && cd ..
cd dashboard && npm install && cd ..
cd mobile && flutter pub get && cd ..
docker-compose up -d
```

### Option 2: Manual Setup
```bash
# 1. Install dependencies
npm install
npm run install:all

# 2. Setup environment
cp env.example .env
# Edit .env with your API keys

# 3. Start databases
docker-compose up -d postgres redis mongodb

# 4. Run migrations
npm run db:migrate

# 5. Start development servers
npm run dev
```

## 🌐 **Deployment Options**

### ⚠️ Vercel Limitations
**Vercel is NOT suitable** for the complete SafeMap system:
- ❌ No WebSocket support (real-time emergencies)
- ❌ No background jobs (emergency notifications) 
- ❌ No database hosting
- ❌ Function timeouts (emergency needs 24/7)

**Use Vercel only for:** Dashboard frontend

### 🏆 Recommended Deployment

#### 1. 🚂 Railway (Best for Testing)
```bash
npm install -g @railway/cli
railway login
railway init safemap
railway up
# Add PostgreSQL, Redis, MongoDB through Railway dashboard
```
**Cost:** $10-20/month | **Best for:** MVP, testing, staging

#### 2. 🌊 DigitalOcean App Platform (Production)
```bash
doctl apps create --spec .do/app.yaml
# Configure managed databases through console
```
**Cost:** $50-100/month | **Best for:** Production, scaling

#### 3. ☁️ AWS/GCP (Enterprise)
- Deploy in Mumbai/Bangalore regions
- Full carrier integration support
- Auto-scaling and compliance
**Cost:** $100-500/month | **Best for:** Large scale

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

### Backend
- **Runtime:** Node.js 18+ with TypeScript
- **Framework:** Express.js with Socket.IO
- **Database:** PostgreSQL (Prisma ORM)
- **Cache:** Redis
- **Logs:** MongoDB
- **Security:** AES-256, TLS 1.3, JWT

### Mobile
- **Framework:** Flutter 3.10+
- **Platform:** Android + iOS
- **Features:** Background services, biometric auth, emergency gestures

### Dashboard
- **Framework:** Next.js 14 + React 18
- **UI:** Chakra UI + Tailwind CSS
- **Maps:** Mapbox GL JS
- **Real-time:** Socket.IO client

### Infrastructure
- **Containers:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Monitoring:** Health checks, logging
- **Deployment:** Railway, DigitalOcean, AWS/GCP

## 🔐 Security & Compliance

### Security Features
- **Encryption:** End-to-end AES-256 encryption
- **Authentication:** JWT + biometric authentication
- **Transport:** TLS 1.3 for all communications
- **Privacy:** Location data encryption at rest
- **Access Control:** Role-based permissions

### Indian Compliance
- **Data Localization:** All data stored in India
- **IT Act 2000:** Full compliance implemented
- **TRAI Regulations:** Carrier integration compliance
- **Privacy:** GDPR-equivalent privacy controls

See [Compliance Checklist](docs/compliance-checklist.md) for details.

## 🚨 Emergency Features

### Multi-Modal Activation
- **USSD Codes:** `*555#`, `112` via carrier networks
- **Panic Button:** Physical button integration
- **Voice Commands:** Hindi, English + 8 Indian languages
- **Secret Gestures:** Shake, double-tap, custom patterns
- **Wearable Integration:** Smartwatch support

### Real-time Response
- **Live Location:** Continuous GPS + cell tower triangulation
- **Evidence Streaming:** Auto-record audio/video/photos
- **Blockchain Storage:** Tamper-proof evidence storage
- **Multi-channel Alerts:** SMS, WhatsApp, voice calls, push notifications

### Indian Integration
- **Carrier APIs:** Jio, Airtel, VI, BSNL integration
- **112 India:** Direct emergency services integration
- **Regional Services:** State police, women helplines
- **Local Context:** Indian addresses, landmarks, languages

## 📱 Mobile App Features

- 🔴 **Emergency Panic Button** - One-tap emergency activation
- 📍 **Live Location Sharing** - Real-time location streaming
- 🎤 **Voice Emergency** - Voice commands in Indian languages
- 👤 **Stealth Mode** - Hidden emergency activation
- 🔒 **Biometric Security** - Fingerprint/face unlock
- 🌐 **Offline Mode** - Works without internet
- ⚡ **Background Service** - Always-on protection
- 👥 **Emergency Contacts** - Instant family notification

## 🖥️ Admin Dashboard Features

- 📊 **Real-time Monitoring** - Live emergency tracking
- 🗺️ **Emergency Map** - Geographic incident visualization
- 📈 **Analytics** - Response time, incident patterns
- 🚨 **Alert Management** - Priority-based emergency handling
- 👮 **Responder Network** - Police, NGO, volunteer coordination
- 📱 **Communication Hub** - Multi-channel messaging
- 📋 **Incident Reports** - Detailed emergency documentation
- 🔍 **Evidence Management** - Secure file handling

## 🌍 Indian Market Focus

### Regional Support
- **Languages:** Hindi, English, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi
- **Carriers:** Deep integration with all major Indian carriers
- **Emergency Numbers:** 112, 100, 1091, state-specific numbers
- **Payments:** UPI, Paytm, PhonePe integration
- **Compliance:** Indian IT Act, TRAI, state regulations

### Carrier Integration
```javascript
// Example: Jio USSD Emergency
POST https://api.jio.com/ussd/emergency
Authorization: Bearer your_jio_api_key
{
  "code": "*555#",
  "phoneNumber": "+919876543210",
  "emergencyType": "PERSONAL_SAFETY",
  "location": { "lat": 12.9716, "lng": 77.5946 }
}
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Flutter 3.10+
- Docker & Docker Compose
- PostgreSQL, Redis, MongoDB

### Project Structure
```
safemap/               # Complete production platform
├── backend/           # Node.js API server
├── mobile/           # Flutter mobile app
├── dashboard/        # React admin dashboard
├── scripts/          # Deployment & utility scripts
├── docs/            # Documentation & compliance
├── infrastructure/   # Docker, K8s, configs
└── shared/          # Common types & utilities
```

### Related Repositories
- **[SafeMap Web Prototype](https://github.com/byprathamesh/safemapprototye)** - Quick demo/testing web version
- **This Repository** - Complete production platform

### Development Commands
```bash
npm run dev              # Start all development servers
npm run test             # Run all tests
npm run build            # Build all projects
npm run simulate:emergency # Test emergency system
npm run db:migrate       # Run database migrations
npm run db:seed         # Seed development data
```

## 🧪 Testing

### Emergency Simulation
```bash
# Run comprehensive emergency test scenarios
npm run simulate:emergency

# Test specific emergency types
npm run test:panic-button
npm run test:voice-emergency
npm run test:ussd-trigger
npm run test:carrier-integration
```

### Test Coverage
- Backend: Unit tests, integration tests, API tests
- Mobile: Widget tests, integration tests
- End-to-end: Emergency flow testing
- Security: Penetration testing, vulnerability scanning

## 📊 Monitoring & Analytics

### Production Monitoring
- **Health Checks:** Automated system health monitoring
- **Performance:** Response time tracking
- **Security:** Intrusion detection
- **Compliance:** Audit logging

### Emergency Analytics
- Response time analysis
- Geographic incident patterns
- User safety scoring
- Effectiveness metrics

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md).

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Emergency Contacts

### Development Support
- **GitHub Issues:** For bugs and feature requests
- **Documentation:** See `docs/` directory
- **Deployment Help:** See `DEPLOYMENT.md`

### Emergency Services (India)
- **National Emergency:** 112
- **Women Helpline:** 1091
- **Police:** 100
- **Medical Emergency:** 108

## 🎯 Roadmap

### Phase 1: MVP (Current)
- ✅ Core emergency features
- ✅ Indian carrier integration
- ✅ Mobile app + dashboard
- ✅ Basic compliance

### Phase 2: Beta Launch
- 🔄 Advanced AI features
- 🔄 Wearable device integration
- 🔄 Enhanced analytics
- 🔄 More regional languages

### Phase 3: Scale
- 📋 International expansion
- 📋 Enterprise features
- 📋 Government partnerships
- 📋 Advanced AI/ML

---

**SafeMap** - *Empowering women's safety through technology* 🛡️

Made with ❤️ for women's safety in India and beyond. 