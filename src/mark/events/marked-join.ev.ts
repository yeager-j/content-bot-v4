import * as admin from 'firebase-admin'

import { Event } from '../../core/event'
import { Logger } from '../../core/logger'
import { BotError } from '../../core/bot-error'


export default class MemberJoin extends Event {
    constructor() {
        super('guildMemberAdd');
    }

    async run(client, args) {
        let [ member ] = args;

        try {
            let db = admin.firestore();
            let usersRef = db.collection('guilds').doc(`${member.guild.name}: ${member.guild.id}`).collection('marked users');
            let user = await usersRef.where('user.id', '==', member.user.id).get();

            if (user.size > 0) {
                if (user.docs[0].data().marked) {
                    await member.addRole(member.guild.roles.find('name', client.settings.silly_person_role));
                }
            }
        } catch (e) {
            throw new BotError('Error', e);
        }
    }
}
