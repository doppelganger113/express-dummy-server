export interface DummyServerLogger {
    debug(msg: string, data?: string | number | boolean | Record<string, unknown>): void;
    info(msg: string, data?: string | number | boolean | Record<string, unknown>): void;
    log(msg: string, data?: string | number | boolean | Record<string, unknown>): void;
    warn(msg: string, data?: string | number | boolean | Record<string, unknown>): void;
    error(msg: string | Error, data?: string | number | boolean | Record<string, unknown>): void;
}
//# sourceMappingURL=DummyServerLogger.d.ts.map