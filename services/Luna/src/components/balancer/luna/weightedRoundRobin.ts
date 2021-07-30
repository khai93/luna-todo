import { Name } from "src/common/name";
import { Instance } from "src/common/instance";
import { TOKENS } from "src/di";
import { LoggerModule } from "src/modules/logger/types";
import { ServiceModule } from "src/modules/service/types";
import { autoInjectable, inject } from "tsyringe";
import { LoadBalancer, LoadBalancerError } from "../types";
import Status from "src/common/status";

@autoInjectable()
export class LunaWeightedRoundRobinBalancer implements LoadBalancer {
    constructor(
        @inject(TOKENS.modules.service) private serviceModule?: ServiceModule,
        @inject(TOKENS.modules.logger) private logger?: LoggerModule
    ) {
        this.logger?.log("Load Balancer loaded with Weighted Round Robin method.");
    }

    balanceService(serviceName: Name): Promise<Instance | undefined> {
        return new Promise(async (resolve, reject) => {
            let serviceInstances = await this.serviceModule?.findAllByName(serviceName);

            if (serviceInstances == null || serviceInstances && serviceInstances.length <= 0) {
                return new LoadBalancerError("Service does not have any instances registered.");
            }

            serviceInstances = serviceInstances.filter(instance => instance.value.status.equals(new Status("OK")))


            const totalInstanceWeight = this.getTotalInstanceWeight(serviceInstances);
            
            /** 
             * Generate a random number from 0 to (Total Instance Weight)  
            */
            const randomWeight = Math.random() * totalInstanceWeight;

            const instance = this.getInstanceByWeightThreshold(serviceInstances, randomWeight);

            return resolve(instance);
        });
    }

    private getTotalInstanceWeight(instances: Instance[]) {
        let totalInstanceWeight = 0;

        for(const instance of instances) {
            /**
            * Not checking for undefined as value objects check themselves in the constructor
            */
            totalInstanceWeight += instance.value.balancerOptions.value.weight as number || 1;
        }

        return totalInstanceWeight;
    }

    private getInstanceByWeightThreshold(instances: Instance[], threshold: number): Instance {
        let totalWeight = 0;
        
        /**
         * Add each instance's weight to the totalWeight,
         * return the instance that passes the threshold
         */
        for (const instance of instances) {
            totalWeight += instance.value.balancerOptions.value.weight as number || 1;

            if (totalWeight >= threshold) {
                return instance;
            }
        }
        
        /**
         * If the loop could not find it, the threshold is larger than all the sum of the instance's weights other than the last one.
         */
        return instances[instances.length -1];
    }
}