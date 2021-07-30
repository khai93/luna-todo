import { Name } from "src/common/name";
import { Instance } from "src/common/instance";
import { TOKENS } from "src/di";
import { LoggerModule } from "src/modules/logger/types";
import { NginxConfigContext, NginxConfigModule } from "src/modules/nginxConfig/types";
import { ServiceModule } from "src/modules/service/types";
import { autoInjectable, inject } from "tsyringe";
import { LoadBalancer, LoadBalancerError } from "../types";


@autoInjectable()
export class NginxRoundRobinBalancer implements LoadBalancer {
    private _serverContext: NginxConfigContext | undefined;

    constructor(
        @inject(TOKENS.modules.logger) private logger?: LoggerModule,
        @inject(TOKENS.modules.service) private serviceModule?: ServiceModule,
        @inject(TOKENS.modules.nginxConfig) private nginxConfigModule?: NginxConfigModule    
    ) { }

    async balanceService(serviceName: Name, currentInstance?: Instance): Promise<Instance> {
        if (currentInstance == null) {
            throw new LoadBalancerError("Current Instance must be passed into nginx round robin module");
        }

        if (this._serverContext == null) {
            this._serverContext = await this.nginxConfigModule!.getServerContext();
        }

        const serviceUpstreamContext = this.nginxConfigModule!.getServiceUpstreamContext(serviceName);


        const instanceAlreadyAdded = serviceUpstreamContext?.getDirectives('server')
                               ?.some(directive => directive.params[0] === currentInstance.value.url.host);
        
        if (!instanceAlreadyAdded) {
            serviceUpstreamContext?.addDirective({
                name: 'server',
                params: [currentInstance.value.url.host]
            });
        } else {
            const directive = serviceUpstreamContext?.getDirectives('server')
                              ?.find(directive => directive.params[0] === currentInstance.value.url.host);
 
            if (directive && directive.params.length > 1) {
                serviceUpstreamContext?.editDirective(directive, {
                    name: directive.name,
                    params: [
                        directive.params[0]
                    ]
                });
            }
        };

        const serviceLocationContext = this.nginxConfigModule!.getServiceLocationContext(serviceName);

        if (serviceLocationContext == null) {
            this.logger!.error(new LoadBalancerError("Service Location Context was unexpectedly undefined"));
        }

        return currentInstance;
    }
}