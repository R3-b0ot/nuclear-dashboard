import type { FetchFunction, Track } from '@nuclearplayer/plugin-sdk';

const API_BASE = 'https://api.deezer.com';
const PROVIDER_ID = 'nuclear-dashboard';

type DeezerTrack = {
  id: number;
  title: string;
  duration: number;
  position: number;
  artist: { id: number; name: string };
  album: { id: number; title: string; cover_medium: string; cover_big: string };
};

type DeezerSearchResponse<T> = { data?: T[] };
type Logger = { error(message: string): void; warn(message: string): void };

export class DeezerDiscoveryClient {
  constructor(
    private readonly fetch: FetchFunction,
    private readonly logger?: Logger,
  ) {}

  async searchTracks(query: string, limit = 10): Promise<Track[]> {
    const encoded = encodeURIComponent(query);
    const url = `${API_BASE}/search/track?q=${encoded}&limit=${limit}`;
    const response = await this.fetch(url);

    if (!response.ok) {
      const body = await response.text();
      this.logger?.error(
        `Deezer request failed (${response.status}) for "${query}": ${body.slice(0, 200)}`,
      );
      throw new Error(`Deezer request failed with HTTP ${response.status}`);
    }

    const payload = (await response.json()) as DeezerSearchResponse<DeezerTrack>;
    if (!Array.isArray(payload.data)) {
      this.logger?.error(`Deezer returned an invalid response for "${query}"`);
      throw new Error('Deezer response did not contain a data array');
    }

    return payload.data.map(mapTrack);
  }

  async discoverRegion(queries: string[], perQuery = 6): Promise<Track[]> {
    const results = await Promise.allSettled(
      queries.map((query) => this.searchTracks(query, perQuery)),
    );
    const seen = new Set<string>();
    const tracks: Track[] = [];

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger?.warn(
          `Skipping failed Deezer discovery query "${queries[index]}": ${String(result.reason)}`,
        );
        return;
      }

      for (const track of result.value) {
        const key = `${track.artists[0]?.name ?? ''}:${track.title}`.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        tracks.push(track);
      }
    });

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
  trackNumber: track.position,
  artwork: artwork(track.album.cover_big, track.album.cover_medium),
  source: { provider: PROVIDER_ID, id: String(track.id) },
});

const artwork = (cover: string, thumbnail: string) => ({
  items: [
    { url: cover, purpose: 'cover' as const },
    { url: thumbnail, purpose: 'thumbnail' as const },
  ],
});
