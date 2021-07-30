import { ExpressRegistryServicesRoute } from "./v1/services/services";
import { ExpressRegistryInstancesRoute } from "./v1/instances/instances";

export default [
    new ExpressRegistryServicesRoute(),
    new ExpressRegistryInstancesRoute()
]