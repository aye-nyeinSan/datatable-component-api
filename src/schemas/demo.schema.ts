export type DataMode = 'client' | 'server';

export type FailureTarget = 'none' | 'table' | 'children';

export type ForcedState = 'none' | 'loading' | 'empty' | 'error';

export type ChildMode = 'inline' | 'ondemand';

export interface DemoSettings {
  mode: DataMode;
  latency: number;
  failure: FailureTarget;
  force: ForcedState;
  childMode: ChildMode;
}
