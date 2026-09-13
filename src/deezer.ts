import type { FetchFunction, Track } from '@nuclearplayer/plugin-sdk';

const API_BASE = 'https://api.deezer.com';
const PROVIDER_ID = 'nuclear-dashboard';

type DeezerTrack = {
  id: number; title: string; duration: number; position: number;
  artist: { id: number; name: string };
  album: { id: number; title: string; cover_medium: string; cover_big: string };
};

type DeezerSearchResponse<T> = { data: T[] };

export class DeezerDiscoveryClient {
  constructor(private readonly fetch: FetchFunction) {}

  async searchTracks(query: string, limit = 10): Promise<Track[]> {
    const encoded = encodeURIComponent(query);
    const response = await this.fetch(`${API_BASE}/search/track?q=${encoded}&limit=${limit}`);
    const payload = (await response.json()) as DeezerSearchResponse<DeezerTrack>;
    return payload.data.map(mapTrack);
  }

  async discoverRegion(queries: string[], perQuery = 6): Promise<Track[]> {
    const results = await Promise.all(queries.map((query) => this.searchTracks(query, perQuery)));
    const seen = new Set<string>();
    const tracks: Track[] = [];
    for (const batch of results) {
      for (const track of batch) {
        const key = `${track.artists[0]?.name ?? ''}:${track.title}`.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        tracks.push(track);
      }
    }
    return tracks;
  }
}

const mapTrack = (track: DeezerTrack): Track => ({
  title: track.title,
  artists: [{ name: track.artist.name, roles: ['main'], source: { provider: PROVIDER_ID, id: String(track.artist.id) } }],
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
