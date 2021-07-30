import { Name } from '../name';
import { IValidatable } from '../interfaces/IValidatable';
import { IValueObject } from '../interfaces/IValueObject';
import { IEquatable } from '../interfaces/IEquatable';
import InstanceId from '../instanceId';
import { InstanceIdRaw } from '../instanceId/instanceId';
import Hostname from '../hostname';
import Port from '../port';
import Version from '../version';
import { Status, StatusText } from '../status/status';
import { BalancerOptions, BalancerOptionsValue } from '../balancerOptions/balancerOptions';

export type InstanceValue = {
    instanceId: InstanceId,
    name: Name,
    description: string,
    version: Version,
    url: URL,
    balancerOptions: BalancerOptions,
    status: Status,
    last_heartbeat: Date,
}

export type InstanceRaw = {
    instanceId: string,
    name: string,
    description: string,
    version: string,
    status: string,
    balancerOptions: BalancerOptionsValue,
    url: string,
    last_heartbeat: number,
}

export class Instance implements IValidatable, IValueObject<InstanceValue>, IEquatable<Instance> {
    private _value: InstanceValue;

    constructor(info: string | InstanceRaw) {
        let obj: InstanceRaw;

        if (typeof(info) === 'string') {
            obj = JSON.parse(info) as unknown as InstanceRaw;
        } else {
            obj = info;
        }

        this._value = {
            instanceId: InstanceId.fromString(obj.instanceId),
            name: new Name(obj.name),
            description: obj.description,
            version: new Version(obj.version),
            status: new Status(obj.status),
            balancerOptions: new BalancerOptions(obj.balancerOptions),
            url: new URL(obj.url),
            last_heartbeat: new Date(Date.now()),
        };

        if (!this.isValid) {
            throw new InstanceNotValidError("Invalid Service");
        }
    }
   
    isValid = (): boolean => Object.values(this._value).every(val => typeof(val) === "string" ? val && val.length > 0 : true);

    equals(object: Instance): boolean {
        // Comparing instance ids because instance ids should be unique between services
        return object.value.instanceId.equals(this._value.instanceId);
    }

    /**
     * @returns An object that is type InstanceValue with its values all being primitive types
     */
    get raw(): InstanceRaw {
        return {
            instanceId: this._value.instanceId.toString(),
            name: this._value.name.value,
            description: this._value.description,
            version: this._value.version.value,
            url: this._value.url.toString(),
            status: StatusText[this._value.status.value],
            balancerOptions: this._value.balancerOptions.value,
            last_heartbeat: this._value.last_heartbeat.getTime()
        } as InstanceRaw;
    }

    get value(): InstanceValue {
        return this._value;
    }
}

export class InstanceNotValidError extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}