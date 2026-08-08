import "./Team.css";
import { motion, useReducedMotion } from "framer-motion";
import { FaFacebook, FaLinkedin } from "react-icons/fa6";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { staggerContainer, staggerItem } from "@/lib/motion";

const team = [
  {
    name: "Judith Eyo",
    title: "Managing Director",
    photo: "/images/team/judith_eyo.webp",
    bio: "Judith is our managing director with over 18 years of experience in real estate, specialising in conversions, refurbishments, and new builds.",
    facebook: "http://facebook.com/judithsalami",
    linkedin: "http://linkedin.com/in/judith-eyo-02944a28",
  },
  {
    name: "Edidiong Inyang",
    title: "Head, Real Estate Investments",
    photo: "/images/team/edidiong_inyang.webp",
    bio: "Edidiong is Head of Real Estate Investment at AXP, with expertise in corporate communications, business management, and stakeholder engagement.",
    facebook: "https://web.facebook.com/profile.php?id=100008518124329",
    linkedin: "https://www.linkedin.com/in/edidiong-inyang-332b17256",
  },
];

export function Team() {
  const reduce = useReducedMotion();
  return (
    <section className="section team-section section--alabaster">
      <div className="shell">
        <SectionHeading eyebrow="Leadership" title="The team behind AXP" copy="Meet the people steering AXP's mission to make mortgage access clear and dependable." />
        <motion.div className="team-grid" variants={staggerContainer} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          {team.map((member) => (
            <motion.figure key={member.name} variants={staggerItem}>
              <img className="team-photo" src={member.photo} alt={member.name} loading="lazy" />
              <figcaption>
                <strong>{member.name}</strong>
                <span>{member.title}</span>
                <p>{member.bio}</p>
                <div className="team-social">
                  <a href={member.facebook} target="_blank" rel="noreferrer" aria-label={`${member.name} on Facebook`}><FaFacebook /></a>
                  <a href={member.linkedin} target="_blank" rel="noreferrer" aria-label={`${member.name} on LinkedIn`}><FaLinkedin /></a>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
