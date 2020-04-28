import { Event } from '../event'
import { Logger } from '../logger'

export default class ReadyEvent extends Event {
    constructor() {
        super('ready');
    }

    async run(client, ...args) {
        client.user.setGame('v' + client.version);

        Logger.log('log', '======================');
        Logger.log('log', `Watchdog is ready to go! I'm v${client.version}!`, true);
        Logger.log('log', '======================');

        for (const guild of client.guilds.array()) {
            await guild.channels.find('name', 'general').send(`Watchdog is ready to go! I'm v${client.version}!`)
        }
    }
}
