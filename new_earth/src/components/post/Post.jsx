import React, { useState, useRef, useEffect } from "react";
import supabase from "../../services/supabaseClient";
import "./Post.css";

const Post = ({ tableName, schema = "public", onPostSuccess }) => {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");
  const editorRef = useRef(null);

  // Get current user
  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  };

  // Format text functions
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleInput = (e) => {
    setContent(e.target.innerHTML);
  };

  const handlePost = async () => {
    if (!content.trim() || !editorRef.current?.innerText.trim()) {
      setError("Please enter some content before posting.");
      return;
    }

    if (!tableName) {
      setError("Table name is required.");
      return;
    }

    setIsPosting(true);
    setError("");

    try {
      const user = await getCurrentUser();
      if (!user) {
        setError("You must be logged in to post.");
        setIsPosting(false);
        return;
      }

      // Get plain text and HTML content
      //const plainText = editorRef.current.innerText;
      const htmlContent = editorRef.current.innerHTML;

      // Get display_name from user metadata
      const displayName =
        user.user_metadata?.display_name ||
        user.email?.split("@")[0] ||
        "Anonymous";

      // Insert post into the specified table and schema
      const { data, error: insertError } = await supabase
        .schema(schema)
        .from(tableName)
        .insert([
          {
            content: htmlContent,
            // content_text: plainText,
            user_id: user.id,
            username: displayName,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (insertError) {
        throw insertError;
      }

      // Clear the editor
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
        setContent("");
      }

      // Call success callback if provided
      if (onPostSuccess) {
        onPostSuccess(data[0]);
      }
    } catch (err) {
      setError(err.message || "Failed to post. Please try again.");
      console.error("Post error:", err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="post-container">
      <div className="post-editor-wrapper">
        <div
          ref={editorRef}
          className="post-editor"
          contentEditable
          onInput={handleInput}
          data-placeholder="What's on your mind?"
          suppressContentEditableWarning={true}
        />
        <div className="post-footer">
          <div className="post-toolbar">
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => formatText("bold")}
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => formatText("italic")}
              title="Italic"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => formatText("formatBlock", "h3")}
              title="Header"
            >
              H
            </button>
          </div>
          <div className="post-error">{error}</div>
          <button
            className="post-button"
            onClick={handlePost}
            disabled={isPosting || !content.trim()}
          >
            {isPosting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Post;
