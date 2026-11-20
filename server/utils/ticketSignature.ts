// Place at: server/utils/ticketSignature.ts  (Nuxt auto-imports it in server routes)
//
// Django sends `has_signature`, `signature_url` and `has_enforcer_signature`.
// The web pages only need two fields, each a same-origin URL that a Nuxt route
// serves (the route adds the admin token), or '' when there is no signature:
//   violator_signature -> /api/tickets/<id>/signature
//   enforcer_signature -> /api/tickets/<id>/enforcer-signature
export function withViolatorSignature(t: any) {
  const { has_signature, signature_url, has_enforcer_signature, ...rest } = t
  return {
    ...rest,
    violator_signature: has_signature ? `/api/tickets/${t.id}/signature` : '',
    enforcer_signature: has_enforcer_signature ? `/api/tickets/${t.id}/enforcer-signature` : '',
  }
}