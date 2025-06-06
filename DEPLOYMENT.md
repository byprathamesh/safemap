# 🚀 SafeMap Deployment Guide

## ⚠️ Important: Vercel Limitations

**Vercel is NOT suitable for the complete SafeMap system** due to:
- No persistent WebSocket connections (emergency real-time features)
- No background job processing (emergency notifications)
- Serverless function timeouts (emergency response needs 24/7 availability)
- No database hosting (PostgreSQL, MongoDB required)
- Limited file storage (audio/video evidence)

**Use Vercel only for:** Dashboard frontend (static site)

## 🏆 Recommended Deployment Options

### 1. 🚂 Railway (Best for Testing & MVP)

**Perfect for:** Quick testing, MVP, development staging

**Advantages:**
- Built-in PostgreSQL, Redis, MongoDB
- Automatic HTTPS
- Easy environment management
- $5/month for hobby projects
- Great for Indian developers

**Deploy Steps:**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and initialize
railway login
railway init safemap

# 3. Deploy backend
railway up --service backend

# 4. Add databases
railway add postgresql
railway add redis
railway add mongodb

# 5. Set environment variables
railway variables set DATABASE_URL=postgresql://...
railway variables set REDIS_URL=redis://...
railway variables set JIO_API_KEY=your_jio_key
railway variables set AIRTEL_API_KEY=your_airtel_key
# ... other vars from env.example

# 6. Deploy
git push origin main
```

**Cost:** ~$10-20/month for staging

---

### 2. 🌊 DigitalOcean App Platform (Production Ready)

**Perfect for:** Production deployment, scaling

**Advantages:**
- Indian data centers (Bangalore)
- Managed databases
- Auto-scaling
- $25/month starting
- Great performance in India

**Deploy Steps:**
```bash
# 1. Create App Platform project
doctl apps create --spec .do/app.yaml

# 2. Set up managed databases
# PostgreSQL, Redis, MongoDB available

# 3. Configure environment variables
# Through DigitalOcean console

# 4. Deploy
git push origin main
```

---

### 3. 🚀 Render (Alternative to Railway)

**Perfect for:** Testing, small production

**Advantages:**
- Free tier available
- Automatic SSL
- Built-in PostgreSQL
- Mumbai region available

**Deploy Steps:**
```bash
# 1. Connect GitHub repository
# 2. Create Web Service (backend)
# 3. Create PostgreSQL database
# 4. Set environment variables
# 5. Deploy automatically on push
```

---

### 4. ☁️ AWS/GCP (Enterprise Production)

**Perfect for:** Large scale, enterprise deployment

**Advantages:**
- Mumbai/India regions
- Full control and compliance
- Integration with Indian carriers
- Scalable to millions of users

**Architecture:**
- **Compute:** ECS/EKS (AWS) or GKE (GCP)
- **Database:** RDS PostgreSQL, ElastiCache Redis
- **Storage:** S3/Cloud Storage for evidence files
- **CDN:** CloudFront/Cloud CDN for mobile app
- **Monitoring:** CloudWatch/Cloud Monitoring

---

## 📱 Mobile App Deployment

### Android (Google Play Store)
```bash
cd mobile
flutter build appbundle --release
# Upload to Google Play Console
```

### iOS (Apple App Store)
```bash
cd mobile
flutter build ios --release
# Use Xcode to upload to App Store Connect
```

## 🖥️ Dashboard Deployment Options

### Option 1: Vercel (Frontend Only)
```bash
cd dashboard
npm install
npm run build
vercel --prod
```

### Option 2: Netlify
```bash
cd dashboard
npm run build
netlify deploy --prod --dir=out
```

### Option 3: With Backend (Railway/Render)
Deploy as part of full-stack application

---

## 🔄 CI/CD Setup

### GitHub Actions (Included)
The project includes `.github/workflows/ci-cd.yml` for:
- Automated testing
- Security scanning
- Docker image building
- Deployment triggers

### Manual Deployment Steps:
1. **Setup Repository Secrets:**
   ```
   RAILWAY_TOKEN
   DO_TOKEN
   AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY
   ```

2. **Configure Environments:**
   - Staging: `develop` branch
   - Production: `main` branch

---

## 🗃️ Database Setup

### 1. PostgreSQL (Main Database)
```sql
-- Run after deployment
npx prisma migrate deploy
npx prisma db seed
```

### 2. Redis (Caching)
```bash
# Automatic with Railway/Render
# Configure REDIS_URL in environment
```

### 3. MongoDB (Logs)
```bash
# Automatic with Railway/DigitalOcean
# Configure MONGODB_URL in environment
```

---

## 🔐 Production Security Checklist

### Environment Variables (CRITICAL)
```bash
# Generate secure keys
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)

# Indian Carrier APIs
JIO_API_KEY=your_actual_jio_key
AIRTEL_API_KEY=your_actual_airtel_key
VI_API_KEY=your_actual_vi_key
BSNL_API_KEY=your_actual_bsnl_key

# Emergency Services
INDIA_112_API_KEY=your_112_api_key
GUPSHUP_API_KEY=your_gupshup_key
EXOTEL_API_KEY=your_exotel_key

# Cloud Storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=safemap-evidence-india

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

### SSL/HTTPS Setup
- Railway/Render: Automatic
- Custom domains: Configure DNS properly
- Use Let's Encrypt for free SSL

### Database Security
- Enable SSL connections
- Whitelist IP addresses
- Use strong passwords
- Regular backups

---

## 🌍 Indian Compliance Setup

### 1. Data Localization
- Deploy in Mumbai/Bangalore regions
- Store all data within India
- Configure CDN for India

### 2. Carrier Integration
```bash
# Test carrier endpoints
curl -X POST https://jio-api.jio.com/ussd \
  -H "Authorization: Bearer $JIO_API_KEY" \
  -d '{"code": "*555#", "phone": "+919876543210"}'
```

### 3. Emergency Services
```bash
# Test 112 India integration
curl -X POST https://112.gov.in/api/emergency \
  -H "Authorization: Bearer $INDIA_112_API_KEY" \
  -d '{"location": {...}, "type": "PERSONAL_SAFETY"}'
```

---

## 💰 Cost Estimates

### Development/Testing
- **Railway:** $10-20/month
- **Render:** $7-15/month (free tier available)
- **Vercel (frontend only):** Free/$20/month

### Production (1000+ users)
- **DigitalOcean:** $50-100/month
- **Railway:** $30-60/month
- **AWS/GCP:** $100-500/month (scales with usage)

### Enterprise (10,000+ users)
- **AWS/GCP:** $500-2000/month
- **Dedicated infrastructure:** $1000-5000/month

---

## 🚀 Quick Start Commands

### For Testing (Railway):
```bash
# 1. Clone and setup
git clone <your-repo>
cd safemap
npm install

# 2. Deploy to Railway
railway login
railway init
railway up

# 3. Configure databases and environment
railway add postgresql redis mongodb
# Set env vars through Railway dashboard

# 4. Run migrations
railway run npx prisma migrate deploy

# 5. Your app is live! 🎉
```

### For Production (DigitalOcean):
```bash
# 1. Setup DO CLI
snap install doctl
doctl auth init

# 2. Create app
doctl apps create --spec .do/app.yaml

# 3. Configure managed databases
# Through DigitalOcean console

# 4. Set environment variables
# Through DigitalOcean console

# 5. Deploy
git push origin main
```

---

## 📞 Support & Monitoring

### Monitoring Setup
- **Sentry:** Error tracking
- **DataDog/New Relic:** Performance monitoring
- **Uptime Robot:** Availability monitoring

### Emergency Response Testing
```bash
# Test emergency simulation
npm run simulate:emergency

# Test carrier integration
npm run test:carriers

# Test 112 India integration
npm run test:emergency-services
```

---

## 🎯 Recommended Deployment Path

### Phase 1: MVP Testing
1. **Deploy on Railway** (backend + databases)
2. **Deploy dashboard on Vercel** (frontend)
3. **Test with mobile app** (local development)
4. **Integrate with sandbox APIs** (Jio, Airtel, etc.)

### Phase 2: Beta Launch
1. **Migrate to DigitalOcean App Platform**
2. **Setup production databases**
3. **Integrate real carrier APIs**
4. **Deploy mobile apps to app stores**
5. **Setup monitoring and alerts**

### Phase 3: Production Scale
1. **Migrate to AWS/GCP** (if needed)
2. **Setup multi-region deployment**
3. **Implement auto-scaling**
4. **Full compliance audit**
5. **24/7 monitoring and support**

---

## ❓ Need Help?

- **Railway Issues:** Check Railway docs or Discord
- **DigitalOcean Issues:** Use DO community forums
- **Carrier Integration:** Contact carrier developer support
- **Emergency Services:** Contact 112 India technical team

Ready to deploy your SafeMap system! 🚀 