import * as fs from 'fs-extra';
import * as path from 'path';
import { BotError } from './bot-error';

export abstract class Module {
    abstract init();

    registerCommands(client, cmdPath) {
        client.registry.registerCommandsIn(cmdPath);
    }

    async registerEvents(client, evPath) {
        let files;

        try {
            files = await fs.readdir(evPath);
        } catch (e) {
            throw new BotError('FileError', e);
        }

        files.forEach(async file => {
            let Event;

            try {
                Event = await import(path.join(evPath, file.slice(0, -3)));
            } catch (e) {
                throw new BotError('Import Error', e);
            }

            let event = new Event.default(client);
            event.client = client;

            console.info(`Registered event ${event.event}`);

            client.on(event.event, (...args) => event.run(client, args));
        });
    }
}
