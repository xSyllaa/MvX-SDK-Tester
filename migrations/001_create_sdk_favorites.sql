-- Create sdk_favorites table
CREATE TABLE IF NOT EXISTS "sdk_favorites" (
    "id" SERIAL PRIMARY KEY,
    "user_id" UUID NOT NULL,
    "sdk_name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    UNIQUE ("user_id", "sdk_name")
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "idx_sdk_favorites_user_id" ON "sdk_favorites"("user_id");
CREATE INDEX IF NOT EXISTS "idx_sdk_favorites_sdk_name" ON "sdk_favorites"("sdk_name"); 