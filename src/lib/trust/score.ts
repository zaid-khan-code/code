export const TRUST_EVENTS = {
  signup:                     5,
  complete_onboarding:       10,
  posted_request:             2,
  offered_help:               3,
  help_accepted:              5,
  request_solved_as_author:   5,
  request_solved_as_helper:  15,
  received_thanks:            5,
  fast_first_response:        5,
  reported_content_upheld:  -20,
} as const;

export type TrustEventType = keyof typeof TRUST_EVENTS;
