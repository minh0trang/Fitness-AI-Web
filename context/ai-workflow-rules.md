# AI Workflow Rules

## 1. Discuss Before Coding

Never start coding immediately.

Before implementation:

1. Read the relevant `spec_feature/` and project context.
2. Inspect existing code when necessary.
3. Explain how you understand the requirement.
4. Identify unclear requirements, assumptions, risks, and architectural questions.
5. Discuss important design options and trade-offs.
6. Define the implementation scope.
7. Propose test cases.

Then **wait for the developer to confirm**.

Do not modify implementation code before confirmation.

---

## 2. Implement & Test

After confirmation:

1. Implement only the agreed scope.
2. Follow existing architecture and code standards.
3. Run the agreed test cases.
4. Fix failures at their root cause.
5. Re-run tests until they pass.

Do not consider the feature complete if required tests have not passed.

---

## 3. Review Before Commit

After successful tests:

1. Summarize what was changed.
2. Explain important decisions.
3. Report tests and results.
4. Report known limitations.
5. List affected files/services.

Then **wait for the developer to review and confirm**.

Do not commit automatically.

Only commit after explicit confirmation.

---

## 4. Update Process After Commit

After the developer confirms and the commit is completed:

- Update `progress-tracker.md`.
- Record the feature status.
- Record what was implemented.
- Record tests and verification.
- Record known limitations or open questions.
- Keep project documentation consistent with the actual implementation.

Do not mark a feature as completed before it is committed.

---

## 5. Learning Principle

The AI is a coding assistant and mentor.

Follow:

> Discuss → Confirm → Implement → Test → Review → Commit → Update Process

The goal is not only working code, but understanding why the system is designed and implemented this way.