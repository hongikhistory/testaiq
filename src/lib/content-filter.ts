// External ID / messenger pattern detection
const PATTERNS = [
  /카톡\s*[:：]?\s*\S+/gi,
  /카카오톡?\s*[:：]?\s*\S+/gi,
  /kakao\s*[:：]?\s*\S+/gi,
  /라인\s*[:：]?\s*\S+/gi,
  /line\s*[:：]?\s*\S+/gi,
  /인스타\s*[:：]?\s*\S+/gi,
  /instagram\s*[:：]?\s*@?\S+/gi,
  /텔레그램\s*[:：]?\s*\S+/gi,
  /telegram\s*[:：]?\s*@?\S+/gi,
  /위챗\s*[:：]?\s*\S+/gi,
  /wechat\s*[:：]?\s*\S+/gi,
  /010[-\s]?\d{4}[-\s]?\d{4}/g, // Korean phone
  /\+\d{1,3}[-\s]?\d{6,}/g, // International phone
];

export function detectExternalId(text: string): boolean {
  return PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(text);
  });
}

export function maskExternalId(text: string): string {
  let result = text;
  for (const pattern of PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, "[외부ID 공유 제한]");
  }
  return result;
}
