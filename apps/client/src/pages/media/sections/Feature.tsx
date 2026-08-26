import "./Feature.css";
import { Play } from "lucide-react";

const categories = ["News", "Press releases", "Documentaries", "Events", "Gallery", "Videos", "Podcasts", "Awards"];

export function Feature() {
  return (
    <section className="section media-section">
      <div className="shell">
        <div className="media-feature">
          <div className="media-image"><img src="/images/partnership_studio_2.png" alt="Professionals reviewing an African city model" /><button aria-label="Play" disabled><Play /></button></div>
          <div><span>Featured documentary</span><h2>Housing is infrastructure.</h2><p>A proposed film series exploring how homes connect to jobs, finance, transport, community and long-term urban prosperity.</p></div>
        </div>
        <div className="media-category-grid">{categories.map((item, i) => <div className="media-category-placeholder" key={item}><span>{String(i + 1).padStart(2, "0")}</span><h3>{item}</h3></div>)}</div>
      </div>
    </section>
  );
}
