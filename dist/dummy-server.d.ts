import { Express } from "express";
import { DummyServerOptions } from "./DummyServerOptions";
export interface RequestSnapshot {
    method: string;
    params: Record<string, unknown>;
    query: Record<string, unknown>;
    body?: unknown;
    headers: Record<string, unknown>;
}
export interface DummyServer {
    url: string;
    close: () => void;
    requestStore: Map<string, RequestSnapshot[]>;
}
export declare const createDummyServer: (registerEndpoints: (app: Express) => Promise<void>, options?: DummyServerOptions) => Promise<DummyServer>;
//# sourceMappingURL=dummy-server.d.ts.map