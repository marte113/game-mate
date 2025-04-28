-- payments 테이블 생성
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  token_amount INTEGER NOT NULL,
  order_name TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- 인덱스 생성
  CONSTRAINT payments_user_id_idx UNIQUE (user_id, payment_id)
);

-- RLS 정책 설정
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 관리자는 모든 결제 내역 조회 가능
CREATE POLICY "관리자는 모든 결제 내역 조회 가능" ON payments
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 사용자는 자신의 결제 내역만 조회 가능
CREATE POLICY "사용자는 자신의 결제 내역만 조회 가능" ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 서비스 역할만 결제 내역 추가 가능
CREATE POLICY "서비스 역할만 결제 내역 추가 가능" ON payments
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- users 테이블에 tokens 컬럼 추가 (없는 경우)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'tokens'
  ) THEN
    ALTER TABLE users ADD COLUMN tokens INTEGER DEFAULT 0;
  END IF;
END
$$; 