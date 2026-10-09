// Portfolio content drawn from Amey's supplied resumes.
export const profile = {
  name: 'Amey Shelar', role: 'Full-stack & AI developer',
  email: 'ameys436@gmail.com', phone: '+91 9867684996', phoneHref: 'tel:+919867684996',
  github: 'https://github.com/amey-16', linkedin: 'https://www.linkedin.com/in/amey-shelar123',
  resume: '/amey-shelar-resume.pdf',
}

export const projects = [
  {
    name: 'VPN Dashboard', fullName: 'VPN Tunneling Dashboard',
    kind: 'Network monitoring & data visualization', color: '#c6dcf3',
    role: 'Dashboard development', tools: 'React.js, REST APIs, charts',
    summary: 'A clearer view of secure network tunnels.',
    description: 'A dashboard for monitoring VPN tunnels, including IKE and Child Security Associations, through graphs and structured tables.',
    brief: 'Bring VPN tunnel information into a single interface for secure network monitoring.',
    deliverables: ['Monitoring dashboard', 'Data visualizations', 'Structured tunnel tables'],
    challenge: 'Present live tunnel and security-association data in a form that is practical to inspect.',
    approach: 'Built a React interface connected to REST APIs, with charts and structured tables for real-time network data.',
    result: 'A working dashboard for monitoring VPN tunnel activity and visualizing network information.',
  },
  {
    name: 'JATAYU', fullName: 'JATAYU Autonomous UAV',
    kind: 'Computer vision & autonomous systems', color: '#dce4ca',
    role: 'AI, navigation & hardware integration', tools: 'Python, OpenCV, NanoDet, MAVLink, Flask, Raspberry Pi',
    summary: 'Human detection meets autonomous navigation.',
    description: 'An autonomous UAV project combining AI-based human detection and tracking with real-time navigation.',
    brief: 'Connect computer vision, navigation and flight-control hardware in an autonomous UAV.',
    deliverables: ['Human detection & tracking', 'Stereo-vision navigation', 'Hardware integration & control logic'],
    challenge: 'Coordinate human detection, depth estimation and hardware control in a real-time system.',
    approach: 'Used Python, OpenCV and NanoDet for vision, stereo vision for depth estimation, and MAVLink with Raspberry Pi for hardware integration. Flask supported the application layer.',
    result: 'An integrated UAV project with human detection, tracking, navigation and control logic.',
  },
  {
    name: 'Retail Platform', fullName: 'Retail Optimization Platform',
    kind: 'Full-stack development & retail analytics', color: '#d9d8f0',
    role: 'Web platform development', tools: 'React.js, Node.js, Express.js, Supabase, YOLO, OpenCV, Stripe',
    summary: 'Retail data turned into useful business insights.',
    description: 'A web platform for retail analytics, inventory tracking and data-driven business optimization.',
    brief: 'Build a retail platform that brings analytics and inventory tracking together for startup use cases.',
    deliverables: ['Retail analytics', 'Inventory tracking', 'Data-driven business insights'],
    challenge: 'Connect retail information and inventory workflows in a system designed to scale.',
    approach: 'Developed a React frontend with Node.js, Express.js and Supabase. The project stack also included YOLO, OpenCV and Stripe.',
    result: 'A scalable web platform for retail analytics and inventory tracking, designed for startup use cases.',
  },
]

export const education = [
  { institution: 'Xavier Institute of Engineering', qualification: 'Bachelor of Engineering', detail: 'Computer Engineering', year: '2026', initials: 'BE' },
  { institution: 'Sathaye College', qualification: 'Higher Secondary Certificate', detail: 'HSC', year: '2022', initials: 'HSC' },
  { institution: 'Madhavrao Bhagwat High School', qualification: 'Secondary School Certificate', detail: 'SSC', year: '2020', initials: 'SSC' },
]

export const certifications = [
  { name: 'AWS Academy', detail: 'AWS Academy Graduate', initials: 'AWS' },
  { name: 'BARC', detail: 'Project Appreciation', initials: 'BARC' },
  { name: 'Client', detail: 'Project Appreciation', initials: 'PR' },
  { name: 'Infosys Springboard', detail: 'Data Analytics with Power BI and ChatGPT', initials: 'DA' },
]

export const skillGroups = [
  { name: 'Languages', items: 'C++, Python, JavaScript, TypeScript, SQL' },
  { name: 'Frontend', items: 'React.js, Next.js, HTML, CSS, Tailwind CSS, Bootstrap' },
  { name: 'Backend', items: 'Node.js, Express.js, FastAPI, REST APIs, authentication, API integration' },
  { name: 'Databases', items: 'MongoDB, MySQL, SQLite, PostgreSQL, Qdrant, Supabase' },
  { name: 'Data engineering', items: 'ETL/ELT fundamentals, data pipelines, cleaning, transformation, modeling, aggregation pipelines' },
  { name: 'AI & machine learning', items: 'Predictive modeling, model evaluation, LangChain, Hugging Face, YOLO, OpenCV' },
  { name: 'Tools', items: 'Git, GitHub, Postman, Azure DevOps, Docker basics, GitHub Actions, MLOps' },
]
