# E-Commerce CBD React

Application e-commerce pour des produits CBD utilisant Next.js et Supabase.

## Configuration

### Prérequis

- Node.js 18+
- Compte Supabase

### Installation

1. Cloner le dépôt
2. Installer les dépendances

```bash
npm install
```

3. Configurer Supabase
   - Créez un projet sur [Supabase](https://supabase.com)
   - Exécutez le script SQL dans `supabase/migrations/20240820_products_table.sql` dans l'éditeur SQL de Supabase pour créer la table des produits et ajouter des exemples
   - Créez un fichier `.env.local` à la racine du projet avec les informations suivantes :

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Lancer le serveur de développement

```bash
npm run dev
```

5. Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur

## Structure du Projet

- `src/lib/supabase.ts` - Configuration du client Supabase
- `src/types/database.types.ts` - Types pour la base de données Supabase
- `src/services/product.service.ts` - Services pour interagir avec les produits dans Supabase
- `src/app/products/page.tsx` - Page de liste des produits
- `src/app/products/[id]/page.tsx` - Page de détail d'un produit

## Schéma de la Base de Données

La table `products` contient les champs suivants :

- `id` - Identifiant unique (UUID)
- `name` - Nom du produit
- `description` - Description du produit
- `price_3g` - Prix pour 3g
- `price_5g` - Prix pour 5g
- `price_10g` - Prix pour 10g
- `price_20g` - Prix pour 20g
- `cbd_percentage` - Pourcentage de CBD
- `culture_type` - Type de culture ('indoor' ou 'outdoor')
- `origin` - Origine du produit (pays)
- `created_at` - Date de création
- `image_url` - URL de l'image principale
- `category` - Catégorie du produit
- `tag` - Tag du produit (ex: Bestseller, Nouveau, etc.)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
