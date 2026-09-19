# HMTI Admin Scope

Status: planned. Admin UI must not be exposed until authentication, server-side authorization, and persistent storage are available.

## Roles

### Super Admin

- Manage administrator accounts and roles.
- Manage organization settings and every content module.
- Review the audit log and restore archived content.

### Content Admin

- Create and edit organization content.
- Preview, publish, unpublish, and archive content.
- Cannot manage administrator accounts or security settings.

Add separate Editor and Publisher roles only when HMTI adopts a real approval workflow.

## Content Modules

- Organization profile: history, vision, missions, address, contact channels, and social links.
- Announcements: draft, schedule, pin, publish, and archive.
- Work programs: purpose, schedule, team, status, documentation, and evaluation.
- News: title, slug, summary, body, author, publication date, media, and metadata.
- Organization structure: period, division, position, member, ordering, and photo.
- Media library: upload, caption, alternative text, usage, and archive.
- Collaboration inbox: proposal status and internal notes when a real contact form exists.

## Required Controls

- No public administrator registration.
- Server-side authorization on every read and write operation.
- Input validation and output encoding at every trust boundary.
- File type and size restrictions for uploads.
- Draft and preview before publication.
- Archive and restore instead of permanent deletion by default.
- Audit entries for account, role, publication, and deletion changes.
- Login rate limiting, secure sessions, and safe error messages.
- Structured content fields instead of arbitrary HTML, CSS, or JavaScript input.

## Implementation Gate

Choose the authentication and storage boundary before building the admin route. The public content model in `app/site-content.ts` is the temporary source of verified content and should be replaced through one typed repository interface when the backend is selected.
