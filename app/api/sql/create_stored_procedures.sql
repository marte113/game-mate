-- 1. 의뢰 생성 및 결제 트랜잭션 저장 프로시저
CREATE OR REPLACE FUNCTION create_order_with_payment(
    p_requester_id UUID,
    p_provider_id UUID,
    p_game TEXT,
    p_scheduled_date DATE,
    p_scheduled_time TIME,
    p_price INTEGER
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_order_id UUID;
BEGIN
    -- 트랜잭션 시작
    BEGIN
        -- 1. 사용자의 토큰 잔액 확인
        IF NOT EXISTS (
            SELECT 1 FROM users 
            WHERE id = p_requester_id AND token >= p_price
        ) THEN
            RAISE EXCEPTION '토큰이 부족합니다';
        END IF;
        
        -- 2. 새로운 의뢰 생성
        INSERT INTO requests (
            requester_id,
            provider_id,
            game,
            status,
            scheduled_date,
            scheduled_time,
            price,
            created_at,
            updated_at
        ) VALUES (
            p_requester_id,
            p_provider_id,
            p_game,
            'pending',
            p_scheduled_date,
            p_scheduled_time,
            p_price,
            NOW(),
            NOW()
        ) RETURNING id INTO v_order_id;
        
        -- 3. 사용자 토큰 차감
        UPDATE users
        SET token = token - p_price
        WHERE id = p_requester_id;
        
        -- 4. 알림 생성
        INSERT INTO notifications (
            user_id,
            type,
            related_id,
            content,
            is_read,
            created_at
        ) VALUES (
            p_provider_id,
            'request',
            v_order_id,
            '새로운 의뢰가 도착했습니다',
            false,
            NOW()
        );
        
        -- 트랜잭션 완료
        RETURN v_order_id;
    EXCEPTION WHEN OTHERS THEN
        -- 오류 발생 시 롤백 (BEGIN/EXCEPTION/END 블록에서 자동 처리)
        RAISE;
    END;
END;
$$;

-- 2. 토큰 잔액 증가 함수 (완료된, 수락된 의뢰에 대한 보상용)
CREATE OR REPLACE FUNCTION increment_balance(
    p_user_id UUID,
    p_amount INTEGER
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE users
    SET token = token + p_amount
    WHERE id = p_user_id;
END;
$$; 