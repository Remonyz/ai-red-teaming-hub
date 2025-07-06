# README.md

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