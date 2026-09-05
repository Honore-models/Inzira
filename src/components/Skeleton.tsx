"use client";

/**
 * Reusable skeleton loading component with shimmer animation.
 *
 * Usage:
 *   <Skeleton className="h-4 w-32" />
 *   <Skeleton className="h-20 rounded-xl" />
 *   <SkeletonGroup count={3} className="h-16" />
 */

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return <div className={`skeleton ${className}`} style={style} />;
}

interface SkeletonGroupProps {
  count?: number;
  className?: string;
  gap?: number;
}

export function SkeletonGroup({
  count = 3,
  className = "",
  gap = 12,
}: SkeletonGroupProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={className} />
      ))}
    </div>
  );
}

/* --- Pre-built skeleton layouts --- */

export function CardSkeleton() {
  return (
    <div className="skeleton-card">
      <Skeleton className="skeleton-circle" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton className="skeleton-line-short" />
        <Skeleton className="skeleton-line-long" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="skeleton-dashboard">
      {/* Welcome card skeleton */}
      <div className="skeleton-welcome">
        <div className="skeleton-welcome-left">
          <Skeleton className="skeleton-circle-lg" />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <Skeleton className="skeleton-line-medium" />
            <Skeleton className="skeleton-line-short" />
          </div>
        </div>
        <Skeleton className="skeleton-block" style={{ width: 160, height: 80 }} />
      </div>

      {/* Quick cards skeleton */}
      <div className="skeleton-grid-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-quick-card">
            <Skeleton className="skeleton-circle-sm" />
            <Skeleton className="skeleton-line-medium" />
            <Skeleton className="skeleton-line-short" />
          </div>
        ))}
      </div>

      {/* Roadmap items skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Skeleton className="skeleton-line-short" style={{ width: 100 }} />
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-roadmap-item">
            <Skeleton className="skeleton-circle-sm" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <Skeleton className="skeleton-line-medium" />
              <Skeleton className="skeleton-line-short" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="skeleton-chat">
      {[1, 2].map((i) => (
        <div key={i} className="skeleton-chat-bubble">
          <Skeleton className="skeleton-line-long" />
          <Skeleton className="skeleton-line-medium" />
          <Skeleton className="skeleton-line-short" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        <Skeleton className="skeleton-line-short" />
        <Skeleton className="skeleton-line-short" />
        <Skeleton className="skeleton-line-short" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          <Skeleton className="skeleton-circle-sm" />
          <Skeleton className="skeleton-line-medium" />
          <Skeleton className="skeleton-line-short" />
          <Skeleton className="skeleton-line-short" />
        </div>
      ))}
    </div>
  );
}
