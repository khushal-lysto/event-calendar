import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./App.css";
import { fetchCalendarEvents, fetchCategories } from "./lib/supabaseApi";

function SupabaseCalendar() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load events and categories from Supabase
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      console.log("📄 Starting to load data from Supabase...");

      try {
        // Check if Supabase is configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey || 
            supabaseUrl === 'YOUR_SUPABASE_URL' || 
            supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
          console.warn("⚠️ Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
          setEvents([]);
          setCategories([]);
          setIsLoading(false);
          return;
        }

        // Fetch events and categories in parallel
        const [eventsData, categoriesData] = await Promise.all([
          fetchCalendarEvents(),
          fetchCategories()
        ]);

        console.log("✅ Data loaded successfully:", {
          events: eventsData.length,
          categories: categoriesData.length
        });

        setEvents(eventsData);
        setCategories(categoriesData);
        
        // Initialize with all categories selected
        setSelectedCategoryFilters(categoriesData.map(cat => cat.id));
      } catch (error) {
        console.error("❌ Failed to load data:", error);
        setEvents([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter events based on selected categories
  const getFilteredEvents = () => {
    if (selectedCategoryFilters.length === 0) {
      return [];
    }

    return events.filter(event => 
      selectedCategoryFilters.includes(event.extendedProps.categoryId)
    );
  };

  // Handle individual category filter toggle
  const handleCategoryFilterToggle = (categoryId) => {
    if (selectedCategoryFilters.includes(categoryId)) {
      // Remove the category
      setSelectedCategoryFilters(prev => 
        prev.filter(id => id !== categoryId)
      );
    } else {
      // Add the category
      setSelectedCategoryFilters(prev => [...prev, categoryId]);
    }
  };

  // Select all categories
  const selectAllCategories = () => {
    setSelectedCategoryFilters(categories.map(cat => cat.id));
  };

  // Deselect all categories
  const deselectAllCategories = () => {
    setSelectedCategoryFilters([]);
  };

  // Handle event click
  const handleEventClick = (arg) => {
    arg.jsEvent.preventDefault();
    
    const event = arg.event;
    setSelectedEvent({
      title: event.title,
      start: event.start,
      end: event.end,
      color: event.color,
      extendedProps: event.extendedProps
    });
    setShowModal(true);
  };

  // Handle date click
  const handleDateClick = (arg) => {
    alert("Date clicked: " + arg.dateStr);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format date range
  const formatDateRange = (start, end) => {
    if (!start) return "";

    const startDate = formatDate(start);
    if (!end || start.toDateString() === end.toDateString()) {
      return startDate;
    }

    const endDate = formatDate(end);
    return `${startDate} - ${endDate}`;
  };

  // Open event link
  const openEventLink = () => {
    if (selectedEvent?.extendedProps?.link) {
      window.open(selectedEvent.extendedProps.link, "_blank");
    }
  };

  // Add event to calendar
  const addToCalendar = () => {
    if (!selectedEvent) return;

    const formatDateForGoogleCalendar = (date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const startDate = formatDateForGoogleCalendar(selectedEvent.start);
    const endDate = selectedEvent.end 
      ? formatDateForGoogleCalendar(selectedEvent.end)
      : formatDateForGoogleCalendar(new Date(selectedEvent.start.getTime() + 60 * 60 * 1000)); // Default 1 hour duration

    const description = selectedEvent.extendedProps?.description || '';
    const location = selectedEvent.extendedProps?.location || '';
    const link = selectedEvent.extendedProps?.link || '';

    // Combine description with link if available
    const fullDescription = `${description}${link ? `\n\nEvent Link: ${link}` : ''}`;

    // Create Google Calendar URL
    const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
    googleCalendarUrl.searchParams.set('action', 'TEMPLATE');
    googleCalendarUrl.searchParams.set('text', selectedEvent.title);
    googleCalendarUrl.searchParams.set('dates', `${startDate}/${endDate}`);
    googleCalendarUrl.searchParams.set('details', fullDescription);
    
    if (location) {
      googleCalendarUrl.searchParams.set('location', location);
    }

    // Open Google Calendar in new tab
    window.open(googleCalendarUrl.toString(), '_blank');
  };


  const filteredEvents = getFilteredEvents();

  return (
    <div className="app">
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="auto-refresh-indicator">
          <span className="refresh-spinner">🔄</span>
          <span className="refresh-text">Loading events from database...</span>
        </div>
      )}

      {/* Configuration check */}
      {!isLoading && categories.length === 0 && events.length === 0 && (
        <div className="config-message">
          <div className="config-content">
            <h2>🔧 Supabase Configuration Required</h2>
            <p>To use the Supabase Calendar, please:</p>
            <ol>
              <li>Copy <code>env.template</code> to <code>.env</code></li>
              <li>Add your Supabase URL and Anon Key</li>
              <li>Run the database schema in Supabase</li>
              <li>Refresh the page</li>
            </ol>
            <p><strong>Environment Variables Needed:</strong></p>
            <ul>
              <li><code>VITE_SUPABASE_URL</code> - Your Supabase project URL</li>
              <li><code>VITE_SUPABASE_ANON_KEY</code> - Your Supabase anon key</li>
            </ul>
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#e3f2fd', borderRadius: '8px' }}>
              <p><strong>Note:</strong> Once configured, this calendar will display gaming events from your Supabase database with category filtering and event details.</p>
            </div>
          </div>
        </div>
      )}


      {/* Main Content Area with Sidebar and Calendar */}
      <div className="main-content">
        {/* Category Filter Sidebar */}
        <div className="game-filter-sidebar">
          <div className="filter-header">
            <h3 className="filter-title">Filter by Category</h3>
            <div className="filter-actions">
              <button
                className="filter-action-btn select-all-btn"
                onClick={selectAllCategories}
              >
                Select All
              </button>
              <button
                className="filter-action-btn deselect-all-btn"
                onClick={deselectAllCategories}
              >
                Deselect All
              </button>
            </div>
          </div>

          <div className="filter-checkboxes">
            {categories.map((category) => (
              <label key={category.id} className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedCategoryFilters.includes(category.id)}
                  onChange={() => handleCategoryFilterToggle(category.id)}
                  className="filter-checkbox"
                />
                <div
                  className="filter-color-indicator"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="filter-checkbox-label">{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Calendar Container */}
        <div className="calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            weekends={true}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="auto"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek",
            }}
            events={filteredEvents}
          />
        </div>
      </div>

      {/* Event Modal */}
      {showModal && selectedEvent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <span>×</span>
            </button>

            <div className="modal-header">
              <div
                className="event-game-indicator"
                style={{ backgroundColor: selectedEvent.color }}
              >
                {selectedEvent.extendedProps?.category?.toUpperCase() || 'EVENT'}
              </div>
              <h2>{selectedEvent.title}</h2>
              <p className="event-date">
                {formatDateRange(selectedEvent.start, selectedEvent.end)}
              </p>
            </div>

            <div className="modal-body">
              {selectedEvent.extendedProps?.location && (
                <div className="event-location">
                  <span className="location-icon">📍</span>
                  {selectedEvent.extendedProps.location}
                </div>
              )}

              <div className={`modal-content-layout ${!selectedEvent.extendedProps?.image ? 'no-image' : ''}`}>
                {/* Left side - Description */}
                <div className="modal-description-section">
                  {selectedEvent.extendedProps?.description && (
                    <div className="event-description">
                      <p>{selectedEvent.extendedProps.description}</p>
                    </div>
                  )}
                </div>

                {/* Right side - Image */}
                {selectedEvent.extendedProps?.image && (
                  <div className="modal-image-section">
                    <div className="event-image-container">
                      <img
                        src={selectedEvent.extendedProps.image}
                        alt={`${selectedEvent.title} event image`}
                        className="event-image"
                        onError={(e) => {
                          console.error("Failed to load event image");
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              {selectedEvent.extendedProps?.link && (
                <button className="btn-event-link" onClick={openEventLink}>
                  <span className="btn-icon">🔗</span>
                  Open Event Link
                </button>
              )}

              <button className="btn-copy-calendar" onClick={addToCalendar}>
                <span className="btn-icon">+</span>
                Add to my calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupabaseCalendar;
