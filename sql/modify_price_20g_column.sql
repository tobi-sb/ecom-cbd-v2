-- Modifier la colonne price_20g pour permettre les valeurs NULL
ALTER TABLE products ALTER COLUMN price_20g DROP NOT NULL;

-- Définir une valeur par défaut de 0 pour les enregistrements existants
UPDATE products SET price_20g = 0 WHERE price_20g IS NULL; 