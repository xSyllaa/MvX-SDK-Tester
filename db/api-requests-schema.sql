-- Schema for API Requests tracking
-- This table tracks user API usage by time periods

-- Create API Request tracking table
CREATE TABLE IF NOT EXISTS "api_requests" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "request_type" VARCHAR(50) NOT NULL,
  "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "request_data" JSONB, -- Optional metadata about the request
  "subscription_plan" VARCHAR(20) DEFAULT 'free'
);

-- Create indexes for faster querying
CREATE INDEX IF NOT EXISTS "idx_api_requests_user_id" ON "api_requests" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_api_requests_timestamp" ON "api_requests" ("timestamp");
CREATE INDEX IF NOT EXISTS "idx_api_requests_request_type" ON "api_requests" ("request_type");

-- Create function to count user's requests for different periods
CREATE OR REPLACE FUNCTION get_user_api_usage(
  p_user_id UUID
) 
RETURNS TABLE (
  daily_count BIGINT,
  weekly_count BIGINT,
  monthly_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Count requests made today
    COUNT(*) FILTER (WHERE timestamp >= CURRENT_DATE) AS daily_count,
    -- Count requests made in the last 7 days
    COUNT(*) FILTER (WHERE timestamp >= (CURRENT_DATE - INTERVAL '6 days')) AS weekly_count,
    -- Count requests made in the last 30 days
    COUNT(*) FILTER (WHERE timestamp >= (CURRENT_DATE - INTERVAL '29 days')) AS monthly_count
  FROM
    "api_requests"
  WHERE
    user_id = p_user_id;
END;
$$;

-- Function to add a new API request record
CREATE OR REPLACE FUNCTION log_api_request(
  p_user_id UUID,
  p_request_type VARCHAR DEFAULT 'ai',
  p_request_data JSONB DEFAULT NULL,
  p_subscription_plan VARCHAR DEFAULT 'free'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_request_id UUID;
BEGIN
  INSERT INTO "api_requests" (
    user_id,
    request_type,
    request_data,
    subscription_plan
  ) VALUES (
    p_user_id,
    p_request_type,
    p_request_data,
    p_subscription_plan
  )
  RETURNING id INTO v_request_id;
  
  RETURN v_request_id;
END;
$$;

-- Add view for quick stats access
CREATE OR REPLACE VIEW "user_api_usage_summary" AS
SELECT
  user_id,
  COUNT(*) FILTER (WHERE timestamp >= CURRENT_DATE) AS today_count,
  COUNT(*) FILTER (WHERE timestamp >= (CURRENT_DATE - INTERVAL '6 days')) AS weekly_count,
  COUNT(*) FILTER (WHERE timestamp >= (CURRENT_DATE - INTERVAL '29 days')) AS monthly_count
FROM
  "api_requests"
GROUP BY
  user_id;

-- Add subscription_plan column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'subscription_plan'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "subscription_plan" VARCHAR(20) DEFAULT 'free';
  END IF;
END $$; 