import { AxiosResponse } from "axios";
import { Router } from "express";
import { IExpressRoute } from "src/common/interfaces/IExpressRoute";
import catchErrorAsync from "src/common/middlewares/catchErrorAsync";
import { Name } from "src/common/name";
import Status from "src/common/status";
import Version from "src/common/version";
import { LunaBalancerComponent } from "src/components/balancer/luna/luna";
import { TOKENS } from "src/di";
import { HealthCheckModule } from "src/modules/healthCheck/healthCheck";
import { RequestModule, RequestOptions } from "src/modules/request/types";
import { ServiceModule } from "src/modules/service/types";
import { autoInjectable, inject } from "tsyringe";

@autoInjectable()
export class ExpressGatewayServicesRoute implements IExpressRoute {
    version: Version = new Version("1");

    constructor(
        @inject(TOKENS.modules.service) private serviceModule?: ServiceModule,
        @inject(TOKENS.modules.request) private requestModule?: RequestModule,
        @inject(TOKENS.components.balancer.luna) private balancerComponent?: LunaBalancerComponent,
        @inject(TOKENS.modules.healthCheck) private healthCheckModule?: HealthCheckModule
    ) {}

    execute(router: Router) {
        router.use("/services/:serviceName", catchErrorAsync(async (req, res) => {
            const { serviceName } = req.params;

            const services = await this.serviceModule?.findAllByName(new Name(serviceName));

            if (services == null || services?.length <= 0) {
                throw new Error("Service name provided has no instances registered.");
            }

            await this.healthCheckModule?.checkServiceInstances(new Name(serviceName));
            const instance = await this.balancerComponent?.getNextInstance(new Name(serviceName));
            
            if (instance == null) {
                throw new Error("Service is down.");
            }

            const splitReqUrl = req.url.split("/services/" + instance.raw.name + "/");
            const instanceUrl = new URL(splitReqUrl[splitReqUrl.length - 1], instance.value.url.toString());

            const proxyRequestOptions: RequestOptions = {
                url: instanceUrl.toString(),
                method: req.method,
                responseType: 'stream',
                body: req.body,
                headers: req.headers,
            };

            const response = await this.requestModule?.request<AxiosResponse>(proxyRequestOptions);
            
            response?.data.pipe(res);
        }));

        router.get("/services", catchErrorAsync(async (req, res) => {
            res.sendStatus(200);
        }));
    }
}