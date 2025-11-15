import { useState, useEffect } from "react";
import supabase from "../../services/supabaseClient";
import "./settings.css";

const Settings = () => {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Pre-populate with current display name if it exists
        setDisplayName(
          session.user.user_metadata?.display_name ||
            session.user.user_metadata?.full_name ||
            ""
        );
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setDisplayName(
          session.user.user_metadata?.display_name ||
            session.user.user_metadata?.full_name ||
            ""
        );
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: { display_name: displayName.trim() },
      });

      if (updateError) throw updateError;

      setMessage("Display name updated successfully!");
      // Update local user state
      setUser(data.user);
    } catch (err) {
      setError(err.message || "Failed to update display name");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-content">
        <h1>Settings ⚙️</h1>

        <div className="settings-card">
          <h2>Change Display Name</h2>
          <form onSubmit={handleSubmit} className="display-name-form">
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                id="displayName"
                type="text"
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading || !user}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !user}
              className="submit-button"
            >
              {loading ? "Updating..." : "Update Display Name"}
            </button>

            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
