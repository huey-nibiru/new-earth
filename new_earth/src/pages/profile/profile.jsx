import { useState, useEffect } from "react";
import supabase from "../../services/supabaseClient";
import "./profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserPostsAndReplies = async (userId) => {
      const schemas = ["faith_and_worship", "public"];
      const collectedPosts = [];

      for (const schema of schemas) {
        const { data: posts, error: postsError } = await supabase
          .schema(schema)
          .from("post")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (postsError) {
          console.error(`Error fetching posts from ${schema}:`, postsError);
          continue;
        }

        (posts || []).forEach((post) => {
          collectedPosts.push({
            ...post,
            post_id: post.post_id ?? post.id,
            schema,
            replies: [],
          });
        });
      }

      const postIds = collectedPosts
        .map((post) => post.post_id)
        .filter((postId) => postId !== null && postId !== undefined);

      if (postIds.length > 0) {
        const { data: replies, error: repliesError } = await supabase
          .schema("faith_and_worship")
          .from("replies")
          .select("*")
          .in("post_id", postIds)
          .order("created_at", { ascending: true });

        if (repliesError) {
          console.error("Error fetching replies:", repliesError);
        } else {
          const repliesByPostId = {};
          (replies || []).forEach((reply) => {
            if (!repliesByPostId[reply.post_id]) {
              repliesByPostId[reply.post_id] = [];
            }
            repliesByPostId[reply.post_id].push(reply);
          });

          collectedPosts.forEach((post) => {
            post.replies = repliesByPostId[post.post_id] || [];
          });
        }
      }

      collectedPosts.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setUserPosts(collectedPosts);
    };

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
          await fetchUserPostsAndReplies(session.user.id);
        } else {
          setUserPosts([]);
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
        fetchUserPostsAndReplies(session.user.id);
      } else {
        setUserPosts([]);
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

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes} ${month}/${day}/${year}`;
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
                <span className="info-label">Account Created:</span>
                <span className="info-value">
                  {formatDate(user.created_at)}
                </span>
              </div>
            </div>

            <div className="info-section">
              <h3>Posts</h3>
              {userPosts.length === 0 ? (
                <p className="profile-empty-activity">No posts yet.</p>
              ) : (
                <div className="profile-posts-list">
                  {userPosts.map((post, index) => (
                    <div
                      key={post.post_id ?? `${post.schema}-${index}`}
                      className="profile-post-item"
                    >
                      <div className="profile-post-meta">
                        <span>{formatDateTime(post.created_at)}</span>
                        <span className="profile-post-schema"></span>
                      </div>
                      <div className="profile-post-content">{post.content}</div>

                      <div className="profile-replies-block">
                        <h4>Replies ({post.replies.length})</h4>
                        {post.replies.length === 0 ? (
                          <p className="profile-empty-replies">
                            No replies yet.
                          </p>
                        ) : (
                          <div className="profile-replies-list">
                            {post.replies.map((reply) => (
                              <div
                                key={reply.reply_id ?? reply.id}
                                className="profile-reply-item"
                              >
                                <div className="profile-reply-meta">
                                  <span>
                                    {formatDateTime(reply.created_at)}
                                  </span>
                                  <span>{reply.username || "Anonymous"}</span>
                                </div>
                                <div className="profile-reply-text">
                                  {reply.reply_text}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
