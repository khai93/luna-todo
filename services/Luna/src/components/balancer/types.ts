import { Name } from "src/common/name";
import { Instance } from "src/common/instance";

export enum LoadBalancerType {
    RoundRobin,
    WeightedRoundRobin,
    None
}

export interface LoadBalancer {
    balanceService(serviceName: Name, currentInstance?: Instance): Promise<Instance | undefined>;
}

export class LoadBalancerError extends Error {
    constructor(message : string) {
        super(message);
        
        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}