import { inject, injectable } from "tsyringe";
import { IValidatable } from "../interfaces/IValidatable";
import { IValueObject } from "../interfaces/IValueObject";



export type BalancerOptionsValue = {
    weight?: number
}

export class BalancerOptions implements IValidatable, IValueObject<BalancerOptionsValue> {
    readonly value: BalancerOptionsValue;
    private _errorMessage: string = "";

    constructor(
        opts: BalancerOptionsValue
    ) {
        this.value = opts;

        if (!this.isValid()) {
            throw new BalancerOptionsNotValidError("Balanced Options passed in are invalid");
        }

    }

    isValid(): boolean {
        if (this.value.weight && this.value.weight <= 0) {
            return false;
        }

        return true;
    }
}

export class BalancerOptionsNotValidError extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}