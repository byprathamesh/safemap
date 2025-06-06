# 🤝 Contributing to SafeMap

Thank you for your interest in contributing to SafeMap! This project aims to create the world's best women's safety platform, and we welcome contributions from developers, security experts, and safety advocates worldwide.

## 🎯 Project Mission

SafeMap is building an **industry-grade, real-time emergency response system** specifically designed for Indian women, with deep carrier integration and compliance with Indian regulations.

## 🚀 How to Contribute

### 🐛 Reporting Bugs

**Before submitting a bug report:**
1. Check existing [GitHub Issues](https://github.com/byprathamesh/safemap/issues)
2. Try the latest development version
3. Ensure it's not a configuration issue

**Bug Report Template:**
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 11, Ubuntu 22.04]
- Node.js version: [e.g., 18.17.0]
- Flutter version: [e.g., 3.10.0]
- Component: [Backend/Mobile/Dashboard]

## Emergency Impact
- [ ] Affects emergency response capabilities
- [ ] Security vulnerability
- [ ] Performance issue
- [ ] UI/UX issue
```

### 💡 Suggesting Features

**Feature Request Template:**
```markdown
## Feature Description
Clear description of the proposed feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this be implemented?

## Indian Context
How does this help Indian users specifically?

## Emergency Relevance
How does this improve emergency response?

## Implementation Complexity
- [ ] Simple (< 1 day)
- [ ] Medium (1-3 days)
- [ ] Complex (> 3 days)
```

### 🔧 Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/safemap.git
   cd safemap
   ```

2. **Set up development environment**
   ```bash
   # Automated setup (Linux/Mac)
   ./setup-dev.sh
   
   # Manual setup (Windows)
   npm install
   cd backend && npm install && cd ..
   cd dashboard && npm install && cd ..
   cd mobile && flutter pub get && cd ..
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm run test
   npm run test:emergency  # Emergency-specific tests
   ```

### 📋 Development Guidelines

#### **Code Style**
- **Backend:** Follow TypeScript best practices
- **Mobile:** Follow Flutter/Dart conventions
- **Dashboard:** Follow React/Next.js patterns
- **All:** Use meaningful variable names, especially for emergency-related code

#### **Emergency Code Standards**
```typescript
// ✅ Good: Clear emergency context
async function triggerPanicButtonEmergency(
  userId: string, 
  location: GPSLocation,
  triggerMethod: 'PANIC_BUTTON'
): Promise<EmergencyResponse>

// ❌ Bad: Unclear purpose
async function trigger(id: string, loc: any): Promise<any>
```

#### **Security Requirements**
- **Never commit API keys** or sensitive data
- **Encrypt all location data** at rest
- **Use HTTPS/TLS** for all communications
- **Validate all inputs** to prevent injection attacks
- **Follow OWASP guidelines** for web security

#### **Indian Compliance**
- **Data localization:** All data must stay in India
- **Carrier APIs:** Follow TRAI guidelines
- **Emergency services:** Maintain 112 India compatibility
- **Languages:** Support regional Indian languages

### 🏗️ Project Structure

```
safemap/
├── backend/              # Node.js API server
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── models/       # Database models
│   │   └── routes/       # API routes
│   ├── prisma/          # Database schema
│   └── tests/           # Backend tests
├── mobile/              # Flutter mobile app
│   ├── lib/
│   │   ├── screens/     # UI screens
│   │   ├── services/    # API services
│   │   └── widgets/     # Reusable widgets
│   └── test/           # Mobile tests
├── dashboard/           # React admin dashboard
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Next.js pages
│   │   └── hooks/       # Custom React hooks
│   └── __tests__/      # Dashboard tests
└── docs/               # Documentation
```

### 🧪 Testing Requirements

#### **Emergency System Tests**
All emergency-related code must have comprehensive tests:

```typescript
describe('Emergency Response System', () => {
  it('should trigger emergency within 3 seconds', async () => {
    const response = await emergencyService.triggerPanic(mockUser);
    expect(response.responseTime).toBeLessThan(3000);
  });
  
  it('should notify all emergency contacts', async () => {
    const emergency = await emergencyService.triggerPanic(mockUser);
    expect(emergency.notifications).toHaveLength(mockUser.emergencyContacts.length);
  });
});
```

#### **Carrier Integration Tests**
```typescript
describe('Indian Carrier Integration', () => {
  it('should handle Jio USSD emergency', async () => {
    const result = await carrierService.handleUSSD('*555#', '+919876543210');
    expect(result.carrier).toBe('JIO');
    expect(result.emergency).toBeDefined();
  });
});
```

#### **Test Coverage Requirements**
- **Emergency functions:** 100% coverage
- **Security functions:** 100% coverage
- **API endpoints:** 90%+ coverage
- **UI components:** 80%+ coverage

### 📝 Pull Request Process

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   git checkout -b fix/bug-description
   git checkout -b emergency/critical-fix
   ```

2. **Make your changes**
   - Write tests first (TDD)
   - Implement feature
   - Update documentation

3. **Test thoroughly**
   ```bash
   npm run test
   npm run test:emergency
   npm run test:security
   npm run lint
   npm run type-check
   ```

4. **Commit with clear messages**
   ```bash
   git commit -m "feat(emergency): add voice command support for Hindi"
   git commit -m "fix(security): prevent location data leakage"
   git commit -m "docs(api): update carrier integration guide"
   ```

5. **Submit Pull Request**
   - Use the PR template
   - Link related issues
   - Add screenshots for UI changes
   - Describe emergency impact

#### **PR Template**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature)
- [ ] Emergency fix (critical security/safety)

## Emergency Impact
- [ ] Improves emergency response time
- [ ] Enhances user safety
- [ ] Fixes critical security issue
- [ ] No emergency impact

## Indian Compliance
- [ ] Maintains data localization
- [ ] Compatible with Indian carriers
- [ ] Follows TRAI guidelines
- [ ] Supports regional languages

## Testing
- [ ] Tests pass locally
- [ ] Emergency scenarios tested
- [ ] Security scanning passed
- [ ] Manual testing completed

## Screenshots (if applicable)

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### 🔒 Security Contributions

**Security vulnerabilities** should be reported privately:
- Email: security@safemap.com (for production)
- GitHub Security Advisories (preferred)
- **Do not** create public issues for security bugs

**Security Bug Bounty:**
- Critical vulnerabilities: Recognition + potential rewards
- Must affect emergency response or user safety
- Follow responsible disclosure

### 🌍 Internationalization

**Adding Language Support:**
1. Add language to `backend/src/config/languages.ts`
2. Create translation files in `mobile/lib/l10n/`
3. Add voice command mappings
4. Update documentation

**Supported Languages:**
- Hindi (हिन्दी)
- English
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Bengali (বাংলা)
- Marathi (मराठी)
- Gujarati (ગુજરાતી)
- Kannada (ಕನ್ನಡ)
- Malayalam (മലയാളം)
- Punjabi (ਪੰਜਾਬੀ)

### 📊 Performance Guidelines

**Emergency Response Requirements:**
- **Panic button response:** < 1 second
- **Location sharing:** < 2 seconds
- **Emergency notification:** < 3 seconds
- **Database queries:** < 500ms
- **API responses:** < 1 second

**Mobile App Performance:**
- **App startup:** < 3 seconds
- **Emergency activation:** < 1 second
- **Background location:** Minimal battery impact
- **Memory usage:** < 100MB

### 🎨 UI/UX Guidelines

**Emergency UI Principles:**
- **Large, accessible buttons** for panic situations
- **High contrast colors** for visibility in stress
- **Simple navigation** under emergency conditions
- **Voice feedback** for confirmation
- **Works in dark environments**

**Design Assets:**
- Use Figma designs (link in project)
- Follow Material Design 3 (Android)
- Follow iOS Human Interface Guidelines (iOS)
- Ensure accessibility compliance

### 🏆 Recognition

**Contributors will be recognized through:**
- GitHub contributors list
- Project documentation
- Social media acknowledgments
- Conference mentions (if applicable)

**Special Recognition for:**
- Emergency response improvements
- Security enhancements
- Indian localization contributions
- Performance optimizations

### 📞 Getting Help

**Development Questions:**
- GitHub Discussions: General questions
- Discord: Real-time chat (link in README)
- Email: dev@safemap.com

**Emergency/Security Issues:**
- GitHub Issues: Non-sensitive bugs
- Security email: Critical vulnerabilities
- Direct contact: Urgent matters

### 📋 Issue Labels

- `emergency-critical`: Affects emergency response
- `security`: Security-related issues
- `carrier-integration`: Indian carrier APIs
- `compliance`: Regulatory compliance
- `performance`: Performance improvements
- `ui/ux`: User interface improvements
- `documentation`: Documentation updates
- `good-first-issue`: Suitable for new contributors
- `help-wanted`: Community help needed

### 🎯 Current Priority Areas

**High Priority:**
1. **Emergency response optimization** (< 1 second)
2. **Carrier API integration** (Jio, Airtel, VI, BSNL)
3. **Security hardening** (encryption, authentication)
4. **Indian compliance** (data localization, TRAI)

**Medium Priority:**
1. **Additional language support**
2. **Wearable device integration**
3. **Advanced analytics**
4. **Performance optimization**

**Low Priority:**
1. **UI polish**
2. **Documentation improvements**
3. **Development tooling**
4. **Code refactoring**

---

## 📄 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## 📜 License

By contributing to SafeMap, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for helping make SafeMap the world's best women's safety platform!** 🛡️

Together, we can save lives and empower women's safety through technology. 💪 