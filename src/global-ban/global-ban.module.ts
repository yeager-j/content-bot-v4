import * as path from 'path';

import { Module } from '../core/module';


export class GlobalBanModule extends Module {
    constructor(private client) {
        super();
    }

    async init() {
        this.registerCommands(this.client, path.join(__dirname, 'cmds'));
    }
}
