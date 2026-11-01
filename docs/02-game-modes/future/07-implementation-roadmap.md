# 07 — Roadmap phân task, thứ tự và Definition of Done

> Implement bằng PR nhỏ **sau** PR docs, không gom mọi task vào một mega-PR.

| Task | Phạm vi | Phụ thuộc | DoD |
|---|---|---|---|
| BP-00 | Chốt v1 ruleset / security / names / MVP, ADR | Docs được duyệt | Rulebook nhất quán + sign-off. **Chưa sign-off**: code chạy giá trị đề xuất ([GDD mục 11](02-binh-phap-gdd.md#11-bản-triển-khai-đầu-tiên-chơi-thử-offline)) |
| BP-01 | Core reducer, validator, scoring events, 4-neighbor, lines, wild/eraser | BP-00 | Unit & property-based tests passing. **Đã làm 31/10/2026** (33 test, chưa có property-based; có bàn chữ nhật và chướng ngại) |
| BP-02 | Seeded piece generator, pool, policy agent, Monte Carlo simulator | BP-01 | Replay deterministic & balance report. **Đã làm** (2 agent random/greedy; chưa lookahead) |
| BP-03 | Frontend Binh Pháp Board, HUD, controls & assets existing | BP-02 | Desktop/mobile/a11y review. **Đã làm** bản đầu, chờ review mỹ thuật |
| BP-04 | Scene wiring gated, tutorial, pause/resume local/guest | BP-03 | No navigation/regression issues. **Đã làm một phần**: scene `FORMATION`, resume local; chưa có feature flag, chưa có tutorial riêng (chỉ bảng luật) |
| BP-05 | Progress persistence and optional online verified run | BP-02/04 | Versioned save; security review |
| BP-06 | Leaderboard, rewards economy **ONLY if approved** | BP-05 | Server settlement idempotent; economic QA. Shan đã chốt hướng có xếp hạng và thưởng theo bậc (01/11/2026); thiết kế ở [GDD mục 12](02-binh-phap-gdd.md#12-xếp-hạng-và-thưởng-thiết-kế-chưa-có-code), chưa code |
| BP-07 | QA comprehensive, rollout flag, documentation, regression | BP-04/05 | Formal product acceptance |
| LT-00 | Chốt rulebook ghép 2 yếu tố, authoring standards/hints/save (docs-only) | Docs concept reviewed | Sign-off, không còn mâu thuẫn content |
| LT-01 | Slice content graph 3 nhân vật Châu Ngọc/Tô Kim/Vi Triều, validation & portraits | LT-00 | Acyclic / reachable / recipe uniqueness |
| LT-02 | Pure combine engine + unit/property tests | LT-01 | Deterministic, repeat idempotent |
| LT-03 | UI Vạn Vật Lục + Đài Hợp Nguyên + Tướng Lục | LT-02 | Keyboard/touch/mobile QA |
| LT-04 | Offline persistence, tutorial, hints và migration | LT-03 | No reward, stable resume |
| LT-05 | Content pack mở rộng theo nhân vật đã duyệt | LT-01/04 | Historical/lore/asset graph audit |
| LT-06/07 | Server economy nếu được duyệt + QA/rollout | LT-05 | Receipt idempotent + release flag |
| TW-01 | Trial content-driven floor registry, floor migration, UI pagination | Independent | 20-floors baseline untouched; extension safe |
| TW-02 | Destiny 10→20 simulation, snapshot migration & payouts | Independent | No live-run retroactive mutation |
| SUR-01 | Survival UI rename to Thủ Thành | Independent | Zero API/logic/save changes |

## Phân kỳ

- **Phase A:** BP-00 + BP-01; không thêm scene Home, không tạo hình mới.
- **Phase B:** BP-02 và balance/proof of fun; nếu gameplay chưa hấp dẫn dừng tại đây.
- **Phase C:** BP-03–BP-04 + art polish, user review.
- **Phase D:** BP-05–BP-07. Rewards/ranking tách feature flags và secure endpoint; nếu chưa duyệt vẫn ra practice offline.
- **Parallel design:** LT-00→LT-01 có thể chuẩn bị độc lập; triển khai LT-02..LT-07 theo nhánh/PR riêng sau review, không làm ảnh storyboard tốn kém.
- **Later:** TW-01, TW-02, SUR-01 riêng; không trộn vào PR Binh Pháp hay Liệt Truyện.

## Test output bắt buộc mỗi PR implementation

- Scope of files / risks / backward compat.
- Tests executed and status (do not claim if environment fails).
- Screenshot 1440px/390px for UI tasks.
- Unit + seeded replay + adversarial scenarios for engine tasks.
- Audit economy + idempotency for server reward tasks.
- Explicit no unrelated edits (Battle Engine, Campaign V2, Song Tháp progress).

## Release conditions

- Mode flag default off until server/UI/asset ready.
- Liệt Truyện chỉ khám phá trong Tướng Lục, không auto-grant companion, vàng, đá hoặc thành tựu.
- Game title in Vietnamese, claims “lấy cảm hứng” chỉ trong docs, không lấy thiết kế thương mại gốc.
- Historical/fiction labels wherever narrative is added; no unsupported historical claims.
- Sound/TTS/voice deferred.
