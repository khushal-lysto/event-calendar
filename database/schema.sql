-- Gaming Calendar Database Schema
-- PostgreSQL schema for Supabase integration

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL, -- Hex color code like #3788d8
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create event_descriptions table
CREATE TABLE IF NOT EXISTS event_descriptions (
    id SERIAL PRIMARY KEY,
    text TEXT,
    link VARCHAR(500),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(200),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    description_id INTEGER REFERENCES event_descriptions(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_end_time ON events(end_time);
CREATE INDEX IF NOT EXISTS idx_events_category_id ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);

-- Insert gaming categories
INSERT INTO categories (name, color) VALUES
('Steam', '#1b2838'),           -- Steam platform
('Valorant', '#ff4655'),        -- Valorant game
('PlayStation', '#003791'),     -- PlayStation platform
('Nintendo', '#e60012'),        -- Nintendo platform
('Xbox', '#107c10'),            -- Xbox platform
('Roblox', '#00a2ff'),          -- Roblox platform
('Minecraft', '#62b47a'),       -- Minecraft game
('BGMI', '#da2929'),            -- Battlegrounds Mobile India
('Free Fire', '#ff9c00'),       -- Free Fire game
('GPRC', '#8b5cf6'),            -- GPRC
('MOBA Legends', '#10b981'),    -- MOBA Legends (Moonton)
('Genshin Impact', '#4f46e5'),  -- Genshin Impact (HoYoverse)
('Honkai Star Rail', '#7c3aed'), -- Honkai Star Rail (HoYoverse)
('Marvel Rivals', '#dc2626'),   -- Marvel Rivals (NetEase)
('Razer Gold', '#00ff87'),      -- Razer Gold
('Zenless Zone Zero', '#06b6d4') -- Zenless Zone Zero (HoYoverse)
ON CONFLICT (name) DO NOTHING;
