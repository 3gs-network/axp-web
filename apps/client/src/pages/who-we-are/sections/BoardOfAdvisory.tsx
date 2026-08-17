import "./BoardOfAdvisory.css";
import { motion, useReducedMotion } from "framer-motion";
import { FaLinkedin } from "react-icons/fa6";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { getInitials } from "@/lib/format";

const advisors = [
  {
    name: "Matthew Coker",
    title: "Executive Financial Strategy & Institutional Advisory",
    bio: "Corporate executive and public-sector advisor with more than three decades of experience across banking, risk management, public administration and corporate governance. His experience spans financial strategy, credit and risk, policy advisory, board leadership and institutional transformation.",
    photo: "/images/team/matthew_coker.webp",
    linkedin: "https://www.linkedin.com/in/matthewcoker/",
  },
  {
    name: "Mohammed Al-Amin Momodu",
    title: "Executive Programme & Project Management",
    bio: "Programme and project management consultant with experience across capital projects, housing transformation, digital programme delivery, business change, value engineering and regenerative and sustainable practices.",
    photo: "/images/team/al_amin_momodu.webp",
    linkedin: "#",
  },
  {
    name: "Aminayar O.",
    title: "Lorem Ipsum Dolor Sit Amet",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    linkedin: "#",
  },
  {
    name: "Salma Mohammed",
    title: "Lorem Ipsum Dolor Sit Amet",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    linkedin: "#",
  },
  {
    name: "Femi Adewole",
    title: "Lorem Ipsum Dolor Sit Amet",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    linkedin: "#",
  },
];

export function BoardOfAdvisory() {
  const reduce = useReducedMotion();
  return (
    <section className="section board-advisory-section section--alabaster">
      <div className="shell">
        <SectionHeading
          eyebrow="Board of Advisory"
          title="Depth of experience. Broader perspective."
          copy="The Advisory Board strengthens AXP with external perspective across institutional strategy, finance, capital projects and governance."
        />
        <motion.div className="advisory-grid" variants={staggerContainer} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          {advisors.map((advisor) => (
            <motion.article className="advisory-card" key={advisor.name} variants={staggerItem}>
              <div className="advisory-photo">
                {advisor.photo ? (
                  <img src={advisor.photo} alt={advisor.name} loading="lazy" />
                ) : (
                  <span className="avatar-initials" aria-hidden="true">{getInitials(advisor.name)}</span>
                )}
              </div>
              <strong>{advisor.name}</strong>
              <span>{advisor.title}</span>
              <p>{advisor.bio}</p>
              <div className="advisory-card-footer">
                <div className="advisory-social">
                  <a href={advisor.linkedin} target="_blank" rel="noreferrer" aria-label={`${advisor.name} on LinkedIn`}><FaLinkedin /></a>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
