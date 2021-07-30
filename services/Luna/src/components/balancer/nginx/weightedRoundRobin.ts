import { Name } from "src/common/name";
import { TOKENS } from "src/di";
import { LoggerModule } from "src/modules/logger/types";
import { ServiceModule } from "src/modules/service/types";
import { autoInjectable, inject, injectable } from "tsyringe";
import { Instance } from "../../../common/instance";
import { Status } from "../../../common/status/status";
import { NginxConfigContext, NginxConfigDirective, NginxConfigModule } from "src/modules/nginxConfig/types";
import { LoadBalancer, LoadBalancerError } from "../types";

@autoInjectable()
export class NginxWeightedRoundRobinBalancer implements LoadBalancer {
    private _serverContext: NginxConfigContext | undefined;

    constructor(
        @inject(TOKENS.modules.logger) private logger?: LoggerModule,
        @inject(TOKENS.modules.service) private serviceModule?: ServiceModule,
        @inject(TOKENS.modules.nginxConfig) private nginxConfigModule?: NginxConfigModule
    ){ }

    async balanceService(serviceName: Name, currentInstance: Instance): Promise<Instance> {
        if (this._serverContext == null) {
            this._serverContext = await this.nginxConfigModule!.getServerContext();
        }

        const serviceUpstreamContext = this.nginxConfigModule!.getServiceUpstreamContext(serviceName);
        const serviceWeight = currentInstance.value.balancerOptions.value.weight != null ? `weight=${currentInstance.value.balancerOptions.value.weight}` : '';

        const instanceAlreadyAdded = serviceUpstreamContext?.getDirectives('server')
                               ?.some(directive => directive.params[0] === currentInstance.value.url.host);
        
        const directives: NginxConfigDirective[] = [
                {
                    name: 'server',
                    params: [
                        currentInstance.value.url.host, 
                        serviceWeight, 
                        currentInstance.value.status.equals(new Status("DOWN")) ? 'down' : ''
                    ]
                }
        ];

        if (!instanceAlreadyAdded) {
            serviceUpstreamContext?.addDirective(directives[0]);
        } else {
            this.nginxConfigModule!.editDirectivesIfNotSame(serviceUpstreamContext as NginxConfigContext, directives, 0);
        };

        const serviceLocationContext = this.nginxConfigModule!.getServiceLocationContext(serviceName);

        if (serviceLocationContext == null) {
            this.logger!.error(new LoadBalancerError("Service Location Context was unexpectedly undefined"));
        }

        return currentInstance;
    }
}