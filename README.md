# Nuclear Dashboard

A Spotify-inspired, region-aware discovery dashboard plugin for [Nuclear Music Player](https://github.com/nukeop/nuclear).

> v0.2.0 — the first release-ready data milestone establishes the plugin contract, persisted region preference, India discovery adapter, CI validation, and release packaging workflow. The visual dashboard layer will follow once the host extension boundary is confirmed.

## Goals

- Spotify-inspired information architecture without copying Spotify branding or assets.
- Region-aware discovery, starting with India.
- Local-first personalization where Nuclear exposes the required data.
- Provider-agnostic architecture so regional sources can be swapped or combined.
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
npm test
```

The plugin registers `nuclear-dashboard` and persists a dashboard region preference. India is the first region profile. The first discovery adapter uses public Deezer search data and does not require an API key.

## Architecture

Nuclear's current dashboard SDK exposes providers for top tracks, top artists, top albums, editorial playlists, and new releases. The host renders those provider results into its dashboard. This project therefore keeps regional data acquisition separate from the eventual dashboard presentation layer.

The region layer is deliberately independent of the data source. Adding another market should only require a new region profile and, where necessary, source-specific discovery rules.

## Status

- [x] Repository scaffold
- [x] Nuclear SDK provider entrypoint
- [x] India region model
- [x] Persisted region setting
- [x] First regional discovery adapter
- [x] Typecheck/test CI workflow
- [x] Release packaging workflow
- [x] v0.2.0 package structure validated
- [ ] More regional profiles
- [ ] Top artists / albums / playlists adapters
- [ ] Personalization/history integration
- [ ] Spotify-inspired dashboard presentation
- [ ] Nuclear Plugin Registry submission

## License

MIT
