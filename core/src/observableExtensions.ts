import * as Rx from "rxjs";
import { ComputedValue } from "./interfaces";
import { ComputedValueImpl } from "./computed";
import { ComputedArrayImpl, ComputedArray } from "./computedArray";

declare module "rxjs/Observable" {
    export interface Observable<T> {
        toComputed(initial?: T): ComputedValue<T>;
    }
}

Rx.Observable.prototype.toComputed = function<T>(this: Rx.Observable<T>, initial?: T): ComputedValue<T> {
    return ComputedValueImpl.createComputed<T>(this, <any> initial);
};
Rx.Observable.prototype["toComputedArray"] = function<T>(this: Rx.Observable<T[]>): ComputedArray<T> {
    return ComputedArrayImpl.createComputedArray<T>(this);
};