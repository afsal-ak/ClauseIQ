export const RISK_PATTERNS = {
  // Legal protections
  confidentiality:
    /confidential|nda|non-disclosure/i,

  liability:
    /liability|damages|limitation of liability|indemnity/i,

  unlimitedLiability:
    /unlimited liability|without limitation|uncapped liability/i,

  indemnity:
    /indemnif(y|ication)|hold harmless|defend against/i,

  termination:
    /termination|terminate|termination for convenience|termination rights/i,

  autoRenewal:
    /auto.?renew|automatic renewal|renew automatically|evergreen/i,

  // Disputes
  arbitration:
    /arbitration|dispute resolution|governing law|jurisdiction|court of competent jurisdiction/i,

  governingLaw:
    /governing law|laws of/i,

  // Employment restrictions
  nonSolicitation:
    /non[- ]solicitation|non solicit|employee poaching/i,

  nonCompete:
    /non[- ]compete|restrict competition/i,

  // Financial risk
  payment:
    /payment|invoice|fee|pricing|penalty|late payment|interest/i,

  penalties:
    /penalty|liquidated damages|late fee|fine/i,

  // Contract duration
  duration:
    /(\d+)\s*(day|days|month|months|year|years)/i,

  longTermCommitment:
    /(\d+)\s*(month|months|year|years)|term of agreement|contract term/i,

  // Data / IP
  intellectualProperty:
    /intellectual property|ip rights|ownership|copyright|trademark|patent/i,

  dataPrivacy:
    /personal data|gdpr|privacy|data protection|pii/i,

  // Exclusivity / lock-in
  exclusivity:
    /exclusive|sole provider|exclusive rights/i,

  // Assignment risk
  assignment:
    /assignment|transfer of rights|delegate obligations/i,
};