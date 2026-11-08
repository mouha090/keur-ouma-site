# Kër Ouma — site vitrine (front)

Site sobre et éditorial inspiré de keur-ouma.com, avec l'univers Thiouraye mis en avant :
hero à fumée animée (version ordinateur et version mobile verticale), plateau tournant « Le Rituel des Senteurs »
présentant les vraies photos des pots, sélection, fiches produits, panier, recherche, univers, histoire.

## Lancer

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # export statique dans out/
```

## Structure

```
src/site/
  App.tsx              assemblage : en-tête, page courante, pied de page
  store.tsx            routage par ancre (#thiouraye, #produit-gowe…) et panier (localStorage)
  data.ts              univers, sous-catégories, produits, textes (repris de keur-ouma.com)
  ui/Chrome.tsx        en-tête, menu, recherche, panier latéral, quantité, pied de page + newsletter
  pages/Pages.tsx      accueil, univers, fiche produit, histoire, aide
  site.css             styles du site
src/components/hero-image/   hero : image d'origine + fumée animée (WebGL), ordinateur et mobile
src/components/rituel/       plateau tournant (React Three Fiber + GSAP ScrollTrigger)
  scene/JarPhoto.tsx         pot = photo produit détourée, toujours face à la caméra
public/rituel/               images (photos produits, détourages, calques du hero, textures du décor)
```

## Fonctionnalités reprises du site actuel

Bandeau « Livraison offerte dès 75 € », navigation par univers, sélection Thiouraye, fiches produits
(description, utilisation, livraison, produits associés), panier avec jauge de livraison offerte,
recherche, cinq univers avec leurs sous-catégories, histoire de la maison, newsletter, pied de page.

Front uniquement : le bouton « Passer la commande » et la newsletter sont à brancher sur le back-office existant
(Supabase) ; les produits peuvent être chargés depuis la même base au lieu de `data.ts`.

## Hero : comment la fumée est animée

L'image est séparée hors ligne en deux calques : l'image sans fumée (fond reconstitué) et la fumée seule.
Un shader recompose l'image et fait monter / onduler la fumée. Sans WebGL ou avec « animations réduites »,
l'image d'origine s'affiche telle quelle. Les zones du texte et du bouton ne sont jamais déformées.

## Typographies

Instrument Serif (titres) et Manrope (texte, interface), chargées depuis Google Fonts.
