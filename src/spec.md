# Specification

## Summary
**Goal:** Refresh the app to the NirmaanIQ brand (Deep Purple/Smart Green), normalize stored user roles to exact values, and add a My Profile page with expanded profile fields.

**Planned changes:**
- Update the global UI theme across all pages to use Deep Purple (#4B2E83) as primary, Smart Green (#3CCF4E) as accent, white backgrounds, modern SaaS card styling (soft shadows/rounded edges), and reserve red for critical/risk states.
- Add a static NirmaanIQ logo asset and render it at the top-left of the navigation header, replacing the current generic building icon while keeping the header responsive.
- Enforce exact stored role strings everywhere roles are saved/checked: `admin`, `site_engineer`, `project_manager` (with optional human-friendly labels in the UI).
- Extend the backend user profile model and APIs to support: `full_name`, `phone`, `designation`, `company_name`, `role`, `assigned_project`, including backward-compatible loading/migration from older stored profiles.
- Add an authenticated “My Profile” page reachable from navigation/user menu to edit full name/phone/designation/company name, display role as read-only, and provide Save Changes success/error feedback plus a “Change password” link to the Internet Identity flow.
- Update onboarding/registration UI to collect and save the new profile fields and store role using the exact required values, keeping user-facing text in English and aligned with a professional construction-tech tone.

**User-visible outcome:** The app consistently uses the new Deep Purple/Smart Green brand theme with a NirmaanIQ logo in the header, users can complete richer onboarding and edit their profile on a dedicated My Profile page, and role-based access/UI behaves correctly using normalized role values.
