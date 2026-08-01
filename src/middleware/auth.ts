// TEMPORARY STUB — Rishab owns real auth middleware per the team split.
// Replace requireAdmin/requireEnrolled with his real implementations the
// moment he shares function signatures. Keep these exact names so routes
// importing them don't need to change, only this file's internals.

export async function requireAdmin(request: Request): Promise<void> {
  // TODO(Rishab): real check — verify session/JWT, confirm role === 'admin'.
  // Currently a no-op so routes are structurally complete and testable.
  return
}

export async function requireEnrolled(request: Request, courseId: string): Promise<void> {
  // TODO(Rishab): real check — verify session/JWT, confirm student has an
  // active entitlement for courseId.
  return
}