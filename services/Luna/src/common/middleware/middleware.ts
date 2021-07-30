import { RequestHandler } from "express";
import { IValidatable } from "../interfaces/IValidatable";
import { IValueObject } from "../interfaces/IValueObject";

export class Middleware implements IValueObject<RequestHandler> {
    private _value: RequestHandler;

    constructor(handler: RequestHandler) {
        this._value = handler;
    }

    get value(): RequestHandler {
        return this._value;
    }
}