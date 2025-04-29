import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

// Empêcher Font Awesome d'ajouter automatiquement ses styles CSS (pour éviter le clignotement)
config.autoAddCss = false;

export const metadata: Metadata = {
  title: "Jungle CBD - Votre Oasis de Bien-être",
  description: "Découvrez notre gamme de produits CBD de qualité supérieure, élevés au cœur de la jungle pour un bien-être naturel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body suppressHydrationWarning>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
