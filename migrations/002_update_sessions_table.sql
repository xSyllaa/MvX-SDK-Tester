-- Migration pour ajouter la colonne last_used à la table sessions
BEGIN;

-- Vérifier si la colonne last_used existe déjà
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'sessions' AND column_name = 'last_used'
    ) THEN
        -- Ajouter la colonne last_used à la table sessions
        ALTER TABLE "sessions" ADD COLUMN "last_used" TIMESTAMP WITH TIME ZONE;
        
        -- Mettre à jour les sessions existantes avec une valeur par défaut
        UPDATE "sessions" SET "last_used" = "created_at";
    END IF;
END
$$;

COMMIT; 