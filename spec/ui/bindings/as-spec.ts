import * as it from "tape";
import * as px from "../../../src/core/proactive";
import * as ui from "../../../src/ui/app";
import * as util from "../spec-utils";

it("as: bound to a non-observable value", expect => {
    const template = `<div x-as-child="childModel"><span x-text="child.foo">invalid</span></div>`;
    const el = <HTMLElement> util.parse(template)[0];

    let childModel = {
        foo: px.value("bar"),
    };

    let viewModel = {
        childModel: childModel,
    };

    expect.doesNotThrow(() => ui.applyBindings(viewModel, el));

    expect.equal(el.children[0].textContent, viewModel.childModel.foo());
    viewModel.childModel.foo("foo");
    expect.equal(el.children[0].textContent, viewModel.childModel.foo());

    // try it again
    ui.cleanNode(el);
    viewModel.childModel.foo("baz");
    expect.notEqual(el.children[0].textContent, viewModel.childModel.foo());
    expect.end();
});

it("as: bound to an observable value", expect => {
    const template = `<div x-as-child="childModel"><span x-text="child.foo">invalid</span></div>`;
    const el = <HTMLElement> util.parse(template)[0];

    let childModel1 = {
        foo: px.value("bar"),
    };

    let childModel2 = {
        foo: px.value("magic"),
    };

    let viewModel = {
        childModel: px.value<any>(childModel1),
    };

    expect.doesNotThrow(() => ui.applyBindings(viewModel, el));
    expect.equal(el.children[0].textContent, childModel1.foo());

    viewModel.childModel().foo("foo");
    expect.equal(el.children[0].textContent, childModel1.foo());

    viewModel.childModel(childModel2);
    expect.equal(el.children[0].textContent, childModel2.foo());

    // try it again
    ui.cleanNode(el);
    viewModel.childModel().foo("baz");
    expect.notEqual(el.children[0].textContent, childModel2.foo());
    expect.end();
});