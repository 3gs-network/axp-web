import "./Team.css";
import { motion, useReducedMotion } from "framer-motion";
import { FaFacebook, FaLinkedin } from "react-icons/fa6";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { getInitials } from "@/lib/format";

const team = [
  {
    name: "Joy Coker",
    title: "Managing Director / CEO",
    photo: "/images/team/joy_coker.webp",
    bio: "Leads AXP's enterprise direction, bringing together housing, strategic partnerships and institutional relationships around the company's growth and delivery agenda.",
    facebook: "#",
    linkedin: "#",
  },
  {
    name: "Judith Eyo",
    title: "Head, Corporate Services",
    photo: "https://res.cloudinary.com/gxhmv4fu/image/upload/v1787093665/judith-eyo_bhike3.jpg",
    bio: "Judith is our Head of Corporate Services with over 18 years of experience in real estate, specialising in conversions, refurbishments, and new builds.",
    facebook: "http://facebook.com/judithsalami",
    linkedin: "http://linkedin.com/in/judith-eyo-02944a28",
  },
  {
    name: "Hakeem Sadiku",
    title: "Enterprise Strategy, PMO & Transformation",
    photo: "/images/team/hakeem_sadiku.webp",
    bio: "Leads enterprise strategy, programme governance and transformation, translating strategic priorities into structured initiatives and coordinated execution.",
    facebook: "#",
    linkedin: "#",
  },
  {
    name: "Edidiong Inyang",
    title: "Head, Real Estate Investments",
    photo: "https://res.cloudinary.com/gxhmv4fu/image/upload/v1787093665/edidiong-inyang_h22hvs.jpg",
    bio: "Edidiong is Head of Real Estate Investment at AXP, with expertise in corporate communications, business management, and stakeholder engagement.",
    facebook: "https://web.facebook.com/profile.php?id=100008518124329",
    linkedin: "https://www.linkedin.com/in/edidiong-inyang-332b17256",
  },
  {
    name: "Victor Arinze",
    title: "Technology & Digital Services",
    photo: "https://res.cloudinary.com/gxhmv4fu/image/upload/v1787090994/victor-arinze_mxldal.jpg",
    bio: "Supports AXP's technology environment, digital infrastructure and enterprise systems across operations and customer experience.",
    facebook: "#",
    linkedin: "#",
  },
  {
    name: "Atinuke Jose",
    title: "Brand & Communications",
    photo: "https://res.cloudinary.com/gxhmv4fu/image/upload/v1787093665/atinuke-jose_nzjqbu.jpg",
    bio: "Strategic communications and marketing professional with over 15 years of experience building brands, shaping corporate narratives and connecting organisations with their audiences.",
    facebook: "#",
    linkedin: "#",
  },
];

export function Team() {
  const reduce = useReducedMotion();
  return (
    <section className="section team-section section--navy">
      <div className="shell">
        <SectionHeading light eyebrow="Executive Management" title="The team behind AXP" copy="Meet the people steering AXP's mission to make mortgage access clear and dependable." />
        <motion.div className="team-grid" variants={staggerContainer} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          {team.map((member) => (
            <motion.figure key={member.name} variants={staggerItem}>
              <div className="team-photo">
                {member.photo ? (
                  <img src={member.photo} alt={member.name} loading="lazy" />
                ) : (
                  <span className="avatar-initials" aria-hidden="true">{getInitials(member.name)}</span>
                )}
              </div>
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
