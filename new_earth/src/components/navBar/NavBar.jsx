import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NavBar.css";
import supabase from "../../services/supabaseClient";

import goldCross from "../../assets/goldcross.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has a saved preference, otherwise default to system preference
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Apply dark mode to document
    if (isDarkMode) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
    // Save preference
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsDropdownOpen(false); // Close dropdown on auth state change
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Get username from user metadata display name
  const getUsername = () => {
    if (!user) return null;
    return (
      user.user_metadata?.username ||
      user.user_metadata?.username ||
      user.user_metadata?.full_name ||
      "User"
    );
  };

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    // Use explicit "local" scope: default "global" can fail (403, cookie issues) or
    // break in production when bundlers rewrite the identifier `global`.
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      console.warn(
        "Sign out request failed, clearing session in browser:",
        error.message,
      );
      try {
        for (const key of Object.keys(localStorage)) {
          if (key.endsWith("-auth-token")) localStorage.removeItem(key);
        }
      } catch {
        /* ignore */
      }
      window.location.assign("/");
      return;
    }
    navigate("/");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <a href="/faith-and-worship">
          <img
            src={goldCross}
            alt="Gold Cross of Life"
            className="navbar-logo"
          />
        </a>
        <Link to="/" className="navbar-home-link">
          Home
        </Link>
        <Link to="/about" className="navbar-about-link">
          About
        </Link>
      </div>

      <div className="navbar-center">
        <h1 className="navbar-title">New Earth</h1>
      </div>

      <div className="navbar-right">
        {user && (
          <div className="username-dropdown-container" ref={dropdownRef}>
            <button
              className="navbar-username"
              onClick={toggleDropdown}
              aria-label="User menu"
            >
              {getUsername()}
            </button>
            {isDropdownOpen && (
              <div className="username-dropdown">
                <Link
                  to="/profile"
                  className="dropdown-item"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="dropdown-item"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Settings
                </Link>
                <button className="dropdown-item" onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
        <button
          className="theme-toggle"
          onClick={toggleDarkMode}
          aria-label={
            isDarkMode ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
