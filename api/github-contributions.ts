/**
 * GitHub Contributions API Handler
 *
 * This serverless function fetches contribution data from GitHub's GraphQL API.
 * Deploy this to Vercel, Netlify, or any serverless platform.
 *
 * IMPORTANT: You must use a Classic Personal Access Token (not fine-grained).
 * Fine-grained tokens do not return full contribution data for private repos.
 *
 * Required token scopes:
 * - repo (for private repo contributions)
 * - read:user (for user profile data)
 *
 * Environment variable:
 * - GITHUB_TOKEN: Your classic personal access token
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface GitHubContributionDay {
  contributionCount: number;
  contributionLevel: 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE';
  date: string;
}

interface GitHubContributionWeek {
  contributionDays: GitHubContributionDay[];
}

interface GitHubResponse {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: GitHubContributionWeek[];
        };
      };
    };
  };
  errors?: Array<{ message: string }>;
}

const levelMap: Record<string, 0 | 1 | 2 | 3 | 4> = {
  'NONE': 0,
  'FIRST_QUARTILE': 1,
  'SECOND_QUARTILE': 2,
  'THIRD_QUARTILE': 3,
  'FOURTH_QUARTILE': 4,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, weeks = '26' } = req.query;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required' });
  }

  const weeksToShow = Math.min(Math.max(parseInt(weeks as string, 10) || 26, 1), 53);

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'GitHub token not configured' });
  }

  try {
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  contributionLevel
                  date
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables: { username } }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('GitHub API error:', response.status, text);
      return res.status(response.status).json({ error: 'Failed to fetch from GitHub' });
    }

    const data: GitHubResponse = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return res.status(400).json({ error: data.errors[0]?.message || 'GraphQL error' });
    }

    const calendar = data.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) {
      return res.status(404).json({ error: 'User not found or no contribution data' });
    }

    // Convert GitHub format to our format
    const allWeeks: ContributionDay[][] = calendar.weeks.map(week =>
      week.contributionDays.map(day => ({
        date: day.date,
        count: day.contributionCount,
        level: levelMap[day.contributionLevel] || 0,
      }))
    );

    // Take last N weeks
    const recentWeeks = allWeeks.slice(-weeksToShow);

    // Calculate total for displayed period
    let total = 0;
    recentWeeks.forEach(week => {
      week.forEach(day => {
        total += day.count;
      });
    });

    // Cache for 1 hour
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

    return res.status(200).json({
      totalContributions: total,
      weeks: recentWeeks,
    });
  } catch (error) {
    console.error('GitHub contributions fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch contributions' });
  }
}
