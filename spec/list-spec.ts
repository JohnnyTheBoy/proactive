import { px } from "../src/proactive";
import { List } from "../src/list";
import { Observable, Subject, Symbol } from "rxjs/Rx";

describe("Observable List", () => {
    it("is correctly initialized from default value", () => {
        let obsList = px.list<number>([3, 2, 1]);
        expect(obsList()).toEqual([3, 2, 1]);
    });

    it("isEmpty test", () => {
        let fixture = px.list<number>();
        expect(fixture.isEmpty()).toBeTruthy();
        fixture.push(1);
        expect(fixture.isEmpty()).toBeFalsy();
    });

    it("should remove every item that satisfies the supplied selector", () => {
        const items = px.list([1, 2, 3, 4, 5]);
        const removed = items.remove(x => x % 2 === 0);
        expect(items()).toEqual([1, 3, 5]);
        expect(removed).toEqual([2, 4]);
    });

    it("should remove last item using pop", () => {
        const items = px.list([1, 2, 3, 4, 5]);
        const removed = items.pop();
        expect(items()).toEqual([1, 2, 3, 4]);
        expect(removed).toEqual(5);
    });
    it("should remove 1st item using shift", () => {
        const items = px.list([1, 2, 3, 4, 5]);
        const removed = items.shift();
        expect(items()).toEqual([2, 3, 4, 5]);
        expect(removed).toEqual(1);
    });
    it("should reverse order of items", () => {
        const items = px.list([1, 2, 3, 4, 5]);
        let reversed: number[] = [];
        items.subscribe(x => reversed = x);
        items.reverse();
        expect(items()).toEqual([5, 4, 3, 2, 1]);
        expect(reversed).toEqual([5, 4, 3, 2, 1]);
    });
    it("should remove range using splice", () => {
        const items = px.list([1, 2, 3, 4, 5]);
        let latest: number[] = [];
        items.subscribe(x => latest = x);
        const removed = items.splice(1, 3);
        expect(items()).toEqual([1, 5]);
        expect(removed).toEqual([2, 3, 4]);
        expect(latest).toEqual([1, 5]);
    });
});