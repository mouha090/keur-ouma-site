'use client';
/** Application : en-tête, page courante (routage par ancre), pied de page. */
import { CartProvider, useRoute } from './store';
import { Header, Footer } from './ui/Chrome';
import { Home, UniversePage, ProductPage, StoryPage, HelpPage } from './pages/Pages';

function Current() {
  const r = useRoute();
  switch (r.name) {
    case 'universe': return <UniversePage key={r.slug} slug={r.slug} />;
    case 'product': return <ProductPage key={r.slug} slug={r.slug} />;
    case 'story': return <StoryPage />;
    case 'help': return <HelpPage />;
    default: return <Home />;
  }
}

export default function App() {
  return (
    <CartProvider>
      <a className="skip" href="#contenu">Aller au contenu</a>
      <Header />
      <main id="contenu"><Current /></main>
      <Footer />
    </CartProvider>
  );
}
