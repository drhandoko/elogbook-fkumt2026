# Two programme sections

The interface offers Sarjana Kedokteran / Bachelor of Medicine (PSSK) and Pendidikan Profesi Dokter / Medical Professional Program (PSPD).

This release adds a read-only undergraduate assessment overview from the existing authenticated PSSK grade records. Students see only their linked student records. Existing server authorization still applies. Switching section is not a change of role, enrollment, or access rights. Admin account and grade import operations remain shared and are marked accordingly. No backend schemas, student data, or existing clinical workflows are migrated.

No third-party application source or branding was imported. Existing UMT branding is retained.

## Not included yet
- Program-specific coordinator permissions and enrollment migration.
- Approved S.Ked curriculum and semester mapping.
- Learning-outcome achievement calculations, progress notes and external portfolio links.
- Translation of the legacy professional interface (only programme titles are bilingual).

Aggregate grades must not be treated as proof of individual competency achievement. The undergraduate view explicitly reports competency mapping as not configured.

## Validation
Run `node build.js`, `node tests/live.js`, `node tests/review-live.js`, and `node tests/render.js`. The last suite covers programme switching, repeated selection, invalid selection, open-form protection, grade scoping and all existing routes.

## Deployment safety
The current live Firebase application uses the existing Apps Script URL. Before deploying, build with the exact live ELOGBOOK_API_URL and verify that public/config.js preserves it. Do not deploy demo/main configuration, change billing, or deploy an unreviewed backend. Deployment is not performed merely by pushing this branch.
