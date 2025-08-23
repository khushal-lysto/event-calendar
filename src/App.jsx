import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import googleCalendarPlugin from '@fullcalendar/google-calendar'
import './App.css'

function App() {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filteredEvents, setFilteredEvents] = useState([])
  const [apiEvents, setApiEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [calendarRef, setCalendarRef] = useState(null)
  const [selectedGameFilters, setSelectedGameFilters] = useState(['steam', 'valorant', 'roblox', 'xbox', 'psn', 'dota', 'league', 'csgo', 'minecraft', 'fortnite', 'apex', 'overwatch', 'gaming'])

  // Runtime config fetched from public/config.json
  const [runtimeConfig, setRuntimeConfig] = useState(null)

  useEffect(() => {
    const runtimeConfigUrl = `${import.meta.env.BASE_URL || '/'}config.json`
    fetch(runtimeConfigUrl, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setRuntimeConfig(json))
      .catch(() => setRuntimeConfig(null))
  }, [])

  // Fetch API events on component mount (independent of runtime config)
  useEffect(() => {
    const loadApiEvents = async () => {
      setIsLoading(true)
      console.log('📄 Starting to load API events...')
      
      try {
        const eventNames = await fetchApiEvents()
        console.log('✅ API events loaded successfully:', eventNames)
        console.log('✅ Event names array:', eventNames)
        console.log('✅ Array length:', eventNames.length)
        console.log('✅ Is array?', Array.isArray(eventNames))
        console.log('✅ Event names for filtering:', eventNames)
        setApiEvents(eventNames)
        
        // Log summary after loading
        console.log('🎯 Event filtering summary:')
        console.log(`   - API events loaded: ${eventNames.length}`)
        console.log(`   - Ready to filter calendar events`)
      } catch (error) {
        console.error('❌ Failed to load API events:', error)
        setApiEvents([])
      } finally {
        setIsLoading(false)
      }
    }
    
    // Load API events immediately when component mounts
    loadApiEvents()
  }, []) // Empty dependency array means this runs once on mount

  // Effect to refresh calendar when API events are loaded
  useEffect(() => {
    if (!isLoading && calendarRef) {
      console.log('🔄 API events loaded, refreshing calendar with filter...')
      // Force FullCalendar to refetch and reprocess events
      calendarRef.refetchEvents()
    }
  }, [isLoading, apiEvents, calendarRef]) // Runs when loading state or API events change

  // Google Calendar configuration from environment variables (build-time)
  // with fallback to runtime config
  const GOOGLE_CALENDAR_CONFIG = {
    API_KEY: import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY || runtimeConfig?.apiKey || '',
    CALENDAR_ID: import.meta.env.VITE_GOOGLE_CALENDAR_ID || runtimeConfig?.calendarId || ''
  }

  // API configuration
  const API_CONFIG = {
    WEBHOOK_URL: 'https://ka-lysto.app.n8n.cloud/webhook/8b3419e2-886e-43b7-8ba2-92ccbbe8a8e2'
  }

  // Fallback mock data in case API fails (for development/testing)
  const FALLBACK_EVENTS = [
    'Steam Racing Fest',
    'Steam 4X Fest'
  ]

  // Debug logging to check environment variables
  console.log('Environment variables:', {
    API_KEY: import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY ? '✅ Loaded' : '❌ Missing',
    CALENDAR_ID: import.meta.env.VITE_GOOGLE_CALENDAR_ID ? '✅ Loaded' : '❌ Missing'
  })
  console.log('Runtime config present:', runtimeConfig ? '✅ Yes' : '❌ No')
  console.log('Calendar config:', GOOGLE_CALENDAR_CONFIG)
  console.log('API config:', API_CONFIG)

  // Function to fetch events from the n8n webhook API
  const fetchApiEvents = async () => {
    try {
      console.log('Fetching events from:', API_CONFIG.WEBHOOK_URL)

      const response = await fetch(API_CONFIG.WEBHOOK_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors', // Try to handle CORS
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch API events: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📊 Raw API response:', data)
      console.log('📊 Response type:', typeof data)
      console.log('📊 Is array?', Array.isArray(data))
      
      // Extract event names from the "Event" field
      const eventNames = data
        .map(item => {
          console.log('Processing item:', item)
          return item.Event
        })
        .filter(name => {
          console.log('Filtering name:', name)
          return name && name.trim() !== ''
        })

      console.log('📊 Events from API "Event" field:', eventNames)
      console.log('📋 Total events found:', eventNames.length)
      return eventNames
    } catch (error) {
      console.error('Error fetching API events:', error)
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      
      // Use fallback data if API fails
      console.log('📄 Using fallback events due to API failure')
      return FALLBACK_EVENTS
    }
  }

  // Game/platform color mapping
  const gameColors = {
    steam: '#1b2838',          // Dark blue for Steam
    valorant: '#ff4655',        // Red for Valorant
    roblox: '#00a2ff',         // Blue for Roblox
    xbox: '#107c10',           // Green for Xbox
    psn: '#003791',            // Blue for PlayStation
    dota: '#ff6b35',           // Orange for Dota
    league: '#c89b3c',         // Gold for League of Legends
    csgo: '#f7931e',           // Orange for CS:GO
    minecraft: '#62b47a',      // Green for Minecraft
    fortnite: '#ff6b35',       // Orange for Fortnite
    apex: '#da2929',           // Red for Apex Legends
    overwatch: '#ff9c00',      // Orange for Overwatch
    default: '#5f6368'         // Gray for unknown games
  }

  // Function to determine game type and color
  const getGameTypeAndColor = (event) => {
    const title = event.title?.toLowerCase() || ''
    const description = event.extendedProps?.description?.toLowerCase() || ''
    const location = event.extendedProps?.location?.toLowerCase() || ''
    
    // Keywords for different games/platforms
    const gameKeywords = {
      steam: ['steam', 'valve', 'racing fest', '4x fest'],
      valorant: ['valorant', 'riot'],
      roblox: ['roblox'],
      xbox: ['xbox', 'microsoft', 'game pass'],
      psn: ['playstation', 'psn', 'ps4', 'ps5', 'sony'],
      dota: ['dota', 'dota 2'],
      league: ['league', 'lol', 'league of legends'],
      csgo: ['csgo', 'counter-strike', 'counter strike'],
      minecraft: ['minecraft', 'mojang'],
      fortnite: ['fortnite', 'epic'],
      apex: ['apex', 'apex legends'],
      overwatch: ['overwatch', 'blizzard']
    }

    // Check title, description, and location for game keywords
    const allText = `${title} ${description} ${location}`
    
    for (const [game, keywords] of Object.entries(gameKeywords)) {
      if (keywords.some(keyword => allText.includes(keyword))) {
        return { game, color: gameColors[game] }
      }
    }

    // If no specific game is found, try to detect if it's a general gaming event
    const generalGamingKeywords = ['game', 'gaming', 'esports', 'tournament', 'championship', 'match']
    if (generalGamingKeywords.some(keyword => allText.includes(keyword))) {
      return { game: 'gaming', color: '#8e44ad' } // Purple for general gaming
    }

    return { game: 'default', color: gameColors.default }
  }

  // Function to get all available game types
  const getAvailableGameTypes = () => {
    return [
      { value: 'steam', label: 'Steam' },
      { value: 'valorant', label: 'Valorant' },
      { value: 'roblox', label: 'Roblox' },
      { value: 'xbox', label: 'Xbox' },
      { value: 'psn', label: 'PlayStation' },
      { value: 'dota', label: 'Dota 2' },
      { value: 'league', label: 'League of Legends' },
      { value: 'csgo', label: 'CS:GO' },
      { value: 'minecraft', label: 'Minecraft' },
      { value: 'fortnite', label: 'Fortnite' },
      { value: 'apex', label: 'Apex Legends' },
      { value: 'overwatch', label: 'Overwatch' },
      { value: 'gaming', label: 'General Gaming' }
    ]
  }

  // Function to filter events based on API data
  const shouldShowEvent = (event) => {
    console.log('🔍 Checking event:', event.title, 'API events loaded:', apiEvents.length, 'Is loading:', isLoading)
    
    // IMPORTANT: If still loading API events, don't show any events yet
    if (isLoading) {
      console.log('⏳ Still loading API events, hiding all events temporarily')
      return false
    }
    
    if (apiEvents.length === 0) {
      // If no API data after loading, show all events
      console.log('⚠️ No API data available after loading, showing all events')
      return true
    }
    
    // FullCalendar events have a title property
    const eventTitle = event.title?.toLowerCase() || ''
    
    if (!eventTitle) {
      console.log(`❌ FILTERED OUT: Event with no title`)
      return false
    }
    
    const isMatch = apiEvents.some(apiEvent => {
      const apiEventLower = apiEvent.toLowerCase()
      const matches = eventTitle.includes(apiEventLower) || apiEventLower.includes(eventTitle)
      return matches
    })
    
    // Log filtering decision
    if (isMatch) {
      console.log(`✅ SHOWING: "${event.title}" - matches API event`)
    } else {
      console.log(`❌ FILTERED OUT: "${event.title}" - no API match`)
    }
    
    return isMatch
  }

  // Function to filter events based on game type
  const shouldShowEventByGameType = (event) => {
    if (selectedGameFilters.length === 0) {
      return false
    }
    
    const { game } = getGameTypeAndColor(event)
    return selectedGameFilters.includes(game)
  }

  // Handle individual game type checkbox change
  const handleGameFilterToggle = (gameType) => {
    if (selectedGameFilters.includes(gameType)) {
      // Remove the game type
      const updatedFilters = selectedGameFilters.filter(filter => filter !== gameType)
      setSelectedGameFilters(updatedFilters)
    } else {
      // Add the game type
      setSelectedGameFilters([...selectedGameFilters, gameType])
    }
    
    // Refresh calendar to apply new filter
    if (calendarRef) {
      calendarRef.refetchEvents()
    }
  }

  // Select all game types
  const selectAllGames = () => {
    const allGameTypes = getAvailableGameTypes().map(gameType => gameType.value)
    setSelectedGameFilters(allGameTypes)
    if (calendarRef) {
      calendarRef.refetchEvents()
    }
  }

  // Deselect all game types
  const deselectAllGames = () => {
    setSelectedGameFilters([])
    if (calendarRef) {
      calendarRef.refetchEvents()
    }
  }

  // Combined filter function
  const shouldShowEventCombined = (event) => {
    return shouldShowEvent(event) && shouldShowEventByGameType(event)
  }

  // Handle game type filter change
  const handleGameFilterChange = (newFilter) => {
    setSelectedGameFilters(newFilter)
    // Refresh calendar to apply new filter
    if (calendarRef) {
      calendarRef.refetchEvents()
    }
  }

  // Function to render event content with custom styling
  const renderEventContent = (eventInfo) => {
    const { game, color } = getGameTypeAndColor(eventInfo.event)
    
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
        <div className="event-game-badge">{game.toUpperCase()}</div>
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
    
    // CHECK: Only handle clicks for events that should be shown
    if (!shouldShowEventCombined(event)) {
      console.log('🚫 Ignoring click on filtered event:', event.title)
      return
    }
    
    const { game, color } = getGameTypeAndColor(event)
    
    setSelectedEvent({
      title: event.title,
      start: event.start,
      end: event.end,
      url: event.url,
      extendedProps: event.extendedProps,
      game: game,
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
      
      {/* Game Type Legend */}
      <div className="event-legend">
        <h3>Game Types</h3>
        <div className="legend-items">
          {Object.entries(gameColors).map(([game, color]) => (
            <div key={game} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: color }}
              ></div>
              <span className="legend-label">{game.charAt(0).toUpperCase() + game.slice(1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area with Sidebar and Calendar */}
      <div className="main-content">
        {/* Game Type Filter Sidebar */}
        <div className="game-filter-sidebar">
          <div className="filter-header">
            <h3 className="filter-title">Filter by Game Type</h3>
            <div className="filter-actions">
              <button 
                className="filter-action-btn select-all-btn"
                onClick={selectAllGames}
              >
                Select All
              </button>
              <button 
                className="filter-action-btn deselect-all-btn"
                onClick={deselectAllGames}
              >
                Deselect All
              </button>
            </div>
          </div>
          
          <div className="filter-checkboxes">
            {getAvailableGameTypes().map((gameType) => (
              <label key={gameType.value} className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedGameFilters.includes(gameType.value)}
                  onChange={() => handleGameFilterToggle(gameType.value)}
                  className="filter-checkbox"
                />
                <span className="filter-checkbox-label">{gameType.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Calendar Container */}
        <div className="calendar-container">
          <FullCalendar
            ref={(el) => {
              if (el) setCalendarRef(el.getApi())
            }}
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
            eventSourceSuccess={(rawEvents, response) => {
              console.log("📊 Raw events from Google:", rawEvents)

              // Hide everything while API events are still loading
              if (isLoading) {
                console.log("⏳ API still loading, returning empty events")
                return []
              }

              // If no API data -> show everything
              if (apiEvents.length === 0) {
                console.log("⚠️ No API filter, returning all events")
                return rawEvents
              }

              // Filter by shouldShowEvent
              const filtered = rawEvents.filter(ev => shouldShowEventCombined(ev))
              console.log(`✅ Filtered events: ${filtered.length} / ${rawEvents.length}`)
              return filtered
            }}
            eventDidMount={(info) => {
              console.log('📅 Event mounted:', info.event.title)
            }}
            eventSourceFailure={(error) => {
              console.error('❌ Calendar API error:', error)
            }}
            eventsDidSet={(events) => {
              console.log(`📊 Final events after filtering: ${events.length}`)
              setFilteredEvents(events)
            }}
          />
        </div>
      </div>

      {/* Custom Event Modal */}
      {showModal && selectedEvent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <span>×</span>
            </button>
            
            <div className="modal-header">
              <div className="event-game-indicator" style={{ backgroundColor: selectedEvent.color }}>
                {selectedEvent.game.charAt(0).toUpperCase() + selectedEvent.game.slice(1)}
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