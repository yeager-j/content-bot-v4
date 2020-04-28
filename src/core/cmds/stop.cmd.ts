import * as Commando from 'discord.js-commando';
import { BotError } from '../bot-error';
import { exec } from "child_process";

export default class Update extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'stop',
            group: 'general',
            memberName: 'stop',
            description: 'Causes the bot process to stop'
        })
    }

    hasPermission(msg) {
        return msg.client.isOwner(msg.author);
    }

    async run(message, args) {
        await message.channel.send(`Shutting down bot...`);

        exec('sh scripts/stop.sh');
    }
}
