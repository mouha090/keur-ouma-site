/**
 * Contenus du site, repris de keur-ouma.com (relevés le 8 novembre 2026) :
 * univers, sous-catégories, produits Thiouraye, prix et textes.
 */
import { VARIETIES, asset, type Variety } from '@/components/rituel/data/varieties';

export const SHOP = {
  freeShippingFrom: 75,
  announce: 'Livraison offerte dès 75 € d’achat',
  instagram: 'https://www.instagram.com/',
};

export type Product = Variety & {
  slug: string;
  universe: 'thiouraye';
  long: string[];
  usage?: string;
};

const LONG: Record<string, { long: string[]; usage?: string }> = {
  cocaine: {
    long: [
      'Un parfum envoûtant pour vos vêtements, votre literie et votre maison.',
      'Découvrez le Thiouraye Cocaïne, une véritable invitation à l’élégance et au raffinement. Inspiré des traditions sénégalaises, ce Thiouraye polyvalent accompagne vos rituels de parfumage au quotidien.',
    ],
    usage:
      'Dans vos armoires : saupoudrez une petite quantité dans un récipient ouvert, sans contact direct avec vos vêtements. Pour la literie : traditionnellement, une petite quantité peut être saupoudrée sur le matelas avant de poser le drap-housse ; vérifiez la compatibilité avec les textiles et la peau. Dans votre encensoir : déposez une petite quantité dans un encensoir adapté.',
  },
  naaka: {
    long: [
      'Un voyage olfactif au cœur des traditions sénégalaises.',
      'Laissez-vous séduire par le Thiouraye Naaka Jeddah, un encens traditionnel sénégalais qui incarne l’élégance, le raffinement et l’art de parfumer son intérieur. Inspiré des rituels de senteurs du Sénégal, le Naaka Jeddah évoque les parfums boisés, musqués et orientaux.',
      'Certaines préparations traditionnelles associent notamment le bois de oud, le bois d’agar et le musc, pour créer des senteurs profondes et enveloppantes.',
    ],
  },
  gowe: {
    long: [
      'L’allié incontournable contre les odeurs tenaces.',
      'Le Thiouraye Gowé est un encens traditionnel sénégalais particulièrement apprécié pour sa capacité à masquer les odeurs persistantes grâce à son parfum puissant et caractéristique : odeurs de cuisine, de poisson, de friture.',
      'Une senteur de caractère, aux notes boisées, terreuses et légèrement épicées. Un incontournable des maisons sénégalaises, parfait après avoir cuisiné ou avant de recevoir des invités.',
    ],
    usage:
      'Après avoir aéré votre pièce, déposez une petite quantité de Gowé sur un charbon incandescent dans un encensoir adapté. Laissez son parfum se diffuser pour masquer les odeurs résiduelles.',
  },
  diguidie: {
    long: [
      'Une senteur rare, intense et envoûtante, venue des traditions africaines.',
      'Le Thiouraye Diguidié est un encens traditionnel sénégalais apprécié pour son caractère unique et ses notes boisées, chaleureuses et subtilement épicées. Issu d’une tradition de parfumerie ancestrale, le Diguidié est réputé pour ses graines aromatiques précieuses.',
      'Son parfum enveloppant transforme votre intérieur en un véritable cocon de douceur et d’élégance.',
    ],
  },
};

export const PRODUCTS: Product[] = VARIETIES.map((v) => ({
  ...v,
  slug: v.id,
  universe: 'thiouraye' as const,
  ...LONG[v.id],
}));

export const productBySlug = (s: string) => PRODUCTS.find((p) => p.slug === s);

export type Universe = {
  slug: string;
  name: string;
  kicker: string;
  intro: string;
  image: string;
  categories: { name: string; text: string }[];
};

export const UNIVERSES: Universe[] = [
  {
    slug: 'thiouraye', name: 'Thiouraye', kicker: 'Encens & rituels',
    intro: 'Des thiouraye, des encens et des senteurs pour parfumer la maison et les moments de partage.',
    image: asset('site-thiouraye-collection.webp'),
    categories: [
      { name: 'Thiouraye', text: 'Des compositions enveloppantes et des objets choisis pour parfumer la maison.' },
      { name: 'Accessoires', text: 'Les détails graphiques et les matières choisies qui signent une silhouette.' },
    ],
  },
  {
    slug: 'secrets-de-femme', name: 'Secrets de Femme', kicker: 'Étoffes & parures',
    intro: 'Des étoffes, des perles et des rituels choisis avec délicatesse.',
    image: asset('site-secrets-perles.webp'),
    categories: [
      { name: 'Pagnes & Étoffes', text: 'Des étoffes vivantes sélectionnées pour leurs couleurs, leur tombé et leur histoire.' },
      { name: 'Bin-bin & Perles de taille', text: 'Des perles délicates assemblées comme des secrets à porter près de soi.' },
      { name: 'Coffrets Secrets de Femme', text: 'Des rituels sensoriels réunis dans des écrins prêts à transmettre.' },
    ],
  },
  {
    slug: 'sandika', name: 'Sandika', kicker: 'Goûts & partages',
    intro: 'Des ingrédients familiers et francs pour faire voyager la table.',
    image: asset('site-sandika.webp'),
    categories: [
      { name: 'Boissons & Infusions', text: 'Bissap, café Touba et infusions pour retrouver les goûts familiers.' },
      { name: 'Céréales & Préparations', text: 'Des essentiels du garde-manger sénégalais à cuisiner au quotidien.' },
      { name: 'Épices & Condiments', text: 'Des assemblages francs et aromatiques pour faire voyager chaque recette.' },
    ],
  },
  {
    slug: 'mode', name: 'Mode & Créations', kicker: 'Silhouettes & savoir-faire',
    intro: 'Des silhouettes contemporaines où les matières et les gestes parlent d’eux-mêmes.',
    image: asset('site-mode-femme.webp'),
    categories: [
      { name: 'Femme', text: 'Des silhouettes fluides et affirmées, entre broderies, volumes contemporains et allure de cérémonie.' },
      { name: 'Homme', text: 'Des lignes sobres et précises qui revisitent les essentiels du vestiaire sénégalais.' },
      { name: 'Enfant', text: 'Des tenues confortables et lumineuses pour les plus jeunes.' },
    ],
  },
  {
    slug: 'coffrets', name: 'Coffrets & Cadeaux', kicker: 'Gestes & attentions',
    intro: 'Des attentions à composer, à raconter et à transmettre.',
    image: asset('site-coffrets.webp'),
    categories: [
      { name: 'Coffrets Découverte', text: 'Une première rencontre avec les gestes, les senteurs et les saveurs de la maison.' },
      { name: 'Coffrets Secrets de Femme', text: 'Des rituels sensoriels réunis dans des écrins prêts à transmettre.' },
      { name: 'Cadeaux de Cérémonie', text: 'Des attentions raffinées pour célébrer les grands moments.' },
    ],
  },
];

export const universeBySlug = (s: string) => UNIVERSES.find((u) => u.slug === s);

export const IMAGES = {
  maison: asset('site-maison-hero.webp'),
  mode: asset('site-mode.webp'),
  histoire: asset('site-histoire.webp'),
  encens: asset('site-thiouraye-encens.webp'),
};

export const fmt = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
