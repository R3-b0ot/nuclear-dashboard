import type { DashboardProvider, NuclearPlugin, NuclearPluginAPI } from '@nuclearplayer/plugin-sdk';
import { DeezerDiscoveryClient } from './deezer';
import { DEFAULT_REGION, getRegion } from './regions';

const PROVIDER_ID = 'nuclear-dashboard';
const REGION_SETTING = 'region';

const createProvider = (
  client: DeezerDiscoveryClient,
  regionId: string,
  logger: NuclearPluginAPI['Logger'],
): DashboardProvider => ({
  id: PROVIDER_ID,
  kind: 'dashboard',
  name: 'Nuclear Dashboard',
  capabilities: ['topTracks'],
  async fetchTopTracks() {
    logger.info(`Nuclear Dashboard fetchTopTracks invoked for region: ${regionId}`);
    return client.discoverRegion(getRegion(regionId).discoveryQueries, 5);
  },
});

let unsubscribeRegion: (() => void) | undefined;

const plugin: NuclearPlugin = {
  async onEnable(api: NuclearPluginAPI) {
    api.Logger.info('Nuclear Dashboard enabling');

    await api.Settings.register([{
      id: REGION_SETTING,
      title: 'Dashboard region',
      description: 'Choose the market used for regional discovery content.',
      category: 'Dashboard',
      kind: 'enum',
      options: [{ value: DEFAULT_REGION.id, label: DEFAULT_REGION.name }],
      default: DEFAULT_REGION.id,
      widget: { type: 'select' },
    }]);

    const regionId = (await api.Settings.get<string>(REGION_SETTING)) ?? DEFAULT_REGION.id;
    const client = new DeezerDiscoveryClient(api.Http.fetch, api.Logger);
    api.Providers.register(createProvider(client, regionId, api.Logger));
    api.Logger.info(`Nuclear Dashboard provider registered for region: ${regionId}`);

    unsubscribeRegion = api.Settings.subscribe<string>(REGION_SETTING, (value) => {
      const nextRegionId = value ?? DEFAULT_REGION.id;
      api.Logger.info(`Nuclear Dashboard region changed: ${nextRegionId}`);
      api.Providers.unregister(PROVIDER_ID);
      api.Providers.register(createProvider(client, nextRegionId, api.Logger));
    });
  },

  onDisable(api: NuclearPluginAPI) {
    unsubscribeRegion?.();
    unsubscribeRegion = undefined;
    api.Providers.unregister(PROVIDER_ID);
  },
};

export default plugin;
