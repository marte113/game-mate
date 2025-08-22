/**
 * 추천 시스템에서 사용하는 시드 기반 랜덤 생성기
 * mulberry32 알고리즘을 사용하여 결정론적 랜덤 수열 생성
 */

import { cyrb53 } from './hash';

/**
 * 시드 기반 의사 랜덤 생성기 (mulberry32 알고리즘)
 * @param seed 시드 값
 * @returns 0과 1 사이의 랜덤 수를 반환하는 함수
 */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 게임과 날짜를 기반으로 일관된 랜덤 함수 생성
 * @param gameId 게임 ID
 * @param date 날짜 (기본값: 오늘)
 * @returns 랜덤 함수
 */
export function createDailyGameRandom(gameId: string, date: Date = new Date()): () => number {
  const dayKey = date.toISOString().slice(0, 10);
  const seedStr = `${gameId}:${dayKey}`;
  const seed = cyrb53(seedStr);
  return mulberry32(seed);
}

/**
 * 신규 메이트 수 선택 (3명 또는 4명)
 * @param rng 랜덤 함수
 * @param min 최소값 (기본값: 3)
 * @param max 최대값 (기본값: 4)
 * @returns 선택된 수
 */
export function pickNewbieCount(rng: () => number, min = 3, max = 4): number {
  return rng() < 0.5 ? min : max;
}
