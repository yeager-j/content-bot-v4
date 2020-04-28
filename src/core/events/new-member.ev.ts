import * as moment from 'moment';

import { Event } from '../event';
import { TextChannel } from 'discord.js';
import { BotError } from '../bot-error';
import * as admin from 'firebase-admin';
import GlobalBan from '../../global-ban/cmds/global-ban.cmd';

export default class NewMember extends Event {
    constructor() {
        super('guildMemberAdd');
    }

    async run(client, ...args) {
        const hour = 1000 * 60 * 60;
        const day = hour * 24;
        const member = args[0][0];

        let now = moment();

        let embed: any = {
            title: "Member Join!",
            description: `+ [${now.format('dddd, MMMM Do YYYY, h:mm:ss a')}] ${member.user.username} has joined the server!`,
            color: 4376052
        };

        if (now.unix() * 1000 - member.user.createdTimestamp <= hour) {
            embed.fields = [
                {
                    name: "!! Warning !!",
                    value: "This user's account is less than an hour old!"
                }
            ];
        } else if (now.unix() * 1000 - member.user.createdTimestamp <= day) {
            embed.fields = [
                {
                    "name": "!! Warning !!",
                    "value": "This user's account is less than a day old!"
                }
            ];
        }

        try {
            let db = admin.firestore();
            let usersRef = db.collection('guilds').doc(`${member.guild.name}: ${member.guild.id}`).collection('marked users');
            let user = await usersRef.where('user.id', '==', member.user.id).get();

            if (user.size > 0) {
                if (user.docs[0].data().marked) {
                    if (!embed.fields) {
                        embed.fields = [];
                    }

                    embed.fields.push({
                        name: "!! Info !!",
                        value: "This user is marked!"
                    });
                }
            }
        } catch (e) {
            throw new BotError('Error', e);
        }

        let channel = member.guild.channels.find('name', client.settings.event_channel);

        if (channel instanceof TextChannel) {
            channel.send({ embed });
        }
    }
}
