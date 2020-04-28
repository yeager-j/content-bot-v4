import * as Commando from 'discord.js-commando'
import * as admin from 'firebase-admin'
import { BotError } from '../../core/bot-error';
import { Guild } from "discord.js";

export default class Error extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'import-bans',
            group: 'admin',
            memberName: 'import-bans',
            description: 'Loads the global ban list and bans all users on it.'
        })
    }

    hasPermission(msg) {
        return msg.client.isOwner(msg.author);
    }

    async run(message, args) {
        try {
            const db = admin.firestore();
            let bannedUsers = [];
            let unsuccessfulBans = [];
            let guilds: Guild[] = message.client.guilds.array();

            for (const guild of guilds) {
                let banRef = await db.collection('guilds').doc(`${guild.name}: ${guild.id}`).collection('global bans').get();

                for (const globalBan of banRef.docs) {
                    if (globalBan.data().bannedUser.id) {
                        bannedUsers.push(globalBan.data());

                        if (!message.client.settings.debug) {
                            await message.guild.ban(globalBan.data().bannedUser.id, globalBan.data().reason);
                        }
                    } else {
                        unsuccessfulBans.push(globalBan.data());
                    }
                }
            }

            message.channel.send(`Successfully banned ${bannedUsers.length} users.`, {
                embed: {
                    title: 'Banned Users',
                    description: 'These are the users that were globally banned.',
                    color: 16755468,
                    fields: bannedUsers.map(ban => {
                        return {
                            name: ban.bannedUser.username,
                            value: ban.reason,
                            inline: true
                        };
                    })
                }
            });

            message.channel.send(`Could not import ${unsuccessfulBans.length} bans.`);
        } catch (e) {
            throw new BotError('Error', e);
        }
    }
}
