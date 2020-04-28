import * as Commando from 'discord.js-commando'
import * as admin from 'firebase-admin'
import * as _ from 'underscore'
import { Client, Guild } from 'discord.js'
import { Logger } from '../../core/logger'
import * as moment from 'moment';
import { BotError } from '../../core/bot-error';
import { GlobalBanModule } from '../global-ban.module';

export default class GlobalBan extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'global-ban',
            group: 'admin',
            memberName: 'global-ban',
            description: 'Bans a user on all servers this bot is Administrator on',
            args: [
                {
                    key: 'member',
                    label: 'member',
                    prompt: 'Which user do you want to ban?',
                    type: 'member'
                },
                {
                    key: 'reason',
                    label: 'reason',
                    prompt: 'Why do you want to ban them?',
                    type: 'string'
                }
            ]
        })
    }

    hasPermission(msg) {
        return msg.member.hasPermission('BAN_MEMBERS');
    }

    async run(message, args) {
        let client: Client = message.client;

        GlobalBan.globalBan(message.channel, message.guild, message.client, message.author, args.member, args.reason);
    }

    static async globalBan(channel, guild, client, adminUser, member, reason) {
        let guilds: Guild[] = client.guilds.array();
        let successfulGuilds = [];

        let obj: any = {
            bannedUser: _.pick(member.user, (value, key, object) => value !== undefined && typeof value !== 'object' && typeof value !== 'function'),
            originGuild: _.pick(guild, (value, key, object) => value !== undefined && typeof value !== 'object' && typeof value !== 'function'),
            guilds: guilds.map(guild => _.pick(guild, 'createdAt', 'createdTimestamp', 'id', 'memberCount', 'name', 'ownerID')),
            reason: reason,
            admin: {
                id: adminUser.id,
                username: adminUser.username,
                discriminator: adminUser.discriminator
            },
            successfulGuilds: [],
            unsuccessfulGuilds: []
        };

        channel.send(`Trying to ban ${member.user.username} globally...`);

        for (let guild of guilds) {
            try {
                await guild.ban(member, reason);

                let channel: any = guild.channels.find('name', client.settings.event_channel);

                if (channel && channel.type === 'text') {
                    channel.send({
                        embed: {
                            title: 'Global Ban!',
                            color: 13372171,
                            description: `A user has been banned on ${guilds.length} servers.`,
                            fields: [
                                {
                                    name: 'Origin Server',
                                    value: guild.name,
                                    inline: true
                                },
                                {
                                    name: 'Banned User',
                                    value: `${member.user.username}#${member.user.discriminator}`,
                                    inline: true
                                },
                                {
                                    name: 'Moderator',
                                    value: `${adminUser.username}#${adminUser.discriminator}`,
                                    inline: true
                                },
                                {
                                    name: 'Reason',
                                    value: reason,
                                    inline: true
                                }
                            ]
                        }
                    });
                }

                obj.successfulGuilds.push(_.pick(guild, 'createdAt', 'createdTimestamp', 'id', 'memberCount', 'name', 'ownerID'));
                successfulGuilds.push(guild);
            } catch (e) {
                channel.send(`I was unable to ban ${member.user.username} in the guild ${guild.name}`);
                obj.unsuccessfulGuilds.push(_.pick(guild, 'createdAt', 'createdTimestamp', 'id', 'memberCount', 'name', 'ownerID'));
                throw new BotError('Ban Error', e);
            }
        }

        if (successfulGuilds.length > 0) {
            let names = successfulGuilds.map(guild => guild.name);

            channel.send(`Successfully banned ${member.user.username} in ${names.join(',')}`);
        }

        try {
            let db = admin.firestore();
            await db.collection('guilds').doc(`${guild.name}: ${guild.id}`).collection('global bans').doc(moment().format('MMMM Do YYYY, h:mm:ss a')).set(obj);
        } catch (e) {
            throw new BotError('Error', e);
        }
    }
}
