import React, { useState, useEffect } from "react";
import supabase from "../../services/supabaseClient";
import "./Likes.css";

const Likes = ({ post, schema = "faith_and_worship", tableName = "post" }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post?.likes || 0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // Get current authenticated user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
        }
      } catch (error) {
        console.error("Error getting user:", error);
      }
    };

    getCurrentUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check if current user has liked this post
  useEffect(() => {
    if (userId && post?.like_uid && Array.isArray(post.like_uid)) {
      setIsLiked(post.like_uid.includes(userId));
    } else {
      setIsLiked(false);
    }
  }, [userId, post?.like_uid]);

  // Update likes count when post changes
  useEffect(() => {
    setLikesCount(post?.likes || 0);
  }, [post?.likes]);

  const handleLike = async () => {
    if (!userId) {
      console.warn("User must be logged in to like posts");
      return;
    }

    if (!post) {
      console.error("Post is required");
      return;
    }

    // Check for id field - it might be named differently in some schemas
    const postId = post.post_id;
    if (!postId) {
      console.error("Post ID is required. Post object:", post);
      return;
    }

    setLoading(true);

    try {
      const currentLikeUid = post.like_uid || [];
      const isCurrentlyLiked =
        Array.isArray(currentLikeUid) && currentLikeUid.includes(userId);
      const newLikeState = !isCurrentlyLiked;

      // Prepare new like_uid array
      let newLikeUid;
      if (newLikeState) {
        // Add user ID to array if not already present
        newLikeUid = Array.isArray(currentLikeUid)
          ? [...currentLikeUid, userId]
          : [userId];
      } else {
        // Remove user ID from array
        newLikeUid = Array.isArray(currentLikeUid)
          ? currentLikeUid.filter((id) => id !== userId)
          : [];
      }

      // Calculate new likes count
      // Note: Per requirements, both liking and unliking add 1 to the count
      const newLikesCount = (post.likes || 0) + 1;

      // Update the post in the database
      const { error: updateError } = await supabase
        .schema(schema)
        .from(tableName)
        .update({
          likes: newLikesCount,
          like_uid: newLikeUid,
        })
        .eq("id", postId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setIsLiked(newLikeState);
      setLikesCount(newLikesCount);
    } catch (error) {
      console.error("Error updating like:", error);
      // Optionally show an error message to the user
    } finally {
      setLoading(false);
    }
  };

  // Don't render if post is missing or doesn't have an ID
  if (!post) {
    return null;
  }

  const postId = post.post_id;
  if (!postId) {
    return null;
  }

  return (
    <div className="likes-container">
      <button
        className={`like-button ${isLiked ? "liked" : ""}`}
        onClick={handleLike}
        disabled={loading || !userId}
        aria-label={isLiked ? "Unlike" : "Like"}
      >
        <span className="heart-emoji">{isLiked ? "❤️" : "🤍"}</span>
        {likesCount > 0 && <span className="likes-count">{likesCount}</span>}
      </button>
    </div>
  );
};

export default Likes;
