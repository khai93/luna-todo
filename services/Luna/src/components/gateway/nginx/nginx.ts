import { IExecutable } from "src/common/interfaces/IExecutable";
import { TOKENS } from "src/di";
import { LoggerModule } from "src/modules/logger/types";
import { inject, injectable } from "tsyringe";
import shellJS from 'shelljs';
import config from "src/config";
import { Instance } from "src/common/instance";
import { ServiceModule } from "src/modules/service/types";
import { LoadBalancer } from "src/components/balancer/types";
import InstanceId from "src/common/instanceId";

@injectable()
export class NginxGatewayComponent implements IExecutable {
    private _reloading = false;

    constructor(
        @inject(TOKENS.modules.logger) private logger: LoggerModule,
        @inject(TOKENS.values.shell) private shell: typeof shellJS,
        @inject(TOKENS.values.config) private _config: typeof config,
        @inject(TOKENS.modules.service) private serviceModule: ServiceModule,
        @inject(TOKENS.components.balancer.nginx) private balancerComponent: LoadBalancer
    ) { }

    execute(): void {
        this.logger.log("Setting Nginx as the Api Gateway.");

        if (process.platform !== 'linux') {
            this.logger.fatal(new NginxModuleError("The Nginx component only supports linux."));
        }

        if(!this.shell.which('nginx')) {
            this.logger.fatal(new NginxModuleError("'nginx' was not found as a command and is required for nginx component."));
        }

        if (this._config.nginx.confFilePath == "") {
            this.logger.fatal(new NginxModuleError("Environment variable 'NGINX_CONFIG_FILE_PATH' is required to use nginx component."));
        }

        if(this.shell.exec('whoami', { silent: true }).stdout.toLowerCase().trim() !== "root") {
            this.logger.fatal(new NginxModuleError("Root permissions are required to use nginx as the api gateway, Please run luna with 'sudo' or as root."));
        }

        this.init()
        this.setUpListeners();
    }


    // Initialize all of the starting services from the start
    private async init() {
        const services = await this.serviceModule.getAll();

        for (const instance of services) {
            this.balancerComponent.balanceService(instance.value.name, instance);
        }

        this.requestNginxReload();
    }

    private setUpListeners() {
        this.serviceModule.on('update', (updatedInstance: Instance) => {
            this.logger.log(`Service [${updatedInstance.value.name.value}] updated.`);
            this.balancerComponent.balanceService(updatedInstance.value.name, updatedInstance);
            this.requestNginxReload();
        });

        this.serviceModule.on('remove', (removedInstanceId: InstanceId) => {
            this.logger.log(`Service [${removedInstanceId.raw.serviceName}] deregistered.`);
        });

        this.serviceModule.on('add', (addedInstance: Instance) => {
            this.logger.log(`Service [${addedInstance.value.name.value}] registered.`);
            this.balancerComponent.balanceService(addedInstance.value.name, addedInstance);
            this.requestNginxReload();
        });
    }

    private requestNginxReload() {
        if (this._reloading === false) {
            this._reloading = true;
            this.logger.log('Reloading Nginx service in 3 seconds.');

            setTimeout(() => {
                if (this.shell.exec('sudo nginx -t', { silent: true }).code != 0) {
                    this.logger.error(new NginxModuleError("Nginx Config File Test: Failure"));
                }

                if (this.shell.exec('sudo service nginx reload', { silent: true }).code != 0) {
                    this.logger.error(new NginxModuleError("Nginx Service Reload: Failure"));
                }

                this._reloading = false;
            }, 3000);
        }
    }
}

export class NginxModuleError extends Error {
    constructor(message : string) {
        super(message);
        
        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}