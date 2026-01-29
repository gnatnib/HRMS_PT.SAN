# Project Research Summary

**Project:** HRMS Smart Presence
**Domain:** HRMS Indonesia (UMKM-focused)
**Researched:** 2026-01-29
**Confidence:** HIGH

## Executive Summary

HRMS Smart Presence adalah sistem Human Resource Management modern yang dirancang khusus untuk UMKM Indonesia (50-200 karyawan) dengan fokus kepatuhan regulasi penuh. Berdasarkan penelitian, sistem ini harus menggabungkan Progressive Web App (PWA) untuk karyawan lapangan dengan web dashboard untuk manajemen, menggunakan Next.js + Laravel stack dengan MySQL database. Pendekatan yang direkomendasikan adalah mobile-first dengan GPS attendance validation dan payroll engine yang memenuhi regulasi BPJS dan PPh 21.

Risiko terbesar adalah kesalahan perhitungan kepatuhan (BPJS/PPh 21) yang dapat menyebabkan liabilitas hukum, serta akurasi GPS attendance untuk karyawan lapangan. Mitigasi dilakukan dengan membangun compliance engine sebagai microservice terpisah dan implementasi multi-layered attendance validation dengan fallback mechanisms.

## Key Findings

### Recommended Stack

Dari penelitian existing codebase dan best practices, stack yang direkomendasikan adalah Next.js 14+ dengan PWA capabilities untuk frontend, dan Laravel 11+ API-only untuk backend. Database MySQL 8+ dengan Redis untuk queue processing payroll. Stack ini sudah terbukti untuk UMKM scale dan mendukung mobile-first approach yang critical untuk 60% karyawan lapangan.

**Core technologies:**
- **Next.js 14+ PWA** — Mobile-first interface dengan offline capabilities untuk field employees
- **Laravel 11+ API** — Backend robust dengan sanctum authentication dan queue system
- **MySQL 8+** — Database terpercaya dengan proper indexing untuk 200 karyawan
- **Redis Queue** — Asynchronous payroll processing untuk performance

### Expected Features

Penelitian menunjukkan user expectation yang jelas untuk HRMS Indonesia. Table stakes features yang harus ada termasuk mobile attendance dengan GPS, payroll calculation dengan BPJS integration, dan PPh 21 tax compliance. Differentiators utama adalah PWA technology (no app store download) dan AI-powered fraud detection untuk competitive advantage.

**Must have (table stakes):**
- **Mobile Attendance with GPS** — Field employees need clock-in/out dari job sites
- **Payroll Calculation** — Core HR function dengan BPJS dan PPh 21 compliance
- **Employee Database** — Foundation untuk semua HR operations
- **Basic Reports** — Management visibility untuk attendance dan payroll

**Should have (competitive):**
- **PWA Technology** — No app store download, works offline, instant updates
- **AI-Powered Fraud Detection** — Prevents buddy punching dan time theft
- **Real-time Field Monitoring** — Live tracking dashboard untuk managers

**Defer (v2+):**
- **Advanced Performance Management** — Terlalu complex untuk UMKM
- **Learning Management System** — UMKM butuh on-the-job training, bukan e-learning

### Architecture Approach

Service-Repository pattern dengan Laravel API dan queue-based processing untuk payroll. PWA offline-first architecture dengan intelligent caching strategy untuk time-sensitive data. Microservice approach untuk compliance engine (BPJS/PPh 21) untuk isolasi risiko kepatuhan.

**Major components:**
1. **Next.js PWA** — Mobile-first UI dengan GPS tracking, camera access, offline capabilities
2. **Laravel API Gateway** — RESTful endpoints dengan sanctum authentication dan business logic orchestration
3. **Payroll Processor** — Queue-based processing untuk salary calculations dengan BPJS/PPh 21 compliance
4. **Compliance Engine** — Dedicated service untuk Indonesian labor law compliance dengan automated updates

### Critical Pitfalls

Lima pitfall kritis yang diidentifikasi dari penelitian:

1. **BPJS/PPh 21 Compliance Engine** — Build sebagai microservice terpisah dengan monthly tax rule updates
2. **Mobile GPS Attendance Accuracy** — Implement multi-layered validation dengan Haversine formula dan network fallback
3. **UMKM Payroll Complexity** — Handle overtime, THR, shift differentials dengan configurable rule engine
4. **PWA Cache Invalidation** — Time-based cache invalidation (attendance: 5 min, payroll: 1 hour)
5. **Hybrid AI Team Documentation** — Establish `.claude/` directory dengan agent skills dan context preservation

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation
**Rationale:** Compliance engine must be built before any payroll features untuk menghindari liabilitas hukum
**Delivers:** Database schema, authentication system, basic employee management, compliance engine
**Addresses:** Employee database, user authentication, BPJS/PPh 21 calculation foundation
**Avoids:** BPJS/PPh 21 compliance errors, AI documentation gaps

### Phase 2: Core Features
**Rationale:** Mobile attendance dan payroll adalah core value proposition yang harus validasi dulu
**Delivers:** GPS attendance system, payroll engine dengan compliance, leave management, basic reports
**Uses:** Next.js PWA, Laravel API, MySQL database, Redis queue system
**Implements:** Service-Repository pattern, queue-based processing, PWA offline capabilities

### Phase 3: Advanced Features
**Rationale:** Differentiators untuk competitive advantage setelah core terbukti works
**Delivers:** AI fraud detection, real-time monitoring, HR analytics, document templates
**Uses:** Advanced PWA capabilities, background processing, real-time data synchronization

### Phase 4: Integration & Polish
**Rationale:** Production readiness dengan bank integration dan optimization
**Delivers:** Bank transfer export, BPJS reporting templates, mobile optimization, UAT
**Implements:** File-based integrations, performance optimization, comprehensive testing

### Phase Ordering Rationale

- Foundation dulu karena compliance engine adalah blocking requirement yang tidak bisa ditunda
- Core features berikutnya untuk validate product-market fit dengan UMKM users
- Advanced features terakhir untuk competitive advantage setelah core proven
- Integration & polish untuk production readiness dan scaling preparation

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** GPS attendance accuracy validation — perlu field testing dengan berbagai Android devices dan network conditions
- **Phase 2:** UMKM payroll complexity — perlu parallel payroll testing dengan real employee scenarios
- **Phase 3:** AI fraud detection algorithms — perlu research biometric validation dan liveness detection

Phases dengan standard patterns (skip research-phase):
- **Phase 1:** Authentication dan database setup — well-documented Laravel patterns
- **Phase 4:** File export integrations — established CSV/Excel patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Existing codebase validation, established patterns |
| Features | HIGH | Competitor analysis, user expectation research |
| Architecture | HIGH | Service-Repository pattern terbukti, PWA best practices |
| Pitfalls | HIGH | Real-world failure cases analysis, compliance research |

**Overall confidence:** HIGH

### Gaps to Address

- **GPS Accuracy Threshold:** Perlu field testing untuk menentukan acceptable GPS accuracy radius (current research suggests < 50 meters)
- **BPJS API Rate Limits:** Perlu testing dengan actual BPJS API untuk understand rate limits dan error handling
- **PWA iOS Background Sync:** Perlu validation untuk iOS Safari limitations pada background tracking

## Sources

### Primary (HIGH confidence)
- Next.js PWA Documentation — Progressive Web App capabilities dan service worker patterns
- Laravel 11 Queue System — Asynchronous job processing untuk payroll calculations
- Indonesian BPJS Compliance Guidelines — Legal requirements untuk contribution calculations
- PWA Best Practices MDN — Offline-first architecture dan caching strategies

### Secondary (MEDIUM confidence)
- JCSS Indonesia PPh 21 compliance research (2026) — Tax calculation rules dan TER implementation
- Gadjian payroll errors analysis (2025) — Common failure patterns dalam payroll systems
- ResearchGate geolocation attendance studies (2025) — GPS accuracy challenges di urban environments

### Tertiary (LOW confidence)
- Competitor feature analysis (MiHCM, Mekari Talenta, Ngabsen.id) — Market positioning validation
- Acclime Indonesia payroll compliance risks (2025) — Legal risk assessment needs validation

---
*Research completed: 2026-01-29*
*Ready for roadmap: yes*