import { Module } from '../core/module';
import * as path from 'path';

export class ArchiveModule extends Module {
    constructor(private client) {
        super();
    }

    async init() {
        this.registerCommands(this.client, path.join(__dirname, 'cmds'));
    }
}
