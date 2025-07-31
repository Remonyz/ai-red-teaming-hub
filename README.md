# AI Red Teaming Hub

A comprehensive platform for AI safety research, providing access to adversarial datasets, evaluation protocols, and analysis tools for red teaming and defensive AI research.

https://ai-red-teaming-hub.onrender.com/

![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-blue?style=flat-square&logo=tailwindcss)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [For Users](#for-users)
- [For Developers](#for-developers)
- [Data Management](#data-management)
- [Contributing](#contributing)
- [Security](#security)
- [Architecture](#architecture)
- [Deployment](#deployment)

## 🎯 Overview

The AI Red Teaming Hub is a Next.js-based platform designed to support AI safety research by providing:

- **Comprehensive Dataset Collection**: 50+ AI safety datasets and benchmarks
- **Evaluation Protocols**: 34+ standardized evaluation frameworks
- **Interactive Platform**: Search, filter, and export functionality
- **Research Tools**: Analysis and coverage gap identification
- **Contribution System**: Community-driven data submissions

This platform serves researchers, developers, and organizations working on AI alignment, safety evaluation, and defensive measures against adversarial AI attacks.

## ✨ Features

### 🔍 **Dataset Explorer**
- Browse 50+ curated AI safety datasets
- Advanced search and filtering capabilities
- Metadata including prompt counts, dates, and tested models
- Export data in JSON, CSV, and PDF formats

### 📊 **Protocol Library** 
- Access 34+ evaluation frameworks and benchmarks
- Detailed descriptions and compatibility information
- Direct links to papers and project repositories
- Download individual or bulk protocol data

### 🧪 **Testing Documentation**
- Comprehensive guides for AI safety testing
- Best practices for red teaming exercises
- Integration instructions for evaluation protocols

### 📈 **Analysis Tools**
- Coverage gap analysis with visualizations
- Research recommendations based on current datasets
- Interactive charts and statistical insights

### 🤝 **Contribution System**
- Submit new datasets and protocols via web forms
- Community-driven expansion of the knowledge base
- Developer review and validation process

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-red-teaming-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 👥 For Users

### Exploring Datasets

1. **Browse**: Use the Prompts tab to explore available datasets
2. **Search**: Use the search bar to find specific datasets by name or description
3. **Filter**: Apply filters by attack type, threat domain, or tested models
4. **Sort**: Sort by relevance, date, prompt count, or alphabetically
5. **Export**: Download filtered results in your preferred format

### Using Protocols

1. **Navigate**: Visit the Protocols tab to browse evaluation frameworks
2. **Details**: Click "View Protocol" to see detailed information
3. **Access**: Use provided links to access papers and repositories
4. **Download**: Export protocol information for offline use

### Contributing Data

1. **Submit**: Use the Contributions tab to submit new datasets or protocols
2. **Forms**: Fill out comprehensive forms with all required metadata
3. **Review**: Submissions are reviewed by developers before inclusion
4. **Integration**: Approved submissions are added to the main database

## 👨‍💻 For Developers

### Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint linter

# Package Management
npm install          # Install dependencies
npm update           # Update dependencies
```

### Project Structure

```
ai-red-teaming-hub/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI primitives (shadcn/ui)
│   ├── prompts-tab.tsx   # Dataset display and search
│   ├── protocols-tab.tsx # Protocol library interface
│   ├── analysis-tab.tsx  # Analytics and visualization
│   └── contributions-tab.tsx # Submission forms
├── lib/                  # Utility functions and data loading
│   ├── data.ts          # CSV loading and field mapping
│   ├── csv-parser.ts    # CSV parsing utilities
│   ├── utils/           # Helper functions
│   └── field-mapper.ts  # Column mapping logic
├── public/data/         # Data storage
│   ├── datasets.csv     # AI safety datasets (50+ entries)
│   └── protocols.csv    # Evaluation protocols (34+ entries)
├── types/               # TypeScript type definitions
└── hooks/               # Custom React hooks
```

### Tech Stack

- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Radix UI + shadcn/ui
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **CSV Processing**: PapaParse
- **Search**: Fuse.js for fuzzy search
- **PDF Generation**: jsPDF
- **State Management**: React useState (no external state library)

## 📊 Data Management

### Data Sources

The application uses CSV files as the single source of truth:

- **`/public/data/datasets.csv`** - AI safety datasets and benchmarks
- **`/public/data/protocols.csv`** - Evaluation protocols and frameworks

### CSV File Formats

#### datasets.csv Structure
```csv
Benchmark,Dataset Name,Dataset URL,Task/Purpose,Details,Prompt/Sample Count,Date
```

#### protocols.csv Structure  
```csv
Benchmark Name,Primary Focus,Modality,Description,Paper URL,Project/GitHub/Dataset URL
```

### Field Mapping System

The system automatically maps CSV columns to internal data structures:

**Dataset Mapping:**
- `Dataset Name` → `title`
- `Benchmark` → `source` 
- `Dataset URL` → `sourceUrl`
- `Task/Purpose` → `category`
- `Details` → `description`
- `Prompt/Sample Count` → `promptCount`
- `Date` → `dateAdded`

**Protocol Mapping:**
- `Benchmark Name` → `name`
- `Primary Focus` → `category`
- `Modality` → `modalities`
- `Description` → `description`
- `Paper URL` → `url`
- `Project/GitHub/Dataset URL` → `projectUrl`

### Adding New Data

1. **Review Submissions**: Check user submissions in the Contributions tab
2. **Validate Data**: Ensure accuracy and completeness
3. **Update CSV**: Add approved entries to appropriate CSV files
4. **Test Loading**: Verify data loads correctly after restart
5. **Deploy**: CSV changes are automatically loaded on application restart

### Default Values

Missing fields are automatically populated with defaults:
- `promptCount`: "Unknown"
- `dateAdded`: "Unknown" 
- `testedModels`: []
- `organization`: "Unknown"
- `metrics`: []

## 🤝 Contributing

### For Users
- Use the web forms in the Contributions tab
- Provide complete and accurate information
- Include proper attribution and source URLs
- Follow existing data formatting patterns

### For Developers
- Review all user submissions before adding to CSV files
- Maintain consistent formatting in CSV files
- Test data loading after CSV updates
- Keep CSV files in sync with documented column formats
- Follow existing code patterns and TypeScript conventions

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes following the code style
4. **Test** your changes thoroughly
5. **Submit** a pull request with detailed description

## 🔒 Security

### Defensive Security Focus

This platform is designed exclusively for **defensive security research**:
- Academic research on AI safety and alignment
- Red teaming exercises to identify vulnerabilities
- Development of defensive measures and safety protocols
- Evaluation of AI model robustness

### Data Safety
- All prompts and datasets are used for research purposes
- No malicious code generation or improvement
- Community moderation of submitted content
- Transparent review process for new additions

## 🏗️ Architecture

### Component Architecture

```
App Shell
├── Header (Navigation, Branding)
├── NavigationTabs (Main Sections)
├── Content Area
│   ├── PromptsTab (Dataset Explorer)
│   ├── ProtocolsTab (Protocol Library) 
│   ├── AnalysisTab (Research Analytics)
│   └── ContributionsTab (Submission Forms)
└── Footer (Links, Information)
```

### Data Flow

1. **CSV Loading**: Files loaded from `/public/data/` at runtime
2. **Field Mapping**: Columns mapped to standard field names
3. **Default Application**: Missing values filled with defaults
4. **Component State**: Data stored in React state with filtering/sorting
5. **Export Pipeline**: Processed data exported in multiple formats

### State Management

- **Local State**: React useState for component-specific data
- **Data Loading**: Async CSV parsing with Papa Parse
- **Caching**: In-memory caching of loaded datasets
- **No External Store**: Simplified architecture without Redux/Zustand

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables

No environment variables required for basic functionality.

### Static Files

Ensure `/public/data/` directory contains:
- `datasets.csv` - Complete dataset information  
- `protocols.csv` - Complete protocol information

### Performance Considerations

- CSV files are loaded client-side for filtering/sorting performance
- Large datasets may require pagination (not currently implemented)
- Static generation recommended for production deployment

### Deployment Platforms

Compatible with:
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS Amplify** 
- **Self-hosted** with Node.js

---

## 📄 License

This project is part of AI safety research and follows open science principles. Please ensure any use aligns with defensive security and research purposes.

## 📞 Support

For questions, issues, or contributions:
- Open an issue in the repository
- Follow the contribution guidelines
- Contact the development team for major changes

---

*Built with ❤️ for AI Safety Research*
