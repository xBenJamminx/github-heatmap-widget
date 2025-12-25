import React, { useEffect, useState } from 'react';
import type { GitHubHeatmapProps, ContributionDay, ContributionWeek, ColorTheme } from './types';

const defaultColorTheme: ColorTheme = {
  0: '#161b22',
  1: '#0e4429',
  2: '#006d32',
  3: '#26a641',
  4: '#39d353',
};

export const GitHubHeatmap: React.FC<GitHubHeatmapProps> = ({
  apiUrl,
  username,
  weeks = 26,
  startDate,
  endDate,
  colorTheme = defaultColorTheme,
  cellSize = 5,
  cellGap = 1,
  showLoading = true,
  linkToProfile = true,
  className = '',
}) => {
  const [data, setData] = useState<ContributionWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [totalContributions, setTotalContributions] = useState(0);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        // Build query params - use date range if provided, otherwise use weeks
        const params = new URLSearchParams({ username });
        if (startDate) {
          params.set('startDate', startDate);
          params.set('endDate', endDate || new Date().toISOString().split('T')[0]);
        } else {
          params.set('weeks', String(weeks));
        }

        const response = await fetch(`${apiUrl}?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch');
        }

        const result = await response.json();

        // Add month labels to weeks
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let lastMonth = -1;

        const weeksWithLabels: ContributionWeek[] = result.weeks.map((weekDays: ContributionDay[]) => {
          let monthLabel: string | undefined;

          if (weekDays.length > 0 && weekDays[0].date) {
            const date = new Date(weekDays[0].date);
            const month = date.getMonth();
            if (month !== lastMonth) {
              monthLabel = monthNames[month];
              lastMonth = month;
            }
          }

          return { days: weekDays, monthLabel };
        });

        setData(weeksWithLabels);
        setTotalContributions(result.totalContributions);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch contributions:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchContributions();
  }, [apiUrl, username, weeks, startDate, endDate]);

  if (loading && showLoading) {
    return (
      <div className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
        <div style={{ width: '10px', height: '10px', border: '2px solid #666', borderTopColor: '#999', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '10px', color: '#666' }}>Loading...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || data.length === 0) return null;

  const firstMonth = data.find(w => w.monthLabel)?.monthLabel || '';
  const lastMonth = [...data].reverse().find(w => w.monthLabel)?.monthLabel || '';

  const content = (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} className={className}>
      {/* Heatmap grid */}
      <div style={{ display: 'flex', gap: `${cellGap}px` }}>
        {data.map((week, weekIndex) => (
          <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: `${cellGap}px` }}>
            {week.days.map((day, dayIndex) => (
              <div
                key={day.date || dayIndex}
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  borderRadius: '1px',
                  backgroundColor: colorTheme[day.level],
                }}
                title={`${day.date}: ${day.count} contributions`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '8px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
        <span style={{ fontSize: '8px', color: '#888' }}>
          {firstMonth}–{lastMonth}
        </span>
        <span style={{ fontSize: '10px', fontWeight: 600, color: '#fff' }}>
          {totalContributions.toLocaleString()}
        </span>
      </div>
    </div>
  );

  if (linkToProfile) {
    return (
      <a
        href={`https://github.com/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none' }}
      >
        {content}
      </a>
    );
  }

  return content;
};
