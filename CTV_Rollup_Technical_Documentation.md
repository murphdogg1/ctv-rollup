# CTV Rollup Application - Technical Documentation

## Executive Summary

The CTV Rollup Application is a production-ready web application designed to ingest, normalize, and analyze CTV (Connected TV) delivery logs. The system provides campaign-agnostic data processing with intelligent deduplication, multi-tier rollup reporting, and comprehensive analytics capabilities.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Data Model](#data-model)
4. [Core Features](#core-features)
5. [API Reference](#api-reference)
6. [Database Design](#database-design)
7. [Frontend Architecture](#frontend-architecture)
8. [Deployment & Configuration](#deployment--configuration)
9. [Performance Considerations](#performance-considerations)
10. [Security & Data Handling](#security--data-handling)

## System Architecture

### Overview
The application follows a modern web application architecture with:
- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Backend**: Next.js API Routes with in-memory database (DuckDB planned)
- **Data Processing**: Real-time CSV ingestion and normalization
- **Reporting**: Multi-dimensional rollup analytics with export capabilities

### Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Data Layer    │
│   (Next.js)     │◄──►│   (Route        │◄──►│   (In-Memory    │
│   React + TS    │    │    Handlers)    │    │    Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │   Business      │    │   Data          │
│   (shadcn/ui)   │    │   Logic        │    │   Persistence   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Technology Stack

### Frontend Technologies
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 18
- **Styling**: Tailwind CSS 4.0
- **Component Library**: shadcn/ui
- **State Management**: React Hooks (useState, useEffect)
- **Data Tables**: TanStack Table v8
- **Icons**: Lucide React

### Backend Technologies
- **Runtime**: Node.js 18+
- **API Framework**: Next.js API Routes
- **Database**: In-memory database (DuckDB planned)
- **Data Processing**: PapaParse (CSV), string-similarity
- **Validation**: Zod schema validation
- **File Handling**: Node.js fs/promises

### Development Tools
- **Package Manager**: npm
- **Build Tool**: Next.js built-in
- **Linting**: ESLint
- **Type Checking**: TypeScript compiler
- **Development Server**: Next.js dev server

## Data Model

### Core Entities

#### Campaign
```typescript
interface Campaign {
  campaign_id: string;        // Unique identifier
  campaign_name: string;      // Human-readable name
  created_at: Date;          // Creation timestamp
}
```

#### CampaignUpload
```typescript
interface CampaignUpload {
  upload_id: string;         // Unique upload identifier
  campaign_id: string;       // Associated campaign
  filename: string;          // Original filename
  stored_path: string;       // File storage location
  uploaded_at: Date;         // Upload timestamp
}
```

#### CampaignContentRaw
```typescript
interface CampaignContentRaw {
  campaign_id: string;       // Associated campaign
  campaign_name_src?: string; // Source campaign name (optional)
  content_title: string;     // Content title
  content_network_name: string; // App/platform name
  impression: number;        // Impression count
  quartile100: number;       // Video completion count
}
```

### Rollup Data Structures

#### App Rollup
```typescript
interface AppRollup {
  campaign_id: string;       // Campaign identifier
  app_name: string;          // Content network name
  impressions: number;       // Total impressions
  completes: number;         // Total completions
  avg_vcr: number;          // Average VCR percentage
  content_count: number;     // Unique content pieces
}
```

#### Genre Rollup
```typescript
interface GenreRollup {
  campaign_id: string;       // Campaign identifier
  genre_canon: string;       // Canonical genre name
  impressions: number;       // Total impressions
  completes: number;         // Total completions
  avg_vcr: number;          // Average VCR percentage
  content_count: number;     // Unique content pieces
}
```

#### Content Rollup
```typescript
interface ContentRollup {
  campaign_id: string;       // Campaign identifier
  content_key: string;       // Normalized content key
  content_title: string;     // Content title
  content_network_name: string; // App name
  impressions: number;       // Total impressions
  completes: number;         // Total completions
  avg_vcr: number;          // Average VCR percentage
}
```

## Core Features

### 1. Campaign Management
- **Campaign Creation**: Automatic campaign generation from CSV uploads
- **Campaign Naming**: Smart filename-to-campaign-name conversion with override capability
- **Campaign Listing**: Comprehensive view of all campaigns with metadata

### 2. Data Ingestion
- **CSV Processing**: Robust CSV parsing with error handling
- **Column Mapping**: Case-insensitive column detection and mapping
- **Data Validation**: Zod schema validation for data integrity
- **File Storage**: Secure file storage with organized directory structure

### 3. Intelligent Deduplication
- **Case-Insensitive Matching**: Automatic grouping of similar network names (e.g., "Fox" vs "FOX")
- **Content Aggregation**: Smart rollup of content to network level
- **Threshold-Based Grouping**: Networks with <1000 impressions grouped into "Other" category

### 4. Multi-Tier Rollup Reporting
- **App-Level Rollup**: Performance by content network/platform
- **Genre-Level Rollup**: Performance by content genre/category
- **Content-Level Rollup**: Performance by individual content piece
- **Cross-Campaign Analytics**: Aggregated insights across all campaigns

### 5. Data Export
- **CSV Export**: Campaign-specific data export in multiple formats
- **Filtered Exports**: Export by rollup type (app, genre, content)
- **Formatted Output**: Clean, business-ready CSV files

## API Reference

### Campaign Management

#### Create Campaign
```http
POST /api/campaigns/ingest
Content-Type: multipart/form-data

Parameters:
- file: CSV file (required)
- campaignName: string (optional, overrides filename)
```

**Response:**
```json
{
  "success": true,
  "campaign": {
    "id": "campaign-id",
    "name": "Campaign Name"
  },
  "upload": {
    "filename": "file.csv",
    "storedPath": "/uploads/path"
  },
  "content": {
    "rowsProcessed": 100,
    "rowsInserted": 98,
    "errors": 2
  }
}
```

#### List Campaigns
```http
GET /api/campaigns
```

**Response:**
```json
{
  "success": true,
  "campaigns": [
    {
      "id": "campaign-id",
      "name": "Campaign Name",
      "created_at": "2025-08-29T14:13:07.058Z"
    }
  ]
}
```

### Rollup Data

#### App Rollup
```http
GET /api/campaigns/{campaignId}/rollup/app
```

#### Genre Rollup
```http
GET /api/campaigns/{campaignId}/rollup/genre
```

#### Content Rollup
```http
GET /api/campaigns/{campaignId}/rollup/content
```

### Data Export

#### Export Campaign Data
```http
GET /api/campaigns/{campaignId}/export?type={app|genre|content}
Accept: text/csv
```

### System Status

#### Health Check
```http
GET /api/status
```

**Response:**
```json
{
  "connected": true,
  "engine": "in-memory",
  "rowCounts": {
    "campaigns": 8,
    "campaign_uploads": 8,
    "content_aliases": 0,
    "genre_map": 0
  }
}
```

## Database Design

### Current Implementation: In-Memory Database

The application currently uses an in-memory database for development and testing purposes. This provides:
- **Fast Development**: No external database setup required
- **Data Persistence**: Global variables maintain state across Next.js hot reloads
- **Easy Testing**: Simple data manipulation and inspection

### Planned Implementation: DuckDB

The system is designed to migrate to DuckDB for production use, providing:
- **Persistent Storage**: Data survives application restarts
- **SQL Interface**: Standard SQL queries and views
- **Performance**: Columnar storage for analytical workloads
- **Scalability**: Handle larger datasets efficiently

### Database Schema

#### Tables
```sql
-- Campaigns table
CREATE TABLE campaigns (
  campaign_id VARCHAR PRIMARY KEY,
  campaign_name VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign uploads table
CREATE TABLE campaign_uploads (
  upload_id VARCHAR PRIMARY KEY,
  campaign_id VARCHAR REFERENCES campaigns(campaign_id),
  filename VARCHAR NOT NULL,
  stored_path VARCHAR NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Raw content data table
CREATE TABLE campaign_content_raw (
  campaign_id VARCHAR REFERENCES campaigns(campaign_id),
  campaign_name_src VARCHAR,
  content_title VARCHAR NOT NULL,
  content_network_name VARCHAR NOT NULL,
  impression INTEGER DEFAULT 0,
  quartile100 INTEGER DEFAULT 0
);

-- Content aliases for normalization
CREATE TABLE content_aliases (
  content_title_canon VARCHAR PRIMARY KEY,
  content_key VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Genre mapping table
CREATE TABLE genre_map (
  raw_genre VARCHAR PRIMARY KEY,
  genre_canon VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Views
```sql
-- App rollup view
CREATE VIEW rr_rollup_app AS
SELECT 
  campaign_id,
  content_network_name as app_name,
  SUM(impression) as impressions,
  SUM(quartile100) as completes,
  ROUND((SUM(quartile100) / SUM(impression)) * 100, 2) as avg_vcr,
  COUNT(DISTINCT content_title) as content_count
FROM campaign_content_raw
GROUP BY campaign_id, content_network_name
HAVING SUM(impression) >= 1000;

-- Genre rollup view
CREATE VIEW rr_rollup_genre AS
SELECT 
  campaign_id,
  COALESCE(gm.genre_canon, 'Unknown') as genre_canon,
  SUM(ccr.impression) as impressions,
  SUM(ccr.quartile100) as completes,
  ROUND((SUM(ccr.quartile100) / SUM(ccr.impression)) * 100, 2) as avg_vcr,
  COUNT(DISTINCT ccr.content_title) as content_count
FROM campaign_content_raw ccr
LEFT JOIN genre_map gm ON ccr.content_network_name = gm.raw_genre
GROUP BY campaign_id, gm.genre_canon;
```

## Frontend Architecture

### Component Structure

#### Layout Components
- **RootLayout**: Main application shell with navigation
- **Navigation**: Top navigation bar with main sections

#### Page Components
- **Dashboard**: Overview with statistics and quick actions
- **Campaigns**: Campaign management and upload interface
- **Campaign Reports**: Detailed campaign analytics with tabs
- **Normalize**: Data normalization tools

#### UI Components
- **Cards**: Information display containers
- **Tables**: Data presentation with TanStack Table
- **Forms**: Upload and configuration forms
- **Tabs**: Multi-view content organization
- **Buttons**: Action triggers with consistent styling

### State Management

The application uses React's built-in state management:
- **Local State**: useState for component-specific data
- **Effect Management**: useEffect for side effects and data fetching
- **Context**: No global state management required for current scope

### Data Flow

```
User Action → Component State → API Call → Database → Response → UI Update
     ↓              ↓            ↓         ↓         ↓         ↓
  Button Click → setState → fetch() → In-Memory → JSON → re-render
```

## Deployment & Configuration

### Environment Variables

```bash
# Database configuration
DB_ENGINE=duckdb                    # Database engine (duckdb|in-memory)
UPLOAD_DIR=./uploads               # File upload directory

# Application configuration
NODE_ENV=production                # Environment (development|production)
PORT=3000                          # Server port
```

### Build Process

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build
npm run start

# Type checking
npm run typecheck

# Linting
npm run lint
```

### File Structure

```
ctv-rollup/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes
│   │   ├── campaigns/            # Campaign pages
│   │   ├── normalize/            # Normalization pages
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Dashboard
│   ├── components/               # Reusable UI components
│   ├── server/                   # Backend logic
│   └── types/                    # TypeScript definitions
├── public/                       # Static assets
├── uploads/                      # File storage
├── package.json                  # Dependencies
└── README.md                     # Documentation
```

## Performance Considerations

### Data Processing
- **Batch Processing**: CSV files processed in chunks for memory efficiency
- **Lazy Loading**: Campaign data loaded on-demand
- **Caching**: In-memory database provides fast data access

### Frontend Optimization
- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Built-in Next.js image optimization
- **Bundle Analysis**: Webpack bundle analyzer for optimization

### Scalability
- **Database Migration**: Ready for DuckDB migration
- **Horizontal Scaling**: Stateless API design
- **File Storage**: Configurable storage backends

## Security & Data Handling

### Data Validation
- **Input Sanitization**: Zod schema validation for all inputs
- **File Type Validation**: CSV file type enforcement
- **Size Limits**: Configurable file size limits

### File Security
- **Secure Storage**: Files stored outside web root
- **Access Control**: Campaign-specific data isolation
- **Path Traversal**: Prevention of directory traversal attacks

### Data Privacy
- **No PII Storage**: System designed for aggregate data only
- **Data Retention**: Configurable data retention policies
- **Export Controls**: Controlled data export capabilities

## Future Enhancements

### Planned Features
1. **DuckDB Integration**: Production database implementation
2. **Real-time Updates**: WebSocket-based live data updates
3. **Advanced Analytics**: Machine learning insights and predictions
4. **Multi-tenant Support**: Organization and user management
5. **API Authentication**: JWT-based API security

### Technical Improvements
1. **Database Migrations**: Versioned schema management
2. **Testing Suite**: Comprehensive unit and integration tests
3. **Monitoring**: Application performance monitoring
4. **CI/CD Pipeline**: Automated deployment pipeline
5. **Documentation**: API documentation with OpenAPI/Swagger

## Conclusion

The CTV Rollup Application provides a robust, scalable solution for CTV delivery log analysis. With its campaign-agnostic design, intelligent deduplication, and comprehensive reporting capabilities, it serves as a powerful tool for media analytics and campaign optimization.

The modular architecture and planned DuckDB integration ensure the system can grow with business needs while maintaining performance and reliability. The comprehensive API design and modern frontend provide an excellent user experience for data analysts and campaign managers.

---

**Document Version**: 1.0  
**Last Updated**: August 29, 2025  
**Author**: AI Assistant  
**Review Status**: Draft
