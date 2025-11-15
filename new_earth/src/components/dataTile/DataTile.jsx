import React, { useState, useEffect } from "react";
import supabase from "../../services/supabaseClient";
import "./DataTile.css";
// used to display content from the database in a grid format

const DataTile = ({ schema = "public", tableName }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTileId, setExpandedTileId] = useState(null);

  // Format date to mm/dd/yyyy hh:mm
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

  useEffect(() => {
    if (!tableName) {
      setError("Table name is required");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: fetchedData, error: fetchError } = await supabase
          .schema(schema)
          .from(tableName)
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setData(fetchedData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schema, tableName]);

  // Prevent body scroll when tile is expanded
  useEffect(() => {
    if (expandedTileId !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [expandedTileId]);

  if (loading) {
    return (
      <div className="data-tile-container">
        <div className="data-tile-loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="data-tile-container">
        <div className="data-tile-error">Error: {error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="data-tile-container">
        <div className="data-tile-empty">No data found</div>
      </div>
    );
  }

  return (
    <div className="data-tile-container">
      {expandedTileId !== null && (
        <div
          className="data-tile-overlay"
          onClick={() => setExpandedTileId(null)}
        />
      )}
      <div className="data-tile-grid">
        {data.map((item, index) => {
          const content = item.content;
          const formattedDate = formatDate(item.created_at);

          const isExpanded = expandedTileId === (item.id || index);

          return (
            <div
              key={item.id || index}
              className={`data-tile ${isExpanded ? "expanded" : ""}`}
            >
              {isExpanded && (
                <button
                  className="data-tile-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedTileId(null);
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
              )}
              <div
                className={`data-tile-content ${isExpanded ? "expanded" : ""}`}
                onClick={() => {
                  if (!isExpanded) {
                    setExpandedTileId(item.id || index);
                  }
                }}
              >
                {formattedDate && (
                  <div className="data-tile-date">
                    {formattedDate}
                    {item.username && (
                      <span className="data-tile-username">
                        {" "}
                        • {item.username}
                      </span>
                    )}
                  </div>
                )}
                {content &&
                typeof content === "string" &&
                content.includes("<") ? (
                  <div
                    className="data-tile-field data-tile-html"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                ) : (
                  <div className="data-tile-field">
                    <span className="data-tile-value">
                      {content ? String(content) : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DataTile;
