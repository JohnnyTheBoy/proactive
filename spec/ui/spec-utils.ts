import HtmlTemplateEngine from "../../src/ui/templateEngines";

export function parse(template: string): Node[] {
    const engine = new HtmlTemplateEngine();
    const nodes = engine.parse(template);
    return nodes;
}

let knownEvents = {};
let knownEventTypesByEventName = {};
const keyEventTypeName = "KeyboardEvent";
knownEvents[keyEventTypeName] = ["keyup", "keydown", "keypress"];
knownEvents["MouseEvents"] = ["click", "dblclick", "mousedown", "mouseup", "mousemove", "mouseover", "mouseout", "mouseenter", "mouseleave"];

Object.keys(knownEvents).forEach(x => {
    let eventType = x;
    let knownEventsForType = knownEvents[x];

    if (knownEventsForType.length) {
        for (let i = 0, j = knownEventsForType.length; i < j; i++) {
            knownEventTypesByEventName[knownEventsForType[i]] = eventType;
        }
    }
});

export function triggerEvent(element: HTMLElement, eventType: string, keyCode?: any) {
    if (typeof document.createEvent === "function") {
        if (typeof element.dispatchEvent === "function") {
            let eventCategory = knownEventTypesByEventName[eventType] || "HTMLEvents";
            let event: any;

            if (eventCategory !== "KeyboardEvent") {
                event = document.createEvent(eventCategory);
                (<any> event.initEvent)(eventType, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, element);
            } else {
                let keyEvent = <KeyboardEvent> <any> document.createEvent(eventCategory);
                keyEvent.initKeyboardEvent(eventType, true, true, window, "", 0, "", false, "");

                if (keyCode) {
                    Object.defineProperty(keyEvent, "keyCode", {
                        get() {
                            return keyCode;
                        },
                    });
                }

                event = keyEvent;
            }

            element.dispatchEvent(event);
        } else {
            throw new Error("The supplied element doesn't support dispatchEvent");
        }
    } else if (element.click) {
        element.click();
    } else if (typeof element["fireEvent"] !== "undefined") {
        element["fireEvent"]("on" + eventType);
    } else {
        throw new Error("Browser doesn't support triggering events");
    }
}