import { Request, Router } from "express";
import InstanceId from "src/common/instanceId";
import { IExpressRoute } from "src/common/interfaces/IExpressRoute";
import { basicAuthMiddleware } from "src/common/middlewares/basicAuth/basicAuth";
import catchErrorAsync from "src/common/middlewares/catchErrorAsync";
import { Instance } from "src/common/instance";
import { TOKENS } from "src/di";
import { ServiceModule } from "src/modules/service/types";
import { inject, autoInjectable } from "tsyringe";
import Version from "../../../../../../common/version";
import { IKeyValuePair } from "src/common/interfaces/IKeyValuePair";
import { InstanceRaw } from "src/common/instance/instance";
import { HealthCheckModule } from "src/modules/healthCheck/healthCheck";
import { Name } from "src/common/name";

export type FormattedService = {
    name: string,
    description: string,
    status: 'UP' | 'DOWN',
    instances: InstanceRaw[]
}
@autoInjectable()
export class ExpressRegistryServicesRoute implements IExpressRoute {
    version: Version = new Version("1");

    constructor(
        @inject(TOKENS.modules.service) private serviceModule?: ServiceModule,
        @inject(TOKENS.modules.healthCheck) private healthCheckModule?: HealthCheckModule
    ){}

    execute(router: Router) {
        router.get("/services", catchErrorAsync(async (req, res) => {
            await this.healthCheckAll();
            const instancesByServiceName = await this.getFormattedServices();

            res.render("services", { services: instancesByServiceName });
        }));

        router.get("/services/json", catchErrorAsync(async (req, res) => {
            await this.healthCheckAll();
            const instancesByServiceName = await this.getFormattedServices();

            res.json(instancesByServiceName);
        }));
    };

    private async getFormattedServices(): Promise<FormattedService[]> {
        const instances = await this.getInstancesByServiceName();
        let formattedServices: FormattedService[] = [];

        for (let serviceName in instances) {
            const isOneInstanceActive = instances[serviceName].some(instance => instance.status === 'OK');

            formattedServices.push({
                name: serviceName,
                description: instances[serviceName][0].description,
                status: isOneInstanceActive ? 'UP' : 'DOWN',
                instances: instances[serviceName]
            });
        }

        return formattedServices;
    }

    private async getInstancesByServiceName() {
        const instances = await this.serviceModule!.getAll();
        
        return instances.reduce<IKeyValuePair<InstanceRaw[]>>((acc, curr) => {
            if (acc[curr.value.name.value] == null) {
                acc[curr.value.name.value] = [];
            }

            acc[curr.value.name.value].push(curr.raw);

            return acc;
        }, {});
    }

    private async healthCheckAll() {
        const instances = await this.serviceModule!.getAll();

        for (const instance of instances) {
            await this.healthCheckModule?.checkServiceInstances(instance.value.name);
        }
    }
}