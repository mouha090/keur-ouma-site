/**
 * Données des variétés du Rituel des Senteurs.
 *
 * Noms, prix et liens : repris de keur-ouma.com (collection Thiouraye, relevés le 8 novembre 2026).
 * Descriptions : condensées à partir des fiches produits du site, sans ajout de propriétés.
 * Tout est configurable ici : l'ordre du tableau = l'ordre sur le plateau (01 → 04).
 */

export type Atmosphere = {
  /** fond de la section et brouillard de la scène */
  bg: string;
  /** lumière principale (couleur, intensité, hauteur relative 0–1) */
  key: string;
  keyIntensity: number;
  keyHeight: number;
  /** contre-jour chaud qui dessine les bords du verre */
  rim: string;
  rimIntensity: number;
  /** lumière d'ambiance (diffuse) */
  ambient: number;
  /** lueur de la niche architecturale */
  glow: string;
};

export type Variety = {
  id: string;
  name: string;
  /** nature de la matière, affichée au-dessus du nom */
  matter: string;
  description: string;
  /** en euros ; null = prix non renseigné */
  price: number | null;
  url: string;
  /** photo produit d'origine (fond compris) */
  photo: string;
  /** photo produit détourée, utilisée sur le plateau */
  cutout: string;
  atmosphere: Atmosphere;
};

const BASE = process.env.NEXT_PUBLIC_ASSET_BASE ?? '';
const asset = (f: string) => `${BASE}/rituel/${f}`;

export const VARIETIES: Variety[] = [
  {
    id: 'cocaine',
    name: 'Thiouraye Cocaine',
    matter: 'Rose, en grains',
    description:
      'Un Thiouraye polyvalent, inspiré des traditions sénégalaises, pour parfumer l’armoire, le linge et la maison.',
    price: 11.9,
    url: '#produit-cocaine', // fiche d'origine : https://www.keur-ouma.com/produit/20
    photo: asset('photo-cocaine.webp'),
    cutout: asset('jar-cocaine.webp'),
    atmosphere: {
      bg: '#F6EEEA', key: '#FFE6DF', keyIntensity: 2.6, keyHeight: 0.62,
      rim: '#F4C9CF', rimIntensity: 1.6, ambient: 0.55, glow: '#F3D9D6',
    },
  },
  {
    id: 'naaka',
    name: 'Naaka Jeddah',
    matter: 'Brun profond, résineux',
    description:
      'Un encens traditionnel aux évocations boisées, musquées et orientales, pour une atmosphère profonde et enveloppante.',
    price: 15,
    url: '#produit-naaka', // fiche d'origine : https://www.keur-ouma.com/produit/16
    photo: asset('photo-naaka.webp'),
    cutout: asset('jar-naaka.webp'),
    atmosphere: {
      bg: '#F2E9DD', key: '#FFD3A0', keyIntensity: 3.1, keyHeight: 0.55,
      rim: '#FFB067', rimIntensity: 2.4, ambient: 0.4, glow: '#EBC79A',
    },
  },
  {
    id: 'gowe',
    name: 'Gowé',
    matter: 'Brun ambré, en grains',
    description:
      'Une senteur de caractère, boisée et légèrement épicée, appréciée pour rafraîchir la maison après la cuisine ou avant de recevoir.',
    price: 12,
    url: '#produit-gowe', // fiche d'origine : https://www.keur-ouma.com/produit/17
    photo: asset('photo-gowe.webp'),
    cutout: asset('jar-gowe.webp'),
    atmosphere: {
      bg: '#F5ECDD', key: '#FFC982', keyIntensity: 3.2, keyHeight: 0.42,
      rim: '#FFC46E', rimIntensity: 2.6, ambient: 0.48, glow: '#F0CF95',
    },
  },
  {
    id: 'diguidie',
    name: 'Diguidié Saff',
    matter: 'Gris-beige, en morceaux',
    description:
      'Une senteur rare aux notes boisées, chaleureuses et subtilement épicées, issue d’une tradition de parfumerie ancestrale.',
    price: 11.9,
    url: '#produit-diguidie', // fiche d'origine : https://www.keur-ouma.com/produit/18
    photo: asset('photo-diguidie.webp'),
    cutout: asset('jar-diguidie.webp'),
    atmosphere: {
      bg: '#F1EEE8', key: '#FFF2E2', keyIntensity: 2.4, keyHeight: 0.7,
      rim: '#E9DCCB', rimIntensity: 1.4, ambient: 0.66, glow: '#E6DCCD',
    },
  },
];

export { asset };

export const ASSETS = {
  travertine: asset('travertine.jpg'),
  travertineNormal: asset('travertine-n.jpg'),
  travertineRough: asset('travertine-r.jpg'),
  plaster: asset('plaster.jpg'),
  plasterNormal: asset('plaster-n.jpg'),
  heroImage: asset('hero-thiouraye.webp'),
  heroPlate: asset('hero-plate.webp'),
  heroSmoke: asset('hero-smoke.webp'),
  heroImageM: asset('hero-thiouraye-m.webp'),
  heroPlateM: asset('hero-plate-m.webp'),
  heroSmokeM: asset('hero-smoke-m.webp'),
};

export const formatPrice = (p: number | null) =>
  p == null ? 'Prix bientôt disponible' : p.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
