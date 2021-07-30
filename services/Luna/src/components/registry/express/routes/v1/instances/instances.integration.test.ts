/**
 * Tests instances routes
 * 
 * @group integration/components/registry
 */

import express from 'express';
import request from 'supertest';
import { container, TOKENS } from 'src/di';

import mockServiceModule, { fakeServices, mockAdd, mockUpdate, mockFindByInstanceId, mockGetAll, mockRemove, resetServiceModuleMocks } from 'src/modules/service/__mocks__/service';
import InstanceId from 'src/common/instanceId';
import { ExpressRegistryInstancesRoute } from './instances';
import { InstanceRaw } from 'src/common/instance/instance';

describe("Express Registry Component: Instances Route", () => {
    const app = express();

    app.use(express.json());

    container.register(TOKENS.modules.service, { useClass: mockServiceModule });
        
    const instanceRoute = container.resolve(ExpressRegistryInstancesRoute);
    instanceRoute.execute(app);
            
    beforeEach(() => {
        resetServiceModuleMocks();
    });

    describe("GET method", () => {
        it('GET /instances/mock:0.0.0.0:80 -> returns correct mock data', async () => {
            expect.assertions(1);
    
            const { body } = await request(app).get("/instances/mock:0.0.0.0:80");
    
            expect(body).toEqual(fakeServices[0].raw);
        });

        it('GET /instances/mock2:0.0.0.0:80 -> returns 404 if requested with instance id that is not registered', async () => {
            expect.assertions(1);

            const resp = await request(app).get("/instances/mockBad:0.0.0.0:80");
    
            expect(resp.statusCode).toEqual(404);
        });
    });
    
    describe("POST method", () => {
        it('POST /instances/mockData:0.0.0.0:80 -> registers mock data successfully', async () => {
            expect.assertions(2);
            
            const fakeData: InstanceRaw = {
                instanceId: InstanceId.fromString('mockData:0.0.0.0:80').toString(),
                name: 'mockName',
                description: 'mockDesc',
                version: '1',
                status: 'OK',
                balancerOptions: {
                    weight: 1,
                },
                url: 'http://localhost',
                last_heartbeat: 0,
            };

            const resp = await request(app)
                .post("/instances/mockData:0.0.0.0:80")
                .send(fakeData);
                
            expect(mockAdd.mock.calls.length).toBe(1);
            expect(resp.statusCode).toBe(201)
        });

        it('POST /instances/mock:0.0.0.0:80 -> errors if instance is already registered', async () => {
            expect.assertions(1);

            const resp = await request(app)
                .post('/instances/mock:0.0.0.0:80')
                .send({
                    instanceId: InstanceId.fromString('mock:0.0.0.0:80').toString(),
                    name: 'mock',
                    description: 'mockDesc',
                    version: '1',
                    status: 'OK',
                    balancerOptions: {
                        weight: 1,
                    },
                    url: 'http://localhost',
                    last_heartbeat: 0,
                } as InstanceRaw);
            
            expect(resp.status).toBe(400);
        });

        it("POST /instances/mockFake:0.0.0.0:80 -> errors if requested with instance id that doesn't match body's instance id", async () => {
            expect.assertions(1);

            const resp = await request(app)
                .post('/instances/mockFake:0.0.0.0:80')
                .send({
                    instanceId: InstanceId.fromString('mockFake2:0.0.0.0:80').toString(),
                    name: 'mockFake',
                    description: 'mockDesc',
                    version: '1',
                    status: 'OK',
                    balancerOptions: {
                        weight: 1,
                    },
                    url: 'http://localhost',
                    last_heartbeat: 0,
                } as InstanceRaw);
            
            expect(resp.statusCode).toBe(400);
        });
    });

    describe("PUT method", () => {
        it("PUT /instances/mock:0.0.0.0:80 -> updates instance successfully", async () => {
            expect.assertions(2);

            const resp = await request(app)
                .put('/instances/mock:0.0.0.0:80')
                .send({
                    instanceId: InstanceId.fromString('mock:0.0.0.0:80').toString(),
                    name: 'mock',
                    description: 'mockDesc',
                    version: '1',
                    status: 'OK',
                    balancerOptions: {
                        weight: 1,
                    },
                    url: 'http://localhost',
                    last_heartbeat: 0,
                } as InstanceRaw);
            
            expect(resp.statusCode).toBe(200);
            expect(mockUpdate).toBeCalled();
        });

        it("PUT /instances/mockFake:0.0.0.0:80 -> errors if requested with instance id that is not registered", async () => {
            expect.assertions(1);

            const resp = await request(app)
                .put('/instances/mockFake:0.0.0.0:80')
                .send({
                    instanceId: InstanceId.fromString('mockFake:0.0.0.0:80').toString(),
                    name: 'mockFake',
                    description: 'mockDesc',
                    version: '1',
                    status: 'OK',
                    balancerOptions: {
                        weight: 1,
                    },
                    url: 'http://localhost',
                    last_heartbeat: 0,
                } as InstanceRaw);
            
            expect(resp.statusCode).toBe(400);
        });

        it("PUT /instances/mockFake:0.0.0.0:80 -> errors if requested with instance id that doesn't match body's instance id", async () => {
            expect.assertions(1);

            const resp = await request(app)
                .put('/instances/mockFake:0.0.0.0:80')
                .send({
                    instanceId: InstanceId.fromString('mockFake2:0.0.0.0:80').toString(),
                    name: 'mockFake',
                    description: 'mockDesc',
                    version: '1',
                    status: 'OK',
                    balancerOptions: {
                        weight: 1,
                    },
                    url: 'http://localhost',
                    last_heartbeat: 0,
                } as InstanceRaw);
            
            expect(resp.statusCode).toBe(400);
        });
    });

    describe("DELETE method", () => {
        it("DELETE /instances/mock:0.0.0.0:80 -> deletes instance successfully", async () => {
            expect.assertions(1);

            const resp = await request(app)
                .delete('/instances/mock:0.0.0.0:80');
            
            expect(resp.statusCode).toBe(200);
        });

        it("DELETE /instances/mock5:0.0.0.0:80 -> errors if requested with instance id that is not registered", async () => {
            expect.assertions(1);

            const resp = await request(app)
                .delete('/instances/mock5:0.0.0.0:80');
            
            expect(resp.statusCode).toBe(400);
        });
    });
});