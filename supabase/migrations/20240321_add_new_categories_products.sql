-- Add new categories
INSERT INTO categories (name, slug, description, image_url)
VALUES
  ('Cosmétiques CBD', 'cosmetiques', 'Une gamme complète de produits cosmétiques enrichis au CBD pour prendre soin de votre peau.', '/images/categories/cosmetiques-cbd.webp'),
  ('Accessoires', 'accessoires', 'Tous les accessoires nécessaires pour une expérience CBD optimale.', '/images/categories/accessoires-cbd.webp');

-- Add new products
INSERT INTO products (name, description, price_3g, price_5g, price_10g, price_20g, cbd_percentage, culture_type, origin, image_url, category, tag)
VALUES
  -- New Fleurs CBD products
  ('White Widow CBD', 'Variété légendaire avec un effet équilibré et des arômes doux.', 21.99, 34.99, 64.99, 119.99, 16.5, 'indoor', 'Pays-Bas', '/images/gorilla-glue-small-buds-ivory.webp', 'fleurs', 'Nouveau'),
  ('Blue Dream CBD', 'Hybride populaire avec des notes de baies et un effet relaxant.', 23.99, 36.99, 69.99, 129.99, 17.0, 'indoor', 'Canada', '/images/fleurs-cbd-indoor-harlequin-ivory.webp', 'fleurs', 'Populaire'),
  ('Sour Diesel CBD', 'Variété énergisante avec un arôme diesel caractéristique.', 22.99, 35.99, 67.99, 125.99, 18.0, 'indoor', 'USA', '/images/green-crack-fleurs-de-cbd-easy-weed.webp', 'fleurs', 'Bestseller'),

  -- New Huiles CBD products
  ('Huile CBD 20% Full Spectrum', 'Huile concentrée pour un effet puissant et durable.', 59.99, 0, 0, 0, 20.0, 'indoor', 'France', '/images/huile/huile-de-cbd-5-avec-thc-full-spectrum-chanvroo-france.webp', 'huiles', 'Premium'),
  ('Huile CBD 5% Broad Spectrum', 'Huile douce idéale pour les débutants.', 29.99, 0, 0, 0, 5.0, 'indoor', 'France', '/images/huile/huile-de-cbd-5-avec-thc-full-spectrum-chanvroo-france (1).jpg', 'huiles', 'Nouveau'),
  ('Huile CBD Sport 10%', 'Formule spéciale pour la récupération musculaire.', 45.99, 0, 0, 0, 10.0, 'indoor', 'France', '/images/huile/huile-de-cbd-10-endometriose-cbd-cbg-cbn.jpg', 'huiles', 'Sport'),

  -- New Résines CBD products
  ('Hash CBD Royal', 'Résine premium avec un goût authentique.', 27.99, 44.99, 84.99, 0, 25.0, 'outdoor', 'Maroc', '/images/resines/hash-cbd-king-hassan-easyweed.webp', 'resines', 'Premium'),
  ('Hash CBD Blonde', 'Résine blonde de qualité supérieure.', 24.99, 39.99, 74.99, 0, 20.0, 'outdoor', 'Liban', '/images/resines/hash-cbd-king-hassan-easyweed.webp', 'resines', 'Nouveau'),
  ('Hash CBD Noire', 'Résine noire traditionnelle.', 26.99, 42.99, 79.99, 0, 22.0, 'outdoor', 'Afghanistan', '/images/resines/hash-cbd-king-hassan-easyweed.webp', 'resines', 'Bestseller'),

  -- New Cosmétiques CBD products
  ('Crème Visage CBD', 'Crème hydratante enrichie au CBD pour une peau éclatante.', 0, 0, 0, 0, 2.0, 'indoor', 'France', '/images/gorilla-glue-small-buds-ivory.webp', 'cosmetiques', 'Nouveau'),
  ('Baume CBD Sport', 'Baume récupérateur pour les sportifs.', 0, 0, 0, 0, 3.0, 'indoor', 'France', '/images/fleurs-cbd-indoor-harlequin-ivory.webp', 'cosmetiques', 'Sport'),
  ('Shampoing CBD', 'Shampoing doux au CBD pour des cheveux sains.', 0, 0, 0, 0, 1.5, 'indoor', 'France', '/images/green-crack-fleurs-de-cbd-easy-weed.webp', 'cosmetiques', 'Premium'),

  -- New Accessoires products
  ('Grinder Premium', 'Grinder en aluminium de haute qualité.', 0, 0, 0, 0, 0, 'indoor', 'Allemagne', '/images/gorilla-glue-small-buds-ivory.webp', 'accessoires', 'Premium'),
  ('Vaporisateur Portable', 'Vaporisateur compact et efficace.', 0, 0, 0, 0, 0, 'indoor', 'Chine', '/images/fleurs-cbd-indoor-harlequin-ivory.webp', 'accessoires', 'Nouveau'),
  ('Kit de Rangement', 'Kit complet pour conserver vos produits CBD.', 0, 0, 0, 0, 0, 'indoor', 'France', '/images/green-crack-fleurs-de-cbd-easy-weed.webp', 'accessoires', 'Bestseller'); 