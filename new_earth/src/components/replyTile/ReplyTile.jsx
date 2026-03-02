import React, { useState, useEffect } from "react";
import supabase from "../../services/supabaseClient";
import "./ReplyTile.css";

const ReplyTile = ({ postId }) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [replyText, setReplyText] = useState("");

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes} 🕰️ ${month}/${day}/${year}`;
  };

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  };

  const fetchReplies = async () => {
    if (!postId) return;

    try {
      setLoading(true);
      setError(null);

      const { data: fetchedReplies, error: fetchError } = await supabase
        .schema("faith_and_worship")
        .from("replies")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setReplies(fetchedReplies || []);
    } catch (err) {
      console.error("Error fetching replies:", err);
      setError(err.message || "Failed to load replies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReplies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleReplySubmit = async () => {
    const text = replyText.trim();
    if (!text || !postId) return;

    try {
      setLoading(true);
      setError(null);

      const user = await getCurrentUser();
      if (!user) {
        setError("You must be logged in to reply.");
        return;
      }

      const { error: insertError } = await supabase
        .schema("faith_and_worship")
        .from("replies")
        .insert([
          {
            reply_text: text,
            post_id: postId,
            user_id: user.id,
            created_at: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        throw insertError;
      }

      setReplyText("");
      await fetchReplies();
    } catch (err) {
      console.error("Error adding reply:", err);
      setError(err.message || "Failed to add reply");
    } finally {
      setLoading(false);
    }
  };

  if (!postId) {
    return null;
  }

  return (
    <div className="post-replies">
      {loading && !replies.length && (
        <div className="post-replies-loading">Loading replies...</div>
      )}
      {error && <div className="post-replies-error">Error: {error}</div>}
      <div className="post-replies-list">
        {replies.map((reply) => {
          const replyDate = formatDate(reply.created_at);
          return (
            <div
              key={reply.reply_id || reply.id}
              className="post-reply"
            >
              {replyDate && (
                <div className="post-reply-meta">
                  {replyDate}
                  {reply.user_id && (
                    <span className="post-reply-user">
                      {" "}
                      • {reply.user_id}
                    </span>
                  )}
                </div>
              )}
              <div className="post-reply-text">{reply.reply_text}</div>
            </div>
          );
        })}
        {(!replies || replies.length === 0) && !loading && !error && (
          <div className="post-replies-empty">No replies yet.</div>
        )}
      </div>
      <div className="post-reply-form">
        <textarea
          className="post-reply-input"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Write a reply..."
        />
        <button
          type="button"
          className="post-reply-submit"
          onClick={handleReplySubmit}
          disabled={loading || !replyText.trim()}
        >
          Reply
        </button>
      </div>
    </div>
  );
};

export default ReplyTile;

