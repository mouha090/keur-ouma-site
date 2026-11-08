import type { NextConfig } from 'next';

// Export statique : la section ne dépend d'aucun serveur.
// PREVIEW=1 produit des chemins relatifs pour l'aperçu hébergé.
const preview = process.env.PREVIEW === '1';

const config: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  assetPrefix: preview ? '.' : undefined,
  env: { NEXT_PUBLIC_ASSET_BASE: preview ? '.' : '' },
};

export default config;
