import { IEquatable } from "../interfaces/IEquatable";
import { IValidatable } from "../interfaces/IValidatable";
import { IValueObject } from "../interfaces/IValueObject";

export class NameNotValid extends Error {
    constructor(message : string) {
        super(message);
        
        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}


export class Name implements IValidatable, IValueObject<string>, IEquatable<Name | string> {
    private _value: string;

    constructor(name: string) {
        this._value = name;

        if (!this.isValid()) {
            throw new NameNotValid("Name is not a string or its length is not greather than 0");
        }
    }

    isValid = (): boolean => this._value != null && 
                             this._value.length > 0;
                             
    
    get value(): string {
        return this._value;
    } 

    get raw(): string {
        return this._value;
    }

    equals(object: string | Name): boolean {
        if (object instanceof Name) {
            return object.value === this._value
        } else {
            const nameObj = new Name(object);

            return nameObj.equals(this);
        }
    }
}