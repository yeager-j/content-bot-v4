import * as Commando from 'discord.js-commando';
import { BotError } from '../bot-error';

export default class Error extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'leave',
            group: 'general',
            memberName: 'leave',
            description: 'Causes the bot to leave the server.'
        })
    }

    hasPermission(msg) {
        return msg.client.isOwner(msg.author);
    }

    async run(message, args) {
        message.channel.send(`Bye bitches!`);
        message.guild.leave();
    }
}
