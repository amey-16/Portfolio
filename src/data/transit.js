// Content for the Skill Transit Map. Every fact here comes from Amey's resumes;
// the network geometry is authored so each line bends only at 45 / 90 degrees.

export const profile = {
  name: 'Amey Shelar',
  role: 'Full-stack developer & AI/ML engineer',
  email: 'ameys436@gmail.com',
  github: 'https://github.com/amey-16',
  linkedin: 'https://www.linkedin.com/in/amey-shelar123',
}

export const lines = [
  { id: 'frontend', name: 'Frontend', color: 'var(--red)', summary: 'Interfaces people can read at a glance: React and Next.js apps, dashboards and responsive layouts.', skills: ['HTML / CSS', 'Bootstrap', 'Tailwind CSS', 'React', 'Next.js', 'TypeScript'] },
  { id: 'backend', name: 'Backend', color: 'var(--blue)', summary: 'Services and data stores behind the interface: APIs, authentication and integrations.', skills: ['FastAPI', 'Express.js', 'Node.js', 'REST APIs', 'PostgreSQL', 'MongoDB'] },
  { id: 'data', name: 'Data', color: 'var(--amber)', summary: 'Getting data into shape: cleaning, transformation, modeling and pipelines that feed dashboards.', skills: ['SQL', 'Power BI', 'ETL / ELT', 'Pipelines', 'Data modeling', 'Supabase'] },
  { id: 'ai', name: 'AI / ML', color: 'var(--green)', summary: 'Models with an engineering context: computer vision, predictive modeling and LLM tooling.', skills: ['Python', 'Hugging Face', 'LangChain', 'OpenCV', 'YOLO', 'NanoDet'] },
]

// Interchanges: where two or more lines meet. `slug` links to a case study.
export const interchanges = [
  { id: 'retail', name: 'Retail Platform', full: 'Retail Optimization Platform', kind: 'Project', lines: ['frontend', 'backend', 'data', 'ai'], slug: 'retail-optimization-platform', note: 'React, Node.js, Express and Supabase, with YOLO and OpenCV in the analytics workflow.' },
  { id: 'barc', name: 'BARC', full: 'Bhabha Atomic Research Centre', kind: 'Internship · 2025', lines: ['frontend', 'backend'], note: 'Project intern in Mumbai. Developed a research-focused web system under expert mentorship.' },
  { id: 'ibm', name: 'IBM SkillsBuild', full: 'IBM SkillsBuild', kind: 'Internship · 2024', lines: ['data', 'ai'], note: 'AI/ML intern (virtual). Machine learning fundamentals and data analysis.' },
  { id: 'vpn', name: 'VPN Dashboard', full: 'VPN Tunneling Dashboard', kind: 'Project', lines: ['frontend', 'data'], slug: 'vpn-tunneling-dashboard', note: 'React interface on REST APIs, with graphs and tables for IKE and Child SA data.' },
  { id: 'jatayu', name: 'JATAYU', full: 'JATAYU Autonomous UAV', kind: 'Project', lines: ['backend', 'ai'], slug: 'jatayu', note: 'Human detection, tracking and stereo-vision navigation, wired to hardware through MAVLink and Flask.' },
]

// Geometry (viewBox 0 150 1600 360). Lines run parallel through the central
// trunk, swap order inside the Retail capsule, then fan out in pairs.
export const geometry = {
  frontend: 'M40 230H600L670 300H930L1000 230H1560',
  backend: 'M40 246H593.4L663.4 316H760M840 332H930L1000 402H1560',
  data: 'M40 402H600L670 332H760M840 316H936.6L1006.6 246H1560',
  ai: 'M40 418H606.6L676.6 348H923.4L993.4 418H1560',
  // Hidden inside the capsule: short connectors that swap backend and data.
  swap: { backend: 'M760 316L840 332', data: 'M760 332L840 316' },
}

// Skill stations: [line, label, x, y, label side]
const W = [100, 225, 480], E = [1120, 1375, 1500]
export const stations = [
  ['frontend', 'HTML / CSS', W[0], 230, 'above'], ['frontend', 'Bootstrap', W[1], 230, 'above'], ['frontend', 'Tailwind CSS', W[2], 230, 'above'],
  ['frontend', 'React', E[0], 230, 'above'], ['frontend', 'Next.js', E[1], 230, 'above'], ['frontend', 'TypeScript', E[2], 230, 'above'],
  ['backend', 'FastAPI', W[0], 246, 'below'], ['backend', 'Express.js', W[1], 246, 'below'], ['backend', 'Node.js', W[2], 246, 'below'],
  ['backend', 'REST APIs', E[0], 402, 'above'], ['backend', 'PostgreSQL', E[1], 402, 'above'], ['backend', 'MongoDB', E[2], 402, 'above'],
  ['data', 'SQL', W[0], 402, 'above'], ['data', 'Power BI', W[1], 402, 'above'], ['data', 'ETL / ELT', W[2], 402, 'above'],
  ['data', 'Pipelines', E[0], 246, 'below'], ['data', 'Data modeling', E[1], 246, 'below'], ['data', 'Supabase', E[2], 246, 'below'],
  ['ai', 'Python', W[0], 418, 'below'], ['ai', 'Hugging Face', W[1], 418, 'below'], ['ai', 'LangChain', W[2], 418, 'below'],
  ['ai', 'OpenCV', E[0], 418, 'below'], ['ai', 'YOLO', E[1], 418, 'below'], ['ai', 'NanoDet', E[2], 418, 'below'],
]

// Capsules: [interchange id, x, y top, height, label y, width]
export const capsules = [
  ['retail', 800, 286, 76, 266, 84],
  ['barc', 350, 216, 44, 190, 34],
  ['ibm', 350, 388, 44, 480, 34],
  ['vpn', 1250, 216, 44, 190, 34],
  ['jatayu', 1250, 388, 44, 480, 34],
]

export const journey = [
  { when: '2020', place: 'Madhavrao Bhagwat High School', role: 'Secondary School Certificate', detail: 'Where the route begins.', lines: [] , kind: 'Education' },
  { when: '2022', place: 'Sathaye College', role: 'Higher Secondary Certificate', detail: 'Science stream, then on to engineering.', lines: [], kind: 'Education' },
  { when: 'June 2024', place: 'IBM SkillsBuild', role: 'AI/ML Intern · Virtual', detail: 'Worked on machine learning fundamentals and data analysis.', lines: ['data', 'ai'], kind: 'Internship' },
  { when: 'July 2025', place: 'BARC', role: 'Project Intern · Mumbai', detail: 'Developed a research-focused web system under expert mentorship at Bhabha Atomic Research Centre. Received a project appreciation.', lines: ['frontend', 'backend'], kind: 'Internship' },
  { when: '2026', place: 'Xavier Institute of Engineering', role: 'B.E. Computer Engineering', detail: 'Bachelor of Engineering, class of 2026.', lines: [], kind: 'Education' },
  { when: 'July 2026', place: 'IIT Bombay', role: 'Research Intern · Mumbai', detail: 'Working on the industry project Dhatuverse.', lines: [], kind: 'Now', current: true },
]

export const tickets = [
  { issuer: 'AWS Academy', title: 'AWS Academy Graduate', code: 'AWS' },
  { issuer: 'Infosys Springboard', title: 'Data Analytics with Power BI and ChatGPT', code: 'INFOSYS' },
  { issuer: 'Bhabha Atomic Research Centre', title: 'Project Appreciation', code: 'BARC' },
]

export const toolbox = ['C++', 'Python', 'JavaScript', 'TypeScript', 'SQL', 'Git', 'GitHub Actions', 'Postman', 'Docker', 'Azure DevOps', 'MySQL', 'SQLite', 'Qdrant', 'MLOps']
