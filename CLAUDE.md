# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based gaming calendar application that displays events from a Supabase PostgreSQL database. The app uses FullCalendar for the calendar interface and supports category-based filtering for gaming events.

## Development Commands

- **Development server**: `npm run dev` (or `pnpm run dev`)
- **Build**: `npm run build` (or `pnpm run build`)
- **Build with linting**: `npm run build:amplify` (lints then builds)
- **Lint**: `npm run lint`
- **Preview**: `npm run preview`
- **Deploy to GitHub Pages**: `npm run deploy`

## Technology Stack

- **Frontend**: React 19 with Vite
- **Calendar**: FullCalendar (@fullcalendar/react, @fullcalendar/daygrid, @fullcalendar/interaction)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: GitHub Pages via gh-pages package
- **Linting**: ESLint with React hooks and refresh plugins

## Architecture

### Core Components
- `src/main.jsx` - Application entry point
- `src/MainApp.jsx` - Main app wrapper with navigation header
- `src/SupabaseCalendar.jsx` - Primary calendar component with event management and filtering
- `src/lib/supabase.js` - Supabase client configuration and table constants
- `src/lib/supabaseApi.js` - API functions for fetching events, categories, and data transformation

### Database Schema
The application uses three main Supabase tables:
- **categories** - Gaming categories with colors (Steam, Valorant, PlayStation, etc.)
- **event_descriptions** - Event details, links, and images
- **events** - Event records with foreign keys to categories and descriptions

### Key Features
- Real-time event loading from Supabase database
- Category-based filtering with color-coded events
- Event modal with descriptions, images, and external links
- Google Calendar integration for adding events
- Responsive design with sidebar filtering

## Environment Configuration

Required environment variables in `.env`:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

Use `env.template` as a starting point for configuration.

## Database Setup

Run `database/schema.sql` in your Supabase SQL Editor to create the required tables and populate gaming categories.

## Deployment Options

### AWS Amplify (Recommended)
- **Build config**: `amplify.yml` configured for Node.js build
- **Build command**: `npm run build` (or `npm run build:amplify` for linting + build)
- **Output directory**: `dist`
- **Environment variables**: Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Amplify console

### GitHub Pages (Alternative)
- **Base path**: `/event-calendar/` (uncomment in vite.config.js)
- **Homepage**: Set to GitHub Pages URL in package.json
- **Deploy**: Uses gh-pages package to deploy dist folder

## Code Patterns

- React functional components with hooks
- Environment variable validation with fallback handling
- Supabase client initialization with error handling
- FullCalendar event transformation from database format
- Modal state management for event details
- Category filtering with checkbox controls