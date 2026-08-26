import "./PageHero.css";
export function PageHero({ eyebrow, title, copy, image, imagePosition, breathe = false, flip = false, children }: { eyebrow: string; title: string; copy: string; image?: string; imagePosition?: string; breathe?: boolean; flip?: boolean; children?: React.ReactNode }) {
  return <section className={`page-hero ${image ? "page-hero--image" : ""} ${breathe ? "page-hero--breathe" : ""} ${flip ? "page-hero--flip" : ""}`}>{image && <><img src={image} alt="" style={imagePosition ? { objectPosition: imagePosition } : undefined} /><div className="page-hero-scrim" /></>}<div className="shell page-hero-inner"><p className="eyebrow eyebrow--gold">{eyebrow}</p><h1>{title}</h1><p>{copy}</p>{children}</div></section>;
}
