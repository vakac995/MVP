# Migration Kanban: Disconnecting from solarapp.dev

This kanban-style checklist will guide you through the process of fully disconnecting your app from solarapp.dev and replacing it with your own backend and services.

---

## 🟦 To Do

### 1. **Audit & Planning**
- [ ] List all files importing from `@hey-api/openapi-ts` or `src/lib/sdk/`
- [ ] List all files referencing `solarapp.dev` or `api.solarapp.dev`
- [ ] List all files using solarapp.dev-specific types (e.g., Project, UserDetails)
- [ ] List all OAuth and authentication logic tied to solarapp.dev
- [ ] List all UI/UX flows that depend on solarapp.dev data or business rules
- [ ] List all logging or other integrations pointing to solarapp.dev

### 2. **API Client & Types**
- [ ] Remove `@hey-api/openapi-ts` and all generated SDK files
- [ ] Create your own API client (e.g., using fetch/axios or your SDK)
- [ ] Replace all API calls in the app to use your new client
- [ ] Replace all types/interfaces with your own (matching your backend)

### 3. **Authentication**
- [ ] Remove or refactor all OAuth logic tied to solarapp.dev
- [ ] Implement your own login, logout, and token management
- [ ] Update all redirect URIs and hardcoded URLs
- [ ] Test login/logout and user context thoroughly

### 4. **Hardcoded URLs & References**
- [ ] Search for all `solarapp.dev`, `api.solarapp.dev`, and related URLs
- [ ] Replace with your own backend/service URLs
- [ ] Move URLs to environment variables for flexibility

### 5. **UI/UX & Business Logic**
- [ ] Review all UI flows (badges, voting, registration, etc.) for solarapp.dev dependencies
- [ ] Refactor logic to match your backend’s data shape and business rules
- [ ] Update error handling and edge cases as needed

### 6. **Other Integrations**
- [ ] Remove or replace logging, error reporting, or analytics integrations
- [ ] Test all integrations with your new services

### 7. **Testing & QA**
- [ ] Test all major user flows (projects, voting, donations, comments, registration, etc.)
- [ ] Test authentication and protected routes
- [ ] Test error handling and edge cases
- [ ] Test mobile and desktop layouts

### 8. **Documentation & Cleanup**
- [ ] Update project documentation to reflect new backend/services
- [ ] Remove any unused code, types, or dependencies
- [ ] Document any new environment variables or setup steps

---

## 🟧 In Progress
- [ ] (Move tasks here as you work on them)

---

## 🟩 Done
- [ ] (Move completed tasks here)

---

**Tip:** Work in small, testable increments. Start with API and types, then authentication, then UI/UX, and finally integrations and cleanup.

If you need code samples or step-by-step help for any task, just ask!
