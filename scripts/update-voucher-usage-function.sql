-- Create a function to safely increment voucher usage
CREATE OR REPLACE FUNCTION increment_voucher_usage(voucher_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_usage INTEGER;
    usage_limit_val INTEGER;
BEGIN
    -- Get current usage and limit
    SELECT used_count, usage_limit 
    INTO current_usage, usage_limit_val
    FROM vouchers 
    WHERE id = voucher_id AND is_active = true;
    
    -- Check if voucher exists and is active
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if usage limit would be exceeded
    IF usage_limit_val IS NOT NULL AND current_usage >= usage_limit_val THEN
        RETURN FALSE;
    END IF;
    
    -- Increment usage count
    UPDATE vouchers 
    SET used_count = used_count + 1,
        updated_at = NOW()
    WHERE id = voucher_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_voucher_usage(UUID) TO PUBLIC;
