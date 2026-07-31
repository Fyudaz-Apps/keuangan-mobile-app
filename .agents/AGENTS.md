# Workspace Rules & Guidelines

Welcome to the workspace rules. These instructions govern how code should be designed, written, tested, committed, and optimized within this project.

---

## Coding Style & Immutability

### Immutability
ALWAYS create new objects, NEVER mutate existing state:

```javascript
// WRONG: Mutation
function updateUser(user, name) {
  user.name = name  // MUTATION!
  return user
}

// CORRECT: Immutability
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
```

### File Organization
MANY SMALL FILES > FEW LARGE FILES:
- High cohesion, low coupling.
- 200-400 lines typical, 800 max.
- Extract utilities from large components.
- Organize by feature/domain, not by type.

### Error Handling & Validation
- ALWAYS handle errors comprehensively.
- ALWAYS validate user input (e.g., using schema validation tools like Zod if available).

---

## Security Guidelines

### Mandatory Security Checks
Before ANY commit:
- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitized HTML)
- [ ] CSRF protection enabled
- [ ] Authentication/authorization verified
- [ ] Error messages do not leak sensitive data

### Secret Management
```typescript
// ALWAYS use environment variables:
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error('API_KEY not configured');
}
```

---

## Git Workflow

### Commit Message Format
```
<type>: <description>

<optional body>
```
Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`.

### Pull Request Workflow
1. Analyze full commit history (not just latest commit).
2. Use `git diff [base-branch]...HEAD` to see all changes.
3. Draft comprehensive PR summary.

---

## Performance & Context Management

- Keep functions focused and small (<50 lines).
- Avoid bloated context windows. Prefer editing single files or small clusters over massive refactors.
- When facing build errors, analyze error logs carefully and fix incrementally.
