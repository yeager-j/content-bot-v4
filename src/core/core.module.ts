import * as path from 'path';

import { Module } from './module';


export class CoreModule extends Module {
    constructor(private client) {
        super();
    }

    async init() {
        await this.registerEvents(this.client, path.join(__dirname, 'events'));
        this.registerCommands(this.client, path.join(__dirname, 'cmds'));
    }
}
