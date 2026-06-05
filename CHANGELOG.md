# Changelog

All notable changes to the QANexus framework will be documented in this file.

---

## [1.1.1] - 2026-06-05
### Changed
- Reviewed Playwright HTML Trace Viewer configurations and artifact retention guidelines for optimized CI runner execution.

---

## [1.1.0] - 2026-06-04
### Added
- Created `CHANGELOG.md` to track framework updates.

### Security
- Untracked `.env.prod` and `.env.stage` files from the Git index and configured `.gitattributes` to exclude `presentation.html` from language statistics.
- Scrubbed `node_modules` and testing report files from history to optimize repository size.

---

## [1.0.1] - 2026-06-03
### Fixed
- Fixed critical `this` context binding runtime crash in `testHooks.ts`.
- Removed unnecessary `await` calls from synchronous assertions in `login.spec.ts` and `dashboard.spec.ts`.

### Added
- Configured ESLint (`eslint.config.js`) for TypeScript and Playwright validation.
- Added comprehensive visual architecture documentation under `docs/framework_overview.md` and `presentation.html`.

---

## [1.0.0] - 2026-06-02
### Added
- Initial commit of the QANexus Playwright + TypeScript test automation framework.
