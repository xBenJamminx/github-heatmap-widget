# GitHub Heatmap Widget

A lightweight, customizable GitHub contribution heatmap widget for React. Perfect for portfolio sites, dashboards, and developer profiles.

![GitHub Heatmap Widget](https://img.shields.io/npm/v/github-heatmap-widget)

## Features

- Real contribution data via GitHub GraphQL API
- Fully customizable colors and sizing
- Lightweight (~2KB gzipped)
- TypeScript support
- Works with any React framework (Next.js, Vite, CRA, etc.)

## Installation

```bash
npm install github-heatmap-widget
```

## Quick Start

### 1. Set up the API endpoint

Copy `api/github-contributions.ts` to your project's API directory (e.g., `api/` for Vercel, `netlify/functions/` for Netlify).

### 2. Create a GitHub Token

**IMPORTANT: You must use a Classic Personal Access Token. Fine-grained tokens do NOT return full contribution data.**

1. Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (for private repo contributions)
   - `read:user` (for user profile data)
4. Copy the token

### 3. Add the token to your environment

```bash
# .env.local (Vercel)
GITHUB_TOKEN=ghp_your_token_here

# Or set it in your hosting platform's environment variables
```

### 4. Use the component

```tsx
import { GitHubHeatmap } from 'github-heatmap-widget';

function App() {
  return (
    <GitHubHeatmap
      apiUrl="/api/github-contributions"
      username="your-github-username"
      weeks={26}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiUrl` | `string` | **required** | Your API endpoint URL |
| `username` | `string` | **required** | GitHub username |
| `weeks` | `number` | `26` | Number of weeks to display (max: 53) |
| `colorTheme` | `ColorTheme` | GitHub default | Custom color theme |
| `cellSize` | `number` | `5` | Size of each cell in pixels |
| `cellGap` | `number` | `1` | Gap between cells in pixels |
| `showLoading` | `boolean` | `true` | Show loading spinner |
| `linkToProfile` | `boolean` | `true` | Link to GitHub profile on click |
| `className` | `string` | `''` | Custom class name |

## Custom Color Themes

```tsx
<GitHubHeatmap
  apiUrl="/api/github-contributions"
  username="xBenJamminx"
  colorTheme={{
    0: '#161b22',  // No contributions
    1: '#0e4429',  // 1st quartile
    2: '#006d32',  // 2nd quartile
    3: '#26a641',  // 3rd quartile
    4: '#39d353',  // 4th quartile (most)
  }}
/>
```

### Example Themes

#### Emerald
![Emerald theme](./assets/theme-emerald.svg)
```tsx
colorTheme={{
  0: 'rgba(39, 39, 42, 0.6)',
  1: 'rgba(6, 78, 59, 0.8)',
  2: '#047857',
  3: '#10b981',
  4: '#34d399',
}}
```

#### GitHub Default
![GitHub theme](./assets/theme-github.svg)
```tsx
colorTheme={{
  0: '#161b22',
  1: '#0e4429',
  2: '#006d32',
  3: '#26a641',
  4: '#39d353',
}}
```

#### Purple
![Purple theme](./assets/theme-purple.svg)
```tsx
colorTheme={{
  0: '#161b22',
  1: '#3b0764',
  2: '#7c3aed',
  3: '#a78bfa',
  4: '#c4b5fd',
}}
```

#### Blue
![Blue theme](./assets/theme-blue.svg)
```tsx
colorTheme={{
  0: '#161b22',
  1: '#0c4a6e',
  2: '#0369a1',
  3: '#0ea5e9',
  4: '#7dd3fc',
}}
```

#### Orange / Amber
![Orange theme](./assets/theme-orange.svg)
```tsx
colorTheme={{
  0: '#161b22',
  1: '#78350f',
  2: '#b45309',
  3: '#f59e0b',
  4: '#fcd34d',
}}
```

#### Pink / Rose
![Pink theme](./assets/theme-pink.svg)
```tsx
colorTheme={{
  0: '#161b22',
  1: '#831843',
  2: '#db2777',
  3: '#f472b6',
  4: '#fbcfe8',
}}
```

## Why Classic Tokens?

GitHub's fine-grained personal access tokens have a limitation: they don't return contribution data from private repositories, even with "All repositories" access. This is because contribution data is tied to your user profile, not individual repositories.

Classic tokens with `repo` and `read:user` scopes provide full access to your contribution graph, including private repo contributions.

## API Response Format

The API returns data in this format:

```json
{
  "totalContributions": 2014,
  "weeks": [
    [
      { "date": "2024-06-30", "count": 5, "level": 2 },
      { "date": "2024-07-01", "count": 0, "level": 0 },
      ...
    ],
    ...
  ]
}
```

## Self-Hosting the API

If you don't want to use Vercel, you can adapt the API for any platform:

### Express.js
```js
app.get('/api/github-contributions', async (req, res) => {
  // Copy the handler logic from api/github-contributions.ts
});
```

### Netlify Functions
```js
// netlify/functions/github-contributions.ts
export const handler = async (event) => {
  // Adapt the handler for Netlify's format
};
```

## Local Development

The component fetches data from your API endpoint. For local development:

1. Use `vercel dev` (if using Vercel) to run API routes locally
2. Or point `apiUrl` to your production API during development

## License

MIT © Ben Jammin
