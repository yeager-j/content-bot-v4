import * as Commando from 'discord.js-commando'
import * as moment from 'moment'
import * as admin from 'firebase-admin'
import { BotError } from '../../core/bot-error';

export default class CheckWarnings extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'warnings',
            group: 'admin',
            memberName: 'warnings',
            description: 'Gets a list of active warnings against a user.',
            args: [
                {
                    key: 'member',
                    label: 'member',
                    prompt: 'Which member do you want to check?',
                    type: 'member'
                }
            ]
        });
    }

    hasPermission(msg) {
        return msg.member.hasPermission('KICK_MEMBERS');
    }

    async run(message, args) {
        try {
            let db = admin.firestore();

            let warningsRef = db.collection('guilds').doc(`${message.guild.name}: ${message.guild.id}`).collection('warnings').where('user.id', '==', args.member.user.id);
            let activeWarningsRef = warningsRef.where('expires', '>', moment().unix());

            let warnings = await warningsRef.get();
            let activeWarnings = await activeWarningsRef.get();

            if (activeWarnings.size > 0) {
                message.channel.send(`This user has ${activeWarnings.size} active warnings and has been warned ${warnings.size} times in total.`);

                activeWarnings.forEach(async doc => {
                    let warning = doc.data();

                    try {
                        let admin = await message.guild.fetchMember(warning.admin.id);

                        message.channel.send('', {embed: {
                                color: 3447003,
                                title: warning.reason,
                                description: `Expires on ${moment(warning.expires * 1000).calendar()}`,
                                author: {
                                    "name": admin.user.username,
                                    "icon_url": admin.user.avatarURL
                                }
                            }});
                    } catch (e) {
                        throw new BotError('Error', e);
                    }
                });
            } else {
                message.channel.send(`This user has no active warnings, but has been warned ${warnings.size} times total.`);
            }
        } catch (e) {
            throw new BotError('Error', e);
        }
    }
}
