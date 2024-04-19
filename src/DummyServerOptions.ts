import { DummyServerLogger } from './DummyServerLogger';

export interface DummyServerOptions {
  debug?: boolean;
  logger?: DummyServerLogger;
}
