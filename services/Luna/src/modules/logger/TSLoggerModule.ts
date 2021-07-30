import { inject, injectable } from "tsyringe";
import { LoggerModule } from "./types";
import { ILogObject, Logger } from "tslog";
import { TOKENS } from "src/di";
import fs from 'fs/promises';

@injectable()
export class TSLoggerModule implements LoggerModule {
    constructor(
        @inject(TOKENS.values.tsLogger) private logger: Logger,
        @inject(TOKENS.values.fsAsync) private fsAsync: typeof fs
    ) { }
  

    log(message: string): void {
        this.logger.info(message);
    }

    warn(message: string): void {
        this.logger.warn(message);
    }

    error(error: Error): void {
        this.logger.prettyError(error);
    }

    fatal(error: Error): void {
        this.logger.fatal(error);
    }
}