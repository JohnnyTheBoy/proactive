import { Observable, Subscription } from "rxjs";
import { DomManager } from "../domManager";
import { isRxObservable } from "../utils";
import { INodeState, IComponent, IDataContext, IBinding } from "../interfaces";
import { DataContext } from "../nodeState";
import { BaseHandler } from "./baseHandler";
import { ComponentRegistry } from "../componentRegistry";
import { HtmlEngine } from "../templateEngines";

export class ComponentBinding<T> extends BaseHandler<string> {
    private readonly domManager: DomManager;
    protected readonly registry: ComponentRegistry;
    private readonly engine: HtmlEngine;
    constructor(name: string, domManager: DomManager, engine: HtmlEngine, registry: ComponentRegistry) {
        super(name);
        this.priority = 20;
        this.unique = true;
        this.controlsDescendants = true;
        this.domManager = domManager;
        this.registry = registry;
        this.engine = engine;
    }

    public applyInternal(element: HTMLElement, binding: IBinding<string>, state: INodeState, shadowDom = false): void {
        const host = element;
        if (element.attachShadow !== undefined && shadowDom) {
            element.attachShadow({ mode: "open" });
            element = element.shadowRoot as any;
        }
        const component = this.getComponent(binding, state);
        // transclusion
        const children = this.engine.createFragment();
        this.domManager.applyBindingsToDescendants(state.context, element);
        while (element.firstChild) {
            children.appendChild(element.removeChild(element.firstChild));
        }

        let internal: Subscription;
        function doCleanup() {
            if (internal) {
                internal.unsubscribe();
            }
        }

        // subscribe to any input changes
        binding.cleanup.add(component.subscribe(comp => {
            doCleanup();
            internal = new Subscription();
            // isolated nodestate and ctx
            let newContext = state.context;

            if (comp.viewModel) {
                newContext = new DataContext(comp.viewModel);

                // wire custom events
                if (comp.viewModel.emitter !== undefined && isRxObservable(comp.viewModel.emitter)) {
                    internal.add(comp.viewModel.emitter.subscribe(evt => host.dispatchEvent(evt)));
                }
                // apply custom component value
                if (comp.viewModel.value !== undefined && isRxObservable(comp.viewModel.value)) {
                    internal.add(comp.viewModel.value.subscribe(val => {
                        host["value"] = val;
                        const evt = this.engine.createEvent("change");
                        host.dispatchEvent(evt);
                    }));
                }
                // auto-dispose view-model
                if (comp.viewModel.cleanup !== undefined) {
                    internal.add(comp.viewModel.cleanup);
                }
            }
            // done
            this.applyTemplate(element, newContext, comp, children);
        }));
        binding.cleanup.add(doCleanup);
    }
    protected getComponent(binding: IBinding<string>, state: INodeState): Observable<IComponent> {
        const name = binding.evaluate(state.context, this.dataFlow) as Observable<string>;
        const descriptor = name.mergeMap(n => this.registry.load(n));
        const params = this.getParams(state);
        const vm = this.getVm(state);
        return descriptor.map(desc => <IComponent> { viewModel: this.registry.initialize(desc, params, vm), template: desc.template });
    }
    protected applyTemplate(element: HTMLElement, childContext: IDataContext, component: IComponent, children: DocumentFragment) {
        if (component.template) {
            // clear
            while (element.firstChild) {
                this.domManager.cleanNode(<Element> element.firstChild);
                element.removeChild(element.firstChild);
            }
            element.appendChild(component.template);
        }

        // invoke preBindingInit
        if (component.viewModel && component.viewModel.hasOwnProperty("preInit")) {
            (<any> component.viewModel).preInit(element, childContext);
        }

        this.domManager.applyBindingsToDescendants(childContext, element);
        // transclusion
        for (let i = 0; i < element.childNodes.length; i++) {
            const child = element.childNodes[i] as HTMLElement;
            if (child.tagName === "SLOT") {
                element.insertBefore(children.cloneNode(true), child);
                this.domManager.cleanNode(element.removeChild(child) as HTMLElement);
            }
        }

        // invoke postBindingInit
        if (component.viewModel && component.viewModel.hasOwnProperty("postInit")) {
            (<any> component.viewModel).postInit(element, childContext);
        }
    }

    private getParams(state: INodeState): T {
        const params = {} as T;
        const attributes = state.getBindings<any>("attr");
        if (attributes.length > 0) {
            attributes.forEach(x => params[x.parameter as string] = x.expression(state.context));
        }
        return params;
    }
    private getVm(state: INodeState): T | undefined {
        const vm = state.getBindings<T>("attr").filter(x => x.parameter === "vm")[0];
        if (vm !== undefined) {
            return vm.expression(state.context) as T;
        }
        return undefined;
    }
}
