import { IEquatable } from "../interfaces/IEquatable";
import { IValidatable } from "../interfaces/IValidatable";
import { IValueObject } from "../interfaces/IValueObject";

export enum StatusText {
    OK,
    DOWN
}

export class Status implements IValueObject<StatusText>, IValidatable, IEquatable<Status> {
    readonly value: StatusText;

    constructor(status: StatusText | string) {
        if (typeof(status) === 'string') {
            const statusString = status as keyof typeof StatusText;

            this.value = StatusText[statusString];
        } else {
            this.value = status;
        }

        if (!this.isValid()) {
            throw new StatusNotValid("String provided is null");
        }
        
    }

    isValid = (): boolean => this.value != null;

    equals(object: Status): boolean {
        return this.value === object.value;
    }
} 

export class StatusNotValid extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}