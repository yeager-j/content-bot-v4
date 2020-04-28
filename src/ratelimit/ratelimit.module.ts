import { Module } from '../core/module';
import * as path from 'path';
import * as moment from 'moment';


export class RatelimitModule extends Module {
    constructor(private client) {
        super();
    }

    async init() {
        await this.registerEvents(this.client, path.join(__dirname, 'events'));
        this.registerCommands(this.client, path.join(__dirname, 'cmds'));
    }
}

export let rateLimited: { id, last_msg, is_limited, remaining_msgs, reset_time }[] = [];
export function resetTime() {
    return moment().add(4, 'seconds').unix() * 1000;
}
