/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  // 팀 컨벤션([type] : subject, 선택 스코프)을 지원하기 위한 커스텀 파서
  // 예) [chore] : update deps
  // 예) [feat(app)] : 프로필 공개 API 추가
  parserPreset: {
    parserOpts: {
      // 1: type, 2: scope (optional), 3: subject
      headerPattern: /^\[([a-z]+)\](?:\(([^)]+)\))?\s*:\s*(.+)$/i,
      headerCorrespondence: ['type', 'scope', 'subject']
    }
  },
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'perf',
        'refactor',
        'docs',
        'style',
        'test',
        'build',
        'ci',
        'chore',
        'revert'
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'app',
        'components',
        'hooks',
        'apis',
        'libs',
        'constants',
        'stores',
        'supabase',
        'types',
        'utils',
        'docs',
        'ci'
      ]
    ],
    // 팀 컨벤션에서는 한글/대문자 시작 등 다양성을 허용 → 케이스 검사를 비활성화
    'subject-case': [0],
    'subject-empty': [2, 'never']
  }
};
