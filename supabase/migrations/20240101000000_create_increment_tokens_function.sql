-- 사용자 토큰을 증가시키는 함수 생성
CREATE OR REPLACE FUNCTION increment_user_tokens(user_id UUID, amount INTEGER)
RETURNS TABLE (
  id UUID,
  tokens INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_tokens INTEGER;
BEGIN
  -- 사용자 토큰 업데이트
  UPDATE users
  SET tokens = COALESCE(tokens, 0) + amount
  WHERE id = user_id
  RETURNING id, tokens INTO id, updated_tokens;
  
  -- 결과 반환
  RETURN QUERY SELECT id, updated_tokens;
END;
$$; 