import SupabaseCalendar from "./SupabaseCalendar";
import "./App.css";

function MainApp() {
  return (
    <div className="main-app">
      {/* Navigation Header */}
      <div className="nav-header">
        <div className="nav-container">
          <h1 className="nav-title">Gaming Calendar</h1>
        </div>
      </div>

      {/* Render the Supabase calendar */}
      <SupabaseCalendar />
    </div>
  );
}

export default MainApp;
