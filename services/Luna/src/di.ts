export const TOKENS = {
    values: {
        expressApp: Symbol(),
        expressRouter: Symbol(),
        tsLogger: Symbol(),
        config: Symbol(),
        axiosClient: Symbol(),
        fsAsync: Symbol(),
        shell: Symbol(),
        nginxConf: Symbol()
    },
    modules: {
        service: Symbol(),
        logger: Symbol(),
        nginxConfig: Symbol(),
        request: Symbol(),
        healthCheck: Symbol()
    },
    components: {
        registry: {
            component: Symbol(),
            routes: Symbol()
        },
        gateway: {
            component: Symbol(),
            routes: Symbol()
        },
        balancer: {
            nginx: Symbol(),
            luna: Symbol()
        }
    }
}

import "reflect-metadata";
import express from 'express';
import { ILogObject, Logger } from 'tslog';
import { container, Lifecycle } from "tsyringe";
import { TSLoggerModule } from './modules/logger/TSLoggerModule';
import { LoggerModule } from './modules/logger/types';
import { ServiceModule } from './modules/service/types';
import config from './config';
import { ExpressRegistryComponent } from './components/registry/express/express';
import { NginxConfigModule } from "./modules/nginxConfig/types";
import http from 'http';
import https from 'https';
import { NginxConfModule } from "./modules/nginxConfig/nginxConfModule";
import axios, { AxiosResponse } from "axios";
import { RequestModule } from "./modules/request/types";
import { AxiosRequestModule } from "./modules/request/axiosModule";
import { ExpressGatewayComponent } from "./components/gateway/express/express";
import { MemoryServiceModule } from "./modules/service/memory";
import { NginxBalancerComponent } from "./components/balancer/nginx/nginx";
import { LunaBalancerComponent } from "./components/balancer/luna/luna";
import fs from 'fs/promises';
import shellJS from 'shelljs';
import { NginxConfFile } from 'nginx-conf';
import { NginxGatewayComponent } from "./components/gateway/nginx/nginx";
import { ApiGatewayType } from "./components/gateway/types";
import { HealthCheckModule } from "./modules/healthCheck/healthCheck";

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });


// Values

container.register(TOKENS.values.expressApp, {
    useValue: express()
});

container.register(TOKENS.values.expressRouter, {
    useValue: express.Router
});


const tsLogger = new Logger();

function logToTransport (logObject: ILogObject) {
    fs.appendFile("logs", JSON.stringify(logObject) + "/r/n");
}

tsLogger.attachTransport(
    {
      silly: logToTransport,
      debug: logToTransport,
      trace: logToTransport,
      info: logToTransport,
      warn: logToTransport,
      error: logToTransport,
      fatal: logToTransport,
    },
    "debug"
  );

container.register(TOKENS.values.tsLogger, {
    useValue: tsLogger
});

container.register(TOKENS.values.config, {
    useValue: config
});

container.register(TOKENS.values.axiosClient, {
    useValue: axios.create({
        httpsAgent,
        httpAgent
    })
});

container.register(TOKENS.values.fsAsync, {
    useValue: fs
});

container.register(TOKENS.values.shell, {
    useValue: shellJS
});

container.register(TOKENS.values.nginxConf, {
    useValue: NginxConfFile
});

// Modules

container.register<ServiceModule>(TOKENS.modules.service, {
    useClass: MemoryServiceModule
}, { lifecycle: Lifecycle.ContainerScoped });

container.register<LoggerModule>(TOKENS.modules.logger, {
    useClass: TSLoggerModule
});

container.register<RequestModule>(TOKENS.modules.request, {
    useClass: AxiosRequestModule
});

container.register<NginxConfigModule>(TOKENS.modules.nginxConfig, {
    useClass: NginxConfModule
});

container.register<HealthCheckModule>(TOKENS.modules.healthCheck, {
    useClass: HealthCheckModule
});

/** COMPONENTS */

container.register(TOKENS.components.registry.component, {
    useClass: ExpressRegistryComponent
}, {
    lifecycle: Lifecycle.ContainerScoped
});

if (config.gateway == ApiGatewayType.Luna) {
    container.register(TOKENS.components.gateway.component, {
        useClass: ExpressGatewayComponent
    }, {
        lifecycle: Lifecycle.ContainerScoped
    });
} else {
    container.register(TOKENS.components.gateway.component, {
        useClass: NginxGatewayComponent
    }, {
        lifecycle: Lifecycle.ContainerScoped
    });
}

container.register(TOKENS.components.balancer.nginx, {
    useClass: NginxBalancerComponent
});

container.register(TOKENS.components.balancer.luna, {
    useClass: LunaBalancerComponent
});

import expressRegistryComponentRoutes from './components/registry/express/routes';
import expressGatewayComponentRoutes from './components/gateway/express/routes';

container.register(TOKENS.components.registry.routes, {
    useValue: expressRegistryComponentRoutes
});

container.register(TOKENS.components.gateway.routes, {
    useValue: expressGatewayComponentRoutes
});


export { container }