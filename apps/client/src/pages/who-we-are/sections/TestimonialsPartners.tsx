import "./TestimonialsPartners.css";
import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { staggerContainer, staggerItem } from "@/lib/motion";

const testimonials = [
  {
    quote: "AXP has played a key role in helping our clients quickly and reliably get mortgages, which in turn has made it easier and smoother for us at Terra Developers to sell properties.",
    name: "Kola Ashiru-Balogun",
    title: "Managing Partner, Terra Developers",
    photo: "/images/partners/kola_ashiru_balogun.webp",
  },
  {
    quote: "From site visits to documentation, AXP was professional and responsive. They truly prioritise customer satisfaction.",
    name: "Michael T.",
    title: "Mortgage Client",
    photo: "/images/partners/michael_t.webp",
  },
  {
    quote: "I was initially skeptical about real estate investments, but AXP provided expert advice and flexible mortgage options. Best decision ever.",
    name: "Aisha B.",
    title: "Civil Servant",
    photo: "/images/partners/aisha_b.webp",
  },
  {
    quote: "AXP made my home-buying journey stress-free. Their team guided me through the mortgage process with ease, and now I own my dream home.",
    name: "Emeka O.",
    title: "CEO, Royal Tail",
    photo: "/images/partners/emeka_o.webp",
  },
];

const partners = [
  { name: "Federal Mortgage Bank of Nigeria", logo: "/images/partners/federal_mortgage_bank.webp" },
  { name: "AG Mortgage Bank", logo: "/images/partners/ag_mortgage_bank.webp" },
  { name: "Prudential Mortgage Bank", logo: "/images/partners/prudential-blue-white-1024x196.png", dark: true },
  { name: "Family Homes Funds", logo: "/images/partners/family_homes_funds.webp" },
  { name: "MBAN", logo: "/images/partners/mban.webp" },
];

export function TestimonialsPartners() {
  const reduce = useReducedMotion();
  return (
    <section className="section testimonials-section">
      <div className="shell">
        <SectionHeading eyebrow="Client evidence" title="Testimonials & partners" copy="What the people and institutions we work with say about building with AXP." />
        <motion.div className="testimonial-grid" variants={staggerContainer} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          {testimonials.map((item) => (
            <motion.figure key={item.name} variants={staggerItem}>
              <span className="testimonial-mark">&ldquo;</span>
              <blockquote>{item.quote}</blockquote>
              <figcaption>
                <img className="testimonial-avatar" src={item.photo} alt={item.name} loading="lazy" />
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.title}</small>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
        <div className="testimonial-partners">
          <span className="testimonial-partners-label">In partnership with</span>
          <div className="testimonial-partners-row">
            {partners.map((item) => <img key={item.name} className={item.dark ? "partner-logo-dark" : undefined} src={item.logo} alt={item.name} loading="lazy" />)}
          </div>
        </div>
      </div>
    </section>
  );
}
