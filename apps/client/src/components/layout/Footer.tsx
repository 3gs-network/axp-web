import "./Footer.css";
import { Link } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import { FaLinkedin, FaXTwitter, FaInstagram, FaFacebook, FaWhatsapp } from "react-icons/fa6";
import { BrandMark } from "./BrandMark";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-cta shell">
        <p className="eyebrow eyebrow--gold">Making urban living possible</p>
        <h2>Ready to take the next step?</h2>
        <div className="button-row">
          <Link to="/home-ownership-opportunities" className="button button--gold">Explore opportunities <ArrowRight size={16} /></Link>
          <Link to="/contact" className="button button--ghost-light">Contact AXP</Link>
        </div>
      </div>
      <div className="footer-main shell">
        <div className="footer-brand">
          <BrandMark inverse />
          <p>Building Africa’s future through housing, finance and strategic partnerships.</p>
          <span>We are invested in your investment.</span>
          <div className="footer-social">
            <a href="https://www.linkedin.com/company/axp-limited/?viewAsMember=true" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="http://x.com/axp_solutionpro?s=21" target="_blank" rel="noreferrer" aria-label="X (Twitter)"><FaXTwitter /></a>
            <a href="http://instagram.com/axplimited/" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="http://facebook.com/share/165yuzKibv/?mibextid=wwXIfr" target="_blank" rel="noreferrer" aria-label="Facebook"><FaFacebook /></a>
          </div>
        </div>
        <div className="footer-links">
          <div><h3>Explore</h3><Link to="/who-we-are">Who we are</Link><Link to="/home-ownership-opportunities">Home ownership opportunities</Link><Link to="/homeready">HomeReady™</Link><Link to="/impact">Impact</Link></div>
          <div><h3>Learn</h3><Link to="/knowledge">Knowledge Centre</Link><Link to="/work-with-axp">Work with AXP</Link><Link to="/contact">Contact AXP</Link></div>
          <div><h3>Company</h3><Link to="/contact">Contact</Link></div>
          <div className="footer-contact-row">
            <a href="https://wa.me/+2349026211153" target="_blank" rel="noreferrer"><FaWhatsapp /><span>WhatsApp</span></a>
            <a href="mailto:info@axplimited.com"><Mail size={15} /><span>Email</span></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom shell"><span>© 2026 AXP Africa Limited.</span><span>Making Urban Living Possible · Africa</span></div>
    </footer>
  );
}
