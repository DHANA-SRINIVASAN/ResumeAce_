# 🚀 ResumeAce - AI-Powered Resume Analysis & Career Matching Platform

<div align="center">

![ResumeAce Logo](./public/logo.png)

**An intelligent resume management system that leverages AI to help professionals optimize their careers and find perfect job matches**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?style=for-the-badge&logo=openai)](https://openai.com/)

[🌟 Features](#-features) • [🛠️ Tech Stack](#️-tech-stack) • [🚀 Quick Start](#-quick-start) • [📸 Screenshots](#-screenshots) • [🤝 Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [🌟 Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [📸 Screenshots](#-screenshots)
- [🔧 Configuration](#-configuration)
- [📊 Database Schema](#-database-schema)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Project Overview

ResumeAce is a comprehensive resume management and job matching application that combines artificial intelligence with modern web technologies. The platform helps professionals:

- **Optimize resumes** with AI-powered analysis and recommendations
- **Find perfect job matches** through intelligent matching algorithms
- **Identify skill gaps** and get personalized development suggestions
- **Track career progress** with detailed analytics and insights
- **Manage multiple resume versions** for different job applications

### 🎯 Problem Statement

In today's competitive job market, professionals face several challenges:
- Creating effective resumes that highlight relevant skills
- Identifying skill gaps for desired positions
- Finding suitable job opportunities that match qualifications
- Managing multiple resume versions efficiently

### 💡 Solution

ResumeAce addresses these challenges through:
- **AI-Powered Resume Analysis** using advanced NLP techniques
- **Intelligent Job Matching** comparing resume content with job requirements
- **Skill Gap Analysis** identifying missing skills and providing recommendations
- **Centralized Resume Management** with version control and optimization tools

---

## 🌟 Features

### 🔥 Core Features

| Feature                   | Description                                       | Status     |
| ------------------------- | ------------------------------------------------- | ---------- |
| **Smart Resume Upload**   | PDF/DOCX processing with AI text extraction       | ✅ Complete |
| **AI Resume Analysis**    | Comprehensive parsing and content structuring     | ✅ Complete |
| **Job Matching Engine**   | Intelligent candidate-job pairing algorithms      | ✅ Complete |
| **Skill Gap Analysis**    | Identify missing skills for target roles          | ✅ Complete |
| **Interactive Dashboard** | Centralized resume management interface           | ✅ Complete |
| **Multi-Portal System**   | Separate interfaces for candidates and recruiters | ✅ Complete |

### 🚀 Advanced Features

| Feature                 | Description                                   | Status     |
| ----------------------- | --------------------------------------------- | ---------- |
| **Resume Builder**      | Interactive drag-and-drop interface           | ✅ Complete |
| **Sentiment Analysis**  | NLP analysis of resume language effectiveness | ✅ Complete |
| **Career Roadmaps**     | Personalized professional development paths   | ✅ Complete |
| **Bias Detection**      | AI-powered fairness analysis                  | ✅ Complete |
| **Bulk Processing**     | Handle multiple resumes simultaneously        | ✅ Complete |
| **Analytics Dashboard** | Usage statistics and performance metrics      | ✅ Complete |
| **Template System**     | Pre-built resume templates                    | ✅ Complete |
| **Feedback System**     | User experience improvement tools             | ✅ Complete |

### 🔐 Security & Performance

- **🔒 Secure Authentication** - NextAuth.js with password hashing
- **🛡️ Data Privacy** - Anonymized resume options and GDPR compliance
- **⚡ Performance Optimized** - Code splitting, lazy loading, and caching
- **📱 Responsive Design** - Mobile-first approach with Tailwind CSS
- **🔄 Real-time Updates** - Live data synchronization

---

## 🛠️ Tech Stack

### Frontend Technologies
```
Next.js 15          - React framework with App Router
React 18            - Modern UI library with concurrent features
TypeScript          - Type-safe development
Tailwind CSS        - Utility-first CSS framework
Shadcn UI           - Modern component library
Lucide React        - Beautiful icon library
React Hook Form     - Efficient form handling
Recharts            - Data visualization
HTML2Canvas         - PDF generation
```

### Backend & Database
```
Next.js API Routes  - Server-side endpoints
Node.js             - JavaScript runtime
Prisma ORM          - Type-safe database toolkit
PostgreSQL          - Relational database
NextAuth.js         - Authentication system
Bcrypt              - Password security
Zod                 - Schema validation
```

### AI & Machine Learning
```
Google Genkit       - AI toolkit for content generation
OpenAI API          - Advanced NLP for resume analysis
Custom AI Flows     - Specialized algorithms for:
  ├── Resume parsing and analysis
  ├── Job recommendation engine
  ├── Skill gap identification
  ├── Career roadmap generation
  ├── Bias detection
  └── Interactive feedback systems
```

### Development Tools
```
ESLint & Prettier   - Code quality and formatting
Turbopack           - Ultra-fast bundler
Jest                - Testing framework
Prisma Studio       - Database management
Git                 - Version control
```

---

## 🏗️ Architecture

### System Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │   AI Services   │    │   File Storage  │
│   (Shadcn UI)   │    │   (OpenAI/      │    │   (Local/Cloud) │
│                 │    │    Genkit)      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Project Structure
```
resumeace_project/
├── 📁 src/
│   ├── 📁 app/                 # Next.js App Router
│   │   ├── 📁 api/             # API endpoints
│   │   ├── 📁 dashboard/       # User dashboard
│   │   ├── 📁 candidate-portal/# Candidate interface
│   │   ├── 📁 recruiter-portal/# Recruiter interface
│   │   ├── 📁 admin/           # Admin panel
│   │   └── 📁 auth/            # Authentication pages
│   ├── 📁 components/          # React components
│   │   ├── 📁 ui/              # Base UI components
│   │   └── 📁 features/        # Feature-specific components
│   ├── 📁 ai/                  # AI integration
│   │   ├── 📁 flows/           # AI processing flows
│   │   └── genkit.ts           # AI configuration
│   ├── 📁 lib/                 # Utility functions
│   ├── 📁 hooks/               # Custom React hooks
│   └── 📁 types/               # TypeScript definitions
├── 📁 prisma/                  # Database schema & migrations
├── 📁 public/                  # Static assets
├── 📁 data/                    # File storage
└── 📁 docs/                    # Documentation
```

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)
- **Git**

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/resumeace.git
   cd resumeace
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/resumeace"
   
   # OpenAI API
   OPENAI_API_KEY="your-openai-api-key"
   
   # Application
   NEXT_PUBLIC_APP_URL="http://localhost:9006"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:9006"
   
   # Email (optional)
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT="587"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASSWORD="your-app-password"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   
   # Seed database (optional)
   npm run prisma:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or for faster builds
   npm run dev:turbo
   ```

6. **Open your browser**
   Navigate to [http://localhost:9006](http://localhost:9006)

### 🎉 You're all set! 

The application should now be running locally. You can:
- Create an account or log in
- Upload your resume for analysis
- Explore job recommendations
- Use the interactive resume builder

---

## 📸 Screenshots

### 🏠 Landing Page
![Landing Page](./screenshots/landing-page.png)
*Modern, responsive landing page with clear value proposition*

### 📊 Dashboard Overview
![Dashboard](./screenshots/dashboard.png)
*Comprehensive dashboard showing resume analytics and job matches*

### 📄 Resume Analysis
![Resume Analysis](./screenshots/resume-analysis.png)
*Detailed AI-powered resume analysis with skill identification*

### 🎯 Job Recommendations
![Job Recommendations](./screenshots/job-recommendations.png)
*Personalized job recommendations based on resume content*

### 🔍 Skill Gap Analysis
![Skill Gap Analysis](./screenshots/skill-gap-analysis.png)
*Interactive skill gap analysis with improvement suggestions*

### 🏗️ Resume Builder
![Resume Builder](./screenshots/resume-builder.png)
*Drag-and-drop resume builder with real-time preview*

### 👥 Recruiter Portal
![Recruiter Portal](./screenshots/recruiter-portal.png)
*Dedicated interface for recruiters to find and match candidates*

### 📱 Mobile Responsive
![Mobile View](./screenshots/mobile-view.png)
*Fully responsive design optimized for mobile devices*

---

## 🔧 Configuration

### Environment Variables

| Variable          | Description                    | Required | Default                 |
| ----------------- | ------------------------------ | -------- | ----------------------- |
| `DATABASE_URL`    | PostgreSQL connection string   | ✅        | -                       |
| `OPENAI_API_KEY`  | OpenAI API key for AI features | ✅        | -                       |
| `NEXTAUTH_SECRET` | NextAuth.js secret key         | ✅        | -                       |
| `NEXTAUTH_URL`    | Application URL for auth       | ✅        | `http://localhost:9006` |
| `EMAIL_HOST`      | SMTP server for emails         | ❌        | -                       |
| `EMAIL_PORT`      | SMTP port                      | ❌        | `587`                   |
| `EMAIL_USER`      | Email username                 | ❌        | -                       |
| `EMAIL_PASSWORD`  | Email password                 | ❌        | -                       |

### Available Scripts

| Script                    | Description                             |
| ------------------------- | --------------------------------------- |
| `npm run dev`             | Start development server                |
| `npm run dev:turbo`       | Start development server with Turbopack |
| `npm run build`           | Build for production                    |
| `npm run start`           | Start production server                 |
| `npm run lint`            | Run ESLint                              |
| `npm run typecheck`       | Run TypeScript checks                   |
| `npm run prisma:generate` | Generate Prisma client                  |
| `npm run prisma:migrate`  | Run database migrations                 |
| `npm run prisma:studio`   | Open Prisma Studio                      |
| `npm run prisma:seed`     | Seed database with sample data          |

---

## 📊 Database Schema

### Core Models

```prisma
model User {
  id                String              @id @default(uuid())
  email             String              @unique
  name              String?
  password          String?
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  resumes           Resume[]
  jobApplications   JobApplication[]
  skillDevelopment  SkillDevelopment[]
}

model Resume {
  id                String              @id @default(uuid())
  userId            String
  title             String
  content           Json
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  user              User                @relation(fields: [userId], references: [id])
  jobMatches        JobMatch[]
  skillGapAnalyses  SkillGapAnalysis[]
}

model JobMatch {
  id          String   @id @default(uuid())
  resumeId    String
  jobTitle    String
  company     String
  matchScore  Float
  createdAt   DateTime @default(now())
  resume      Resume   @relation(fields: [resumeId], references: [id])
}
```

### Database Relationships
- **User** → **Resume** (One-to-Many)
- **Resume** → **JobMatch** (One-to-Many)
- **User** → **JobApplication** (One-to-Many)
- **User** → **SkillDevelopment** (One-to-Many)

---

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure
```
tests/
├── __tests__/
│   ├── components/     # Component tests
│   ├── api/           # API endpoint tests
│   ├── utils/         # Utility function tests
│   └── integration/   # Integration tests
├── __mocks__/         # Mock files
└── setup.js          # Test setup
```

### Testing Technologies
- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **MSW** - API mocking
- **Playwright** - E2E testing

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Set environment variables in Vercel dashboard**
   - Add all required environment variables
   - Configure database connection

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker Deployment

1. **Build Docker image**
   ```bash
   docker build -t resumeace .
   ```

2. **Run container**
   ```bash
   docker run -p 3000:3000 --env-file .env resumeace
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Style Guidelines

- Use **TypeScript** for all new code
- Follow **ESLint** and **Prettier** configurations
- Write **tests** for new features
- Use **conventional commits** for commit messages
- Update **documentation** for new features

### Reporting Issues

Please use the [GitHub Issues](https://github.com/yourusername/resumeace/issues) page to report bugs or request features.

---

## 📈 Roadmap

### Phase 1 - Core Features ✅
- [x] Resume upload and analysis
- [x] Job matching engine
- [x] User authentication
- [x] Basic dashboard

### Phase 2 - Enhanced Features ✅
- [x] Skill gap analysis
- [x] Resume builder
- [x] Recruiter portal
- [x] Analytics dashboard

### Phase 3 - Advanced Features 🚧
- [ ] LinkedIn integration
- [ ] Real-time job board connections
- [ ] Mobile application
- [ ] Advanced ML models
- [ ] Enterprise features

### Phase 4 - Scale & Optimize 📋
- [ ] Performance optimization
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] API for third-party integrations

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** for providing powerful AI capabilities
- **Vercel** for excellent deployment platform
- **Prisma** for amazing database toolkit
- **Shadcn** for beautiful UI components
- **Next.js team** for the incredible framework

---

## 📞 Contact & Support

- **Email**: dhanasrinivasan1921@gmail.com
- **LinkedIn**: [Your LinkedIn Profile](https://www.linkedin.com/in/ds1921/)
- **GitHub**: [Your GitHub Profile](https://github.com/DHANA-SRINIVASAN)
- **Project Issues**: [GitHub Issues](https://github.com/DHANA-SRINIVASAN/ResumeAce_/issues)

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ by [Your Name]

[🔝 Back to Top](#-resumeace---ai-powered-resume-analysis--career-matching-platform)

</div>
