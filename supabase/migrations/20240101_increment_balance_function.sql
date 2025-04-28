-- 유저 토큰 잔액을 증가시키는 함수
CREATE OR REPLACE FUNCTION increment_balance(user_id_param UUID, amount_param INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- 현재 토큰 잔액 조회
  SELECT balance INTO current_balance
  FROM user_tokens
  WHERE user_id = user_id_param;
  
  -- 현재 잔액이 없으면 0으로 초기화
  IF current_balance IS NULL THEN
    current_balance := 0;
  END IF;
  
  -- 새 잔액 계산
  new_balance := current_balance + amount_param;
  
  RETURN new_balance;
END;
$$; 