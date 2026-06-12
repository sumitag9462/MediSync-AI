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
          top: dropdownPosition.top + 6,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          zIndex: 9999,
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(139, 92, 246, 0.15)',
          borderRadius: '16px',
          boxShadow: '0 12px 36px rgba(139,92,246,0.1)',
        }}
        className="max-h-48 overflow-y-auto p-1.5 hide-scrollbar"
      >
        {suggestions.map((med, i) => (
          <button
            key={i}
            className="block w-full text-left px-3.5 py-2 text-sm font-bold rounded-xl transition-all hover:bg-purple-50"
            style={{ color: '#1e293b' }}
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

    const dropdownLeft = bellDropdownPosition.left;
    const availableWidth = window.innerWidth - dropdownLeft - 10;
    const dropdownWidth = Math.min(bellDropdownPosition.width, availableWidth);

    return ReactDOM.createPortal(
      <div
        style={{
          position: "absolute",
          top: bellDropdownPosition.top + 6,
          left: dropdownLeft - 160,
          width: 320,
          zIndex: 9999,
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(139, 92, 246, 0.15)',
          borderRadius: '18px',
          boxShadow: '0 12px 36px rgba(139,92,246,0.12)',
        }}
        className="max-h-64 overflow-y-auto p-2.5 hide-scrollbar"
      >
        <p className="text-[10px] font-extrabold uppercase tracking-widest px-2 mb-2" style={{ color: '#94a3b8' }}>Upcoming Doses</p>
        {upcomingDoses.map((dose, i) => (
          <div key={i} className="flex justify-between items-center px-2 py-2 hover:bg-purple-50/50 rounded-xl transition-all">
            <div>
              <p className="font-extrabold text-xs" style={{ color: '#1e293b' }}>{dose.medicationName}</p>
              <p className="text-[10px] font-bold" style={{ color: '#94a3b8' }}>{dose.time}</p>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleDoseAction(dose, "Taken")}
                className="p-1 rounded-lg hover:scale-105 transition-all text-emerald-600 hover:bg-emerald-50 border border-emerald-100"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => handleDoseAction(dose, "Skipped")}
                className="p-1 rounded-lg hover:scale-105 transition-all text-red-500 hover:bg-red-50 border border-red-100"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
        {upcomingDoses.length === 0 && <p className="text-slate-400 text-center py-2 text-xs">No upcoming doses</p>}
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
    <div style={{
      background: 'var(--bg-navbar)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-card)',
      padding: '14px 32px',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 90,
      boxShadow: '0 1px 0 rgba(139,92,246,0.06)',
    }}>
      {/* Search input */}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: 16, transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <Search className="text-slate-400" size={16} />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search medicines..."
          style={{
            background: 'var(--bg-input)',
            border: '1.5px solid var(--border-input)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px 10px 42px',
            fontSize: '0.875rem',
            color: 'var(--text-heading)',
            width: 280, outline: 'none',
            fontFamily: 'inherit',
          }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4 sm:space-x-6">
        
        {/* AI Assistant Button */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-chatbot'))}
          className="btn-primary"
          style={{ padding: '8px 18px', fontSize: '0.875rem' }}
        >
          ✨ AI Assistant
        </button>
        {/* Bell */}
        <div className="relative" ref={bellRef}>
          <button
            className="text-slate-500 hover:text-slate-800 relative p-1 rounded-xl transition-all"
            onClick={handleBellClick}
          >
            <Bell size={18} />
            {upcomingDoses.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                {upcomingDoses.length}
              </span>
            )}
          </button>
        </div>

        {/* User */}
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-tr from-purple-600 to-pink-500 shadow-sm flex items-center justify-center">
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
          <div className="hidden sm:block text-left">
            <span className="text-xs font-extrabold block leading-tight" style={{ color: '#1e293b' }}>{user?.name}</span>
            <p className="text-[10px] text-slate-400 font-bold">Patient</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="text-slate-400 hover:text-red-500 p-1.5 rounded-xl hover:bg-red-50/50 transition-all"
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* Portals */}
      <SuggestionsPortal />
      <BellDropdownPortal />
    </div>
  );
};

export default Topbar;
