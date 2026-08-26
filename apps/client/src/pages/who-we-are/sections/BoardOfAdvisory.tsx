import "./BoardOfAdvisory.css";
import { motion, useReducedMotion } from "framer-motion";
import { FaAward, FaBookOpen, FaBuildingColumns, FaBullseye, FaCalendarDays, FaCity, FaClipboardList, FaCoins, FaDesktop, FaGear, FaGlobe, FaHandshake, FaHouse, FaLandmark, FaLeaf, FaLinkedin, FaPeopleGroup, FaRegBuilding, FaShieldHalved, FaTrophy, FaUser, FaUserGroup } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { getInitials } from "@/lib/format";

interface AdvisorStat {
  icon: IconType;
  value: string;
  label: string;
}

interface AdvisorInstitution {
  name: string;
  fullName?: string;
  role?: string;
  note: string;
}

interface AdvisorRegion {
  code: string;
  name: string;
}

interface AdvisorProject {
  icon?: IconType;
  title: string;
  location: string;
  category: string;
}

interface AdvisorRecognition {
  icon: IconType;
  label: string;
}

interface Advisor {
  name: string;
  title: string;
  tags?: string[];
  photo?: string;
  quote?: string;
  bio: string[];
  stats?: AdvisorStat[];
  institutions?: AdvisorInstitution[];
  institutionsLabel?: string;
  projects?: AdvisorProject[];
  projectsLabel?: string;
  expertise?: AdvisorRecognition[];
  expertiseLabel?: string;
  sectors?: AdvisorProject[];
  sectorsLabel?: string;
  countries?: AdvisorRegion[];
  countriesLabel?: string;
  countriesCount?: string;
  recognitions?: AdvisorRecognition[];
  recognitionsLabel?: string;
  missionStatement?: string;
  linkedin: string;
}

function ProjectTile({ project }: { project: AdvisorProject }) {
  const Icon = project.icon ?? FaRegBuilding;
  return (
    <div className="advisory-project">
      <div className="advisory-project-visual" aria-hidden="true"><Icon /></div>
      <strong>{project.title}</strong>
      <span>{project.location}</span>
      {project.category && <small>{project.category}</small>}
    </div>
  );
}

const advisors: Advisor[] = [
  {
    name: "Matthew Coker",
    title: "Finance, Risk, Governance & Institutional Strategy",
    tags: ["Corporate Executive", "Financial Strategist", "Public-Sector Advisor"],
    photo: "/images/team/matthew_coker.webp",
    quote: "Brings deep expertise in financial strategy, risk, governance and institutional transformation to strengthen AXP's strategic decision-making and unlock long-term value.",
    bio: [
      "Corporate executive and public-sector adviser with over three decades of experience across banking, risk management, asset management and institutional governance.",
      "Matthew has held senior leadership roles at the Asset Management Corporation of Nigeria (AMCON) and across leading financial institutions including FirstBank, Citibank Nigeria and Access Bank.",
      "He currently serves as Chairman of AXP Solutions Pro and as Special Assistant (Research & Strategy) to the Executive Secretary of the National Assembly Library Trust Fund, supporting policy, research and institutional capacity-building.",
      "An INSEAD alumnus with executive education from top global institutions and professional credentials in banking and governance.",
    ],
    stats: [
      { icon: FaCalendarDays, value: "30+ Years", label: "Executive Experience" },
      { icon: FaHandshake, value: "US$500M+", label: "Trade Lines Managed" },
      { icon: FaShieldHalved, value: "Risk & Governance", label: "Leadership" },
      { icon: FaLandmark, value: "Public Sector", label: "Institutional Advisory" },
    ],
    institutions: [
      { name: "AMCON", fullName: "Asset Management Corporation of Nigeria", note: "Senior Leadership Positions" },
      { name: "FirstBank", fullName: "Since 1894", note: "Head, International Trade (US$500M+ Trade Lines)" },
      { name: "Citi", fullName: "Nigeria International Bank", note: "Now Citibank Nigeria" },
      { name: "Access", fullName: "Access Bank", note: "Leadership in Service Quality & Operational Excellence" },
      { name: "NALTF", fullName: "National Assembly Library Trust Fund", note: "Special Assistant (Research & Strategy) to the Executive Secretary" },
    ],
    linkedin: "https://www.linkedin.com/in/matthewcoker/",
  },
  {
    name: "Mohammed Al-Amin Momodu",
    title: "Programme Delivery, Transformation & Value Engineering",
    tags: ["Chartered Engineer", "Programme Manager", "Transformation Consultant", "Value Engineering Expert"],
    photo: "/images/team/al_amin_momodu.webp",
    quote: "A multidisciplinary engineer and programme delivery leader with extensive experience in capital projects, housing transformation, digital delivery and sustainable development across public and private sectors.",
    bio: [
      "A Chartered Engineer and executive programme management consultant with extensive experience delivering complex initiatives across capital projects, housing transformation, digital transformation, business change and sustainable development.",
      "His multidisciplinary expertise bridges engineering, programme governance and value engineering to drive strategic outcomes, optimise performance and create long-term value for organisations and communities.",
      "He is recognised for leading high-performing teams, managing stakeholders effectively and implementing robust governance and delivery frameworks that turn strategy into measurable impact.",
    ],
    stats: [
      { icon: FaUser, value: "C.Eng", label: "Chartered Engineer (UK)" },
      { icon: FaClipboardList, value: "PMP®", label: "Project Management Professional" },
      { icon: FaGear, value: "PRINCE2 Agile®", label: "Certified" },
      { icon: FaUserGroup, value: "CSM®", label: "Certified Scrum Master" },
      { icon: FaLandmark, value: "Member", label: "COREN, ICE, ASCE, APM" },
    ],
    institutionsLabel: "Core competencies & credentials",
    institutions: [
      { name: "C.Eng", note: "Chartered Engineer (UK)" },
      { name: "PMP", note: "Project Management Professional" },
      { name: "PRINCE2 Agile", note: "PRINCE2 Agile® Certified" },
      { name: "CSM", note: "Certified Scrum Master" },
      { name: "COREN", note: "Council for the Regulation of Engineering in Nigeria" },
      { name: "ICE", note: "Institution of Civil Engineers (UK)" },
      { name: "ASCE", note: "American Society of Civil Engineers" },
      { name: "APM", note: "Association for Project Management" },
    ],
    expertiseLabel: "Areas of expertise",
    expertise: [
      { icon: FaCity, label: "Capital Project Delivery" },
      { icon: FaHouse, label: "Housing Transformation" },
      { icon: FaDesktop, label: "Digital Transformation" },
      { icon: FaPeopleGroup, label: "Programme Leadership & Governance" },
      { icon: FaLeaf, label: "Sustainable Development" },
    ],
    sectorsLabel: "Delivering impact across sectors",
    sectors: [
      { icon: FaCity, title: "Capital Projects", location: "Infrastructure Delivery", category: "" },
      { icon: FaHouse, title: "Housing Transformation", location: "Communities & Homes", category: "" },
      { icon: FaDesktop, title: "Digital Transformation", location: "Systems & Innovation", category: "" },
      { icon: FaLeaf, title: "Sustainable Development", location: "People, Planet, Progress.", category: "" },
    ],
    missionStatement: "Committed to delivering excellence through strategic insight, technical expertise and value-driven solutions that build resilient organisations and sustainable communities.",
    linkedin: "#",
  },
  {
    name: "Mohammad Amin Nayyar",
    title: "Architecture, Sustainable Design & Urban Development",
    tags: ["Architect", "Planner", "Researcher", "Design Leader"],
    photo: "https://res.cloudinary.com/gxhmv4fu/image/upload/v1787084210/aminn-ayyar_zg7ovg.jpg",
    quote: "Architect, researcher and sustainability advocate with three decades of international experience in architecture, bioclimatic design and large-scale urban development.",
    bio: [
      "Architect, researcher and CEO/Director of ANA Design Studio, with over three decades of experience in architecture, bioclimatic design, building performance and large-scale urban development.",
      "His portfolio spans multiple sectors and geographies, with landmark projects across India, Nigeria, UAE, Oman, Ireland and Myanmar. His work reflects a strong commitment to sustainable, context-responsive design and energy-efficient architecture.",
      "A passionate educator and thought leader, he has taught architecture and design at leading universities and contributed to national and international research on bioclimatic architecture and sustainable development.",
      "His practice has received multiple national and international awards for design excellence, sustainability and innovation.",
    ],
    stats: [
      { icon: FaCalendarDays, value: "30+ Years", label: "Professional Experience" },
      { icon: FaGlobe, value: "6+ Countries", label: "Global Project Experience" },
      { icon: FaRegBuilding, value: "Architect & Design Leader", label: "Founder & CEO, ANA Design Studio" },
      { icon: FaLeaf, value: "Sustainable Design Expert", label: "Bioclimatic & Energy-Efficient Architecture" },
      { icon: FaAward, value: "Award-Winning Practice", label: "Recognised for Excellence in Sustainable Architecture" },
    ],
    projects: [
      { title: "Landmark Village", location: "Lagos, Nigeria", category: "Mixed-Use Development" },
      { title: "SPAR Global Malls", location: "India", category: "Retail Architecture" },
      { title: "Reliance Projects", location: "India", category: "Corporate Campuses" },
      { title: "Chandigarh Railway Station", location: "Chandigarh, India", category: "Transportation Architecture" },
      { title: "CSMT Redevelopment", location: "Mumbai, India", category: "Heritage Conservation" },
      { title: "Bioclimatic Architecture", location: "Research & Practice", category: "Sustainable Design" },
    ],
    countries: [
      { code: "IN", name: "India" },
      { code: "NG", name: "Nigeria" },
      { code: "AE", name: "UAE" },
      { code: "OM", name: "Oman" },
      { code: "IE", name: "Ireland" },
      { code: "MM", name: "Myanmar" },
    ],
    recognitions: [
      { icon: FaTrophy, label: "National & International Design Awards" },
      { icon: FaLeaf, label: "Sustainable Architecture Excellence" },
      { icon: FaBookOpen, label: "Research & Thought Leadership" },
      { icon: FaAward, label: "Academic & Industry Recognition" },
    ],
    linkedin: "#",
  },
  {
    name: "Salma Mohammed",
    title: "Lorem Ipsum Dolor Sit Amet",
    bio: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    ],
    linkedin: "#",
  },
  {
    name: "Adebayo Femi Adewole",
    title: "Housing Finance, Policy & Large-Scale Development",
    tags: ["Housing Finance Expert", "Development Finance Leader", "Policy & Investment Advisor"],
    photo: "https://res.cloudinary.com/gxhmv4fu/image/upload/v1787090941/femi-adewole_my7atw.jpg",
    quote: "A pan-African housing and development finance leader with a proven record of mobilising capital, shaping policy and delivering homes that transform communities and economies.",
    bio: [
      "Housing development and finance executive with extensive experience across Europe and 34 African countries. He has held senior leadership roles at Shelter Afrique and Family Homes Funds, leading large-scale affordable housing and institutional programmes.",
      "At Family Homes Funds, he led the delivery of approximately 20,000 homes and the creation of 86,000 jobs through innovative public-private partnerships and capital mobilisation initiatives.",
      "He has secured significant debt and equity financing for housing and urban regeneration programmes, including a £400m debt facility and over US$140m in financing for the Lagos Economic Development PPP.",
      "He currently advises governments and international development institutions on housing policy, investment strategy and sustainable urban development across Africa.",
    ],
    stats: [
      { icon: FaGlobe, value: "34 Countries", label: "Pan-African Experience" },
      { icon: FaHouse, value: "20,000 Homes", label: "Facilitated & Supported" },
      { icon: FaPeopleGroup, value: "86,000 Jobs", label: "Supported" },
      { icon: FaCoins, value: "£400M Facility", label: "Secured for Affordable Housing" },
      { icon: FaHandshake, value: "US$140M+", label: "Debt & Equity Mobilised" },
    ],
    institutionsLabel: "Select experience highlights",
    institutions: [
      { name: "Family Homes Funds", role: "Executive Director (Nigeria)", note: "Delivered ~20,000 homes & supported 86,000 jobs" },
      { name: "Shelter Afrique", role: "Executive Director", note: "Investment, Partnerships & Development" },
      { name: "The World Bank", fullName: "World Bank Group", role: "Consultant", note: "Housing Finance & Policy Advisory" },
      { name: "Guinness Partnership", role: "Executive Director", note: "Secured £400m debt facility" },
      { name: "Lagos State", role: "Lagos Economic Development PPP", note: "Mobilised >US$140m debt and equity financing" },
    ],
    countriesLabel: "Pan-African experience",
    countriesCount: "34",
    countries: [
      { code: "AF", name: "Across Africa" },
      { code: "EU", name: "Europe" },
      { code: "UK", name: "United Kingdom" },
    ],
    recognitionsLabel: "Recognised for impact",
    recognitions: [
      { icon: FaTrophy, label: "Leadership in Affordable Housing Finance" },
      { icon: FaLandmark, label: "Capital Mobilisation Excellence" },
      { icon: FaPeopleGroup, label: "Job Creation & Community Development" },
      { icon: FaLeaf, label: "Sustainable & Inclusive Urban Growth" },
    ],
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
        <motion.div className="advisory-list" variants={staggerContainer} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
          {advisors.map((advisor) => (
            <motion.article className="advisory-card" key={advisor.name} variants={staggerItem}>
              <div className="advisory-rail">
                <div className="advisory-photo">
                  {advisor.photo ? (
                    <img src={advisor.photo} alt={advisor.name} loading="lazy" />
                  ) : (
                    <span className="avatar-initials" aria-hidden="true">{getInitials(advisor.name)}</span>
                  )}
                </div>
                {advisor.quote && (
                  <blockquote className="advisory-quote">
                    <span className="advisory-quote-mark" aria-hidden="true">&ldquo;</span>
                    {advisor.quote}
                  </blockquote>
                )}
                {advisor.stats && (
                  <ul className="advisory-stats">
                    {advisor.stats.map((stat) => (
                      <li key={stat.label}>
                        <span className="advisory-stat-icon"><stat.icon /></span>
                        <span>
                          <strong>{stat.value}</strong>
                          <small>{stat.label}</small>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="advisory-content">
                <div className="advisory-content-head">
                  <div>
                    <h3>{advisor.name}</h3>
                    <span className="advisory-title">{advisor.title}</span>
                    {advisor.tags && (
                      <div className="advisory-tags">
                        {advisor.tags.map((tag) => <span key={tag}>{tag}</span>)}
                      </div>
                    )}
                  </div>
                  <div className="advisory-badge">
                    <span className="advisory-badge-icon" aria-hidden="true"><FaBuildingColumns /></span>
                    <span>Board of<br />Advisory</span>
                  </div>
                </div>

                <div className="advisory-bio">
                  {advisor.bio.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                </div>

                {advisor.institutions && (
                  <div className="advisory-institutions">
                    <span className="advisory-institutions-label">{advisor.institutionsLabel ?? "Leadership across leading institutions"}</span>
                    <div className="advisory-institutions-row">
                      {advisor.institutions.map((item) => (
                        <div className="advisory-institution" key={item.name}>
                          <div className="advisory-institution-tile">
                            <strong>{item.name}</strong>
                            {item.fullName && <small>{item.fullName}</small>}
                          </div>
                          {item.role && <p className="advisory-institution-role">{item.role}</p>}
                          <p>{item.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {advisor.projects && (
                  <div className="advisory-projects">
                    <div className="advisory-divider"><span>{advisor.projectsLabel ?? "Select project highlights"}</span></div>
                    <div className="advisory-projects-row">
                      {advisor.projects.map((project) => <ProjectTile project={project} key={project.title} />)}
                    </div>
                  </div>
                )}

                {(advisor.expertise || advisor.sectors) && (
                  <div className="advisory-footer-grid">
                    {advisor.expertise && (
                      <div>
                        <span className="advisory-institutions-label">{advisor.expertiseLabel ?? "Areas of expertise"}</span>
                        <div className="advisory-expertise-row">
                          {advisor.expertise.map((item) => (
                            <div className="advisory-expertise-item" key={item.label}>
                              <span className="advisory-expertise-icon"><item.icon /></span>
                              <small>{item.label}</small>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {advisor.sectors && (
                      <div>
                        <span className="advisory-institutions-label">{advisor.sectorsLabel ?? "Delivering impact across sectors"}</span>
                        <div className="advisory-projects-row advisory-projects-row--compact">
                          {advisor.sectors.map((project) => <ProjectTile project={project} key={project.title} />)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {advisor.missionStatement && (
                  <div className="advisory-mission">
                    <span className="advisory-mission-icon" aria-hidden="true"><FaBullseye /></span>
                    <p>{advisor.missionStatement}</p>
                  </div>
                )}

                {(advisor.countries || advisor.recognitions) && (
                  <div className="advisory-footer-grid">
                    {advisor.countries && (
                      <div className="advisory-countries">
                        <span className="advisory-institutions-label">{advisor.countriesLabel ?? "Global experience"}</span>
                        <div className="advisory-countries-row">
                          <div className="advisory-country-count">
                            <strong>{advisor.countriesCount ?? `${advisor.countries.length}+`}</strong>
                            <small>Countries</small>
                          </div>
                          {advisor.countries.map((country) => (
                            <div className="advisory-country" key={country.name}>
                              <span>{country.code}</span>
                              <small>{country.name}</small>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {advisor.recognitions && (
                      <div className="advisory-recognition">
                        <span className="advisory-institutions-label">{advisor.recognitionsLabel ?? "Recognised for excellence"}</span>
                        <div className="advisory-recognition-row">
                          {advisor.recognitions.map((item) => (
                            <div className="advisory-recognition-item" key={item.label}>
                              <span className="advisory-stat-icon"><item.icon /></span>
                              <small>{item.label}</small>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="advisory-card-footer">
                  <div className="advisory-social">
                    <a href={advisor.linkedin} target="_blank" rel="noreferrer" aria-label={`${advisor.name} on LinkedIn`}><FaLinkedin /></a>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
