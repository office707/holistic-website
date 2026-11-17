# Personal portal design preview

`platform.html` and `user-dashboard.html` open the personal journal preview. `doctor-dashboard.html` shows an isolated practitioner preview with illustrative records.

## Current behavior

- Sign-in and account creation are visual demonstrations with readonly sample credentials. They perform no authentication, account creation, or email delivery.
- A sessionStorage boolean remembers that the demo gate was opened. This is not an authentication token or access control.
- Entries exist only in JavaScript memory in the current page. Refreshing, navigating away, or leaving the demo discards edits. No health information is persisted or sent to a server.
- The preview does not read or migrate the legacy dashboard's localStorage records. Practitioner mode uses independent sample entries and cannot retrieve personal journal edits.
- Seed records are marked as illustrative examples. Pain, mood, energy, sleep, daily impact, visit observations and questions describe user observations; the preview makes no diagnosis or treatment recommendations.
- Users can add, edit, delete, search and select notes. Only selected entries enter the report preview. Printing / saving PDF requires a further user action; nothing is automatically shared with a practice.
- The pain chart reports optional entered scores, including zero. It is not a clinical assessment.

## Before supporting real accounts or patient information

Replace the visual gate with server-validated authentication and authorization. Design protected storage, account ownership, practitioner access, explicit sharing consent and revocation, retention/deletion, and a clear privacy notice. Review the information architecture and wording with qualified practitioners before presenting clinical functionality. Do not rely on the demo session boolean to protect data.

## Verification

Browser coverage includes gate tabs, quote rotation, entry create/edit/delete/search, optional zero pain, literal rendering of entered text, selected-only PDF summary, no journal persistence, logout, separate practitioner samples, and responsive layouts at 320, 390, 1024 and 1440 pixels. The generated selected-entry PDF fits one A4 page for the tested example.
