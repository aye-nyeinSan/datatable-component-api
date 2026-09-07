import type { DemoSettings } from '@/schemas/demo.schema';

export const DEMO_DEFAULTS: DemoSettings = {
  mode: 'client',
  latency: 600,
  failure: 'none',
  force: 'none',
  childMode: 'inline',
};

export const LATENCY_OPTIONS = [0, 600, 2500];
