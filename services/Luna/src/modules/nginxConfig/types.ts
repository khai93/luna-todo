import EventEmitter from "node:events";
import { Name } from "src/common/name";


export type NginxConfigDirective = {
    name: string,
    params: string[]
}

export interface NginxConfigContext extends EventEmitter {
    readonly name: string;
    readonly value: string | number;

    getContexts(name: string): NginxConfigContext[];
    addContext(name: string, value: string): NginxConfigContext;
    addComment(comment: string): NginxConfigContext;
    getComments(): string[];
    addDirective(directive: NginxConfigDirective): NginxConfigContext;
    getDirectives(name: string): NginxConfigDirective[] | undefined;
    editDirective(directiveToEdit: NginxConfigDirective, changes: NginxConfigDirective): NginxConfigContext | undefined;
}   

export interface NginxConfigModule {
    getRootContext(): Promise<NginxConfigContext>;
    getContexts(name: string, parentContext?: NginxConfigContext): NginxConfigContext[] | undefined;
    addContext(name: string, value: string, parentContext?: NginxConfigContext): NginxConfigContext;
    /**
     * Looks for the first server context, 
     * either inside/outside a http context
     */
    getServerContext(): Promise<NginxConfigContext | undefined>;
    getServiceUpstreamContext(serviceName: Name): NginxConfigContext | undefined;
    getServiceLocationContext(serviceName: Name): NginxConfigContext | undefined;
    getServiceUpstreamKey(serviceName: Name): string;
    editDirectivesIfNotSame(context: NginxConfigContext, directives: NginxConfigDirective[], uniqueParamIndex?: number): void;
    
    /**
     * Checks if every directive in an array exists in context,
     * if they don't, adds the directive to the context.
     * @param context 
     * @param directives list fo directives to check and add
     */
    addDirectivesIfNotExist(context: NginxConfigContext, directives: NginxConfigDirective[]): void;
}

export interface NginxConfigContextEvents {
    error: (error: Error) => void,
    update: (updatedContext: NginxConfigContext) => void
}


export class NginxConfigModuleError extends Error {
    constructor(message : string) {
        super(message);
        
        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}