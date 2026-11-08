/** Présentation statique des vrais produits lorsque WebGL n'est pas disponible. */
import { VARIETIES, formatPrice } from '../data/varieties';

export function StaticFallback() {
  return (
    <div className="rituel-fallback">
      <header className="rituel-intro">
        <p className="rituel-house">KËR OUMA</p>
        <h2 className="rituel-title">Le Rituel des Senteurs</h2>
        <p className="rituel-tagline">« L’art de parfumer vos instants. »</p>
      </header>
      <ol className="rituel-fallback-grid">
        {VARIETIES.map((v, i) => (
          <li key={v.id}>
            <img src={v.photo} alt={`Pot de ${v.name} Kër Ouma`} width={540} height={757} loading="lazy" />
            <p className="rituel-progress-num">{String(i + 1).padStart(2, '0')}</p>
            <p className="rituel-matter">{v.matter}</p>
            <h3 className="rituel-name">{v.name}</h3>
            <p className="rituel-desc">{v.description}</p>
            <p className="rituel-price">{formatPrice(v.price)}</p>
            <a className="rituel-cta" href={v.url}><span>Découvrir ce Thiouraye</span></a>
          </li>
        ))}
      </ol>
    </div>
  );
}
