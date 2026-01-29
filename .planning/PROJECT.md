# PROJECT SPECIFICATION - HRMS SMART PRESENCE

## Deskripsi Proyek

**Sistem HRMS Terpadu dengan Fokus Kepatuhan Indonesia untuk UMKM (50-200 Karyawan)**

Sistem Human Resource Management System (HRMS) modern yang dirancang khusus untuk memenuhi kebutuhan UMKM Indonesia dengan kepatuhan regulasi penuh. Sistem ini menggabungkan antarmuka web untuk manajemen dan Progressive Web App (PWA) untuk karyawan lapangan dengan fitur pelacakan GPS real-time.

## Nilai Inti (Core Value)

**"Single Source of Truth untuk HRMS Indonesia yang Kepatuhan-Driven"**

Sistem ini menghilangkan ambiguitas dalam perhitungan payroll dan kehadiran dengan logika yang tervalidasi sesuai regulasi Indonesia, memberikan kepercayaan penuh bagi pengambil keputusan dan karyawan.

## Target Pengguna

### Primary Users
- **HR Manager** (1-3 orang perusahaan): Manajemen penuh sistem
- **Finance/Accounting** (1-2 orang): Verifikasi payroll dan laporan
- **Department Heads** (5-10 orang): Approval cuti, overtime, dan evaluasi kinerja

### Secondary Users  
- **Office Employees** (40% ~ 20-80 karyawan): Web dashboard untuk self-service
- **Field Employees** (60% ~ 30-120 karyawan): PWA mobile untuk attendance dasar

## Batasan & Kendala (Constraints)

### Teknis
- **Unified Codebase**: Satu codebase Next.js untuk web dan mobile PWA
- **Database**: MySQL dengan schema yang ketat dan terdokumentasi
- **Deployment**: Cloud hosting dengan auto-scaling untuk 200 karyawan
- **Mobile**: PWA dengan akses Geolocation API dan Kamera via browser

### Regulasi (Blocking Issues)
- **PPh 21**: Harus mendukung Tarif Efektif Rata-rata (TER) 2024/2025
- **BPJS Ketenagakerjaan**: JKK, JKM, JHT, JP dengan tarif terbaru
- **BPJS Kesehatan**: Perhitungan berdasarkan gaji pokok
- **Depnaker**: Overtime 1.5x jam pertama, 2x jam berikutnya
- **Denda Keterlambatan**: Sistem konfigurasi penalty

### Operasional
- **Documentation-Driven**: Kode ditulis setelah artefak `.planning/` lengkap
- **Tim Hybrid AI**: Claude Code untuk planning, Opus 4.5 untuk implementasi
- **Bahasa Indonesia**: Semua dokumentasi dan interface dalam Bahasa Indonesia
- **UMKM Focus**: Optimized untuk 50-200 karyawan, bukan enterprise scale

## Keputusan Arsitektur

### Frontend Stack
- **Next.js 14+**: React framework dengan PWA capabilities
- **Tailwind CSS**: Utility-first styling untuk mobile responsiveness
- **TypeScript**: Type safety untuk tim hybrid AI
- **PWA**: Service worker untuk offline mobile attendance

### Backend Stack  
- **Laravel 11+**: API-only backend dengan sanctum authentication
- **MySQL 8+**: Database dengan schema yang ketat
- **Redis**: Queue system untuk payroll processing
- **File Storage**: Local storage dengan backup cloud

### Integration Strategy
- **File-Based**: CSV/Excel export untuk bank transfers dan BPJS reporting
- **No Direct API**: Belum perlu integrasi API langsung ke bank/pemerintah
- **Template-Driven**: Generate dokumen HR dengan placeholder system

## Scope Fungsional

### Module 1: Attendance & Time Management (Smart Presence)
- **Clock In/Out Mobile**: GPS coordinates + timestamp + selfie validation
- **Live Tracking**: Real-time map untuk field employees  
- **Shift Management**: Rostering dengan shift swapping
- **Overtime**: Auto-calculate sesuai Depnaker regulations
- **Timesheet**: Project-based time tracking
- **Leave Management**: Cuti tahunan, sakit, tanpa gaji dengan approval pipeline

### Module 2: Payroll & Compensation
- **Payroll Engine**: Automated calculation dengan PPh 21 TER dan BPJS
- **Bank Transfer**: Export CSV format BCA/Mandiri
- **Digital Payslips**: Encrypted payslips via employee dashboard
- **Expense Reimbursement**: Upload receipt dengan approval flow
- **Loan Management**: Kasbon dengan auto-deduction

### Module 3: HR Administration
- **Employee Database**: Centralized data dengan BPJS family info
- **Document Management**: Contracts, NDAs, SP letters dengan template generator
- **Asset Management**: Company assets tracking
- **Task Management**: Kanban board untuk HR tasks
- **Internal Communication**: Announcement board dan chat

### Module 4: Talent Acquisition
- **ATS System**: Kanban pipeline (Applied → Screening → Interview → Offer → Hired)
- **Manpower Planning**: Budgeting untuk new hires
- **Onboarding/Offboarding**: Digital checklist dengan clearance

### Module 5: Talent Development & Analytics
- **Performance Management**: KPI/OKR setting dengan appraisal system
- **LMS Basic**: Training assignment dengan completion tracking
- **HR Analytics**: Dashboard headcount, turnover, absenteeism, payroll cost

## Kriteria Sukses

### Technical Success
- [ ] Schema database tervalidasi untuk 200 karyawan
- [ ] PWA mobile dapat clock-in/out dengan GPS < 3 detik
- [ ] Payroll engine menghitung 100 karyawan < 30 detik
- [ ] Export CSV bank transfer compatible dengan BCA/Mandiri

### Business Success  
- [ ] Kepatuhan BPJS dan PPh 21 100% akurat
- [ ] HR admin time reduced 50% untuk operasional bulanan
- [ ] Field employee attendance tracking real-time
- [ ] Digital payslips accessible 24/7 oleh karyawan

### Documentation Success
- [ ] `DATABASE_SCHEMA.md` presisi untuk Opus 4.5 implementation
- [ ] `API_CONTRACT.md` lengkap dengan contoh request/response
- [ ] `MODULE_LOGIC.md` detail untuk perhitungan payroll Indonesia
- [ ] Tim Opus 4.5 dapat implementasi tanpa ambigu

## Risiko & Mitigasi

### Risiko Kepatuhan
- **Perubahan regulasi BPJS/PPh 21**: Mitigasi dengan modular calculation engine
- **Error perhitungan payroll**: Mitigasi dengan comprehensive test suite

### Risiko Teknis
- **PWA compatibility**: Mitigasi dengan fallback web mobile
- **GPS accuracy**: Mitigasi dengan geofencing validation
- **Performance 200 karyawan**: Mitigasi dengan database optimization

### Risiko Tim
- **Documentation ambiguity**: Mitigasi dengan review cycle Opus 4.5 team
- **Code inconsistency**: Mitigasi dengan strict linting dan type safety

## Timeline Estimasi

### Phase 1: Foundation (4-6 minggu)
- Database schema dan API contracts
- Authentication system
- Basic employee management
- Mobile PWA setup

### Phase 2: Core Modules (6-8 minggu)  
- Attendance system dengan GPS
- Payroll engine dengan kepatuhan
- Leave management
- Basic reporting

### Phase 3: Advanced Features (4-6 minggu)
- ATS dan recruitment
- Performance management
- HR analytics dashboard
- Document templates

### Phase 4: Integration & Polish (2-4 minggu)
- Bank transfer export
- BPJS reporting templates
- Mobile optimization
- User acceptance testing

**Total Estimasi: 16-24 minggu (4-6 bulan)**

---
*Last updated: 29 Januari 2026 - Project Initialization*