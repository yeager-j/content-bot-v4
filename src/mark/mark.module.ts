import { Module } from '../core/module';
import * as path from 'path';

export class MarkModule extends Module {
    constructor(private client) {
        super();
    }

    async init() {
        await this.registerEvents(this.client, path.join(__dirname, 'events'));
        this.registerCommands(this.client, path.join(__dirname, 'cmds'));
    }
}
