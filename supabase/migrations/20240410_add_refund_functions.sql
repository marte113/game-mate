-- 트랜잭션 관리 함수
CREATE OR REPLACE FUNCTION begin_transaction()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  BEGIN;
END;
$$;

CREATE OR REPLACE FUNCTION commit_transaction()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  COMMIT;
END;
$$;

CREATE OR REPLACE FUNCTION rollback_transaction()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  ROLLBACK;
END;
$$;

-- 토큰 잔액 업데이트 함수
CREATE OR REPLACE FUNCTION increment_balance(
  user_id_param UUID,
  amount_param NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  new_balance NUMERIC;
BEGIN
  -- 기존 잔액에 금액 추가
  UPDATE user_tokens
  SET balance = balance + amount_param,
      updated_at = NOW()
  WHERE user_id = user_id_param
  RETURNING balance INTO new_balance;
  
  -- 사용자가 없는 경우 새로 생성
  IF NOT FOUND THEN
    INSERT INTO user_tokens (user_id, balance, updated_at)
    VALUES (user_id_param, amount_param, NOW())
    RETURNING balance INTO new_balance;
  END IF;
  
  RETURN new_balance;
END;
$$; 