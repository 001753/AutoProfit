# AutoProfit — PRD → Phase/Subphase Matrix

**Status:** baseline P00.1  
**Reviewed:** 2026-08-11  
**Source:** `DOC/AutoProfit_PRD_Master_Rev5.md`  
**Breakdown authority:** `DOC/AUTOPROFIT_EXECUTION_PHASES_REV5.md`

## Reading rules

- Setiap nomor di bawah merujuk ke bagian bernomor pada PRD Rev 5. Matrix ini
  sengaja mencatat 1–164 satu per satu agar coverage dapat divalidasi otomatis.
- `P00` berarti foundation/continuity concern dan bukan fitur bisnis.
- `P07–P11` adalah connector platform dan connector bisnis; capability eksternal
  tetap `BLOCKED` sampai credential/approval/sandbox nyata tersedia.
- Mapping consumer mengikuti API/domain/event resmi; bukan izin untuk query tabel
  domain lain secara langsung.
- Satu requirement boleh memiliki producer dan consumer phase. Phase pertama
  adalah tempat kontrak/fondasi dimiliki; consumer tetap harus melalui boundary.

| PRD | Area requirement | Owning phase/subphase | Delivery note |
|---:|---|---|---|
| 1 | Product vision | P00.1 / all | Baseline product promise |
| 2 | Problem | P00.1 / C0.1 | Validate with behavior, not verbal interest |
| 3 | Target user & persona | P00.1 / C0.1 | Beachhead hypothesis; evidence open |
| 4 | Product principles | P00.1 | Governing principles |
| 5 | Product experience | P02.1–P02.2 | UX after identity dependency |
| 6 | Global navigation | P02.2 | Application shell |
| 7 | Command palette | P22.3 | Bulk/search workspace extension |
| 8 | Universal search | P06.3 | Official read model/API |
| 9 | Home dashboard | P06.2 | Dashboard source-of-truth read model |
| 10 | Profitability graph | P13.2–P13.3 | Finance-backed, not placeholder |
| 11 | Business health | P06.2 / P13.3 | Summary from official read model |
| 12 | Needs attention | P06.2 / P16.1 | Actionable notifications |
| 13 | Today mode | P02.2 / P06.2 | Shell plus dashboard workflow |
| 14 | WHY → WHAT → DO | P06.2 / P17.3 | Explanation and evidence boundary |
| 15 | Orders module | P04.2 | Order lifecycle |
| 16 | Order detail | P04.2–P04.3 | Effects and edge cases |
| 17 | Marketplace integration | P07.1 / P08–P11 | Contract first; providers may be blocked |
| 18 | Marketplace sync | P07.2 / P08–P11 | Sync state and recovery |
| 19 | Sync engine | P07.2–P07.3 | Orchestration and replay |
| 20 | Inventory | P05.1 | Stock ledger |
| 21 | Multi-warehouse | P05.3 | Transfer/costing boundary |
| 22 | Stock alert | P16.2 | Rule/event consumer |
| 23 | Purchasing | P15.2–P15.3 | PO lifecycle |
| 24 | Supplier management | P15.1 | Supplier domain |
| 25 | Customer management | P04.1 | Customer domain |
| 26 | Cash management | P13.1 | Cash source-of-truth |
| 27 | Accounting engine | P12.1–P12.3 | Journal/ledger |
| 28 | Double-entry accounting | P12.2–P12.3 | Debit/credit invariant |
| 29 | Chart of accounts | P12.1 | COA and templates |
| 30 | Financial reports | P13.3 | Same source as dashboard |
| 31 | Real profit engine | P13.2 | Estimated vs actual COGS |
| 32 | Settlement reconciliation | P14.1–P14.2 | Exception workflow |
| 33 | Bank reconciliation | P14.3 | Bank boundary |
| 34 | Tax | P23.2 | Legal review required before claims |
| 35 | AI business copilot | P17.1–P17.3 | Read-only first |
| 36 | AI action safety | P18.1–P18.2 | Approval/risk boundary |
| 37 | Business memory | P18.3 | Auditable memory |
| 38 | Explain This | P17.3 | Evidence-grounded explanation |
| 39 | WhatsApp integration | P19.1–P19.2 | Provider capability may be blocked |
| 40 | WhatsApp assistant | P19.3 / P20.3 | Read-only before action |
| 41 | Smart notification engine | P16.1–P16.2 | Rule and channel abstraction |
| 42 | Notification center | P16.1 | In-app first |
| 43 | Automation engine | P16.2–P16.3 | Reliability and safety |
| 44 | Audit log | P01.4 / P16.3 | Sensitive mutation audit |
| 45 | Role & permission | P01.2 / P01.4 | RBAC registry and enforcement |
| 46 | Multi-business | P23.1 | Membership boundary |
| 47 | Multi-currency | P12.3 / P23.2 | Accounting plus UX |
| 48 | Import engine | P06.1 | Official import path |
| 49 | Data cleaning | P06.1 | Exceptions visible, no silent loss |
| 50 | UI/UX design system | P02.1 | Accessible primitives |
| 51 | Anti-AI UI rules | P02.1 | Design quality constraint |
| 52 | Color system | P02.1 | Design tokens |
| 53 | Typography | P02.1 | Design tokens |
| 54 | Spacing | P02.1 | Design tokens |
| 55 | Border & radius | P02.1 | Design tokens |
| 56 | Cards | P02.1 | Component contract |
| 57 | Table design | P02.1 | Component contract |
| 58 | Microinteraction | P02.1 | Interaction states |
| 59 | Loading experience | P02.1 | Complete UI state requirement |
| 60 | Empty state | P02.1 | Complete UI state requirement |
| 61 | Error UX | P02.1 | Recoverable error copy |
| 62 | Mobile experience | P02.1–P02.2 | Responsive shell |
| 63 | Dark mode | P02.1 | Accessible theme |
| 64 | Responsive | P02.1 | Mobile/tablet/desktop |
| 65 | Accessibility | P02.1 | Keyboard and assistive tech |
| 66 | Performance target | P24.2 | Measured at release gate |
| 67 | Realtime architecture | P00.4 / P02.3 | Adapter boundary |
| 68 | Offline-friendly | P02.3 | Client abstraction |
| 69 | Backend architecture | P00.2–P00.4 | Runtime baseline |
| 70 | Database | P00.4 / domain phases | Postgres boundary |
| 71 | Background jobs | P00.4 | Queue contract |
| 72 | API-first | P00.3 / all | API/domain boundary |
| 73 | Security | P00.2 / P24.3 | Security gates |
| 74 | Multi-tenancy | P01.1 / P01.4 | Claims-to-query isolation |
| 75 | Observability | P00.4 / all | Structured logs and health |
| 76 | Marketplace connector framework | P07.1 | Provider-agnostic contract |
| 77 | Retry system | P00.4 / P07.2 | Backoff and dead-letter |
| 78 | Billing/SaaS | P21.1–P21.3 | Entitlement before paid collection |
| 79 | Feature flags | P21.3 | Flag boundary |
| 80 | Onboarding | P02.4 | Self-serve path |
| 81 | First value | P02.4 / P06.1–P06.2 | C1 measurement |
| 82 | Demo/sandbox mode | P02.4 / P06.1 | Clearly labeled data |
| 83 | Analytics | P22.1 | Action/value events |
| 84 | Custom dashboard | P22.2 | Saved workspace |
| 85 | Saved views | P22.2 | User views |
| 86 | Bulk operations | P22.3 | Permissioned bulk |
| 87 | Barcode | P22.3 | Barcode workflow |
| 88 | Document engine | P22.3 | Generated documents |
| 89 | Export | P06.3 | Data portability boundary |
| 90 | Data ownership | P06.3 / P00.1 | Portability and trust |
| 91 | Auditable AI | P17.1 / P18.3 | Evidence and audit |
| 92 | AI hallucination control | P17.1–P17.2 | Grounded read-only tools |
| 93 | Business alert intelligence | P16.2 / P17.3 | Explainable alert |
| 94 | Future prediction | P17.3 | Requires evidence and confidence |
| 95 | UX writing | P02.1 | Product language |
| 96 | Design quality gate | P02.1 / P24.4 | Review evidence |
| 97 | Dashboard golden rule | P06.2 | Actionable, traceable |
| 98 | Dashboard information hierarchy | P06.2 | Read model presentation |
| 99 | Core product loop | P06.2 / P16.1 | Snapshot to action |
| 100 | North Star metric | P22.1 / C3 | Meaningful decisions assisted |
| 101 | Success criteria | P24.4 / C4 | Technical and market evidence |
| 102 | Definition of Done | P00.1 / all | Completion contract |
| 103 | Phase build | P00.1 | Dependency map |
| 104 | Priority classification | P00.1 | Scope control |
| 105 | Critical architectural rule | P00.1 / P00.2 | Boundary decision |
| 106 | Core domain principle | P00.1 / all | Domain ownership |
| 107 | Event-driven internal design | P00.4 / all | Event contracts |
| 108 | Data integrity | P00.1 / all | Invariants and audit |
| 109 | Observability golden rule | P00.4 / all | Operational evidence |
| 110 | UX philosophy | P02.1 | Product experience |
| 111 | Product promise | P00.1 | Baseline |
| 112 | Final experience | P02.2 | Shell and workflow |
| 113 | Long-term moat | P00.1 / C0–C4 | Evidence plan |
| 114 | Design mantra | P02.1 | Design constraint |
| 115 | Data model & ER | P00.2 / domain phases | Contract before schema |
| 116 | API contract specification | P00.2 / domain phases | API-first boundary |
| 117 | Marketplace field/webhook catalog | P07.1 / P08–P11 | Versioned mappings |
| 118 | Accounting schema detail | P12.1 | Accounting source-of-truth |
| 119 | Non-functional requirements/SLA | P00.2 / P24.2–P24.3 | Measured release gate |
| 120 | QA/testing strategy | P00.2 / P24 | Quality gate |
| 121 | AI tool permission/safety schema | P17.1 / P18.1 | Risk registry |
| 122 | Performance/capacity planning | P24.2 | Load evidence |
| 123 | Security parameters | P00.2 / P24.3 | Security evidence |
| 124 | Billing/pricing detail | P21.1–P21.3 | Provider gate explicit |
| 125 | Analytics event taxonomy | P22.1 | Business-action metrics |
| 126 | Readiness scorecard | P24.4 | Release readiness |
| 127 | Two-phase architecture | P00.2 | Shared hosting first |
| 128 | Shared hosting architecture | P00.2–P00.4 | Adapter-backed baseline |
| 129 | Cloud migration | P25 | Triggered, no rewrite |
| 130 | Runtime/dependencies | P00.2 | Toolchain gate |
| 131 | Monitoring | P00.4 | Health and logs |
| 132 | Environment variables | P00.2 | Secret boundary |
| 133 | Completion enforcement | P00.1 / P24 | No premature completion |
| 134 | DoC orders | P04.3 | Orders gate |
| 135 | DoC inventory | P05.3 | Inventory gate |
| 136 | DoC accounting | P12.3 | Accounting gate |
| 137 | DoC marketplace sync | P07.3 / P08–P11 | Connector gate |
| 138 | DoC auth/multi-tenancy | P01.4 | Identity gate |
| 139 | DoC dashboard/home | P06.2 | Dashboard gate |
| 140 | Phase build with dependencies | P00.1 | Canonical dependency rule |
| 141 | Rev 4 readiness scorecard | P24.4 | Historical score context |
| 142 | Tokopedia/TikTok API finding | P09.1 | One engineering adapter, two channels |
| 143 | Marketplace API status | P07.1 / P08–P11 | External readiness tracked |
| 144 | Developer onboarding reality | P08–P11 | Approval/credential blocker |
| 145 | API business-rule changes | P07.1 / P08–P11 | Mapping versioning |
| 146 | API change monitoring | P07.2–P07.3 | Replay/recovery |
| 147 | Five-year resilience | P07 / P24 | Operational continuity |
| 148 | Revised marketplace DoC | P07.3 / P08–P11 | Raw payload and replay |
| 149 | Marketplace readiness score | P07 / P24 | Evidence, not assumption |
| 150 | Reachability principle | P00.1 / P02.4 | C1 first-value metric |
| 151 | WhatsApp as access channel | P19.1–P19.3 | P0 after required contracts |
| 152 | PWA | P02.3 | Web-first access |
| 153 | Self-serve onboarding/COA | P02.4 | Industry template, generic domain |
| 154 | Free/starter thresholds | P21.1 | Entitlement and migration threshold |
| 155 | Long-term resilience | P00.1 / P24 | Continuity from day one |
| 156 | Raw payload preservation/replay | P07.3 | No silent loss |
| 157 | Connector plugin ecosystem | P07.1 | Adapter/plugin boundary |
| 158 | Architecture decision records | P00.1 / P00.2 | ADR from first decision |
| 159 | Runtime/dependency upgrades | P00.2 / P24.3 | Scheduled continuity |
| 160 | Data portability | P06.3 | Early trust feature |
| 161 | Bus factor/continuity plan | P00.1 / P24.3 | Runbooks and ownership |
| 162 | Final reading order | P00.1 | Governance |
| 163 | Phase build reachability/continuity | P00.1 / all | Cross-phase rule |
| 164 | Rev 5 readiness scorecard | P00.1 / P24 | Readiness, not implementation status |

## Coverage rule

This table must contain exactly one row for each integer from 1 through 164.
Run `python scripts/validate_p001.py` after modifying it.
