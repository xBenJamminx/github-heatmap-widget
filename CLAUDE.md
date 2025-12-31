# AI Instructions for github-heatmap-widget

This file provides instructions for AI coding assistants (Claude, GPT, Copilot, etc.) on how to integrate github-heatmap-widget into projects.

## What is github-heatmap-widget?

A lightweight React component that displays a GitHub contribution heatmap. It fetches real contribution data via the GitHub GraphQL API and renders it as a customizable heatmap grid.

## Quick Setup (Copy-Paste Ready)

### 1. Install the package

```bash
npm install github-heatmap-widget
```

### 2. Create the API endpoint

Create `api/github-contributions.ts` (for Vercel) or adapt for your platform:

```typescript
// api/github-contributions.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!username) {
    return new Response(JSON.stringify({ error: 'Username required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const query = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                contributionLevel
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
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { username, from, to }
    }),
  });

  const data = await response.json();

  if (data.errors) {
    return new Response(JSON.stringify({ error: data.errors[0].message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const calendar = data.data.user.contributionsCollection.contributionCalendar;

  return new Response(JSON.stringify({
    totalContributions: calendar.totalContributions,
    weeks: calendar.weeks.map((week: any) =>
      week.contributionDays.map((day: any) => ({
        date: day.date,
        count: day.contributionCount,
        level: ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE']
          .indexOf(day.contributionLevel)
      }))
    )
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### 3. Set up the GitHub token

**IMPORTANT: Must use a Classic Personal Access Token (not fine-grained)**

1. Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Generate new token (classic) with scopes:
   - `repo` (for private repo contributions)
   - `read:user` (for user profile data)
3. Add to environment:

```bash
# .env.local
GITHUB_TOKEN=ghp_your_token_here
```

### 4. Use the component

```tsx
'use client'; // If using Next.js App Router

import { GitHubHeatmap } from 'github-heatmap-widget';

export function ContributionHeatmap() {
  return (
    <GitHubHeatmap
      apiUrl="/api/github-contributions"
      username="your-github-username"
      weeks={26}
    />
  );
}
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiUrl` | `string` | **required** | Your API endpoint URL |
| `username` | `string` | **required** | GitHub username |
| `weeks` | `number` | `26` | Number of weeks to display (max: 53) |
| `startDate` | `string` | - | Custom start date (`YYYY-MM-DD`) |
| `endDate` | `string` | today | Custom end date (`YYYY-MM-DD`) |
| `colorTheme` | `ColorTheme` | GitHub default | Custom color theme |
| `cellSize` | `number` | `5` | Cell size in pixels |
| `cellGap` | `number` | `1` | Gap between cells in pixels |
| `showLoading` | `boolean` | `true` | Show loading spinner |
| `linkToProfile` | `boolean` | `true` | Link to GitHub profile on click |
| `className` | `string` | `''` | Custom CSS class |

## Custom Color Themes

```tsx
<GitHubHeatmap
  apiUrl="/api/github-contributions"
  username="octocat"
  colorTheme={{
    0: '#161b22',  // No contributions (background)
    1: '#0e4429',  // 1st quartile (light)
    2: '#006d32',  // 2nd quartile
    3: '#26a641',  // 3rd quartile
    4: '#39d353',  // 4th quartile (most)
  }}
/>
```

### Popular Color Themes

```typescript
// Emerald (dark background)
const emerald = {
  0: 'rgba(39, 39, 42, 0.6)',
  1: 'rgba(6, 78, 59, 0.8)',
  2: '#047857',
  3: '#10b981',
  4: '#34d399',
};

// Purple
const purple = {
  0: '#161b22',
  1: '#3b0764',
  2: '#7c3aed',
  3: '#a78bfa',
  4: '#c4b5fd',
};

// Blue
const blue = {
  0: '#161b22',
  1: '#0c4a6e',
  2: '#0369a1',
  3: '#0ea5e9',
  4: '#7dd3fc',
};

// Amber/Orange
const amber = {
  0: '#161b22',
  1: '#78350f',
  2: '#b45309',
  3: '#f59e0b',
  4: '#fcd34d',
};
```

## Common Use Cases

### Portfolio Site

```tsx
<section className="my-12">
  <h2>Contributions</h2>
  <GitHubHeatmap
    apiUrl="/api/github-contributions"
    username="your-username"
    weeks={26}
    colorTheme={emeraldTheme}
    cellSize={6}
  />
</section>
```

### Dashboard with Full Year

```tsx
<GitHubHeatmap
  apiUrl="/api/github-contributions"
  username="your-username"
  weeks={53}
  cellSize={4}
  cellGap={2}
/>
```

### Custom Date Range

```tsx
<GitHubHeatmap
  apiUrl="/api/github-contributions"
  username="your-username"
  startDate="2024-01-01"
  endDate="2024-06-30"
/>
```

## Troubleshooting

### 401 Unauthorized
- Token is expired or invalid
- Make sure it's a **Classic** token (starts with `ghp_`)
- Token needs `read:user` and `repo` scopes

### No Contribution Data
- Fine-grained tokens don't return contribution data
- Switch to a Classic personal access token

### Empty Heatmap
- Check browser console for API errors
- Verify username exists and has public activity
- Confirm `apiUrl` is correct

## Environment Variables

```bash
# Required
GITHUB_TOKEN=ghp_your_classic_token_here
```

## Why Classic Tokens?

GitHub's fine-grained tokens have a limitation: they don't return contribution data from private repositories, even with "All repositories" access. Classic tokens with `repo` and `read:user` scopes provide full access to your contribution graph.
