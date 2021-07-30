import { Router } from "express";
import Version from "../version";

export interface IExpressRoute {
    version: Version;
    execute(router: Router): void;
}