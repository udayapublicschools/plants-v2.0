# Security Specifications & Rules Design

This document details the security specification, invariants, and payloads for the Eco-Planter Firestore collections.

## 1. Data Invariants

- **Students (`/students/{studentId}`)**:
  - Any authenticated user can register or read, but a student cannot edit another student's account except adding points/badges if allowed, or we can restrict write operations: only teachers or the student themselves can write.
  - Custom Passcode credentials must be protected.
  - Standard points/XP should be protected from unauthorized escalations.
- **Plants (`/plants/{plantId}`)**:
  - A plant must have a valid `studentId`.
  - Only the owning student or teachers can create, update, or delete the plants.
  - Inputs (growth, sunCount, waterCount, feedCount) must be checked for boundary validations (e.g. growth <= 100).
- **Delete Logs (`/deleteLogs/{logId}`)**:
  - Logs are append-only. No updates or deletions allowed.
  - Can only be deleted or read by teachers/admins.
- **Custom Badges (`/customBadges/{badgeId}`)**:
  - Read-only for students, created and updated by teachers.

## 2. Dirty Dozen Payloads (Targeting Exploitative Scenarios)

1. **Self-Escalation**: A student trying to rewrite another student's XP to `999999` directly.
2. **Identity Spoofing**: Sowing a plant in another student's name by setting `studentId` maliciously.
3. **Ghost Plants**: Creating a plant with an invalid type or negative counts.
4. **Immediate Max Growth**: Sowing a seed with 100% growth instantly on creation.
5. **Log Poisoning**: Deleting logs of deleted plants to hide unauthorized plant removals.
6. **Badge Theft**: Self-conferring a high-tier badge without a teacher's authorization.
7. **Junk ID Poisoning**: Involves writing extremely long, malicious document IDs.
8. **Negative Nurturing**: Setting water/sun/feed counts to negative values.
9. **Spamming Badges**: Creating fake school decorations as a student.
10. **State Shortcutting**: Updating growth by 50% in a single edit without the nurture increments.
11. **Malicious Password Overwrites**: A guest or another student overwriting an existing student's password.
12. **Tampering with Timestamps**: Injecting fake future timestamps instead of server-verified request time.
