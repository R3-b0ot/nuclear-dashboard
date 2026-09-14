import type { FetchFunction, Track } from '@nuclearplayer/plugin-sdk';

const API_BASE = 'https://api.deezer.com';
const PROVIDER_ID = 'nuclear-dashboard';

type DeezerTrack = {
  id: number;
  title: string;
  duration: number;
  position?: number;
  artist: { id: number; name: string };
  album: { id: number; title: string; cover_medium: string; cover_big: string };
};

type DeezerResponse<T> = { data?: T[]; total?: number };
type Logger = {
  info(message: string): void;
  error(message: string): void;
  warn(message: string): void;
};

export class DeezerDiscoveryClient {
  constructor(
    private readonly fetch: FetchFunction,
    private readonly logger?: Logger,
  ) {}

  async searchTracks(query: string, limit = 10): Promise<Track[]> {
    const encoded = encodeURIComponent(query);
    // Use the general /search endpoint. It is the endpoint currently verified
    // to return live catalog results; /search/track is returning empty data in
    // Nuclear's HTTP bridge even for otherwise valid queries.
    const url = `${API_BASE}/search?q=${encoded}&limit=${limit}`;
    this.logger?.info(`Deezer request: ${query}`);
    const response = await this.fetch(url);

    if (!response.ok) {
      const body = await response.text();
      this.logger?.error(
        `Deezer request failed (${response.status}) for "${query}": ${body.slice(0, 200)}`,
      );
      throw new Error(`Deezer request failed with HTTP ${response.status}`);
    }

    const payload = (await response.json()) as DeezerResponse<DeezerTrack>;
    if (!Array.isArray(payload.data)) {
      this.logger?.error(`Deezer returned an invalid response for "${query}"`);
      throw new Error('Deezer response did not contain a data array');
    }

    this.logger?.info(
      `Deezer response: ${query} -> ${payload.data.length} tracks (total ${payload.total ?? 0})`,
    );
    return payload.data.map(mapTrack);
  }

  async fetchLocalChartTracks(limit = 25): Promise<Track[]> {
    const url = `${API_BASE}/chart/0/tracks?limit=${limit}`;
    this.logger?.info('Deezer request: local chart');
    const response = await this.fetch(url);

    if (!response.ok) {
      const body = await response.text();
      this.logger?.error(
        `Deezer local chart failed (${response.status}): ${body.slice(0, 200)}`,
      );
      throw new Error(`Deezer local chart failed with HTTP ${response.status}`);
    }

    const payload = (await response.json()) as DeezerResponse<DeezerTrack>;
    if (!Array.isArray(payload.data)) {
      this.logger?.error('Deezer local chart returned an invalid response');
      throw new Error('Deezer local chart did not contain a data array');
    }

    this.logger?.info(`Deezer local chart response -> ${payload.data.length} tracks`);
    return payload.data.map(mapTrack);
  }

  async discoverRegion(queries: string[], perQuery = 6): Promise<Track[]> {
    this.logger?.info(`Starting Deezer discovery: ${queries.length} queries`);
    const seen = new Set<string>();
    const tracks: Track[] = [];

    // The local chart gives us a useful baseline even when search is degraded.
    try {
      for (const track of await this.fetchLocalChartTracks(25)) {
        const key = `${track.artists[0]?.name ?? ''}:${track.title}`.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        tracks.push(track);
      }
    } catch (error) {
      this.logger?.warn(`Skipping Deezer local chart: ${String(error)}`);
    }

    // Keep requests sequential. A burst of many simultaneous requests can be
    // throttled by the upstream API or by the host HTTP bridge.
    for (const query of queries) {
      try {
        const results = await this.searchTracks(query, perQuery);
        for (const track of results) {
          const key = `${track.artists[0]?.name ?? ''}:${track.title}`.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          tracks.push(track);
        }
      } catch (error) {
        this.logger?.warn(
          `Skipping failed Deezer discovery query "${query}": ${String(error)}`,
        );
      }
    }

    this.logger?.info(`Deezer discovery complete: ${tracks.length} unique tracks`);
    return tracks;
  }
}

const mapTrack = (track: DeezerTrack): Track => ({
  title: track.title,
  artists: [
    {
      name: track.artist.name,
      roles: ['main'],
      source: { provider: PROVIDER_ID, id: String(track.artist.id) },
    },
  ],
  album: {
    title: track.album.title,
    artwork: artwork(track.album.cover_big, track.album.cover_medium),
    source: { provider: PROVIDER_ID, id: String(track.album.id) },
  },
  durationMs: track.duration * 1000,
  trackNumber: track.position ?? 0,
  artwork: artwork(track.album.cover_big, track.album.cover_medium),
  source: { provider: PROVIDER_ID, id: String(track.id) },
});

const artwork = (cover: string, thumbnail: string) => ({
  items: [
    { url: cover, purpose: 'cover' as const },
    { url: thumbnail, purpose: 'thumbnail' as const },
  ],
});
