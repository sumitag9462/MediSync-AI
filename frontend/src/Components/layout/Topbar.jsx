import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { Bell, Search, LogOut, Check, X } from "lucide-react";
import medicines from "../../data/medicines.json";
import { otherApi } from "../../api/otherApi";
import { medicineApi } from "../../api/medicineApi";

const Topbar = ({ user, onLogout }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [upcomingDoses, setUpcomingDoses] = useState([]);
  const [showBellDropdown, setShowBellDropdown] = useState(false);

  const navigate = useNavigate();
  const inputRef = useRef(null);
  const bellRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [bellDropdownPosition, setBellDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Fetch autocomplete suggestions from local JSON
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      setLoading(true);
      const filtered = medicines
        .filter((med) =>
          med.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setLoading(false);

      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Fetch upcoming doses for bell with real-time filtering
  const fetchUpcomingDoses = async () => {
    try {
      const summaryData = await otherApi.getDashboardSummary();
      const doseLogs = await medicineApi.getDoseLogs(); // get logs to filter taken/skipped

      const today = new Date().toDateString();

      const filteredUpcoming = (summaryData.upcomingDoses || []).filter(dose => {
        return !doseLogs.some(log => 
          log.scheduleId === dose.scheduleId &&
          log.time === dose.time &&
          ['Taken', 'Skipped'].includes(log.status) &&
          new Date(log.actionTime).toDateString() === today
        );
      });

      setUpcomingDoses(filteredUpcoming);
    } catch (err) {
      console.error("Failed to fetch upcoming doses:", err);
    }
  };

  useEffect(() => {
    fetchUpcomingDoses();
  }, []);

  // Handle marking a dose as Taken/Skipped
  const handleDoseAction = async (dose, status) => {
    try {
      await medicineApi.createDoseLog({
        scheduleId: dose.scheduleId,
        medicationName: dose.medicationName,
        time: dose.time,
        scheduledTime: new Date(new Date().toDateString() + ' ' + dose.time).toISOString(),
        actionTime: new Date().toISOString(),
        status
      });

      // Remove dose from upcoming list immediately
      setUpcomingDoses((prev) =>
        prev.filter(d => !(d.scheduleId === dose.scheduleId && d.time === dose.time))
      );
    } catch (err) {
      console.error("Failed to log dose:", err);
    }
  };

  // Navigate to hidden/secret page when a medicine is selected
  const handleSelectMedicine = (medicine) => {
    navigate("/medicine-secret", { state: { medicine } });
    setQuery("");
    setSuggestions([]);
  };

  // Suggestions Portal
  const SuggestionsPortal = () => {
    if (!suggestions.length) return null;
    return ReactDOM.createPortal(
      <div
        style={{
          position: "absolute",
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          zIndex: 9999,
        }}
        className="bg-black/70 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto"
      >
        {suggestions.map((med, i) => (
          <button
            key={i}
            className="block w-full text-left px-4 py-2 text-gray-200 hover:bg-purple-700/50"
            onClick={() => handleSelectMedicine(med)}
          >
            {med.name}
          </button>
        ))}
      </div>,
      document.body
    );
  };

  // Bell Dropdown Portal
  const BellDropdownPortal = () => {
    if (!showBellDropdown || !upcomingDoses.length) return null;

    // Fit dropdown inside screen
    const dropdownLeft = bellDropdownPosition.left;
    const availableWidth = window.innerWidth - dropdownLeft - 10; // 10px padding from right
    const dropdownWidth = Math.min(bellDropdownPosition.width, availableWidth);

    return ReactDOM.createPortal(
      <div
        style={{
          position: "absolute",
          top: bellDropdownPosition.top,
          left: dropdownLeft,
          width: dropdownWidth,
          zIndex: 9999,
        }}
        className="bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg max-h-64 overflow-y-auto p-2"
      >
        {upcomingDoses.map((dose, i) => (
          <div key={i} className="flex justify-between items-center px-2 py-1 hover:bg-purple-700/20 rounded-md">
            <div>
              <p className="text-white font-semibold">{dose.medicationName}</p>
              <p className="text-gray-300 text-sm">{dose.time}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDoseAction(dose, "Taken")}
                className="bg-green-500/20 text-green-300 p-1 rounded hover:bg-green-500/40"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => handleDoseAction(dose, "Skipped")}
                className="bg-red-500/20 text-red-300 p-1 rounded hover:bg-red-500/40"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
        {upcomingDoses.length === 0 && <p className="text-gray-400 text-center py-2">No upcoming doses</p>}
      </div>,
      document.body
    );
  };

  const handleBellClick = () => {
    if (bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      setBellDropdownPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: 240 });
    }
    setShowBellDropdown(prev => !prev);
  };

  return (
    <div className="h-16 glass-card flex items-center justify-between px-6 relative">
      {/* Search input */}
      <div className="relative w-full max-w-xs">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-gray-400" size={20} />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search medicines..."
          className="w-full bg-transparent border border-transparent rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus-accent"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        {/* Bell */}
        <div className="relative" ref={bellRef}>
          <button
            className="text-gray-400 hover:text-white relative"
            onClick={handleBellClick}
          >
            <Bell size={22} />
            {upcomingDoses.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {upcomingDoses.length}
              </span>
            )}
          </button>
        </div>

        {/* User */}
        <div className="flex items-center space-x-2">
          <div className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-tr from-purple-600 to-pink-500 shadow-md flex items-center justify-center">
            {user?.photo ? (
              <img
                className="h-full w-full object-cover"
                src={`${user.photo.startsWith("/uploads") ? user.photo : `/uploads${user.photo}`}`}
                alt="User"
                onError={(e) => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}`; }}
              />
            ) : (
              <img
                className="h-full w-full object-cover"
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}`}
                alt="User"
              />
            )}
          </div>
          <div>
            <span className="text-white font-medium">{user?.name}</span>
            <p className="text-xs text-gray-400">Patient</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700"
        >
          <LogOut size={22} />
        </button>
      </div>

      {/* Portals */}
      <SuggestionsPortal />
      <BellDropdownPortal />
    </div>
  );
};

export default Topbar;
