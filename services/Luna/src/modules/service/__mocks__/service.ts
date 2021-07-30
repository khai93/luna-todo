import InstanceId from "src/common/instanceId";
import { Instance } from "src/common/instance";

export const fakeInstance = new Instance({
    instanceId: 'mock:0.0.0.0:80',
    name: 'mock',
    description: 'mockDesc',
    version: '1',
    status: 'OK',
    balancerOptions: {
        weight: 1,
    },
    url: 'http://localhost',
    last_heartbeat: 0,
});

export const fakeInstance2 = new Instance({
    instanceId: 'mock2:0.0.0.0:80',
    name: 'mock2',
    description: 'mockDesc',
    version: '1',
    status: 'OK',
    balancerOptions: {
        weight: 1,
    },
    url: 'http://localhost',
    last_heartbeat: 0,
});

export const fakeInstance3 = new Instance({
    instanceId: 'mock3:0.0.0.0:80',
    name: 'mock3',
    description: 'mockDesc',
    version: '1',
    status: 'OK',
    balancerOptions: {
        weight: 1,
    },
    url: 'http://localhost',
    last_heartbeat: 0,
});

export let fakeServices = [
    fakeInstance,
    fakeInstance2,
    fakeInstance3
];

export const resetServiceModuleMocks = () => {
    fakeServices = [
        fakeInstance,
        fakeInstance2,
        fakeInstance3
    ];

    mockAdd.mockClear();
    mockUpdate.mockClear();
    mockRemove.mockClear();
    mockFindByInstanceId.mockClear();
    mockFindAllByName.mockClear();
    mockGetAll.mockClear();
    mockServiceModule.mockClear();
}


export const mockAdd = jest.fn((s) => Promise.resolve(s));
export const mockUpdate = jest.fn((s) => Promise.resolve(s));
export const mockRemove = jest.fn((instanceId) => {
    const foundService = fakeServices.findIndex(service => service.value.instanceId.equals(instanceId));
                
    if (foundService == -1) {
        fail(new Error("Called delete with service info that is not in the database."));
    }

    delete fakeServices[foundService];
    return Promise.resolve();
});
export const mockFindByInstanceId = jest.fn((instanceId) => {
    return fakeServices.find(service => service.value.instanceId.equals(instanceId))
});
export const mockFindAllByName = jest.fn();
export const mockGetAll = jest.fn(() => fakeServices);

const mockServiceModule = jest.fn().mockImplementation(() => {
    return {
        add: mockAdd,
        update: mockUpdate,
        remove: mockRemove,
        findByInstanceId: mockFindByInstanceId,
        findAllByName: mockFindAllByName,
        getAll: mockGetAll
    }
});

export default mockServiceModule;
