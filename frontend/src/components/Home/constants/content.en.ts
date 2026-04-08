// ============================================
// Page Content Constants - English Version
// ============================================

// ===== Brand Info =====
export const BRAND = {
  NAME: 'Sam College',
  SLOGAN: 'Sam College',
  SUB_SLOGAN: 'All-subject AI teaching platform, making knowledge within reach.\nSupports Open Claw system-level execution, builds self-updating knowledge base, tracks learning progress, and creates personalized learning experiences',
  TAGLINE: 'written by Sam',
} as const;

// ===== Navigation =====
export const NAVIGATION = {
  LINKS: [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'API Documentation', href: '/docs', isExternal: false },
    { label: 'Demo', href: '#demo', isExternal: false },
  ],
  BUTTONS: {
    LOGIN: 'Login',
    REGISTER: 'Register',
    DOWNLOAD: 'Download Client',
  },
} as const;

// ===== External Links =====
export const EXTERNAL_LINKS = {
  GITHUB: 'https://github.com/ssyb34947-maker/SamLang',
  DOWNLOAD_WINDOWS: '#download-windows',
} as const;

// ===== Hero Section =====
export const HERO = {
  BADGE: 'All-Subject AI Teaching Platform',
  CTA: {
    PRIMARY: 'Start Learning Free',
    SECONDARY_GUEST: 'Login',
    SECONDARY_AUTH: 'Enter Learning',
    DOWNLOAD: 'Download Client',
  },
  TRUST_BADGES: ['Free to Start', 'All Subjects Covered', 'Cancel Anytime'],
  DEMO: {
    TITLE: '{BRAND} Agent',
    AI_MESSAGES: [
      "Hello! I'm Professor Sam. What would you like to learn today? I'll teach you in the most suitable way for you.",
      "Great! Let me organize the core knowledge points of conic sections for you... Related data has been saved, and you can also check out the video I prepared for you...",
    ],
    USER_MESSAGE: 'I want to review the conic sections part of high school math',
    INPUT_PLACEHOLDER: 'Type a message...',
    DEMO_LINK_TEXT: 'Watch Video Demo',
  },
} as const;

// ===== Features =====
export const FEATURES_SECTION = {
  TITLE: 'Powerful Features for Better Learning',
  SUBTITLE: '12+ core features covering the entire learning process, making all-subject learning more efficient and engaging',
} as const;

export const FEATURES_LIST = [
  {
    id: 'ai-chat',
    title: 'Professor-Level Teaching',
    description: 'Professor AGENT integrated with cutting-edge intelligent algorithms, providing a teaching experience beyond chatbots',
    icon: 'MessageCircle',
  },
  {
    id: 'conversation-mgmt',
    title: 'Self-Iterating Strategy',
    description: 'Memory system based on Open CLaw, automatically updates teaching strategies every 24 hours',
    icon: 'MessagesSquare',
  },
  {
    id: 'all-subjects',
    title: 'All-Subject Teaching',
    description: 'Covers all subjects including math, physics, chemistry, English, etc., supports output of teaching videos',
    icon: 'BookOpen',
  },
  {
    id: 'open-claw',
    title: 'Open Claw System',
    description: 'System-level execution capability, deeply integrated with the operating system, providing a "lobster raising" experience',
    icon: 'Terminal',
  },
  {
    id: 'knowledge-base',
    title: 'Self-Supporting Knowledge Base',
    description: 'Upload documents, PDFs, notes, AI automatically organizes, summarizes, and connects knowledge points to build personal knowledge networks',
    icon: 'Database',
  },
  {
    id: 'self-update',
    title: 'Self-Updating Knowledge Base',
    description: 'Knowledge base continuously evolves, AI automatically discovers new knowledge and updates old content to keep the knowledge system cutting-edge',
    icon: 'RefreshCw',
  },
  {
    id: 'study-dashboard',
    title: 'Learning Dashboard',
    description: 'Visual display of learning progress, knowledge mastery, and study time distribution, making progress clear at a glance',
    icon: 'TrendingUp',
  },
  {
    id: 'data-analysis',
    title: 'AI Data Analysis',
    description: 'Machine learning algorithm iteration, multi-dimensional insights into learning performance',
    icon: 'BarChart3',
  },
  {
    id: 'agent-cli',
    title: 'Agent Terminal Assistant',
    description: 'Monitors user learning progress, feedback, and needs, intelligently adjusts teaching strategies, and provides personalized learning experiences',
    icon: 'Command',
  },
  {
    id: 'pdf-viewer',
    title: 'Note Management',
    description: 'Built-in Markdown editor, supports annotation, notes, and AI intelligent document content analysis',
    icon: 'FileText',
  },
  {
    id: 'personal-info',
    title: 'Precision Teaching',
    description: 'Based on machine learning algorithms, driven by SKILL. Dynamically adjusts teaching strategies according to user learning habits, progress, feedback, and other characteristics',
    icon: 'User',
  },
  {
    id: 'sketch-style',
    title: 'Multi-Style and Double Language',
    description: 'Supports 5 styles and Chinese-English language System',
    icon: 'Pencil',
  },
] as const;

// ===== How It Works =====
export const HOW_IT_WORKS_SECTION = {
  TITLE: 'Start Your Learning Journey in 3 Steps',
  SUBTITLE: 'Simple to get started, begin your learning journey immediately',
} as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: 'Register & Login',
    description: 'Algorithm cold start, break the ice upon enrollment',
  },
  {
    step: 2,
    title: 'Learn Freely',
    description: 'Enjoy all the resources of the entire college',
  },
  {
    step: 3,
    title: 'Feedback & Iterate',
    description: 'No need to worry about summaries after learning, the college team automatically updates',
  },
] as const;

// ===== Testimonials =====
export const TESTIMONIALS_SECTION = {
  TITLE: 'What Users Say',
  SUBTITLE: 'Feedback from real users',
} as const;

export const TESTIMONIALS_LIST = [
  {
    id: 1,
    name: 'Zhou Yu',
    role: 'Grand Commander',
    content: 'Sam truly has the talent of Bo Ya and Zi Qi.',
    avatar: 'Z',
  },
  {
    id: 2,
    name: 'Liu Bei',
    role: 'General of the Left, Marquis of Yicheng, Governor of Yuzhou, Uncle of the Emperor',
    content: 'Clouds follow dragons, winds follow tigers, heroes of dragon and tiger proudly face the sky.',
    avatar: 'L',
  },
  {
    id: 3,
    name: 'Gongsun Zan',
    role: 'Governor of Youzhou',
    content: 'Truly, who in the world does not know you?',
    avatar: 'GS',
  },
  {
    id: 4,
    name: 'Guan Yu',
    role: 'Marquis of Hanshou',
    content: "Sam's words are profound, worthy of a toast.",
    avatar: 'G',
  },
  {
    id: 5,
    name: 'Cao Cao',
    role: 'Chancellor',
    content: 'Sam, if you leave, what will we eat?',
    avatar: 'C',
  },
  {
    id: 6,
    name: 'Zhang Fei',
    role: 'Butcher and Wine Seller',
    content: '(Pointing at Sam) I think you are reluctant to leave this handsome desk.',
    avatar: 'Z',
  },
] as const;

// ===== CTA Section =====
export const CTA_SECTION = {
  BADGE: 'Ready to Start?',
  TITLE: 'Join {BRAND}, Start Your\nSam College Journey',
  SUBTITLE: 'Free registration, enroll in Sam College immediately',
  BUTTONS: {
    PRIMARY: 'Start Free',
    SECONDARY: 'Try It First',
  },
  FOOTER_NOTE: 'No fees · Cancel anytime · Free version available',
} as const;

// ===== Footer =====
export const FOOTER = {
  TAGLINE: 'Sam College, making every minute of learning valuable.',
  COPYRIGHT: '© 2026 {BRAND}. All rights reserved.',
  MADE_WITH: 'Made with ❤️ for every learner',
  LINK_GROUPS: [
    {
      title: 'Product',
      links: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
    },
    {
      title: 'Resources',
      links: ['Help Center', 'API Docs', 'Community Forum', 'Blog'],
    },
    {
      title: 'Company',
      links: ['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'],
    },
  ],
  SOCIAL: {
    GITHUB: { label: 'GitHub', href: 'https://github.com/ssyb34947-maker/SamLang' },
    TWITTER: { label: 'Twitter', href: '#' },
    EMAIL: { label: 'Email', href: '#' },
  },
} as const;

// ===== Download =====
export const DOWNLOAD = {
  WINDOWS: {
    LABEL: 'Download Windows Client',
    DESCRIPTION: 'Supports Windows 10/11',
    BUTTON_TEXT: 'Download Now',
  },
} as const;
