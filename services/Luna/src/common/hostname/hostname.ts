import { IEquatable } from "../interfaces/IEquatable";
import { IValidatable } from "../interfaces/IValidatable";
import { IValueObject } from "../interfaces/IValueObject";


export class Hostname implements IValidatable, IValueObject<string>, IEquatable<Hostname | string> {
    readonly value: string;

    constructor(_hostname: string) {
        this.value = _hostname;

        if (!this.isValid()) {
            throw new HostnameNotValidError(`String '${this.value}' is not a valid hostname`);
        }
    }
    
    static isValid(hostname: string): boolean {
        return /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/g.test(hostname);
    }

    isValid = (): boolean => this.value != null && 
                             Hostname.isValid(this.value);
                        
    equals(object: Hostname | string): boolean {
        if (typeof(object) === 'string') {
            return new Hostname(object).equals(this);
        } else {
            return this.value === object.value;
        }
    }
    
}


export class HostnameNotValidError extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}