-- Ajout de la colonne is_reviewed à la table components
ALTER TABLE "components" ADD COLUMN IF NOT EXISTS "is_reviewed" BOOLEAN DEFAULT FALSE; 