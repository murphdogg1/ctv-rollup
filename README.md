# CTV Rollup

<!-- Updated for Vercel deployment -->

A production-ready web application for ingesting raw CTV delivery logs (CSV/Parquet), normalizing fields, deduplicating fragmented supply paths, and rendering rollups by App, Genre, and Content—with CSV export.

## Features

- **Data Ingestion**: Upload CSV and Parquet files containing CTV delivery logs
- **Smart Deduplication**: Multi-tier survivorship logic for fragmented supply paths
- **Data Normalization**: Map bundles, genres, and content for consistent analysis
- **Rollup Reports**: Performance metrics by App, Genre, and Content
- **CSV Export**: Download rollup data for further analysis
- **Modern UI**: Built with Next.js, TypeScript, and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, TanStack Table
- **Database**: In-memory storage (demo mode), with architecture for DuckDB/MotherDuck
- **Data Processing**: CSV parsing, data validation with Zod
- **Styling**: Tailwind CSS with modern design system

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ctv-rollup
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Configuration

Create a `.env.local` file with the following variables:

```env
# Database Configuration
DB_ENGINE=duckdb
# MOTHERDUCK_TOKEN=your_token_here

# Upload Configuration
UPLOAD_DIR=./uploads

# App Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

## Database Configuration

### Local DuckDB (Default)
- Set `DB_ENGINE=duckdb`
- Database file will be created at `data/ctv.duckdb`

### MotherDuck (Hosted)
- Set `DB_ENGINE=motherduck`
- Add your `MOTHERDUCK_TOKEN`
- Database will be hosted on MotherDuck

## Usage

### 1. Upload Data
- Navigate to `/upload`
- Drag and drop CSV or Parquet files
- Files are processed and ingested into the database

### 2. Normalize Data
- Navigate to `/normalize`
- Map bundle identifiers to canonical app names
- Map genre identifiers to canonical genres
- Create content aliases for deduplication

### 3. View Reports
- **App Reports** (`/reports/app`): Performance by application
- **Genre Reports** (`/reports/genre`): Performance by content genre
- **Content Reports** (`/reports/content`): Performance by individual content

### 4. Export Data
- Use the export buttons on each report page
- Download CSV files for further analysis

## Data Schema

### Raw Events
The application ingests CTV delivery logs with the following key fields:
- `event_timestamp`: When the event occurred
- `app_bundle_raw`: Raw app bundle identifier
- `content_title_raw`: Raw content title
- `content_genre_raw`: Raw genre identifier
- `impression_id`: Unique impression identifier
- `price_paid`: Amount paid for the impression
- `vtr`: View-through rate
- `viewable`: Whether the impression was viewable

### Normalization Tables
- **bundle_map**: Maps raw bundle IDs to canonical app information
- **genre_map**: Maps raw genre IDs to canonical genre names
- **content_aliases**: Maps content titles to canonical content keys

## Deduplication Logic

The application uses a three-tier survivorship approach:

1. **Tier 1**: Exact `impression_id` match
2. **Tier 2**: Match on `(request_id, ad_break_id, ad_position, timestamp)`
3. **Tier 3**: Match on `(app_bundle, content_key, deal_id, ssp, dsp, ad_break_id, ad_position, timestamp)`

Survivor selection prioritizes:
1. Non-null impression IDs
2. Non-null price data
3. Higher price paid
4. Most recent timestamp

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run typecheck`: Run TypeScript type checking
- `npm run seed`: Seed database with sample data

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── upload/            # Upload page
│   ├── normalize/         # Normalization page
│   └── reports/           # Report pages
├── components/            # Reusable UI components
├── server/                # Server-side code
│   ├── db.ts             # Database connection
│   └── migrations/        # Database migrations
└── types/                 # TypeScript type definitions
```

## Adding Initial Data

### Bundle Mappings
Add initial bundle mappings in the `/normalize` page or create a seed file:

```json
[
  {
    "raw": "com.pluto.tv",
    "app_bundle": "com.pluto.tv",
    "app_name": "Pluto TV",
    "publisher": "Pluto Inc"
  }
]
```

### Genre Mappings
Add initial genre mappings:

```json
[
  {
    "raw": "action",
    "genre_canon": "Action"
  }
]
```

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Set production environment variables
3. Deploy to your hosting platform (Vercel, Netlify, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
