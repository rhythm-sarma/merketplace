"use client";

import { useState, useRef, useCallback } from "react";
import { X, GripVertical, ZoomIn, Star } from "lucide-react";

interface ImageGalleryManagerProps {
  images: string[];
  onReorder: (images: string[]) => void;
  onRemove: (index: number) => void;
}

export default function ImageGalleryManager({
  images,
  onReorder,
  onRemove,
}: ImageGalleryManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // Touch drag state
  const touchState = useRef<{
    startX: number;
    startY: number;
    currentIndex: number;
    isDragging: boolean;
  } | null>(null);

  // ---- Drag & Drop (Desktop) ----

  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = "move";
      // Use a transparent 1x1 image as drag ghost — we show our own visual
      const ghost = document.createElement("img");
      ghost.src =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      e.dataTransfer.setDragImage(ghost, 0, 0);
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (draggedIndex !== null && index !== draggedIndex) {
        setDragOverIndex(index);
      }
    },
    [draggedIndex]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === dropIndex) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        return;
      }
      const updated = [...images];
      const [removed] = updated.splice(draggedIndex, 1);
      updated.splice(dropIndex, 0, removed);
      onReorder(updated);
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex, images, onReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // ---- Touch Drag (Mobile) ----

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, index: number) => {
      const touch = e.touches[0];
      touchState.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        currentIndex: index,
        isDragging: false,
      };
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchState.current) return;
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchState.current.startX);
      const dy = Math.abs(touch.clientY - touchState.current.startY);
      if (dx > 10 || dy > 10) {
        touchState.current.isDragging = true;
        setDraggedIndex(touchState.current.currentIndex);
      }

      if (!touchState.current.isDragging) return;

      // Find which element we are over
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el) {
        const card = el.closest("[data-img-index]") as HTMLElement | null;
        if (card) {
          const overIndex = parseInt(card.dataset.imgIndex || "-1", 10);
          if (overIndex >= 0) {
            setDragOverIndex(overIndex);
          }
        }
      }
    },
    []
  );

  const handleTouchEnd = useCallback(() => {
    if (
      touchState.current?.isDragging &&
      draggedIndex !== null &&
      dragOverIndex !== null &&
      draggedIndex !== dragOverIndex
    ) {
      const updated = [...images];
      const [removed] = updated.splice(draggedIndex, 1);
      updated.splice(dragOverIndex, 0, removed);
      onReorder(updated);
    }
    touchState.current = null;
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, dragOverIndex, images, onReorder]);

  // ---- Preview Lightbox ----

  const openPreview = (index: number) => {
    setPreviewIndex(index);
  };

  const closePreview = () => setPreviewIndex(null);

  const navigatePreview = (dir: -1 | 1) => {
    if (previewIndex === null) return;
    const next = previewIndex + dir;
    if (next >= 0 && next < images.length) {
      setPreviewIndex(next);
    }
  };

  if (images.length === 0) return null;

  return (
    <>
      {/* Image Grid */}
      <div className="igm-grid">
        {images.map((url, i) => {
          const isDragged = draggedIndex === i;
          const isOver = dragOverIndex === i && draggedIndex !== i;

          return (
            <div
              key={`${url}-${i}`}
              data-img-index={i}
              className={`igm-card ${isDragged ? "igm-card--dragging" : ""} ${isOver ? "igm-card--over" : ""}`}
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={(e) => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
              onTouchStart={(e) => handleTouchStart(e, i)}
              onTouchMove={(e) => handleTouchMove(e)}
              onTouchEnd={handleTouchEnd}
            >
              {/* Position badge */}
              <span className={`igm-badge ${i === 0 ? "igm-badge--cover" : ""}`}>
                {i === 0 ? (
                  <>
                    <Star size={10} strokeWidth={3} fill="currentColor" /> COVER
                  </>
                ) : (
                  i + 1
                )}
              </span>

              {/* Drag handle */}
              <button
                type="button"
                className="igm-drag-handle"
                title="Drag to reorder"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <GripVertical size={16} strokeWidth={2.5} />
              </button>

              {/* Image */}
              <img
                src={url}
                alt={`Product ${i + 1}`}
                className="igm-img"
                onClick={() => openPreview(i)}
                draggable={false}
              />

              {/* Hover overlay */}
              <div className="igm-overlay" onClick={() => openPreview(i)}>
                <ZoomIn size={24} strokeWidth={2.5} />
                <span>PREVIEW</span>
              </div>

              {/* Remove button */}
              <button
                type="button"
                className="igm-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(i);
                }}
                title="Remove image"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Drag hint */}
      <p className="igm-hint">
        <GripVertical size={14} strokeWidth={2} style={{ display: "inline", verticalAlign: "middle" }} />
        {" "}Drag images to rearrange · Tap to preview · First image is the cover
      </p>

      {/* Lightbox Preview */}
      {previewIndex !== null && (
        <div className="igm-lightbox" onClick={closePreview}>
          <div className="igm-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            {/* Close */}
            <button className="igm-lightbox-close" onClick={closePreview}>
              <X size={20} strokeWidth={3} />
            </button>

            {/* Counter */}
            <span className="igm-lightbox-counter">
              {previewIndex + 1} / {images.length}
            </span>

            {/* Nav Prev */}
            {previewIndex > 0 && (
              <button
                className="igm-lightbox-nav igm-lightbox-prev"
                onClick={() => navigatePreview(-1)}
              >
                ‹
              </button>
            )}

            {/* Image */}
            <img
              src={images[previewIndex]}
              alt={`Preview ${previewIndex + 1}`}
              className="igm-lightbox-img"
            />

            {/* Nav Next */}
            {previewIndex < images.length - 1 && (
              <button
                className="igm-lightbox-nav igm-lightbox-next"
                onClick={() => navigatePreview(1)}
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
