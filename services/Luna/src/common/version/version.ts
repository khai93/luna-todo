import { IEquatable } from "../interfaces/IEquatable";
import { IValidatable } from "../interfaces/IValidatable";
import { IValueObject } from "../interfaces/IValueObject";

export class VersionNotValidError extends Error {
    constructor(message : string) {
        super(message);

        this.name = "VersionNotValidError";
        this.stack = new Error().stack;
    }
}

export class Version implements IValidatable, IValueObject<string>, IEquatable<Version> {
    private _value: number[];

    constructor(version: string) {

        this._value = typeof(version) == 'string' && version.split(".")
                             .map(str => parseInt(str)) || [];

        if (!this.isValid()) {
            throw new VersionNotValidError(`Version provided is not valid`);
        }
    }
 

    isValid = (): boolean => this._value != null && 
                             this._value.length > 0 && 
                             this._value.every(val => Number.isInteger(val));

    get value(): string {
        return this._value.join(".");
    }

    equals(object: Version): boolean {
        return this.value === object.value;
    }
}