-- Table pour stocker les inscriptions à la waitlist
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255),
    wallet_address VARCHAR(255),
    subscription_tier VARCHAR(50) NOT NULL, -- FREE, PREMIUM, ENTERPRISE
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, DECLINED, CONTACTED
    
    -- Au moins un contact (email ou wallet) doit être fourni
    CONSTRAINT check_contact_info CHECK (
        email IS NOT NULL OR wallet_address IS NOT NULL
    ),
    
    -- Contrainte d'unicité pour éviter les doublons
    CONSTRAINT unique_contact_info UNIQUE (
        COALESCE(LOWER(email), ''),
        COALESCE(wallet_address, '')
    )
);

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist (LOWER(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_waitlist_wallet ON waitlist (wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_waitlist_tier ON waitlist (subscription_tier);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist (status);

-- Fonction pour ajouter une entrée à la waitlist
CREATE OR REPLACE FUNCTION add_to_waitlist(
    p_email VARCHAR,
    p_wallet_address VARCHAR,
    p_subscription_tier VARCHAR,
    p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    -- Vérifier que l'email ou le wallet est fourni
    IF p_email IS NULL AND p_wallet_address IS NULL THEN
        RAISE EXCEPTION 'Either email or wallet address must be provided';
    END IF;
    
    -- Insérer les données
    INSERT INTO waitlist (email, wallet_address, subscription_tier, notes)
    VALUES (p_email, p_wallet_address, p_subscription_tier, p_notes)
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql; 