import { Observable, Subscription, Observer } from "rxjs";
import { Group } from "./utils";

export interface IBindingAttribute<T> {
    readonly tag: string;
    readonly name: string;
    readonly text: string;
    readonly parameter?: string;
    readonly expression: (scope: IDataContext) => T | null;
    evaluate(ctx: IDataContext, element: Element, twoWay: boolean): Observable<T> | Observer<T>;
}

export interface IBindingHandler {
        readonly name: string;
        /**
        * When there are multiple bindings defined on a single DOM element,
        * sometimes it is necessary to specify the order in which the bindings are applied.
        */
        readonly priority: number;
        readonly twoWay: boolean;
       /**
        * If set to true then bindings won't be applied to children
        * of the element such binding is encountered on. Instead
        * the handler will be responsible for that.
        **/
        readonly controlsDescendants: boolean;
       /**
        * Applies the binding to the specified element
        * @param {Node} node The target node
        * @param {any} options The options for the handler
        * @param {IDataContext} ctx The curent data context
        * @param {IDomElementState} state State of the target element
        * @param {IModule} module The module bound to the current binding scope
        **/
        applyBinding(node: Node, state: INodeState, ctx: IDataContext): void;

}

export interface IDataContext {
    readonly $data: any;
    readonly $root: IViewModel;
    readonly $parent?: IViewModel;
    readonly $parents: IViewModel[];
}
export interface INodeState {
    readonly cleanup: Subscription;
    model: IViewModel;        // scope model
    isolate: boolean;
    bindings: Group<IBindingAttribute<any>>;
}
export interface IViewModel {
    readonly cleanup?: Subscription;
    readonly attributes?: { [name: string]: Observable<any> };
    readonly emitter?: Observable<Event>;
}

export interface IComponentDescriptor {
    name?: string;
    template: Node[] | string;
    viewModel?: IViewModel|(new (params?: Object) => IViewModel);
}

export interface IComponent {
    template: Node[];
    viewModel?: IViewModel;
}
