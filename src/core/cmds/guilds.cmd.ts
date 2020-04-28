import * as Commando from 'discord.js-commando'
import * as moment from 'moment'
import { Guild } from "discord.js";
import { BotError } from '../bot-error';

export default class Guilds extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'guilds',
            group: 'general',
            memberName: 'guilds',
            description: 'Lists the guilds the bot is in',
        })
    }

    async run(message, args) {
        let guilds: Guild[] = message.client.guilds.array();

        message.channel.send(`I am in ${guilds.length} servers.`);

        for (let guild of guilds) {
            let channel = guild.channels.find('name', 'general');

            let invite;
            let embed;

            try {
                invite = await channel.createInvite({ maxAge: 180 });
                embed = {
                    description: `Invite Link: [Join Server](${invite.url})`,
                    color: 3447003,
                    author: {
                        name: `${guild.name}`,
                        icon_url: guild.iconURL
                    },
                    footer: {
                        icon_url: guild.owner.user.avatarURL,
                        text: `Server Owner: ${guild.owner.user.username}#${guild.owner.user.discriminator}`
                    }
                };
            } catch (e) {
                embed = {
                    description: `Cannot generate an Invite Link.`,
                    color: 3447003,
                    author: {
                        name: `${guild.name}`,
                        icon_url: guild.iconURL
                    },
                    footer: {
                        icon_url: guild.owner.user.avatarURL,
                        text: `Server Owner: ${guild.owner.user.username}#${guild.owner.user.discriminator}`
                    }
                };
            } finally {
                await message.channel.send({ embed });
            }
        }
    }
}
