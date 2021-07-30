import { IEquatable } from "../interfaces/IEquatable";
import { IValidatable } from "../interfaces/IValidatable";
import { IValueObject } from "../interfaces/IValueObject";

export class Port implements IValueObject<number>, IValidatable, IEquatable<Port | number> {
    readonly value: number;

    constructor(port: number) {
        this.value = port;

        if (!this.isValid()) {
            throw new PortNotValidError("Port is not in the range of 1-65535");
        }
    }

    static isValid(port: number) {
        return /^()([1-9]|[1-5]?[0-9]{2,4}|6[1-4][0-9]{3}|65[1-4][0-9]{2}|655[1-2][0-9]|6553[1-5])$/g.test(port.toString());
    }

    isValid = (): boolean => this.value !== null &&
                             Port.isValid(this.value);

    equals(object: Port | number): boolean {
        if (typeof(object) === 'number') {
            return new Port(object).equals(this);
        } else {
            return this.value === object.value;
        }
    }
}

export class PortNotValidError extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}