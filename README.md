# Gaming Calendar Application

A React-based calendar application with Supabase integration for gaming events:

## Features

### Supabase Calendar
- Fetches events from PostgreSQL database via Supabase
- Category-based filtering and color coding
- Event descriptions with images and links
- Real-time data from database
- Modern, scalable architecture
- Gaming-focused event categories (Steam, Valorant, PlayStation, etc.)

## Quick Start

1. **Set up Supabase**:
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run the database schema in your Supabase SQL Editor

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp env.template .env
   # Edit .env with your Supabase credentials
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## Database Schema

The Supabase integration uses a PostgreSQL database with three main tables:

- **categories**: Store category names and colors
- **event_descriptions**: Store event descriptions, links, and images
- **events**: Store event details with references to categories and descriptions

See `database/schema.sql` for the complete schema definition.

## Project Structure

- `src/SupabaseCalendar.jsx` - Main Supabase-powered calendar component
- `src/MainApp.jsx` - Main app wrapper
- `src/lib/supabase.js` - Supabase client configuration
- `src/lib/supabaseApi.js` - Supabase API functions
- `src/main.jsx` - Entry point
- `src/App.css` - Styles for the calendar
- `database/schema.sql` - Database schema with gaming categories

## Technologies Used

- React 19
- FullCalendar
- Supabase (PostgreSQL)
- Vite
- CSS3 with modern styling

## Adding Your Events

To add your gaming events to the calendar:

1. Set up Supabase and run the database schema
2. Use the provided SQL scripts to insert your events
3. Events will automatically appear in the calendar with proper category filtering

## Deployment

For production deployment:

1. Set environment variables in your deployment platform
2. Build and deploy:
   ```bash
   npm run build
   npm run deploy
   ```
