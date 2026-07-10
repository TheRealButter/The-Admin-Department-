# Admin HQ App Test Results

Date: 2026-07-10

## Test command

```bash
node tests/run-tests.mjs
```

## Local result

```text
All six Admin HQ validation tests passed.
```

## Repo test coverage

The committed modular test suite verifies:

- Invoice Admin sample set returns 7 Pass / 3 Fail.
- Sales Admin sample set returns 7 Pass / 3 Fail.
- Client Admin sample set returns 7 Pass / 3 Fail.
- Property Admin sample set returns 7 Pass / 3 Fail.
- Practice Admin sample set returns 7 Pass / 3 Fail.
- Member Admin sample set returns 7 Pass / 3 Fail.
- Expected failing records are exactly the intended blocked records for all six systems.
- Report totals, pass counts, and fail counts are calculated from engine output.
- CSV round-trip preserves records and IDs.

## Current app status

The app is now a modular static Admin HQ v1 for controlled private pilots:

- `app/index.html` launches all six systems.
- `app/assets/engine.js` contains shared validation/report/CSV logic.
- `app/assets/app.js` contains shared browser UI logic.
- `app/assets/app.css` contains shared UI styling.
- `app/invoice-admin/index.html` runs Invoice Admin.
- `app/sales-admin/index.html` runs Sales Admin.
- `app/client-admin/index.html` runs Client Admin.
- `app/property-admin/index.html` runs Property Admin.
- `app/practice-admin/index.html` runs Practice Admin.
- `app/member-admin/index.html` runs Member Admin.
- `tests/run-tests.mjs` validates all six systems from the shared engine.

## Production note

This is still a browser-local static app. Real client data should only be used in a private approved workspace. A Supabase multi-user backend remains the next production expansion.
