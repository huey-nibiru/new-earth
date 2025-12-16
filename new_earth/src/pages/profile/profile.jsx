import { useState, useEffect } from "react";
import supabase from "../../services/supabaseClient";
import "./profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postCount, setPostCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get initial session
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (session?.user) {
          setUser(session.user);

          // Fetch post count from various schemas
          try {
            const schemas = ["faith_and_worship", "public"];
            let totalPosts = 0;

            for (const schema of schemas) {
              const { count, error: countError } = await supabase
                .schema(schema)
                .from("post")
                .select("*", { count: "exact", head: true })
                .eq("user_id", session.user.id);

              if (!countError && count) {
                totalPosts += count;
              }
            }

            setPostCount(totalPosts);
          } catch (err) {
            console.error("Error fetching post count:", err);
            // Don't set error state for post count, just log it
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load profile");
        console.error("Profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fetch post count when user changes
        const fetchPostCount = async () => {
          try {
            const schemas = ["faith_and_worship", "public"];
            let totalPosts = 0;

            for (const schema of schemas) {
              const { count, error: countError } = await supabase
                .schema(schema)
                .from("post")
                .select("*", { count: "exact", head: true })
                .eq("user_id", session.user.id);

              if (!countError && count) {
                totalPosts += count;
              }
            }

            setPostCount(totalPosts);
          } catch (err) {
            console.error("Error fetching post count:", err);
          }
        };
        fetchPostCount();
      } else {
        setPostCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDisplayName = () => {
    if (!user) return "N/A";
    return (
      user.user_metadata?.username ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "User"
    );
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="page-content">
          <div className="loading-container">
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="page-content">
          <div className="profile-card">
            <h2>Not Authenticated</h2>
            <p>Please log in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="page-content">
        <h1>Profile 👤</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {getDisplayName().charAt(0).toUpperCase()}
            </div>
            <h2>{getDisplayName()}</h2>
          </div>

          <div className="profile-info">
            <div className="info-section">
              <h3>Account Information</h3>
              <div className="info-item">
                <span className="info-label">Display Name:</span>
                <span className="info-value">{getDisplayName()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{user.email || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">User ID:</span>
                <span className="info-value user-id">{user.id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Account Created:</span>
                <span className="info-value">
                  {formatDate(user.created_at)}
                </span>
              </div>
            </div>

            <div className="info-section">
              <h3>Activity</h3>
              <div className="info-item">
                <span className="info-label">Total Posts:</span>
                <span className="info-value highlight">{postCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
