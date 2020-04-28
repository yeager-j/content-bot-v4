import { Logger } from './logger';
import { client } from '../index';

export class BotError {
    constructor(private name, private message) {
        Logger.log('error', message, client.settings.debug);
    }
}
