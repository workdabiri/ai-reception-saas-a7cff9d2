# TASK-R3B-5 — API-only Status Controls Smoke Verified

## 1. Status

R3B_5_API_ONLY_STATUS_SMOKE_VERIFIED

## 2. Scope

* UI reference commit: `5e69b23`
* Backend reference commit: `fe5e70e`
* Backend API base: `https://ai-reception-saas.vercel.app`
* Smoke type: API-only status transition.
* Browser UI smoke: blocked by cross-site Auth.js cookie topology.
* Production/customer PII used: no.
* External delivery involved: no.

## 3. Why API-only Smoke Was Used

* Browser UI smoke remains blocked by cross-site Auth.js cookie/session topology.
* API-only smoke verifies backend status transition behavior using authenticated Auth.js cookie jar.
* This does not verify browser dropdown/click/toast behavior.
* Browser UI smoke remains deferred until auth topology/custom domain/same-origin solution is implemented.

## 4. Session Verification

* Cookie jar stored outside repo under `/tmp`.
* Cookie/token printed: no.
* Session check result: `SESSION_CHECK_OK`.
* No raw userId/session/token stored in checkpoint.

## 5. Conversation Selection

* Business ID: redacted, UUID format validated.
* Conversation ID: redacted.
* Conversation list count: 1.
* Selected conversation: existing staging conversation.
* Initial status: `RESOLVED`.
* Target status: `OPEN`.
* No full IDs recorded.

## 6. Scenario Results

| Scenario                 | Result  | Evidence Summary                                          |
| ------------------------ | ------- | --------------------------------------------------------- |
| List conversations       | pass    | HTTP 200, count=1                                         |
| Read conversation before | pass    | status=RESOLVED, closedAt=set                             |
| Change status            | pass    | HTTP 200, status=OPEN, closedAt=null                      |
| Read conversation after  | pass    | status=OPEN, closedAt=null, STATUS_VISIBLE_AFTER_READ=yes |
| Rollback if allowed      | skipped | OPEN→RESOLVED is not allowed by VALID_TRANSITIONS         |

## 7. Additional Validations

* Backend VALID_TRANSITIONS confirmed.
* UI VALID_TRANSITIONS matched backend.
* Reopen flow `RESOLVED → OPEN` was verified.
* `closedAt` was set before reopen.
* `closedAt` was cleared to `null` after reopen.
* State-machine rollback rule correctly skipped rollback because `OPEN → RESOLVED` is not allowed.

## 8. Backend Contract Confirmed

* Status endpoint accepts `POST /api/businesses/:businessId/conversations/:conversationId/status`.
* Request body: `{ "status": "<ConversationStatus>" }`.
* Backend returned updated conversation.
* Backend state machine allowed `RESOLVED → OPEN`.
* Backend state machine does not allow direct `OPEN → RESOLVED`.
* Permission path for reopen used authenticated operator context.
* No UI/backend source changes were made during smoke.

## 9. Audit Verification

* Audit checked: no.
* Reason: `AUDIT_VERIFICATION_SKIPPED_NO_DB_READ_ACCESS`.
* Expected audit action: `conversation.status_changed`.
* Metadata content leakage count: not checked.
* Audit DB verification remains deferred.
* Do not claim audit verification passed.

## 10. Safety

* Backend source untouched.
* UI source untouched.
* No schema/migration changes.
* No env changes.
* No redeploy.
* No CRM smoke.
* No customer writes.
* No message writes.
* No browser smoke claim.
* No cookies/tokens printed.
* No full IDs recorded.
* No PII recorded.
* R3C/R4 not started.

## 11. Remaining Blockers / Follow-ups

* Browser UI smoke remains blocked by cross-site Auth.js cookie topology.
* API-only smoke cannot verify visual dropdown behavior, toast behavior, disabled pending state, or browser query invalidation.
* Audit verification remains deferred until DB read access exists.
* Future auth topology/custom domain/same-origin milestone remains required.

## 12. Final Status

R3B_5_API_ONLY_STATUS_SMOKE_VERIFIED

Next allowed gates:

* R3B-5 checkpoint merge
* R3B-5 API-only status smoke checkpoint merge
* R3C/R4 only after CTO approval
* Browser auth topology fix as separate infrastructure milestone
