import { ServiceModule, ServiceModuleEvents } from "./types";
import TypedEmitter from "typed-emitter";
import InstanceId from "../../common/instanceId";
import { Name } from "../../common/name";
import { Instance } from "../../common/instance";
import EventEmitter from "events";

export class MemoryServiceModule extends (EventEmitter as new () => TypedEmitter<ServiceModuleEvents>)  implements ServiceModule {
    private _services: Instance[];
    
    constructor() {
        super();
        this._services = [];
    }
    
    add(Instance: Instance): Promise<Instance> {
        return new Promise((resolve, reject) => {
            if (this._services.some(service => service.value.instanceId.equals(Instance.value.instanceId)))
                return reject("Attempted to add service that already exists.");

            this._services.push(Instance);
            this.emit("add", Instance);

            return resolve(Instance);
        });
    }

    update(Instance: Instance): Promise<Instance> {
        const foundService = this._services.findIndex(service => service.value.instanceId.equals(Instance.value.instanceId));

        if (foundService == -1) {
            return Promise.reject("Attempted to update service instance that is not registered.");
        }

        this._services[foundService] = Instance;
        this.emit("update", Instance);

        return Promise.resolve(this._services[foundService]);
    }

    remove(instanceId: InstanceId): Promise<void> {
        const foundService = this._services.findIndex(service => service.value.instanceId.equals(instanceId));

        if (foundService == -1) {
            return Promise.reject("Attempted to remove service instance that is not registered.");
        }

        delete this._services[foundService];
        this._services = this._services.filter(service => service != null);
        this.emit("remove", instanceId)

        return Promise.resolve();
    }

    findByInstanceId(instanceId: InstanceId): Promise<Instance | undefined> {
        const foundService = this._services.find(service => service.value.instanceId.equals(instanceId));

        return Promise.resolve(foundService);
    }
    
    findAllByName(serviceName: Name): Promise<Instance[]> {
        
        const found = this._services.filter(service => service.value.name.equals(serviceName));
        
        return Promise.resolve(found);
    }

    getAll(): Promise<Instance[]> {
        return Promise.resolve(this._services);
    }
}