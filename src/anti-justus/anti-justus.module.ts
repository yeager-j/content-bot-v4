import { Module } from '../core/module';
import * as path from 'path';

export class AntiJustusModule extends Module {
    constructor(private client) {
        super();
    }

    async init() {
        this.registerEvents(this.client, path.join(__dirname, 'events'));
    }
}
