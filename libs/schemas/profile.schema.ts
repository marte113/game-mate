//그럼 이 위치에 스키마를 다시 정의해줘 
//
import { z } from 'zod';

// 프로필 데이터 유효성 검사를 위한 Zod 스키마 정의
export const profileSchema = z.object({
  // 식별자 필드 (업데이트 시 필요 없을 수 있으므로 optional 추가 고려)
  // id: z.string().uuid().optional(),
  // user_id: z.string().uuid().optional(),
  // public_id: z.number().int().positive().optional(),

  // 타임스탬프 필드 (자동 관리되거나 업데이트 시 필요 없을 수 있음)
  // created_at: z.string().datetime().nullable().optional(),
  // updated_at: z.string().datetime().nullable().optional(),

  // --- 사용자가 수정 가능한 필드에 유효성 검사 규칙 추가 ---
  nickname: z.string({
      required_error: "닉네임은 필수 항목입니다.", // Zod 3.x 이상에서는 required_error 사용 가능
      invalid_type_error: "닉네임은 문자열이어야 합니다.",
    })
    .min(1, { message: '닉네임은 비워둘 수 없습니다.' })
    .max(50, { message: '닉네임은 50자를 초과할 수 없습니다.' })
    .nullable(), // DB 스키마에 따라 null 허용 여부 결정

  // --- username 필드 추가 (프로필 태그명) ---
  username: z.string({
      required_error: "태그명(사용자 이름)은 필수 항목입니다.",
      invalid_type_error: "태그명(사용자 이름)은 문자열이어야 합니다.",
    })
    .min(3, { message: '태그명(사용자 이름)은 3자 이상이어야 합니다.' })
    .max(30, { message: '태그명(사용자 이름)은 30자를 초과할 수 없습니다.' })
    // 필요시 정규식 추가 (예: 영문, 숫자, 밑줄만 허용)
    // .regex(/^[a-zA-Z0-9_]+$/, { message: '태그명(사용자 이름)은 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.' })
    .nullable(), // DB 스키마에 따라 null 허용 여부 결정

  // DB 컬럼명이 'description'이라면 스키마 필드명도 일치시키는 것이 좋음
  description: z.string({
      invalid_type_error: "소개는 문자열이어야 합니다.",
    })
    .max(1000, { message: '소개는 1000자를 초과할 수 없습니다.' })
    .nullable(),

  selected_games: z.array(z.string(), {
      invalid_type_error: "선택된 게임은 문자열 배열이어야 합니다.",
    })
    .max(10, { message: '게임은 최대 10개까지 선택할 수 있습니다.' })
    .nullable(),

  selected_tags: z.array(z.string(), {
      invalid_type_error: "선택된 태그는 문자열 배열이어야 합니다.",
    })
    .max(15, { message: '태그는 최대 15개까지 선택할 수 있습니다.' })
    .nullable(),

  youtube_urls: z.array(
      z.string({ invalid_type_error: "YouTube URL은 문자열이어야 합니다." })
       .url({ message: '유효한 URL 형식이 아닙니다.' })
       // 필요시 정규식 강화: .regex(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/, { message: "유효한 YouTube URL 형식이 아닙니다." })
    , { invalid_type_error: "YouTube URL 목록은 배열이어야 합니다."})
    .max(5, { message: 'YouTube 영상은 최대 5개까지 등록할 수 있습니다.' })
    .nullable(),

  is_mate: z.boolean({ invalid_type_error: "메이트 등록 여부는 boolean 값이어야 합니다."}).nullable(),

  // --- 다른 필요한 필드 (DB 스키마 기준, 읽기 전용이라도 타입 정의 목적) ---
  // follower_count: z.number().int().nonnegative().nullable().optional(),
  // rating: z.number().nullable().optional(),
  // username: z.string().nullable().optional(),
  // id, user_id, public_id, created_at, updated_at 등 DB에는 있지만
  // 업데이트 시 사용자가 직접 보내지 않는 값들은 스키마에서 제외하거나 optional 처리 가능
});

// Zod 스키마로부터 TypeScript 타입 추론
export type ProfileDataSchema = z.infer<typeof profileSchema>;

// 참고: 위 스키마는 주로 '업데이트' 시나리오에 맞춰 작성되었습니다.
// '생성' 시나리오나 다른 용도로 사용될 경우, 필드의 필수 여부(nullable, optional 제거 등)를 조정해야 할 수 있습니다.
// 예를 들어, 생성 시 nickname이 필수라면 .nullable()을 제거해야 합니다.
// 주석 처리된 필드들은 실제 DB 스키마와 업데이트 로직에 맞춰 필요에 따라 주석을 해제하거나 수정하세요.