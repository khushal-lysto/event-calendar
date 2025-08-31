import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import "./App.css";

function App() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [apiEvents, setApiEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [calendarRef, setCalendarRef] = useState(null);

  const [selectedGameFilters, setSelectedGameFilters] = useState([
    "steam",
    "valorant",
    "roblox",
    "xbox",
    "psn",
    "dota",
    "league",
    "csgo",
    "minecraft",
    "fortnite",
    "apex",
    "overwatch",
    "gaming",
  ]);

  // Runtime config fetched from public/config.json
  const [runtimeConfig, setRuntimeConfig] = useState(null);



  // Local storage keys
  const STORAGE_KEYS = {
    API_EVENTS: "calendar_api_events",
    LAST_FETCH: "calendar_last_fetch",
    CACHE_DURATION: "calendar_cache_duration",
  };

  // Cache duration in milliseconds (2 hours)
  const CACHE_DURATION_MS = 2 * 60 * 60 * 1000;

  useEffect(() => {
    const runtimeConfigUrl = `${import.meta.env.BASE_URL || "/"}config.json`;
    fetch(runtimeConfigUrl, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setRuntimeConfig(json))
      .catch(() => setRuntimeConfig(null));
  }, []);

  // Load cached data from local storage
  const loadCachedData = () => {
    try {
      const cachedEvents = localStorage.getItem(STORAGE_KEYS.API_EVENTS);
      const lastFetch = localStorage.getItem(STORAGE_KEYS.LAST_FETCH);

      console.log("🔍 Checking cache:", {
        hasCachedEvents: !!cachedEvents,
        hasLastFetch: !!lastFetch,
        cacheSize: cachedEvents ? JSON.parse(cachedEvents).length : 0,
      });

      if (cachedEvents && lastFetch) {
        const parsedEvents = JSON.parse(cachedEvents);
        const lastFetchTime = parseInt(lastFetch);
        const now = Date.now();
        const cacheAgeMinutes = Math.round((now - lastFetchTime) / 1000 / 60);

        console.log("📦 Cache details:", {
          cacheAge: cacheAgeMinutes,
          maxAge: Math.round(CACHE_DURATION_MS / 1000 / 60),
          isValid: now - lastFetchTime < CACHE_DURATION_MS,
        });

        // Check if cache is still valid
        if (now - lastFetchTime < CACHE_DURATION_MS) {
          console.log(
            "📦 Using cached API events (age:",
            cacheAgeMinutes,
            "minutes)"
          );
          setApiEvents(parsedEvents);
          setIsLoading(false);
          return true; // Cache is valid
        } else {
          console.log("⏰ Cache expired, will fetch fresh data");
          localStorage.removeItem(STORAGE_KEYS.API_EVENTS);
          localStorage.removeItem(STORAGE_KEYS.LAST_FETCH);
        }
      } else {
        console.log("📭 No cache found, will fetch fresh data");
      }
      return false; // No valid cache
    } catch (error) {
      console.error("❌ Error loading cached data:", error);
      // Clear corrupted cache
      localStorage.removeItem(STORAGE_KEYS.API_EVENTS);
      localStorage.removeItem(STORAGE_KEYS.LAST_FETCH);
      return false;
    }
  };

  // Save data to local storage
  const saveToCache = (data) => {
    try {
      localStorage.setItem(STORAGE_KEYS.API_EVENTS, JSON.stringify(data));
      localStorage.setItem(STORAGE_KEYS.LAST_FETCH, Date.now().toString());
      console.log("💾 API events cached to local storage");
    } catch (error) {
      console.error("❌ Error saving to cache:", error);
    }
  };

  // Fetch API events on component mount (independent of runtime config)
  useEffect(() => {
    const loadApiEvents = async () => {
      setIsLoading(true);
      console.log("📄 Starting to load API events...");

      // First try to load from cache
      const cacheValid = loadCachedData();

      if (cacheValid) {
        console.log("✅ Using cached API events");
        return;
      }

      try {
        console.log("🔄 Cache invalid or missing, fetching from API...");
        const eventData = await fetchApiEvents();
        console.log("✅ API events loaded successfully:", eventData);
        console.log("✅ Event data array:", eventData);
        console.log("✅ Array length:", eventData.length);
        console.log("✅ Is array?", Array.isArray(eventData));
        console.log("✅ Event data for filtering:", eventData);

        setApiEvents(eventData);

        // Cache the fresh data
        saveToCache(eventData);

        // Log summary after loading
        console.log("🎯 Event filtering summary:");
        console.log(`   - API events loaded: ${eventData.length}`);
        console.log(`   - Ready to filter calendar events`);
      } catch (error) {
        console.error("❌ Failed to load API events:", error);
        setApiEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Load API events immediately when component mounts
    loadApiEvents();
  }, []); // Empty dependency array means this runs once on mount

  // Effect to refresh calendar when API events are loaded
  useEffect(() => {
    if (!isLoading && calendarRef) {
      console.log("🔄 API events loaded, refreshing calendar with filter...");
      // Force FullCalendar to refetch and reprocess events
      calendarRef.refetchEvents();
    }
  }, [isLoading, apiEvents, calendarRef]); // Runs when loading state or API events change

  // Automatic cache refresh every 2 hours
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      console.log("⏰ Auto-refreshing cache (every 2 hours)");
      refreshApiData();
    }, 2 * 60 * 60 * 1000); // Exactly 2 hours

    // Cleanup interval on component unmount
    return () => clearInterval(autoRefreshInterval);
  }, []); // Empty dependency array means this runs once on mount

  // Google Calendar configuration from environment variables (build-time)
  // with fallback to runtime config
  const GOOGLE_CALENDAR_CONFIG = {
    API_KEY:
      import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY ||
      runtimeConfig?.apiKey ||
      "",
    CALENDAR_ID:
      import.meta.env.VITE_GOOGLE_CALENDAR_ID ||
      runtimeConfig?.calendarId ||
      "",
  };

  // API configuration
  const API_CONFIG = {
    WEBHOOK_URL:
      "https://ka-lysto.app.n8n.cloud/webhook/8b3419e2-886e-43b7-8ba2-92ccbbe8a8e2",
  };

  // Fallback mock data in case API fails (for development/testing)
  const FALLBACK_EVENTS = [
    {
      row_number: 1,
      Event: "Steam Racing Fest",
      Show: "T",
      Description: "Fallback event description",
      Link: "https://store.steampowered.com/",
    },
    {
      row_number: 2,
      Event: "Steam 4X Fest",
      Show: "T",
      Description: "Fallback event description",
      Link: "https://store.steampowered.com/",
    },
  ];

  // Debug logging to check environment variables
  console.log("Environment variables:", {
    API_KEY: import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY
      ? "✅ Loaded"
      : "❌ Missing",
    CALENDAR_ID: import.meta.env.VITE_GOOGLE_CALENDAR_ID
      ? "✅ Loaded"
      : "❌ Missing",
  });
  console.log("Runtime config present:", runtimeConfig ? "✅ Yes" : "❌ No");
  console.log("Calendar config:", GOOGLE_CALENDAR_CONFIG);
  console.log("API config:", API_CONFIG);

  // Function to fetch events from the n8n webhook API
  const fetchApiEvents = async () => {
    try {
      console.log("Fetching events from:", API_CONFIG.WEBHOOK_URL);

      const response = await fetch(API_CONFIG.WEBHOOK_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors", // Try to handle CORS
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch API events: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("📊 Raw API response:", data);
      console.log("📊 Response type:", typeof data);
      console.log("📊 Is array?", Array.isArray(data));

      // Return the full data array with Show field filtering
      const filteredData = data.filter((item) => {
        console.log("Processing item:", item, "Show field:", item.Show);
        return item.Show === "T"; // Only show events where Show is 'T'
      });

      console.log("📊 Filtered events (Show=T):", filteredData);
      console.log("📋 Total events to show:", filteredData.length);
      return filteredData;
    } catch (error) {
      console.error("Error fetching API events:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      // Use fallback data if API fails
      console.log("📄 Using fallback events due to API failure");
      return FALLBACK_EVENTS;
    }
  };

  // Function to refresh API data (used by automatic refresh)
  const refreshApiData = async () => {
    console.log("🔄 Refreshing API data...");
    setIsLoading(true);

    try {
      // Clear the cache first
      localStorage.removeItem(STORAGE_KEYS.API_EVENTS);
      localStorage.removeItem(STORAGE_KEYS.LAST_FETCH);
      console.log("🗑️ Cache cleared");

      const eventData = await fetchApiEvents();
      setApiEvents(eventData);
      saveToCache(eventData);
      console.log("✅ API data refreshed successfully");
      
      // Refresh the calendar to show new data
      if (calendarRef) {
        calendarRef.refetchEvents();
      }
    } catch (error) {
      console.error("❌ Failed to refresh API data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Game/platform color mapping
  const gameColors = {
    steam: "#1b2838", // Dark blue for Steam
    valorant: "#ff4655", // Red for Valorant
    roblox: "#00a2ff", // Blue for Roblox
    xbox: "#107c10", // Green for Xbox
    psn: "#003791", // Blue for PlayStation
    dota: "#ff6b35", // Orange for Dota
    league: "#c89b3c", // Gold for League of Legends
    csgo: "#f7931e", // Orange for CS:GO
    minecraft: "#62b47a", // Green for Minecraft
    fortnite: "#ff6b35", // Orange for Fortnite
    apex: "#da2929", // Red for Apex Legends
    overwatch: "#ff9c00", // Orange for Overwatch
    default: "#5f6368", // Gray for unknown games
  };

  // Function to determine game type and color
  const getGameTypeAndColor = (event) => {
    const title = event.title?.toLowerCase() || "";
    const description = event.extendedProps?.description?.toLowerCase() || "";
    const location = event.extendedProps?.location?.toLowerCase() || "";

    // Keywords for different games/platforms
    const gameKeywords = {
      steam: ["steam", "valve", "racing fest", "4x fest"],
      valorant: ["valorant", "riot"],
      roblox: ["roblox"],
      xbox: ["xbox", "microsoft", "game pass"],
      psn: ["playstation", "psn", "ps4", "ps5", "sony"],
      dota: ["dota", "dota 2"],
      league: ["league", "lol", "league of legends"],
      csgo: ["csgo", "counter-strike", "counter strike"],
      minecraft: ["minecraft", "mojang"],
      fortnite: ["fortnite", "epic"],
      apex: ["apex", "apex legends"],
      overwatch: ["overwatch", "blizzard"],
    };

    // Check title, description, and location for game keywords
    const allText = `${title} ${description} ${location}`;

    for (const [game, keywords] of Object.entries(gameKeywords)) {
      if (keywords.some((keyword) => allText.includes(keyword))) {
        return { game, color: gameColors[game] };
      }
    }

    // If no specific game is found, try to detect if it's a general gaming event
    const generalGamingKeywords = [
      "game",
      "gaming",
      "esports",
      "tournament",
      "championship",
      "match",
    ];
    if (generalGamingKeywords.some((keyword) => allText.includes(keyword))) {
      return { game: "gaming", color: "#8e44ad" }; // Purple for general gaming
    }

    return { game: "default", color: gameColors.default };
  };

  // Function to get all available game types
  const getAvailableGameTypes = () => {
    return [
      { value: "steam", label: "Steam" },
      { value: "valorant", label: "Valorant" },
      { value: "roblox", label: "Roblox" },
      { value: "xbox", label: "Xbox" },
      { value: "psn", label: "PlayStation" },
      { value: "dota", label: "Dota 2" },
      { value: "league", label: "League of Legends" },
      { value: "csgo", label: "CS:GO" },
      { value: "minecraft", label: "Minecraft" },
      { value: "fortnite", label: "Fortnite" },
      { value: "apex", label: "Apex Legends" },
      { value: "overwatch", label: "Overwatch" },
      { value: "gaming", label: "General Gaming" },
    ];
  };

  // Function to filter events based on API data
  const shouldShowEvent = (event) => {
    console.log(
      "🔍 Checking event:",
      event.title,
      "API events loaded:",
      apiEvents.length,
      "Is loading:",
      isLoading
    );

    // IMPORTANT: If still loading API events, don't show any events yet
    if (isLoading) {
      console.log("⏳ Still loading API events, hiding all events temporarily");
      return false;
    }

    if (apiEvents.length === 0) {
      // If no API data after loading, show all events
      console.log("⚠️ No API data available after loading, showing all events");
      return true;
    }

    // FullCalendar events have a title property
    const eventTitle = event.title?.toLowerCase() || "";

    if (!eventTitle) {
      console.log(`❌ FILTERED OUT: Event with no title`);
      return false;
    }

    const isMatch = apiEvents.some((apiEvent) => {
      const apiEventLower = apiEvent.Event.toLowerCase();
      const matches =
        eventTitle.includes(apiEventLower) ||
        apiEventLower.includes(eventTitle);
      return matches;
    });

    // Log filtering decision
    if (isMatch) {
      console.log(`✅ SHOWING: "${event.title}" - matches API event`);
    } else {
      console.log(`❌ FILTERED OUT: "${event.title}" - no API match`);
    }

    return isMatch;
  };

  // Function to filter events based on game type
  const shouldShowEventByGameType = (event) => {
    if (selectedGameFilters.length === 0) {
      return false;
    }

    const { game } = getGameTypeAndColor(event);
    return selectedGameFilters.includes(game);
  };

  // Handle individual game type checkbox change
  const handleGameFilterToggle = (gameType) => {
    if (selectedGameFilters.includes(gameType)) {
      // Remove the game type
      const updatedFilters = selectedGameFilters.filter(
        (filter) => filter !== gameType
      );
      setSelectedGameFilters(updatedFilters);
    } else {
      // Add the game type
      setSelectedGameFilters([...selectedGameFilters, gameType]);
    }

    // Refresh calendar to apply new filter
    if (calendarRef) {
      calendarRef.refetchEvents();
    }
  };

  // Select all game types
  const selectAllGames = () => {
    const allGameTypes = getAvailableGameTypes().map(
      (gameType) => gameType.value
    );
    setSelectedGameFilters(allGameTypes);
    if (calendarRef) {
      calendarRef.refetchEvents();
    }
  };

  // Deselect all game types
  const deselectAllGames = () => {
    setSelectedGameFilters([]);
    if (calendarRef) {
      calendarRef.refetchEvents();
    }
  };

  // Combined filter function
  const shouldShowEventCombined = (event) => {
    return shouldShowEvent(event) && shouldShowEventByGameType(event);
  };

  // Handle game type filter change
  const handleGameFilterChange = (newFilter) => {
    setSelectedGameFilters(newFilter);
    // Refresh calendar to apply new filter
    if (calendarRef) {
      calendarRef.refetchEvents();
    }
  };

  // Function to render event content with custom styling
  const renderEventContent = (eventInfo) => {
    const { game, color } = getGameTypeAndColor(eventInfo.event);

    return (
      <div
        className="custom-event-content"
        style={{
          backgroundColor: color,
          borderColor: color,
          color: "white",
        }}
      >
        <div className="event-title">{eventInfo.event.title}</div>
        {eventInfo.timeText && (
          <div className="event-time">{eventInfo.timeText}</div>
        )}
        <div className="event-game-badge">{game.toUpperCase()}</div>
      </div>
    );
  };

  const handleDateClick = (arg) => {
    alert("Date clicked: " + arg.dateStr);
  };

  const handleEventClick = (arg) => {
    // Prevent default behavior (opening Google Calendar)
    arg.jsEvent.preventDefault();

    const event = arg.event;

    // CHECK: Only handle clicks for events that should be shown
    if (!shouldShowEventCombined(event)) {
      console.log("🚫 Ignoring click on filtered event:", event.title);
      return;
    }

    const { game, color } = getGameTypeAndColor(event);

    // Find the matching API event data
    const apiEventData = apiEvents.find((apiEvent) => {
      const eventTitle = event.title?.toLowerCase() || "";
      const apiEventTitle = apiEvent.Event?.toLowerCase() || "";
      return (
        eventTitle.includes(apiEventTitle) || apiEventTitle.includes(eventTitle)
      );
    });

    // Debug: Log the API data to see what fields are available
    console.log("📊 API Event Data:", apiEventData);
    console.log("🖼️ Image URL:", apiEventData?.Image);

    setSelectedEvent({
      title: event.title,
      start: event.start,
      end: event.end,
      url: event.url,
      extendedProps: event.extendedProps,
      game: game,
      color: color,
      apiData: apiEventData, // Include the API data for description and link
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateRange = (start, end) => {
    if (!start) return "";

    const startDate = formatDate(start);
    if (!end || start.toDateString() === end.toDateString()) {
      return startDate;
    }

    const endDate = formatDate(end);
    return `${startDate} - ${endDate}`;
  };

  const copyToCalendar = () => {
    if (selectedEvent && selectedEvent.url) {
      window.open(selectedEvent.url, "_blank");
    }
  };

  const openEventLink = () => {
    if (selectedEvent && selectedEvent.apiData && selectedEvent.apiData.Link) {
      window.open(selectedEvent.apiData.Link, "_blank");
    }
  };

  return (
        <div className="app">
      <div className="header-section">
        <h1>Game Conference Guide</h1>
        <button 
          className="reload-button" 
          onClick={refreshApiData}
          disabled={isLoading}
          title="Clear cache and refresh events"
        >
          {isLoading ? (
            <span className="reload-spinner">🔄</span>
          ) : (
            <span className="reload-icon">🔄</span>
          )}
        </button>
      </div>
      
      {/* Subtle auto-refresh indicator */}
      {isLoading && (
        <div className="auto-refresh-indicator">
          <span className="refresh-spinner">🔄</span>
          <span className="refresh-text">Updating events...</span>
        </div>
      )}



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
              <span className="legend-label">
                {game.charAt(0).toUpperCase() + game.slice(1)}
              </span>
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
              if (el) setCalendarRef(el.getApi());
            }}
            plugins={[dayGridPlugin, interactionPlugin, googleCalendarPlugin]}
            initialView="dayGridMonth"
            weekends={true}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            height="auto"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek",
            }}
            googleCalendarApiKey={GOOGLE_CALENDAR_CONFIG.API_KEY}
            events={{
              googleCalendarId: GOOGLE_CALENDAR_CONFIG.CALENDAR_ID,
              className: "gcal-event",
            }}
            eventSourceSuccess={(rawEvents, response) => {
              console.log("📊 Raw events from Google:", rawEvents);

              // Hide everything while API events are still loading
              if (isLoading) {
                console.log("⏳ API still loading, returning empty events");
                return [];
              }

              // If no API data -> show everything
              if (apiEvents.length === 0) {
                console.log("⚠️ No API filter, returning all events");
                return rawEvents;
              }

              // Filter by shouldShowEvent
              const filtered = rawEvents.filter((ev) =>
                shouldShowEventCombined(ev)
              );
              console.log(
                `✅ Filtered events: ${filtered.length} / ${rawEvents.length}`
              );
              return filtered;
            }}
            eventDidMount={(info) => {
              console.log("📅 Event mounted:", info.event.title);
            }}
            eventSourceFailure={(error) => {
              console.error("❌ Calendar API error:", error);
            }}
            eventsDidSet={(events) => {
              console.log(`📊 Final events after filtering: ${events.length}`);
              setFilteredEvents(events);
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
              <div
                className="event-game-indicator"
                style={{ backgroundColor: selectedEvent.color }}
              >
                {selectedEvent.game.charAt(0).toUpperCase() +
                  selectedEvent.game.slice(1)}
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

              <div className={`modal-content-layout ${!selectedEvent.apiData?.Image ? 'no-image' : ''}`}>
                {/* Left side - Description */}
                <div className="modal-description-section">
                  {/* Show API description if available */}
                  {selectedEvent.apiData?.Description && (
                    <div className="event-description">
                      <h4>Description:</h4>
                      <p>{selectedEvent.apiData.Description}</p>
                    </div>
                  )}

                  {/* Show Google Calendar description if no API description */}
                  {!selectedEvent.apiData?.Description &&
                    selectedEvent.extendedProps?.description && (
                      <div className="event-description">
                        <h4>Description:</h4>
                        <p>{selectedEvent.extendedProps.description}</p>
                      </div>
                    )}
                </div>

                {/* Right side - Image */}
                {selectedEvent.apiData?.Image && (
                  <div className="modal-image-section">
                    <div className="event-image-container">
                      <img
                        src={selectedEvent.apiData.Image}
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
              {/* Show API link if available */}
              {selectedEvent.apiData?.Link && (
                <button className="btn-event-link" onClick={openEventLink}>
                  <span className="btn-icon">🔗</span>
                  Open Event Link
                </button>
              )}

              <button className="btn-copy-calendar" onClick={copyToCalendar}>
                <span className="btn-icon">+</span>
                Copy to my calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
