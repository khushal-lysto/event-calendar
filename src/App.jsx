import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import googleCalendarPlugin from '@fullcalendar/google-calendar'
import './App.css'

function App() {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Google Calendar configuration from environment variables
  const GOOGLE_CALENDAR_CONFIG = {
    API_KEY: import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY,
    CALENDAR_ID: import.meta.env.VITE_GOOGLE_CALENDAR_ID
  }

  // Event type color mapping
  const eventTypeColors = {
    fest: '#4285f4',           // Blue for fests
    sale: '#34a853',           // Green for sales
    tournament: '#ea4335',      // Red for tournaments
    conference: '#fbbc04',      // Yellow for conferences
    default: '#5f6368'          // Gray for unknown types
  }

  // Function to determine event type and color
  const getEventTypeAndColor = (event) => {
    const title = event.title?.toLowerCase() || ''
    const description = event.extendedProps?.description?.toLowerCase() || ''
    const location = event.extendedProps?.location?.toLowerCase() || ''
    
    // Keywords for different event types
    const typeKeywords = {
      fest: ['fest', 'festival', 'celebration', 'party', 'gathering'],
      sale: ['sale', 'discount', 'offer', 'deal', 'promotion'],
      tournament: ['tournament', 'competition', 'championship', 'match', 'game'],
      conference: ['conference', 'summit', 'symposium', 'convention', 'congress']
    }

    // Check title, description, and location for keywords
    const allText = `${title} ${description} ${location}`
    
    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(keyword => allText.includes(keyword))) {
        return { type, color: eventTypeColors[type] }
      }
    }

    return { type: 'default', color: eventTypeColors.default }
  }

  // Function to render event content with custom styling
  const renderEventContent = (eventInfo) => {
    const { type, color } = getEventTypeAndColor(eventInfo.event)
    
    return (
      <div 
        className="custom-event-content"
        style={{ 
          backgroundColor: color,
          borderColor: color,
          color: 'white'
        }}
      >
        <div className="event-title">{eventInfo.event.title}</div>
        {eventInfo.timeText && (
          <div className="event-time">{eventInfo.timeText}</div>
        )}
        <div className="event-type-badge">{type}</div>
      </div>
    )
  }

  const handleDateClick = (arg) => {
    alert('Date clicked: ' + arg.dateStr)
  }

  const handleEventClick = (arg) => {
    // Prevent default behavior (opening Google Calendar)
    arg.jsEvent.preventDefault()
    
    const event = arg.event
    const { type, color } = getEventTypeAndColor(event)
    
    setSelectedEvent({
      title: event.title,
      start: event.start,
      end: event.end,
      url: event.url,
      extendedProps: event.extendedProps,
      type: type,
      color: color
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedEvent(null)
  }

  const formatDate = (date) => {
    if (!date) return ''
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateRange = (start, end) => {
    if (!start) return ''
    
    const startDate = formatDate(start)
    if (!end || start.toDateString() === end.toDateString()) {
      return startDate
    }
    
    const endDate = formatDate(end)
    return `${startDate} - ${endDate}`
  }

  const copyToCalendar = () => {
    if (selectedEvent && selectedEvent.url) {
      window.open(selectedEvent.url, '_blank')
    }
  }

  return (
    <div className="app">
      <h1>Game Conference Guide</h1>
      
      {/* Event Type Legend */}
      <div className="event-legend">
        <h3>Event Types</h3>
        <div className="legend-items">
          {Object.entries(eventTypeColors).map(([type, color]) => (
            <div key={type} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: color }}
              ></div>
              <span className="legend-label">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, googleCalendarPlugin]}
          initialView="dayGridMonth"
          weekends={true}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
          }}
          googleCalendarApiKey={GOOGLE_CALENDAR_CONFIG.API_KEY}
          events={{
            googleCalendarId: GOOGLE_CALENDAR_CONFIG.CALENDAR_ID,
            className: 'gcal-event'
          }}
        />
      </div>

      {/* Custom Event Modal */}
      {showModal && selectedEvent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <span>×</span>
            </button>
            
            <div className="modal-header">
              <div className="event-type-indicator" style={{ backgroundColor: selectedEvent.color }}>
                {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
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
              
              {selectedEvent.extendedProps?.description && (
                <div className="event-description">
                  {selectedEvent.extendedProps.description}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-copy-calendar" onClick={copyToCalendar}>
                <span className="btn-icon">+</span>
                Copy to my calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
