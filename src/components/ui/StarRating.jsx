import React, { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * StarRating - Display/input component for ratings.
 * Internal value: 0-10 (integer). Displayed as 0-5 stars with half-star increments.
 *
 * Props:
 *  - value: 0-10 integer (current rating)
 *  - onChange: (value: number) => void (if interactive)
 *  - readOnly: boolean (display only)
 *  - size: 'sm' | 'md' | 'lg'
 *  - showValue: boolean (show numeric value next to stars)
 *  - count: number (show total ratings count)
 */
export default function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = 'md',
  showValue = false,
  count,
  className = '',
}) {
  const [hoverValue, setHoverValue] = useState(null);

  const displayValue = hoverValue !== null ? hoverValue : value;
  const stars = displayValue / 2; // 0-5

  const sizeClass = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  }[size];

  const textClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  const handleClick = (starIndex, isHalf) => {
    if (readOnly || !onChange) return;
    const newValue = isHalf ? starIndex * 2 - 1 : starIndex * 2;
    onChange(newValue);
  };

  const handleMouseMove = (e, starIndex) => {
    if (readOnly || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    const newValue = isHalf ? starIndex * 2 - 1 : starIndex * 2;
    setHoverValue(newValue);
  };

  const handleMouseLeave = () => {
    if (readOnly || !onChange) return;
    setHoverValue(null);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div
        className="flex items-center"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const fillLevel = Math.min(Math.max(stars - (starIndex - 1), 0), 1);

          return (
            <div
              key={starIndex}
              className={`relative ${!readOnly ? 'cursor-pointer' : ''}`}
              onMouseMove={(e) => handleMouseMove(e, starIndex)}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const isHalf = x < rect.width / 2;
                handleClick(starIndex, isHalf);
              }}
            >
              {/* Background star (empty) */}
              <Star className={`${sizeClass} text-gray-300`} />

              {/* Filled overlay */}
              {fillLevel > 0 && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillLevel * 100}%` }}
                >
                  <Star className={`${sizeClass} text-amber-400 fill-amber-400`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showValue && (
        <span className={`${textClass} font-semibold text-amber-600 ml-1`}>
          {(value / 2).toFixed(1)}
        </span>
      )}

      {count !== undefined && count > 0 && (
        <span className={`${textClass} text-gray-400 ml-0.5`}>
          ({count})
        </span>
      )}
    </div>
  );
}
