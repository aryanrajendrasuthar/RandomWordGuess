import React, { useEffect, useState } from 'react';

interface Props {
  score: number;
}

function getColor(score: number): string {
  if (score <= 30) return 'bg-red-500';
  if (score <= 60) return 'bg-orange-400';
  if (score <= 80) return 'bg-yellow-400';
  if (score < 100) return 'bg-green-400';
  return 'bg-yellow-300';
}

function getLabel(score: number): string {
  if (score <= 15) return 'Completely unrelated';
  if (score <= 40) return 'Loosely related';
  if (score <= 70) return 'Same broad category';
  if (score <= 90) return 'Very close!';
  if (score < 100) return 'Extremely close!';
  return 'Exact match!';
}

export default function ScoreBar({ score }: Props) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = requestAnimationFrame(() => setWidth(score));
    return () => cancelAnimationFrame(t);
  }, [score]);

  const colorClass = getColor(score);

  return (
    <div className="flex-1 flex flex-col gap-1">
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className={`${colorClass} h-3 rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-xs text-gray-400">{getLabel(score)}</span>
    </div>
  );
}
