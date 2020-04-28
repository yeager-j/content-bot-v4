import { Event } from '../event'
import { GuildChannel, GuildMember, TextChannel } from 'discord.js';


export default class DeleteInvite extends Event {
    constructor() {
        super('message');
    }

    async run(client, args) {
        let [ message ] = args;
        let member: GuildMember = message.member;

        if (!(message.channel instanceof TextChannel) && !(message.channel instanceof GuildChannel)) {
            return;
        }

        if (message.author.id === client.user.id) {
            return;
        }

        if (member.roles.size === 1 || member.roles.exists('name', client.settings.silly_person_role)) {
            if (message.content.includes('https://discord.gg/')) {
                message.delete();
            }
        }
    }
}