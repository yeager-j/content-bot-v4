import * as Commando from 'discord.js-commando';
import { BotError } from '../../core/bot-error';
import { Client, Guild } from "discord.js";

export default class Broadcast extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'broadcast',
            group: 'admin',
            memberName: 'broadcast',
            description: 'Broadcasts a message to all servers.',
            args: [
                {
                    key: 'message',
                    label: 'message',
                    prompt: 'What message should I send?',
                    type: 'string'
                }
            ]
        })
    }

    hasPermission(msg) {
        return msg.member.hasPermission('MENTION_EVERYONE');
    }

    async run(message, args) {
        let client: Client = message.client;
        let guilds: Guild[] = client.guilds.array();

        for (let guild of guilds) {
            let channel: any = guild.channels.find('name', 'general');

            if (channel && channel.type === 'text') {
                let embed = {
                    title: `Broadcast!`,
                    description: args.message,
                    author: {
                        name: message.member.user.username,
                        icon_url: message.member.user.avatarURL
                    },
                    color: 32768
                };

                channel.send({ embed })
            }
        }
    }
}
