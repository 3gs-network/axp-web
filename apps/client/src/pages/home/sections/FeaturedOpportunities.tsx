import "./FeaturedOpportunities.css";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { fadeInUp, springPresets, staggerContainer, staggerItem } from "@/lib/motion";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { OpportunityCard } from "@/components/shared/OpportunityCard";
import { opportunityData } from "@/data/opportunities";
import { useOpportunities } from "@/hooks/useOpportunities";

export function FeaturedOpportunities() {
  const { data } = useOpportunities();
  // Fall back to the curated set so the prerendered home page and any offline
  // load still show real content; upgrade to the live feed once it resolves.
  const isLive = Boolean(data && data.length > 0);
  const featured = (isLive ? data! : opportunityData).slice(0, 4);

  return (
    <section className="section featured-opportunities">
      <div className="shell">
        <motion.div className="split-heading" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }}><SectionHeading eyebrow="Featured opportunities" title="Start with an opportunity that fits your next chapter." copy="A curated view of the kinds of homeownership pathways AXP is designed to help people explore." /><Link to="/home-ownership-opportunities" className="button button--outline">View all opportunities <ArrowRight size={16} /></Link></motion.div>
        <motion.div key={isLive ? "live" : "seed"} className="featured-opportunities-grid" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
          {featured.map((opportunity) => <motion.div key={opportunity.slug} variants={staggerItem} whileHover={{ y: -6, transition: springPresets.snappy }}><OpportunityCard opportunity={opportunity} compact /></motion.div>)}
        </motion.div>
      </div>
    </section>
  );
}
