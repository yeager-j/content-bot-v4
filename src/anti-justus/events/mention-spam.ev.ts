import * as moment from 'moment'

import { Event } from '../../core/event'
import { TextChannel } from 'discord.js'
import { BotError } from '../../core/bot-error'
import GlobalBan from '../../global-ban/cmds/global-ban.cmd';


export default class RateLimitMessage extends Event {
    constructor() {
        super('message');
    }

    async run(client, args) {
        const hour = 1000 * 60 * 60;
        const now = moment();
        let [ message ] = args;

        if (!(message.channel instanceof TextChannel)) {
            return;
        }

        if (message.author.id === client.user.id) {
            return;
        }

        let mentionCount = message.mentions.members.size + message.mentions.roles.size;

        if (mentionCount > client.settings.max_mentions) {
            try {
                let dm = await message.member.user.createDM();
                await dm.send('You mentioned too many members!');

                await GlobalBan.globalBan(message.channel, message.guild, message.client, client.user, message.member, 'Too many mentions');

                await message.delete();
            } catch (e) {
                throw new BotError('Error', e);
            }
        }
    }
}
