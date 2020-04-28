import * as Commando from 'discord.js-commando'
import * as moment from 'moment'
import * as admin from 'firebase-admin'
import { BotError } from '../../core/bot-error';


export default class Mark extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'mark',
            group: 'admin',
            memberName: 'mark',
            description: 'Marks a user as a troll, to make them forever a silly person!',
            args: [
                {
                    key: 'member',
                    label: 'member',
                    prompt: 'Which member do you want to mark?',
                    type: 'member'
                },
                {
                    key: 'reason',
                    label: 'reason',
                    prompt: 'Why are you marking them?',
                    type: 'string',
                    default: 'Being a bitch'
                }
            ]
        });
    }

    hasPermission(msg) {
        return msg.member.hasPermission('MANAGE_ROLES');
    }

    async run(message, args) {
        let db = admin.firestore();
        let usersRef;
        let user;

        try {
            usersRef = db.collection('guilds').doc(`${message.guild.name}: ${message.guild.id}`).collection('marked users');
            user = await usersRef.where('user.id', '==', args.member.user.id).get();
        } catch (e) {
            throw new BotError('Error', e);
        }

        let document = {
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
            marked: true,
            issuedAt: moment().unix()
        };

        try {
            if (user.size > 0) {
                if (user.docs[0].data().marked) {
                    await usersRef.doc(user.docs[0].id).update({ marked: false });
                    await args.member.removeRole(message.guild.roles.find('name', message.client.settings.silly_person_role));

                    message.channel.send('Successful un-marked this user.');
                } else {
                    await usersRef.doc(user.docs[0].id).update(document);
                    await args.member.addRole(message.guild.roles.find('name', message.client.settings.silly_person_role));

                    message.channel.send('Successful marked this user.');
                }
            } else {
                await usersRef.add(document);
                await args.member.addRole(message.guild.roles.find('name', message.client.settings.silly_person_role));

                message.channel.send('Successful marked this user.');
            }
        } catch (e) {
            throw new BotError('Error', e);
        }
    }
}
