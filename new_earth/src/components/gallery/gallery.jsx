import { useState, useEffect, useRef } from "react";
import "./gallery.css";

const MosaicGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [gridLayout, setGridLayout] = useState({ columns: 4, itemSize: 200 });
  const containerRef = useRef(null);

  // Filter for PNG and JPG files only
  const validImages =
    images?.filter((img) => {
      const ext = img.toLowerCase();
      return (
        ext.endsWith(".png") || ext.endsWith(".jpg") || ext.endsWith(".jpeg")
      );
    }) || [];

  // Calculate optimal grid layout based on viewport and zoom
  useEffect(() => {
    const calculateLayout = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const effectiveWidth = containerWidth * zoomLevel;

      // Determine columns based on effective width
      let columns;
      if (effectiveWidth < 640) {
        columns = 2;
      } else if (effectiveWidth < 1024) {
        columns = 3;
      } else if (effectiveWidth < 1536) {
        columns = 4;
      } else {
        columns = 5;
      }

      // Calculate item size based on zoom level
      const baseSize = 200;
      const itemSize = baseSize / zoomLevel;

      setGridLayout({ columns, itemSize });
    };

    calculateLayout();

    // Recalculate on resize
    window.addEventListener("resize", calculateLayout);
    return () => window.removeEventListener("resize", calculateLayout);
  }, [zoomLevel]);

  // Generate dynamic span classes based on image index and current layout
  const getSpanClass = (index) => {
    const { columns } = gridLayout;

    // Dynamic pattern that adjusts to column count
    if (columns === 2) {
      // More conservative layout for 2 columns
      return index % 5 === 0 ? "col-span-2 row-span-2" : "";
    } else if (columns === 3) {
      // Moderate variety for 3 columns
      if (index % 7 === 0) return "col-span-2 row-span-2";
      if (index % 4 === 0) return "row-span-2";
      return "";
    } else if (columns === 4) {
      // Classic mosaic pattern for 4 columns
      if (index % 7 === 0) return "col-span-2 row-span-2";
      if (index % 5 === 0) return "row-span-2";
      if (index % 3 === 0) return "col-span-2";
      return "";
    } else {
      // More variety for 5+ columns
      if (index % 11 === 0) return "col-span-3 row-span-2";
      if (index % 7 === 0) return "col-span-2 row-span-2";
      if (index % 5 === 0) return "row-span-2";
      if (index % 3 === 0) return "col-span-2";
      return "";
    }
  };

  return (
    <div className="mosaic-gallery-container" ref={containerRef}>
      {/* Zoom Controls */}
      <div className="zoom-controls">
        <button
          onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
          className="zoom-btn"
          disabled={zoomLevel <= 0.5}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </button>
        <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
        <button
          onClick={() => setZoomLevel(Math.min(2.5, zoomLevel + 0.25))}
          className="zoom-btn"
          disabled={zoomLevel >= 2.5}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        <button onClick={() => setZoomLevel(1)} className="zoom-reset-btn">
          Reset
        </button>
        <div className="grid-info">{gridLayout.columns} cols</div>
      </div>

      {/* Mosaic Grid */}
      {validImages.length > 0 && (
        <div
          className="mosaic-grid"
          style={{
            gridTemplateColumns: `repeat(${gridLayout.columns}, 1fr)`,
            gridAutoRows: `${gridLayout.itemSize}px`,
          }}
        >
          {validImages.map((image, index) => {
            const spanClass = getSpanClass(index);

            return (
              <div
                key={`${index}-${gridLayout.columns}`}
                className={`mosaic-item ${spanClass}`}
                onClick={() => setSelectedImage(image)}
              >
                <div className="mosaic-overlay" />

                <img
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className="mosaic-image"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {validImages.length === 0 && (
        <div className="empty-state">
          <div className="empty-text">No images found</div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="lightbox-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="lightbox-close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="lightbox-content">
            <img
              src={selectedImage}
              alt="Full size view"
              className="lightbox-image"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MosaicGallery;
