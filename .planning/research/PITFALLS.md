# Pitfalls Research

**Domain:** HRMS Indonesia
**Researched:** 2026-01-29
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: BPJS/PPh 21 Compliance Engine

**What goes wrong:**
Payroll calculations produce incorrect tax withholdings or BPJS contributions, triggering audit liabilities and penalties. The system appears functional but generates non-compliant payroll runs.

**Why it happens:**
Teams treat Indonesian tax rules as "simple calculations" without understanding the complexity:
- PTKP status changes (marriage, children) aren't tracked automatically
- 20% surcharge for employees without NPWP is frequently missed
- BPJS JHT and BPJS Kesehatan contribution rates change annually
- e-Bupot filing deadlines (20th) and payment deadlines (15th) are hardcoded
- Province-specific UMK (minimum wage) rules aren't integrated

**How to avoid:**
Build compliance as a separate microservice with:
- Monthly tax rule updates from official DJP sources
- Automated PTKP change detection through employee lifecycle events
- Pre-payroll compliance validation with dry-run mode
- Separate audit trail for all compliance calculations

**Warning signs:**
- Manual spreadsheet adjustments before each payroll run
- "It works but we need to fix X employee's tax" comments in code
- Compliance rules scattered across multiple modules
- No automated testing against official tax calculators

**Phase to address:**
Phase 1 (Foundation) - Compliance engine must be built before any payroll features

---

### Pitfall 2: Mobile GPS Attendance Accuracy

**What goes wrong:**
Field employees (60% of workforce) have attendance rejected due to GPS drift, or can clock in from unauthorized locations. The system becomes unreliable for payroll calculation.

**Why it happens:**
Teams implement basic GPS checking without understanding Indonesia-specific challenges:
- Urban density causes GPS drift (10-50 meter accuracy)
- Poor network coverage in industrial areas prevents real-time verification
- Cheap Android phones have inconsistent GPS hardware
- Geofencing coordinates are set once and never updated
- No fallback mechanism for network failures

**How to avoid:**
Implement multi-layered attendance validation:
- Haversine formula with dynamic radius based on GPS accuracy
- Network location fallback when GPS is unavailable
- Photo verification + timestamp for high-risk locations
- Offline mode with sync when connectivity returns
- Regular geofence coordinate validation

**Warning signs:**
- High rate of "attendance pending approval" tickets
- Employees complaining about app not working in certain areas
- Manual attendance overrides increasing over time
- GPS coordinates showing impossible locations

**Phase to address:**
Phase 2 (Core Features) - Attendance system must handle field employee realities

---

### Pitfall 3: UMKM Payroll Complexity Underestimation

**What goes wrong:**
Payroll engine handles basic salary but fails with overtime, THR, shift differentials, and province-specific calculations. UMKR (50-200 employees) have complex payroll needs that aren't enterprise-scale.

**Why it happens:**
Teams assume "small business = simple payroll" without understanding UMKM realities:
- Multiple shift types with different rates
- Overtime calculation following Indonesian labor law (1.5x, 2x, 3x multipliers)
- THR (religious holiday allowance) proration for new employees
- Province-specific minimum wage (UMK) and BPJS caps
- Piece-rate and commission-based pay structures

**How to avoid:**
Design payroll engine with UMKM complexity:
- Configurable shift patterns with automatic rate calculation
- Overtime rules engine with legal compliance checks
- THR calculation engine with proration rules
- Province-specific rule sets with automatic updates
- Support for mixed payment types (salary + commission)

**Warning signs:**
- Manual payroll adjustments for "special cases"
- Spreadsheets used to calculate overtime or THR
- HR team spending days on payroll verification
- Employee complaints about incorrect pay calculations

**Phase to address:**
Phase 2 (Core Features) - Payroll engine must handle UMKM complexity from day one

---

### Pitfall 4: PWA Cache Invalidation for Time-Sensitive Data

**What goes wrong:**
PWA serves stale attendance data, payroll figures, or compliance information. Users see outdated information leading to incorrect business decisions.

**Why it happens:**
Teams implement standard PWA caching without considering HRMS data sensitivity:
- Service worker caches payroll data indefinitely
- No cache invalidation for time-sensitive attendance records
- Offline mode shows yesterday's schedule as current
- Push notifications don't trigger cache refresh
- No version-aware cache management

**How to avoid:**
Implement intelligent caching strategy:
- Time-based cache invalidation (attendance: 5 min, payroll: 1 hour, compliance: 24 hours)
- Event-driven cache updates (clock-in/out triggers immediate sync)
- Critical data bypasses cache when network available
- Versioned cache with migration strategy
- Network-aware caching (aggressive when online, conservative when offline)

**Warning signs:**
- Users reporting "I clocked in but it doesn't show"
- Payroll numbers changing between app refreshes
- Support tickets about "app showing wrong information"
- Manual "clear cache" instructions in user documentation

**Phase to address:**
Phase 2 (Core Features) - PWA must handle real-time data correctly

---

### Pitfall 5: Hybrid AI Team Documentation Gaps

**What goes wrong:**
Knowledge exists only in Claude Code sessions or individual team members' heads. The hybrid AI team (Claude Code + Opus 4.5) cannot maintain context across projects.

**Why it happens:**
Teams treat AI tools as temporary assistants rather than permanent team members:
- No structured documentation for AI agent skills
- Context switching between Claude Code and Opus 4.5 without handoff
- Critical decisions made in AI sessions aren't preserved
- No version control for AI-generated code patterns
- Team members don't document AI-assisted solutions

**How to avoid:**
Establish AI team documentation practices:
- Create `.claude/` directory with agent skills and context
- Document all AI-assisted decisions with rationale
- Maintain AI session logs with searchable summaries
- Version control AI-generated patterns and templates
- Regular AI team retrospectives with documented outcomes

**Warning signs:**
- "How did we build this?" questions about existing features
- AI sessions starting from scratch each time
- Different team members getting different AI results
- No documentation of AI-assisted optimizations

**Phase to address:**
Phase 1 (Foundation) - AI team documentation must be established from project start

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoded tax rates | Quick MVP launch | Compliance violations, audit risk | Never |
| Manual attendance overrides | Reduced support tickets | Payroll inaccuracies, employee distrust | Only with audit trail |
| Spreadsheet payroll verification | Perceived accuracy | Manual process, human error | Only during parallel testing |
| Single database for all data | Simplified deployment | Performance bottlenecks, scaling issues | MVP with <50 employees |
| Skip PWA testing on iOS | Faster development | 30% of users can't use app | Never for field employees |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| BPJS API | Assume endpoint is always available | Implement retry logic with exponential backoff |
| DJP e-Bupot | Hardcode XML format | Use official XSD schemas with validation |
| Bank Transfer API | Store bank details in plain text | Encrypt sensitive data with key rotation |
| GPS Services | Use coordinates without accuracy check | Require accuracy < 50 meters for attendance |
| Push Notifications | Send sensitive payroll data | Use notifications as triggers only, fetch data securely |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| N+1 payroll queries | Payroll calculation takes >30 seconds | Batch employee payroll processing | 100+ employees |
| GPS polling every minute | Battery drain, network overload | Adaptive polling based on movement | 60+ field employees |
| PWA cache bloat | App becomes unusable after 1 week | Cache size limits with cleanup strategy | 1 month of usage |
| Real-time attendance sync | Database locks during peak hours | Queue-based processing with async sync | 50+ simultaneous clock-ins |
| Compliance rule loading | Payroll fails to start | Cache rules with background updates | Rule changes >10 per month |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing NPWP in plain text | Identity theft, compliance violation | Encrypt at rest with field-level encryption |
| GPS coordinates in logs | Employee tracking, privacy violation | Hash coordinates in logs, store raw securely |
| Payroll data in localStorage | Data theft on device loss | Use encrypted storage with device binding |
| No audit trail for payroll changes | Fraud detection impossible | Immutable audit logs with digital signatures |
| API keys in client code | Service abuse, cost overruns | Environment variables with server-side proxy |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Complex attendance approval | Delayed payroll, employee frustration | One-tap approval with exception handling |
| No offline mode | Field employees can't clock in | Offline-first design with sync on reconnect |
| Payroll details hidden | Lack of trust in system | Transparent breakdown with explanations |
| English-only interface | 40% of users struggle | Bahasa Indonesia with simple language |
| Small touch targets | Mis-taps on mobile phones | 44px minimum touch targets with spacing |

## "Looks Done But Isn't" Checklist

- [ ] **Payroll Engine:** Often missing THR proration rules — verify with new employee scenarios
- [ ] **Attendance System:** Often missing network fallback — test with airplane mode
- [ ] **BPJS Integration:** Often missing error handling — test with invalid employee numbers
- [ ] **PWA Caching:** Often missing real-time updates — test with concurrent users
- [ ] **Compliance Rules:** Often missing province variations — test with different provinces
- [ ] **Mobile GPS:** Often missing accuracy validation — test with old Android phones
- [ ] **AI Documentation:** Often missing session context — verify with new team member

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Compliance errors | HIGH | 1. Halt payroll 2. Manual audit 3. Repay employees 4. Pay penalties 5. Rebuild compliance engine |
| GPS attendance failures | MEDIUM | 1. Enable manual override 2. Add photo verification 3. Implement network fallback 4. Gradually re-enable GPS |
| PWA cache issues | LOW | 1. Force cache refresh 2. Push update 3. Monitor cache hit rates 4. Adjust caching strategy |
| Payroll calculation errors | HIGH | 1. Identify affected periods 2. Recalculate manually 3. Issue corrections 4. Improve testing 5. Add audit trails |
| AI context loss | MEDIUM | 1. Review git history 2. Reconstruct decisions 3. Document patterns 4. Establish AI team practices |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| BPJS/PPh 21 Compliance | Phase 1 (Foundation) | Test against official DJP calculator with edge cases |
| GPS Attendance Accuracy | Phase 2 (Core Features) | Field testing with various Android devices and network conditions |
| UMKM Payroll Complexity | Phase 2 (Core Features) | Parallel payroll testing with real employee scenarios |
| PWA Cache Invalidation | Phase 2 (Core Features) | Load testing with concurrent users and network failures |
| AI Documentation Gaps | Phase 1 (Foundation) | New team member can understand project without verbal handoff |

## Sources

- JCSS Indonesia PPh 21 compliance research (2026)
- Gadjian payroll errors analysis (2025)
- ResearchGate geolocation attendance studies (2025)
- Acclime Indonesia payroll compliance risks (2025)
- Emerhub payroll calculation guide (2025)
- Kusuma Law Firm THR payment regulations (2025)
- Claude Code documentation best practices (2025)
- PWA cache behavior case studies (2025)

---
*Pitfalls research for: HRMS Indonesia*
*Researched: 2026-01-29*