# 07 — Roadmap phân task, thứ tự và Definition of Done

> Implement bằng PR nhỏ **sau** PR docs, không gom mọi task vào một mega-PR.

| Task | Phạm vi | Phụ thuộc | DoD |
|---|---|---|---|
| BP-00 | Chốt v1 ruleset / security / names / MVP, ADR | Docs được duyệt | Rulebook nhất quán + sign-off |
| BP-01 | Core reducer, validator, scoring events, 4-neighbor, lines, wild/eraser | BP-00 | Unit & property-based tests passing |
| BP-02 | Seeded piece generator, pool, policy agent, Monte Carlo simulator | BP-01 | Replay deterministic & balance report |
| BP-03 | Frontend Binh Pháp Board, HUD, controls & assets existing | BP-02 | Desktop/mobile/a11y review |
| BP-04 | Scene wiring gated, tutorial, pause/resume local/guest | BP-03 | No navigation/regression issues |
| BP-05 | Progress persistence and optional online verified run | BP-02/04 | Versioned save; security review |
| BP-06 | Leaderboard, rewards economy **ONLY if approved** | BP-05 | Server settlement idempotent; economic QA |
| BP-07 | QA comprehensive, rollout flag, documentation, regression | BP-04/05 | Formal product acceptance |
| TW-01 | Trial content-driven floor registry, floor migration, UI pagination | Independent | 20-floors baseline untouched; extension safe |
| TW-02 | Destiny 10→20 simulation, snapshot migration & payouts | Independent | No live-run retroactive mutation |
| SUR-01 | Survival UI rename to Thủ Thành | Independent | Zero API/logic/save changes |

## Phân kỳ

- **Phase A:** BP-00 + BP-01; không thêm scene Home, không tạo hình mới.
- **Phase B:** BP-02 và balance/proof of fun; nếu gameplay chưa hấp dẫn dừng tại đây.
- **Phase C:** BP-03–BP-04 + art polish, user review.
- **Phase D:** BP-05–BP-07. Rewards/ranking tách feature flags và secure endpoint; nếu chưa duyệt vẫn ra practice offline.
- **Later:** TW-01, TW-02, SUR-01 riêng; không trộn vào PR Binh Pháp.

## Test output bắt buộc mỗi PR implementation

- Scope of files / risks / backward compat.
- Tests executed and status (do not claim if environment fails).
- Screenshot 1440px/390px for UI tasks.
- Unit + seeded replay + adversarial scenarios for engine tasks.
- Audit economy + idempotency for server reward tasks.
- Explicit no unrelated edits (Battle Engine, Campaign V2, Song Tháp progress).

## Release conditions

- Mode flag default off until server/UI/asset ready.
- Game title in Vietnamese, claims “lấy cảm hứng” chỉ trong docs, không lấy thiết kế thương mại gốc.
- Historical/fiction labels wherever narrative is added; no unsupported historical claims.
- Sound/TTS/voice deferred.
