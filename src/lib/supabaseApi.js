import { supabase, TABLES } from './supabase'

// Fetch all events with their categories and descriptions
export const fetchEvents = async () => {
    try {
        console.log('🔄 Fetching events from Supabase...')

        if (!supabase) {
            console.warn('⚠️ Supabase client not initialized');
            return [];
        }

        const { data, error } = await supabase
            .from(TABLES.EVENTS)
            .select(`
        *,
        categories (
          id,
          name,
          color
        ),
        event_descriptions (
          id,
          text,
          link,
          image_url
        )
      `)
            .eq('is_active', true)
            .order('start_time', { ascending: true })

        if (error) {
            console.error('❌ Error fetching events:', error)
            throw error
        }

        console.log('✅ Events fetched successfully:', data?.length || 0)
        return data || []
    } catch (error) {
        console.error('❌ Failed to fetch events:', error)
        throw error
    }
}

// Fetch all categories
export const fetchCategories = async () => {
    try {
        console.log('🔄 Fetching categories from Supabase...')

        if (!supabase) {
            console.warn('⚠️ Supabase client not initialized');
            return [];
        }

        const { data, error } = await supabase
            .from(TABLES.CATEGORIES)
            .select('*')
            .order('name', { ascending: true })

        if (error) {
            console.error('❌ Error fetching categories:', error)
            throw error
        }

        console.log('✅ Categories fetched successfully:', data?.length || 0)
        return data || []
    } catch (error) {
        console.error('❌ Failed to fetch categories:', error)
        throw error
    }
}

// Transform Supabase events to FullCalendar format
export const transformEventsForCalendar = (events) => {
    return events.map(event => ({
        id: event.id.toString(),
        title: event.title,
        start: event.start_time,
        end: event.end_time,
        color: event.categories?.color || '#5f6368',
        extendedProps: {
            description: event.event_descriptions?.text,
            link: event.event_descriptions?.link,
            image: event.event_descriptions?.image_url,
            location: event.location,
            category: event.categories?.name,
            categoryId: event.categories?.id,
            descriptionId: event.event_descriptions?.id
        }
    }))
}

// Fetch events and transform them for FullCalendar
export const fetchCalendarEvents = async () => {
    try {
        const events = await fetchEvents()
        return transformEventsForCalendar(events)
    } catch (error) {
        console.error('❌ Failed to fetch calendar events:', error)
        return []
    }
}
