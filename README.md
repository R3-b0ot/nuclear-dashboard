# Nuclear Dashboard

A Spotify-inspired, region-aware dashboard plugin for [Nuclear Music Player](https://github.com/nukeop/nuclear).

> Early development — the first milestone establishes the plugin contract and India regional profile. The visual dashboard layer will follow once the host extension boundary is confirmed.

## Goals

- Spotify-inspired information architecture without copying Spotify branding or assets.
- Region-aware discovery, starting with India.
- Local-first personalization where Nuclear exposes the required data.
- Provider-agnostic adapters so the dashboard is not tied to one music service.
- A clean standalone repository that can be released through Nuclear's plugin registry.

## Planned sections

- Quick Access
- Recently Played
- Made For You
- Trending in India
- Top Indian Artists
- New Releases
- Popular Albums
- Hindi / Marathi / Punjabi / Tamil / Telugu discovery
- International discovery

## Development

```bash
npm install
npm run typecheck
npm run build
```

The plugin currently registers `nuclear-dashboard` and an India regional profile. No external API key is required at this stage.

## Architecture

Nuclear's current dashboard SDK exposes providers for top tracks, top artists, top albums, editorial playlists, and new releases. The host renders those provider results into its dashboard. This project therefore keeps the regional/data layer separate from the eventual dashboard presentation layer.

## Status

- [x] Repository scaffold
- [x] Nuclear SDK provider entrypoint
- [x] India region model
- [ ] Regional data adapters
- [ ] Personalization/history integration
- [ ] Spotify-inspired dashboard presentation
- [ ] Local installation package
- [ ] GitHub Release automation
- [ ] Nuclear Plugin Registry submission

## License

MIT
