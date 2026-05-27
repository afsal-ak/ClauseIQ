export const RISK_PATTERNS = {
  nonSolicitation:
    /non[- ]solicitation/i,

  liability:
    /liability/i,

  arbitration:
    /arbitration/i,

  termination:
    /termination/i,

  confidentiality:
    /confidential/i,

  duration:
    /(\d+)\s*(month|months|year|years)/i,

  unlimitedLiability:
    /unlimited liability/i,
};