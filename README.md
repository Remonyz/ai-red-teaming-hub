# README.md

# TODO LIST
- (high) complete contribution tab
  1. Create Google Form for contributor tab 
  2. save the results of the form to a google sheet in the project drive
  3. Retrieve embedded html link
  4. Replace the content in components/contributions-tab.tsx with the html link, need to work with typescript file format
- Remove modality from the prompts datasets 
- (low) prompts datasets don't have dates or prompt count yet
- (low) download button for eval protocol doesn't fully function

This file provides guidance for working with code in this repository.

## Project Overview
This is an AI Red Teaming Hub - a Next.js application that serves as a comprehensive platform for AI safety research. It provides:
- A database of red team prompts used for AI safety testing
- Evaluation protocols and benchmarks for AI model assessment
- Interactive testbed for running safety experiments
- Analysis tools for coverage gaps and research recommendations

## Development Commands

### Core Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint linter

### Package Management
The project uses both npm and pnpm (note both package-lock.json and pnpm-lock.yaml exist). Use npm commands for consistency.

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with custom Berkeley Blue (#003262) and California Gold (#FDB515) colors
- **Charts**: Recharts for data visualization
- **State Management**: React useState hooks (no external state management)

### Key Components Structure
- `app/` - Next.js app router pages
- `components/` - UI components organized by feature
  - `ui/` - Reusable UI primitives (buttons, cards, etc.)
  - Main feature tabs: `prompts-tab.tsx`, `protocols-tab.tsx`, `testbed-tab.tsx`, `analysis-tab.tsx`
- `lib/data.ts` - Static data for prompts and protocols
- `lib/utils.ts` - Utility functions

### Data Structure
The application uses two main data structures:
- `promptsData` - Red team prompts with metadata (attack type, success rate, target model)
- `protocolsData` - Evaluation protocols with compatibility information

### Component Architecture
- **Main Navigation**: Tab-based interface with 4 main sections
- **Prompts Tab**: Searchable/filterable database of adversarial prompts
- **Protocols Tab**: Catalog of evaluation frameworks and benchmarks
- **Testbed Tab**: Interactive testing environment (mock implementation)
- **Analysis Tab**: Coverage analysis with charts and recommendations

## Important Notes

### Security Context
This is a defensive security tool for AI safety research. The prompts and data are used for:
- Academic research on AI safety and alignment
- Red teaming exercises to identify vulnerabilities
- Development of defensive measures and safety protocols

### UI/UX Patterns
- Uses shadcn/ui design system with Radix UI primitives
- Responsive grid layouts with Tailwind CSS
- Color-coded badges for different risk levels and categories
- Export functionality for research data (JSON/CSV)

### Development Practices
- Client-side components use "use client" directive
- TypeScript for type safety
- Consistent use of Tailwind utility classes
- Component composition pattern with reusable UI primitives

## Data Management Workflow

The AI Red Teaming Hub uses a file-based data management system where CSV files are stored in the codebase and managed by developers. The system automatically loads data exclusively from CSV files.

### Current Data Sources

The application loads data from:
- **CSV files**: Developer-managed files in the `/public/data/` directory (single source of truth)
  - `/public/data/datasets.csv` - AI safety datasets and benchmarks (50 entries)
  - `/public/data/protocols.csv` - Evaluation protocols and frameworks (34 entries)

### Developer Workflow

#### Adding New Datasets

1. **Review User Submissions**: Users submit data via forms on the Contributions tab
2. **Validate Data**: Review submissions for accuracy and completeness  
3. **Update CSV Files**: Add approved entries to `/public/data/datasets.csv` or `/public/data/protocols.csv`
4. **Deploy Changes**: CSV files are automatically loaded on application restart

#### CSV File Format

**datasets.csv** expected columns:
```csv
Benchmark,Dataset Name,Dataset URL,Task/Purpose,Details
```

**protocols.csv** expected columns:
```csv
Benchmark Name,Primary Focus,Modality,Description,Paper URL,Project/GitHub/Dataset URL
```

#### Field Mapping System

The system automatically maps CSV columns to internal data structure:

**For datasets.csv:**
- `Dataset Name` → `title`
- `Benchmark` → `source`
- `Dataset URL` → `sourceUrl`
- `Task/Purpose` → `category`
- `Details` → `description`

**For protocols.csv:**
- `Benchmark Name` → `name`
- `Primary Focus` → `category`
- `Modality` → `modalities`
- `Description` → `description`
- `Paper URL` → `url`
- `Project/GitHub/Dataset URL` → `projectUrl`

#### Default Values

Missing fields are automatically filled with appropriate defaults:

**Dataset defaults:**
- `promptCount`: "Unknown"
- `dateAdded`: "Unknown"
- `testedModels`: []
- `attackType`: "dataset"
- `threatDomain`: "general"

**Protocol defaults:**
- `dateAdded`: "Unknown"
- `organization`: "Unknown"
- `metrics`: []
- `testedModels`: []

### Data Loading Process

1. **Application Startup**: System automatically loads CSV files from `/public/data/` directory
2. **Field Mapping**: CSV columns are mapped to standard field names
3. **Default Application**: Missing fields are filled with appropriate defaults
4. **Data Loading**: CSV data is loaded asynchronously into components
5. **Caching**: Loaded data is cached in memory for performance

### User Contribution Workflow

1. **Form Submission**: Users submit new prompts/protocols via web forms
2. **Developer Review**: Developers review submissions for quality and accuracy
3. **CSV Update**: Approved entries are manually added to appropriate CSV files
4. **Automatic Loading**: Next application restart loads the new data

### Terminology Updates

The application now uses "Tested Models" instead of "Compatible Models" to better reflect real-world usage patterns where models have been specifically evaluated with datasets/protocols.

### File Structure

```
/public/data/
├── datasets.csv     # 50 AI safety datasets and benchmarks
└── protocols.csv    # 34 evaluation protocols and frameworks

/lib/
└── data.ts          # CSV loading functions and field mappings

/components/
├── prompts-tab.tsx     # Displays CSV dataset data
├── protocols-tab.tsx   # Displays CSV protocol data
└── contributions-tab.tsx # Form-only submissions for review
```

### Best Practices

**For Developers:**
- Review all user submissions before adding to CSV files
- Maintain consistent formatting in CSV files
- Test data loading after CSV updates
- Keep CSV files in sync with documented column formats

**For Contributors:**
- Use the web forms for new submissions
- Provide complete and accurate information
- Include proper attribution and source URLs
- Follow existing data formatting patterns