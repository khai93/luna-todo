import EventEmitter from "node:events";
import InstanceId from "../../common/instanceId";
import { Name } from "../../common/name";
import { Instance } from "../../common/instance";

export interface ServiceModule extends EventEmitter {
    /**
     * Add a service to the database
     * @param Instance Service to be added
     * @returns {Promise<Instance | null>} added service info or null if it couldn't add the service
     */
    add(Instance: Instance): Promise<Instance>;

    /**
     * Updates a service based on its instanceId in the object.
     * InstanceId's cannot change between services.
     * @param Instance Service to update
     * @returns updated Instance
     */
    update(Instance: Instance): Promise<Instance>;
    remove(instanceId: InstanceId): Promise<void>;
    findByInstanceId(instanceId: InstanceId): Promise<Instance | undefined>;
    findAllByName(serviceName: Name): Promise<Instance[]>;
    getAll(): Promise<Instance[]>;
}

export interface ServiceModuleEvents {
    update: (updatedInstance: Instance) => void,
    remove: (removedServiceName: InstanceId) => void,
    add: (addedInstance: Instance) => void
}

export class ServiceModuleAddError extends Error {
    constructor(message : string) {
        super(message);
        
        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}

export class ServiceModuleUpdateError extends Error {
    constructor(message : string) {
        super(message);
        
        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}

export class ServiceModuleRemoveError extends Error {
    constructor(message : string) {
        super(message);
        
        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}