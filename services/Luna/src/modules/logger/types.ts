export interface LoggerModule {
    log(message: string) : void;
    warn(message: string) : void;
    error(error: Error) : void;
    fatal(error: Error) : void;
}