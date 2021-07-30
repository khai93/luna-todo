import { container, TOKENS } from './di';
import express, { application, ErrorRequestHandler } from 'express';
import { IExecutable } from "./common/interfaces/IExecutable";
import { LoggerModule } from "./modules/logger/types";
import config from './config';
import cors from 'cors';

const expressApp = container.resolve<typeof application>(TOKENS.values.expressApp);
expressApp.set("view engine", "ejs");
expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));
expressApp.use(cors({ origin: "*" }));


const registryComponent = container.resolve<IExecutable>(TOKENS.components.registry.component);
registryComponent.execute();

const gatewayComponent = container.resolve<IExecutable>(TOKENS.components.gateway.component);
gatewayComponent.execute();

const loggerModule = container.resolve<LoggerModule>(TOKENS.modules.logger);

const expressErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    loggerModule.error(err);

    return res.status(500).send({
        error: err.message.toString()
    });
}

expressApp.use(expressErrorHandler);


expressApp.listen(config.server.port, () => loggerModule.log("Luna server started at PORT " + config.server.port));