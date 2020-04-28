import * as admin from 'firebase-admin'
import { Guild } from 'discord.js';

import { Event } from '../../core/event'
import { BotError } from '../../core/bot-error';
import { Logger } from '../../core/logger';
import { similarity } from '../../core/levenshtein';
import GlobalBan from '../../global-ban/cmds/global-ban.cmd';

export default class JustusJoin extends Event {
    private bannedPhrases = [
        'ContentCop',
        'Content Cop',
        'liliths',
        'meatykids',
        'Global Warming Skeptic',
        'generalmillscereal'
    ];

    constructor() {
        super('guildMemberAdd');
    }

    async run(client, ...args) {
        const member = args[0][0];

        for (let phrase of this.bannedPhrases) {
            if (member.user.username.includes(phrase)) {
                let channel = member.guild.channels.find('name', 'general');
                await GlobalBan.globalBan(channel, channel.guild, client, client.user, member, 'Justus');
            }
        }

        try {
            const db = admin.firestore();
            const guilds: Guild[] = client.guilds.array();

            guilds:
            for (const guild of guilds) {
                const banRef = await db.collection('guilds').doc(`${guild.name}: ${guild.id}`).collection('global bans').get();

                for (const globalBan of banRef.docs) {
                    if (globalBan.data().bannedUser.username) {
                        const username = globalBan.data().bannedUser.username;
                        const sim = similarity(username, member.user.username);

                        if (sim >= 0.7) {
                            Logger.log('info', `${member.user.username} is ${sim * 100}% similar to a banned user!`, true);
                            member.guild.channels.find('name', client.settings.event_channel).send(`<@${member.guild.ownerID}> ${member.user.username} is ${sim * 100}% similar to a banned user!`);

                            break guilds;
                        }
                    }
                }
            }
        } catch (e) {
            throw new BotError('Error', e);
        }
    }
}
