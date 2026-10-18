// All facts come from Amey's resumes. Nothing here is invented: no clients,
// metrics or availability claims.

export const profile = {
  name: 'Amey Shelar',
  role: 'Full-stack developer & AI/ML engineer',
  email: 'ameys436@gmail.com',
  github: 'https://github.com/amey-16',
  linkedin: 'https://www.linkedin.com/in/amey-shelar123',
  resume: '/Amey-Shelar-Resume.pdf',
}

export const rotating = ['web apps', 'REST APIs', 'data pipelines', 'dashboards', 'computer vision', 'AI tools']

export const statement = 'I’m Amey, a full-stack developer and AI/ML engineer. I build web apps, data dashboards and computer-vision systems, and I care about the whole path: the interface people touch, the services underneath, and the model that makes it smarter.'
// Words in the statement that resolve in the accent colour.
export const statementAccent = ['interface', 'services', 'model']

export const capabilities = [
  { name: 'Web applications', detail: 'Interfaces that stay readable when the data gets dense. Responsive, typed and fast.', tools: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'] },
  { name: 'Backends & APIs', detail: 'Services, authentication and integrations behind the interface.', tools: ['Node.js', 'Express', 'FastAPI', 'REST'] },
  { name: 'Databases', detail: 'Relational, document and vector stores, modelled for the questions people ask.', tools: ['PostgreSQL', 'MongoDB', 'Supabase', 'Qdrant'] },
  { name: 'Data pipelines', detail: 'Cleaning, transformation and aggregation that turn raw records into something usable.', tools: ['SQL', 'ETL / ELT', 'Python', 'Power BI'] },
  { name: 'Computer vision', detail: 'Detection, tracking and depth, connected to the hardware that acts on it.', tools: ['OpenCV', 'YOLO', 'NanoDet', 'Raspberry Pi'] },
  { name: 'Applied AI', detail: 'Predictive models, evaluation and LLM tooling wired into real products.', tools: ['LangChain', 'Hugging Face', 'Model evaluation', 'MLOps'] },
]

// Experience route: `at` is the position along the route (0–1).
export const route = [
  { at: 0.16, when: 'June 2024', place: 'IBM SkillsBuild', role: 'AI/ML Intern · Virtual', text: 'Machine learning fundamentals and data analysis.' },
  { at: 0.42, when: 'July 2025', place: 'BARC', role: 'Project Intern · Mumbai', text: 'Built a research-focused web system under expert mentorship at Bhabha Atomic Research Centre. Received a project appreciation.' },
  { at: 0.66, when: '2026', place: 'Xavier Institute', role: 'B.E. Computer Engineering', text: 'Bachelor of Engineering, class of 2026.' },
  { at: 0.88, when: 'July 2026', place: 'IIT Bombay', role: 'Research Intern · Mumbai', text: 'Working on the industry project Dhatuverse.', now: true },
]

export const credentials = [
  { mark: 'AWS', title: 'AWS Academy Graduate', by: 'AWS Academy' },
  { mark: 'INFOSYS', title: 'Data Analytics with Power BI and ChatGPT', by: 'Infosys Springboard' },
  { mark: 'BARC', title: 'Project Appreciation', by: 'Bhabha Atomic Research Centre' },
  { mark: 'B.E.', title: 'Computer Engineering, 2026', by: 'Xavier Institute of Engineering' },
]
