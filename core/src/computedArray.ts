import { Observable } from "rxjs";
import { ComputedValueImpl } from "./computed";
import { Func, Disposable, ComputedValue } from "./interfaces";
import "./observableExtensions";

export class ComputedArrayImpl<T> extends ComputedValueImpl<T[]> {

    constructor(source: Observable<T[]>, initial: T[] = []) {
        super(source, initial);
    }

    public static createComputedArray<T>(source: Observable<T[]>): ComputedArray<T> {
        const accessor: ComputedArray<T> = (() => accessor.getValue()) as any;
        const call = accessor["call"];
        const apply = accessor["apply"];
        Object["setPrototypeOf"](accessor, new ComputedArrayImpl(source));
        accessor["call"] = call;
        accessor["apply"] = apply;
        accessor.subscription = accessor.subscribe(val => accessor.value = val, console.error);
        return accessor;
    }

    public mapArray<R>(fn: (x: T, ix?: number) => R): ComputedArray<R> {
        const obs: any = this.map(array => array.map(fn));
        return obs.toComputedArray();
    }
    public filterArray(fn: (x: T, ix?: number) => boolean): ComputedArray<T> {
        const obs: any = this.map(array => array.filter(fn));
        return obs.toComputedArray();
    }
    public sortArray(fn: (x: T, y: T) => number): ComputedArray<T> {
        const obs: any = this.map(array => array.slice().sort(fn));
        return obs.toComputedArray();
    }
    public everyArray(fn: (x: T, ix?: number) => boolean): ComputedValue<boolean> {
        return this.map(array => array.every(fn)).toComputed();
    }
    public someArray(fn: (x: T, ix?: number) => boolean): ComputedValue<boolean> {
        return this.map(array => array.some(fn)).toComputed();
    }
    public reduceArray<R>(fn: (x: R, y: T) => R, initial: R): ComputedValue<R> {
        return this.map(array => array.reduce(fn, initial)).toComputed();
    }
    public flatMapArray<R>(fn: (x: T) => R[]): ComputedArray<R> {
        const obs: any = this.map(array => array.reduce((cumulus: R[], next: T) => [...cumulus, ...fn(next)], <R[]> []));
        return obs.toComputedArray();
    }
    public static whenAny<T>(observables: Observable<Observable<T>[]>): ComputedArray<T> {
        const obs: any = observables.mergeMap(array => Observable.combineLatest<T[]>(array));
        return obs.toComputedArray();
    }
}

export interface ComputedArray<T> extends ComputedArrayImpl<T>, Func<T[]>, Disposable {
}