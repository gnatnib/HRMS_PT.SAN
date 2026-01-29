# Feature Research

**Domain:** HRMS Indonesia (UMKM-focused)
**Researched:** 2026-01-29
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Mobile Attendance with GPS** | Field employees need clock-in/out from job sites | MEDIUM | GPS validation, geofencing, anti-fraud required |
| **Payroll Calculation** | Core HR function - salary processing is non-negotiable | HIGH | Must handle Indonesian tax calculations |
| **BPJS Integration** | Legal requirement for Indonesian companies | HIGH | BPJS Kesehatan & Ketenagakerjaan mandatory |
| **PPh 21 Tax Calculation** | Legal tax compliance requirement | HIGH | Complex tax rules, must stay current |
| **Leave Management** | Basic employee administration | LOW | Annual leave, sick leave, personal leave |
| **Employee Database** | Core HR information management | LOW | Personal data, job info, emergency contacts |
| **Basic Reports** | Management needs visibility | MEDIUM | Attendance, payroll, leave reports |
| **Mobile App** | 60% field employees need mobile access | MEDIUM | Android & iOS, self-service features |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **PWA Technology** | No app store download, works offline, instant updates | MEDIUM | Perfect for UMKM with limited IT support |
| **AI-Powered Fraud Detection** | Prevents buddy punching and time theft | HIGH | Liveness validation, facial recognition |
| **Real-time Field Monitoring** | Live tracking of field employees | MEDIUM | Dashboard for managers, GPS tracking |
| **Automated Compliance Updates** | Stays current with changing Indonesian laws | HIGH | BPJS rate changes, tax rule updates |
| **Voice-Enabled Features** | Hands-free operation for field workers | MEDIUM | Siri & Google Assistant integration |
| **Shift Scheduling Automation** | Optimizes workforce deployment | HIGH | Complex patterns, overtime management |
| **Integrated Reimbursement** | Streamlines expense claims | MEDIUM | Mobile submission, approval workflow |
| **HR Analytics Dashboard** | Data-driven decision making for UMKM | MEDIUM | Visual insights, predictive analytics |
| **Affordable Pricing Tiers** | UMKM-friendly pricing model | LOW | Per-employee pricing, free tier available |
| **Localized Support** | Bahasa language, Indonesian time zones | LOW | Cultural understanding, local regulations |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Complex Performance Management** | Enterprise-grade reviews | Too complex for UMKM, over-engineered | Simple goal tracking, basic feedback |
| **Advanced Recruitment ATS** | Full hiring pipeline | UMKM hire infrequently, not worth complexity | Basic candidate tracking, simple job posting |
| **Learning Management System** | Employee training | UMKM need on-the-job training, not e-learning | External training integration, simple skill tracking |
| **Succession Planning** | Leadership development | UMKM structure too flat, not applicable | Basic skill inventory, cross-training tracking |
| **Compensation Planning** | Salary benchmarking | UMKM budgets limited, market data expensive | Basic salary bands, simple increase tracking |
| **Employee Engagement Surveys** | Measure satisfaction | Survey fatigue, actionability issues | Simple feedback channels, pulse check |
| **Advanced Benefits Administration** | Complex perks | UMKM offer basic benefits, not worth complexity | BPJS + basic insurance tracking |

## Feature Dependencies

```
[Employee Database]
    └──requires──> [Mobile App Registration]
                       └──requires──> [User Authentication]

[Mobile Attendance]
    └──requires──> [Employee Database]
    └──requires──> [GPS/Geofencing]
    └──enhances──> [Payroll Calculation]

[Payroll Calculation]
    └──requires──> [BPJS Integration]
    └──requires──> [PPh 21 Tax Engine]
    └──requires──> [Attendance Data]

[Leave Management]
    └──requires──> [Employee Database]
    └──requires──> [Approval Workflow]

[HR Analytics]
    └──requires──> [All Data Sources]
    └──enhances──> [All Features]

[PWA Technology]
    └──enhances──> [Mobile App Experience]
    └──enhances──> [Field Employee Adoption]
```

### Dependency Notes

- **[Employee Database] requires [Mobile App Registration]:** Foundation for all HR features
- **[Mobile Attendance] requires [GPS/Geofencing]:** Core functionality for field tracking
- **[Payroll Calculation] requires [BPJS Integration]:** Legal compliance dependency
- **[HR Analytics] requires [All Data Sources]:** Aggregates data from all modules
- **[PWA Technology] enhances [Mobile App Experience]:** Technical foundation for mobile-first approach

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] **Employee Database** — Foundation for all HR operations
- [ ] **Mobile Attendance with GPS** — Core value proposition for field teams
- [ ] **Basic Payroll Calculation** — Essential compensation processing
- [ ] **BPJS Integration** — Legal compliance requirement
- [ ] **PPh 21 Basic Calculation** — Tax compliance necessity
- [ ] **Mobile App (Android/iOS)** — Field employee access
- [ ] **Basic Reports** — Management visibility

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] **Leave Management** — Employee self-service expansion
- [ ] **PWA Technology** — Improved mobile experience
- [ ] **Advanced Reports** — Enhanced analytics
- [ ] **Reimbursement Management** — Expense processing
- [ ] **Shift Management** — Complex scheduling

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **AI Fraud Detection** — Advanced security features
- [ ] **Real-time Monitoring** — Live tracking dashboard
- [ ] **Voice Integration** — Hands-free operation
- [ ] **HR Analytics Platform** — Business intelligence
- [ ] **Advanced Compliance** — Automated regulatory updates

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Employee Database | HIGH | LOW | P1 |
| Mobile Attendance | HIGH | MEDIUM | P1 |
| Payroll Calculation | HIGH | HIGH | P1 |
| BPJS Integration | HIGH | MEDIUM | P1 |
| PPh 21 Calculation | HIGH | HIGH | P1 |
| Mobile App | HIGH | MEDIUM | P1 |
| Basic Reports | MEDIUM | LOW | P1 |
| Leave Management | MEDIUM | LOW | P2 |
| PWA Technology | MEDIUM | MEDIUM | P2 |
| AI Fraud Detection | MEDIUM | HIGH | P3 |
| Real-time Monitoring | MEDIUM | HIGH | P3 |
| Voice Integration | LOW | MEDIUM | P3 |
| HR Analytics | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | MiHCM Lite | Mekari Talenta | Ngabsen.id | Our Approach |
|---------|------------|----------------|------------|--------------|
| **Mobile Attendance** | GPS + Geofencing | GPS + Liveness | GPS + Anti-fake | GPS + PWA + AI fraud detection |
| **Payroll** | Automated + BPJS | Automated + BPJS | Basic + BPJS | Automated + BPJS + PPh 21 |
| **Pricing** | Up to 250 emp | Enterprise scale | UMKM focused | Per-employee, UMKM tiers |
| **Mobile App** | Native iOS/Android | Native iOS/Android | Android only | PWA + Native hybrid |
| **Compliance** | Indonesian laws | Indonesian laws | Indonesian laws | Automated updates |
| **Field Support** | GPS tracking | Live tracking | GPS validation | Real-time + AI insights |
| **Complexity** | Medium | High | Low | Simple + Scalable |

## Indonesia-Specific Features

### Mandatory Compliance Features
- **BPJS Kesehatan Integration** - Health insurance mandatory
- **BPJS Ketenagakerjaan Integration** - Employment insurance mandatory  
- **PPh 21 Tax Calculation** - Income tax withholding
- **THR (Holiday Bonus) Calculation** - Religious holiday allowance
- **Severance Pay Calculation** - Termination compensation
- **Overtime Rate Compliance** - Indonesian labor law rates

### Localization Features
- **Bahasa Indonesia Interface** - Local language support
- **Indonesian Time Zones** - WIB/WITA/WIT support
- **Local Bank Integration** - Major Indonesian banks
- **Regional Holiday Calendar** - Provincial holidays
- **Indonesian ID Format** - KTP validation

### UMKM-Specific Adaptations
- **Affordable Pricing Tiers** - Per-employee models
- **Simple Setup Process** - Quick deployment
- **Limited IT Dependency** - Cloud-based, minimal setup
- **Scalable Architecture** - Grows with business
- **Local Support** - Indonesian time zone, Bahasa speaking

## Sources

- **MiHCM Lite:** HR system for small businesses up to 250 employees, GPS attendance, Indonesian compliance
- **Mekari Talenta:** Comprehensive HRIS with mobile attendance, payroll, BPJS integration
- **Ngabsen.id:** UMKM-focused attendance app with GPS anti-fraud, BPJS calculation
- **GajiHub:** Mobile-first HR with GPS validation, affordable pricing
- **Hadirr:** GPS attendance with geofencing, face recognition
- **Asanify:** AI-powered HRMS with BPJS, PPh 21 automation
- **HRMSNext:** Cloud-based HR with 100% Indonesian compliance

---
*Feature research for: HRMS Indonesia (UMKM-focused)*
*Researched: 2026-01-29*