# Credential rotation runbook (template)

**Status:** TEMPLATE — no provider credential is configured by P00.1.

1. Identify the credential class and affected adapter.
2. Request the new value through the environment secret flow; never paste it
   into chat, markdown, source, or logs.
3. Validate the new credential in the provider-approved environment.
4. Switch through configuration/adapter boundary.
5. Revoke the old credential only after successful verification.
6. Record metadata (not the secret), operator, time, scope, and rollback path.
