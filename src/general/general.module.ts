import * as path from 'path';

import { Module } from '../core/module';


export class GeneralModule extends Module {
    constructor(private client) {
        super();
    }

    async init() {
        // await this.registerEvents(this.client, path.join(__dirname, 'events'));
        this.registerCommands(this.client, path.join(__dirname, 'cmds'));
    }
}
