import express, { application, Router } from "express";
import Version from "src/common/version";
import { TOKENS } from "src/di";
import { inject, injectable } from "tsyringe";
import { IExecutable } from "../../../common/interfaces/IExecutable";
import { IExpressRoute } from "../../../common/interfaces/IExpressRoute";

@injectable()
export class ExpressGatewayComponent implements IExecutable {
    private gatewayRouter: Router;

    constructor(
        @inject(TOKENS.values.expressApp) private app: typeof application,
        @inject(TOKENS.values.expressRouter) private router: typeof express.Router,
        @inject(TOKENS.components.gateway.routes) private gatewayRoutes: IExpressRoute[]
    ) { 
        this.gatewayRouter = this.router();
    }

    execute(): void {
        for (const route of this.gatewayRoutes) {
            route.execute(this.gatewayRouter);
        }

        this.app.use("/gateway/", this.gatewayRouter);
    }
}