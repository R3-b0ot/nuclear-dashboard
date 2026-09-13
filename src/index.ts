import type {
  DashboardProvider,
  NuclearPlugin,
  NuclearPluginAPI,
} from '@nuclearplayer/plugin-sdk';

/**
 * Region is intentionally independent from the provider implementation.
 * The first profile is India; more markets can be added without changing
 * the dashboard contract.
 */
export type DashboardRegion = {
  id: string;
  countryCode: string;
  name: string;
  languages: string[];
};

export const DEFAULT_REGION: DashboardRegion = {
  id: 'india',
  countryCode: 'IN',
  name: 'India',
  languages: ['hi', 'mr', 'pa', 'ta', 'te', 'bn', 'gu', 'kn', 'ml'],
};

const PROVIDER_ID = 'nuclear-dashboard';

/**
 * Phase 1 provider.
 *
 * Nuclear currently renders dashboard provider capabilities itself. This
 * provider establishes the regional dashboard contract first; data adapters
 * will be added independently so the UI is not coupled to one service.
 */
const provider: DashboardProvider = {
  id: PROVIDER_ID,
  kind: 'dashboard',
  name: 'Nuclear Dashboard',
  capabilities: [],
};

const plugin: NuclearPlugin = {
  onEnable(api: NuclearPluginAPI) {
    api.Providers.register(provider);
  },

  onDisable(api: NuclearPluginAPI) {
    api.Providers.unregister(PROVIDER_ID);
  },
};

export default plugin;
