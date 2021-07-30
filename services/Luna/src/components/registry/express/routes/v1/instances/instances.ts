import { Request, Router } from "express";
import InstanceId from "src/common/instanceId";
import { IExpressRoute } from "src/common/interfaces/IExpressRoute";
import { basicAuthMiddleware } from "src/common/middlewares/basicAuth/basicAuth";
import catchErrorAsync from "src/common/middlewares/catchErrorAsync";
import { Instance } from "src/common/instance";
import { TOKENS } from "src/di";
import { ServiceModule } from "src/modules/service/types";
import { inject, autoInjectable } from "tsyringe";
import Version from "../../../../../../common/version";

export type ParsedInstanceRequest = {instanceIdObject: InstanceId, bodyInstance?: Instance};

@autoInjectable()
export class ExpressRegistryInstancesRoute implements IExpressRoute {
    version: Version = new Version("1");

    constructor(
        @inject(TOKENS.modules.service) private serviceModule?: ServiceModule
    ) {}

    execute(router: Router) {
        router.get("/instances/:instanceId", catchErrorAsync(async (req, res) => {
            const { instanceIdObject } = await this.parseServiceRequest(req, false);
 
            const instanceData = await this.serviceModule!.findByInstanceId(instanceIdObject);

            if (instanceData == null) {
                return res.sendStatus(404);
            }

            res.send(instanceData.raw);
        }));

        router.post("/instances/:instanceId", catchErrorAsync(async (req, res) => {
            const { instanceIdObject, bodyInstance } = await this.parseServiceRequest(req, true);

            if (!instanceIdObject.equals(bodyInstance!.value.instanceId)) {
                return res.sendStatus(400);
            }

            const foundInstance = await this.serviceModule!.findByInstanceId(instanceIdObject);

            if (foundInstance != null) {
                return res.sendStatus(400);
            }

            const addedInstance = await this.serviceModule!.add(bodyInstance!);
            
            if (addedInstance == null) {
                return res.sendStatus(500);
            }

            return res.status(201).send(addedInstance.raw);
        }));

        router.put("/instances/:instanceId", catchErrorAsync(async (req, res) => {
            const { instanceIdObject, bodyInstance } = await this.parseServiceRequest(req, true);

            if (!instanceIdObject.equals(bodyInstance!.value.instanceId)) {
                return res.sendStatus(400);
            }

            const foundInstance = await this.serviceModule!.findByInstanceId(instanceIdObject);

            if (foundInstance == null) {
                return res.sendStatus(404);
            }

            const updatedInstance = await this.serviceModule!.update(bodyInstance!);

            if (updatedInstance == null) {
                return res.sendStatus(500);
            }

            return res.status(200).send(updatedInstance.raw);
        }));

        router.delete("/instances/:instanceId", catchErrorAsync(async (req, res) => {
            const { instanceIdObject } = await this.parseServiceRequest(req, false);
 
            const foundInstance = await this.serviceModule!.findByInstanceId(instanceIdObject);

            if (foundInstance == null) {
                return res.sendStatus(404);
            }

            await this.serviceModule!.remove(instanceIdObject);

            return res.sendStatus(200);
        }));
    }

    private parseServiceRequest(req: Request, parseBody: boolean): Promise<ParsedInstanceRequest> {
        return new Promise((resolve, reject) => {
            try {
                const { instanceId } = req.params;

                const instanceIdObject = InstanceId.fromString(instanceId);
                
                let bodyInstance;

                if (parseBody) {
                    if (req.body == null || Object.keys(req.body).length === 0) {
                        throw new Error("Instance info required in request body.");
                    }

                    bodyInstance = new Instance(req.body);
                }
                
                return resolve({
                    instanceIdObject,
                    bodyInstance
                });
            } catch (e) {
                reject(e);
            }
        });
    }
}