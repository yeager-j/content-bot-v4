export abstract class Event {
    private _event;

    constructor(event) {
        this._event = event;
    }

    abstract run(client, ...args);

    get event() {
        return this._event;
    }

    set event(event) {
        this._event = event;
    }
}