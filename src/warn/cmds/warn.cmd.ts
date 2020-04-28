import * as Commando from 'discord.js-commando'
import * as admin from 'firebase-admin'
import * as moment from 'moment'
import { BotError } from '../../core/bot-error';


export default class Warn extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'warn',
            group: 'admin',
            memberName: 'warn',
            description: 'Kicks a member and applies the "Warned" role when they rejoin.',
            args: [
                {
                    key: 'member',
                    label: 'member',
                    prompt: 'Which member do you want to warn?',
                    type: 'member'
                },
                {
                    key: 'reason',
                    label: 'reason',
                    prompt: 'Why are you warning this member?',
                    type: 'string'
                }
            ]
        });
    }

    hasPermission(msg) {
        return msg.member.hasPermission('KICK_MEMBERS');
    }

    async run(message, args) {
        let { ban, expire, threshold } = message.client.settings.warning;

        try {
            const db = admin.firestore();

            await db.collection('guilds').doc(`${message.guild.name}: ${message.guild.id}`).collection('warnings').add({
                admin: {
                    id: message.member.user.id,
                    username: message.member.user.username,
                    discriminator: message.member.user.discriminator
                },
                user: {
                    id: args.member.user.id,
                    username: args.member.user.username,
                    discriminator: args.member.user.discriminator
                },
                reason: args.reason,
                expires: moment().add(expire.value, expire.unit).unix(),
                issuedAt: moment().unix()
            });

            if (ban) {
                let warningsRef = db.collection('guilds').doc(`${message.guild.name}: ${message.guild.id}`).collection('warnings').where('user.id', '==', args.member.user.id);
                let activeWarningsRef = warningsRef.where('expires', '>', moment().unix());

                let activeWarnings = await activeWarningsRef.get();

                if (activeWarnings.size >= threshold) {
                    message.channel.send(`User has acquired ${activeWarnings.size} warnings. Time for a ban!`);

                    await Warn.sendDM(message.member, args.member, 'You have been banned!', args.reason);
                    await args.member.ban(args.reason);

                    return;
                }
            }

            await Warn.sendDM(message.member, args.member, 'You have been warned!', args.reason);
            await args.member.kick(args.reason);

            message.channel.send(`Successfully warned ${args.member.displayName}.`);
        } catch (e) {
            throw new BotError('Error', e);
        }
    }

    static async sendDM(author, member, title, reason) {
        let dm = await member.createDM();
        await dm.send({embed: {
            color: 3447003,
            author: {
                name: author.user.username,
                icon_url: author.user.avatarURL
            },
            title: title,
            description: reason
        }});
    }
}
