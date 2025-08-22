/**
 * 추천 시스템에서 사용하는 해시 함수
 * cyrb53 알고리즘을 사용하여 문자열을 일관된 숫자로 변환
 */

/**
 * 문자열을 일관된 해시값으로 변환하는 함수
 * @param str 해시할 문자열
 * @param seed 시드 값 (기본값: 0)
 * @returns 해시된 숫자 값
 */
export function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/**
 * 게임 ID와 날짜를 기반으로 일관된 해시 생성
 * @param gameId 게임 ID
 * @param date 날짜 (기본값: 오늘)
 * @returns 해시 값
 */
export function generateDailyGameSeed(gameId: string, date: Date = new Date()): number {
  const dayKey = date.toISOString().slice(0, 10);
  const seedStr = `${gameId}:${dayKey}`;
  return cyrb53(seedStr);
}
