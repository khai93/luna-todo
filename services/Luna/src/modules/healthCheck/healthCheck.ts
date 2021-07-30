import { Instance } from "src/common/instance";
import { Name } from "src/common/name";
import Status from "src/common/status";
import { TOKENS } from "src/di";
import { inject, injectable } from "tsyringe";
import { LoggerModule } from "../logger/types";
import { ServiceModule } from "../service/types";

@injectable()
export class HealthCheckModule implements HealthCheckModule {
    constructor(
        @inject(TOKENS.modules.service) private serviceModule: ServiceModule,
        @inject(TOKENS.modules.logger) private loggerModule: LoggerModule
    ) {}

    // Checks a service's instances to see if their heartbeats are within 30 seconds
    async checkServiceInstances(serviceName: Name): Promise<void> {
        const instances = await this.serviceModule.findAllByName(serviceName);

        for (let instance of instances) {
            if (Date.now() - instance.value.last_heartbeat.getTime()  >= 30 * 1000) {
                const updatedInstance = new Instance({ 
                    ...instance.raw,
                    status: "DOWN"
                });
                
                this.loggerModule.log(`${instance.raw.name}'s instance '${instance.raw.instanceId}' went down`);

                await this.serviceModule.update(updatedInstance);
            }
        }
    }
}