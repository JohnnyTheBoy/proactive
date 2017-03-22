import * as Rx from "rxjs";
import { SingleBindingBase } from "./bindingBase";
import { DomManager } from "../domManager";
import { INodeState } from "../interfaces";

export class IfBinding extends SingleBindingBase<boolean> {

    public priority = 50;
    public controlsDescendants = true;
    protected inverse: boolean = false;

    constructor(name: string, domManager: DomManager) {
        super(name, domManager);
    }

    protected applySingleBinding(el: HTMLElement, observable: Rx.Observable<boolean>, state: INodeState) {
        const parent = el.parentElement as HTMLElement;
        const placeholder: Comment = document.createComment(`if`);
        parent.insertBefore(placeholder, el);

        this.domManager.nodeStateManager.set(placeholder, state);
        parent.removeChild(el);

        const visibility = observable.map(x => this.inverse ? !x : !!x).distinctUntilChanged();
        // subscribe
        state.cleanup.add(visibility.subscribe((x => {
            if (x) {
                this.domManager.applyBindingsToDescendants(state.context, el);
                parent.insertBefore(el, placeholder);
            } else if (el.parentElement === parent) {
                parent.removeChild(el);
                this.domManager.cleanDescendants(el);
            }
        })));
        state.cleanup.add(() => parent.removeChild(placeholder));
    }
}

export class NotIfBinding extends IfBinding {
    constructor(name: string, domManager: DomManager) {
        super(name, domManager);

        this.inverse = true;
    }
}
