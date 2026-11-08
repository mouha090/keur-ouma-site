'use client';
/** Pages du site : accueil, univers (Thiouraye mis en avant), fiche produit, histoire, aide. */
import { useState } from 'react';
import HeroImage from '@/components/hero-image/HeroImage';
import RituelDesSenteurs from '@/components/rituel/RituelDesSenteurs';
import { PRODUCTS, UNIVERSES, IMAGES, SHOP, fmt, productBySlug, universeBySlug, type Product } from '../data';
import { href, useCart } from '../store';
import { Icon, Qty } from '../ui/Chrome';

/* ---------- briques ---------- */
function ProductCard({ p, priority }: { p: Product; priority?: boolean }) {
  const cart = useCart();
  return (
    <article className="card">
      <a className="card-media" href={href.product(p.slug)} aria-label={p.name}>
        <img src={p.photo} alt={`Pot de ${p.name} Kër Ouma`} width={540} height={757} loading={priority ? 'eager' : 'lazy'} />
        <img className="card-alt" src={p.cutout} alt="" width={694} height={900} loading="lazy" />
      </a>
      <div className="card-body">
        <p className="card-matter">{p.matter}</p>
        <h3 className="card-name"><a href={href.product(p.slug)}>{p.name}</a></h3>
        <p className="card-price">{fmt(p.price ?? 0)}</p>
      </div>
      <button className="card-add" onClick={() => cart.add(p.slug)}>Ajouter au panier</button>
    </article>
  );
}

function ProductGrid({ items = PRODUCTS }: { items?: Product[] }) {
  return <div className="grid-products">{items.map((p, i) => <ProductCard key={p.slug} p={p} priority={i < 2} />)}</div>;
}

function SectionHead({ eyebrow, title, link }: { eyebrow: string; title: string; link?: { label: string; href: string } }) {
  return (
    <header className="section-head">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="display-lg">{title}</h2>
      </div>
      {link && <a className="link-arrow" href={link.href}>{link.label}{Icon.arrow}</a>}
    </header>
  );
}

function Ritual() {
  return (
    <section className="split split-dark">
      <figure className="split-media"><img src={IMAGES.encens} alt="Bâton d’encens et filet de fumée" width={693} height={1040} loading="lazy" /></figure>
      <div className="split-text">
        <p className="eyebrow">Le geste</p>
        <h2 className="display-lg">Quelques grains, un charbon ardent.</h2>
        <p>Déposez une petite quantité de thiouraye sur un charbon incandescent, dans un encensoir adapté. La fumée s’élève, s’étire, puis se pose dans la pièce : la maison change de caractère.</p>
        <p className="muted-inv small">Ne laissez jamais un encensoir allumé sans surveillance.</p>
        <a className="btn btn-light" href={href.universe('thiouraye')}>Choisir mon thiouraye</a>
      </div>
    </section>
  );
}

function Universes({ exclude }: { exclude?: string }) {
  const list = UNIVERSES.filter((u) => u.slug !== exclude);
  return (
    <section className="section">
      <SectionHead eyebrow="Cinq univers, une maison" title="Explorez Kër Ouma" />
      <div className="grid-universes">
        {list.map((u, i) => (
          <a key={u.slug} className={`uni ${u.slug === 'thiouraye' ? 'is-featured' : ''}`} href={href.universe(u.slug)}>
            <span className="uni-media"><img src={u.image} alt="" width={700} height={1000} loading="lazy" /></span>
            <span className="uni-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="uni-kicker">{u.kicker}</span>
            <span className="uni-name">{u.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function StoryTeaser() {
  return (
    <section className="split">
      <div className="split-text">
        <p className="eyebrow">Notre histoire</p>
        <h2 className="display-lg">Une maison faite pour se retrouver.</h2>
        <p>Kër signifie la maison en wolof. Un espace vivant où les gestes se transmettent, où les goûts rapprochent et où la création sénégalaise se raconte au présent.</p>
        <a className="link-arrow" href={href.story}>Entrer dans notre histoire{Icon.arrow}</a>
      </div>
      <figure className="split-media"><img src={IMAGES.maison} alt="Deux femmes en tenues rayées dans une maison" width={780} height={1040} loading="lazy" /></figure>
    </section>
  );
}

/* ---------- accueil ---------- */
export function Home() {
  return (
    <>
      <HeroImage ctaHref={href.universe('thiouraye')} />
      <RituelDesSenteurs />
      <section className="section">
        <SectionHead eyebrow="Encens & rituels" title="La sélection Thiouraye" link={{ label: 'Tout l’univers Thiouraye', href: href.universe('thiouraye') }} />
        <ProductGrid />
      </section>
      <Ritual />
      <Universes />
      <StoryTeaser />
    </>
  );
}

/* ---------- univers ---------- */
export function UniversePage({ slug }: { slug: string }) {
  const u = universeBySlug(slug);
  if (!u) return <NotFound />;
  const isThiouraye = u.slug === 'thiouraye';
  return (
    <>
      <nav className="crumbs" aria-label="Fil d’Ariane"><a href={href.home}>Accueil</a><span>/</span><span>{u.name}</span></nav>
      <section className="uni-hero">
        <div className="uni-hero-text">
          <p className="eyebrow">{u.kicker}</p>
          <h1 className="display-xl">{u.name}</h1>
          <p className="lead">{u.intro}</p>
        </div>
        <figure className="uni-hero-media"><img src={u.image} alt="" width={1254} height={1254} /></figure>
      </section>

      {isThiouraye ? (
        <>
          <section className="section">
            <SectionHead eyebrow="Sélection de la maison" title="Les thiouraye" />
            <ProductGrid />
          </section>
          <RituelDesSenteurs />
          <section className="section">
            <SectionHead eyebrow="Dans l’univers" title="À explorer" />
            <Categories u={u} />
          </section>
          <Ritual />
        </>
      ) : (
        <section className="section">
          <SectionHead eyebrow="Dans l’univers" title="À explorer" />
          <Categories u={u} soon />
          <div className="soon-note">
            <p>Les créations de cet univers arrivent bientôt en ligne. En attendant, découvrez nos thiouraye.</p>
            <a className="btn" href={href.universe('thiouraye')}>Découvrir les thiouraye</a>
          </div>
        </section>
      )}
      <Universes exclude={u.slug} />
    </>
  );
}

function Categories({ u, soon }: { u: NonNullable<ReturnType<typeof universeBySlug>>; soon?: boolean }) {
  return (
    <ol className="cats">
      {u.categories.map((c, i) => (
        <li key={c.name}>
          <span className="cat-num">{String(i + 1).padStart(2, '0')}</span>
          <h3 className="display-sm">{c.name}</h3>
          <p>{c.text}</p>
          {soon && <span className="tag">Bientôt</span>}
        </li>
      ))}
    </ol>
  );
}

/* ---------- fiche produit ---------- */
export function ProductPage({ slug }: { slug: string }) {
  const p = productBySlug(slug);
  const cart = useCart();
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [added, setAdded] = useState(false);
  if (!p) return <NotFound />;
  const images = [p.photo, p.cutout];
  const others = PRODUCTS.filter((o) => o.slug !== p.slug);
  return (
    <>
      <nav className="crumbs" aria-label="Fil d’Ariane">
        <a href={href.home}>Accueil</a><span>/</span><a href={href.universe('thiouraye')}>Thiouraye</a><span>/</span><span>{p.name}</span>
      </nav>
      <section className="product">
        <div className="product-gallery">
          <div className={`product-main ${img === 1 ? 'is-cutout' : ''}`}>
            <img src={images[img]} alt={`Pot de ${p.name} Kër Ouma`} width={img ? 694 : 540} height={img ? 900 : 757} />
          </div>
          <div className="product-thumbs" role="group" aria-label="Photos">
            {images.map((src, i) => (
              <button key={src} className={i === img ? 'is-active' : ''} onClick={() => setImg(i)} aria-label={`Photo ${i + 1}`} aria-pressed={i === img}>
                <img src={src} alt="" width={120} height={150} />
              </button>
            ))}
          </div>
        </div>
        <div className="product-info">
          <p className="eyebrow">Thiouraye · {p.matter}</p>
          <h1 className="display-xl">{p.name}</h1>
          <p className="product-price">{fmt(p.price ?? 0)}</p>
          <p className="lead">{p.long[0]}</p>
          <div className="product-buy">
            <Qty value={qty} onChange={setQty} label={p.name} />
            <button className="btn btn-grow" onClick={() => { cart.add(p.slug, qty); setAdded(true); setTimeout(() => setAdded(false), 1800); }}>
              {added ? 'Ajouté au panier' : 'Ajouter au panier'}
            </button>
          </div>
          <p className="small muted">{SHOP.announce}.</p>
          <div className="accordions">
            <details open>
              <summary>Le produit</summary>
              {p.long.slice(1).map((t) => <p key={t}>{t}</p>)}
            </details>
            <details>
              <summary>Utilisation &amp; précautions</summary>
              <p>{p.usage ?? 'Déposez une petite quantité dans un encensoir adapté pour diffuser son parfum dans votre intérieur.'}</p>
              <p>Ne laissez jamais un encensoir allumé sans surveillance. Conservez le pot fermé, à l’abri de la chaleur.</p>
            </details>
            <details>
              <summary>Livraison &amp; retours</summary>
              <p>{SHOP.announce}. Les conditions détaillées sont disponibles dans la rubrique <a href={href.help}>Aide</a>.</p>
            </details>
          </div>
        </div>
      </section>
      <section className="section">
        <SectionHead eyebrow="À découvrir aussi" title="Poursuivre l’histoire" />
        <ProductGrid items={others} />
      </section>
    </>
  );
}

/* ---------- histoire, aide ---------- */
export function StoryPage() {
  return (
    <>
      <section className="story-hero">
        <img src={IMAGES.histoire} alt="Une rue colorée sous un grand arbre" width={743} height={1040} />
        <div className="story-hero-text">
          <p className="eyebrow">Notre histoire</p>
          <h1 className="display-xl">Une maison faite pour se retrouver.</h1>
        </div>
      </section>
      <section className="prose">
        <p className="lead">Kër signifie la maison en wolof.</p>
        <p>Un espace vivant où les gestes se transmettent, où les goûts rapprochent et où la création sénégalaise se raconte au présent.</p>
        <p>Des créations, des senteurs, des saveurs et des attentions qui racontent une histoire : Kër Ouma réunit cinq univers sous un même toit, du thiouraye qui parfume la maison aux étoffes, aux saveurs et aux coffrets qui se transmettent.</p>
        <a className="btn" href={href.universe('thiouraye')}>Découvrir les thiouraye</a>
      </section>
      <Universes />
    </>
  );
}

export function HelpPage() {
  return (
    <section className="prose prose-help">
      <p className="eyebrow">À votre service</p>
      <h1 className="display-xl">Livraison et aide</h1>
      <h2 className="display-sm">Livraison</h2>
      <p>{SHOP.announce}. Les délais et tarifs selon votre adresse sont indiqués au moment de la commande.</p>
      <h2 className="display-sm">Retours et remboursements</h2>
      <p>Les conditions de retour et de remboursement sont détaillées dans nos conditions générales de vente.</p>
      <h2 className="display-sm">Une question ?</h2>
      <p>Notre équipe vous répond avec plaisir. Retrouvez-nous aussi sur Instagram.</p>
    </section>
  );
}

export function NotFound() {
  return (
    <section className="prose">
      <h1 className="display-xl">Cette page n’existe pas.</h1>
      <p>Elle a peut-être changé d’adresse.</p>
      <a className="btn" href={href.home}>Revenir à l’accueil</a>
    </section>
  );
}
