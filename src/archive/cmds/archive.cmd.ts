import * as Commando from 'discord.js-commando'
import * as admin from 'firebase-admin'
import * as _ from 'underscore'
import * as moment from 'moment'
import { Logger } from '../../core/logger'
import { BotError } from '../../core/bot-error';


export default class Archive extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'archive',
            group: 'admin',
            memberName: 'archive',
            description: 'Archives messages in a channel. Default 50.',
            details: 'Usage: !archive [messages] (Max: 50, Default: 20)',
            args: [
                {
                    key: 'messages',
                    label: 'messages',
                    prompt: 'How many messages should be archived?',
                    type: 'integer',
                    default: 20,
                    max: 50
                }
            ]
        });
    }

    hasPermission(msg) {
        return msg.member.hasPermission('MANAGE_MESSAGES');
    }

    async run(message, args) {
        let now = moment().format('MMMM Do YYYY, h:mm:ss a');

        try {
            const db = admin.firestore();
            const bucket = admin.storage().bucket();
            const batch = db.batch();
            const messages = await message.channel.fetchMessages({ limit: args.messages });

            await db.collection('guilds').doc(`${message.guild.name}: ${message.guild.id}`).collection('archives').doc(now).set({});

            const ref = db.collection('guilds').doc(`${message.guild.name}: ${message.guild.id}`).collection('archives').doc(now).collection('messages');

            message.channel.send(`Archiving ${messages.size} messages...`);

            for (let msg of messages.array()) {
                const obj = {
                    author: _.pick(msg.author, (value, key, object) => value !== undefined && typeof value !== 'object' && typeof value !== 'function'),
                    channel: _.pick(msg.channel, (value, key, object) => value !== undefined && typeof value !== 'object' && typeof value !== 'function'),
                    content: msg.content,
                    createdAt: msg.createdAt,
                    createdTimestamp: msg.createdTimestamp,
                    embeds: msg.embeds.map(embed => _.pick(embed, (value, key, object) => value !== undefined && typeof value !== 'object' && typeof value !== 'function')),
                    guild: _.pick(msg.guild, (value, key, object) => value !== undefined && typeof value !== 'object' && typeof value !== 'function'),
                    id: msg.id,
                    member: _.pick(msg.member, (value, key, object) => value !== undefined && typeof value !== 'object' && typeof value !== 'function')
                };

                const messageRef = ref.doc(msg.id);
                batch.set(messageRef, obj);

                if (msg.attachments.size > 0) {

                }
            }

            await batch.commit();

            message.channel.send(`Done!`);
        } catch (e) {
            throw new BotError('Error', e);
        }
    }
}
