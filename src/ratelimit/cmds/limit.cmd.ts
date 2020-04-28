import * as Commando from 'discord.js-commando';
import { rateLimited, resetTime } from '../ratelimit.module';


export default class Limit extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'limit',
            group: 'admin',
            memberName: 'limit',
            description: 'Rate limits a member, only allowing them one message every few seconds.',
            details: '!limit @member',
            args: [
                {
                    key: 'member',
                    label: 'member',
                    prompt: 'Who do you want to rate limit?',
                    type: 'member'
                }
            ]
        })
    }

    hasPermission(msg) {
        return msg.member.hasPermission('KICK_MEMBERS');
    }

    async run(message, args) {
        let { cooldown, max_lines, max_messages } = message.client.settings.rate_limit;
        let userRLIndex = rateLimited.findIndex(user => user.id === args.member.user.id);
        let userRL = rateLimited[userRLIndex];

        if (userRL && userRL.is_limited) {
            message.channel.send(`${args.member.user.username} is no longer rate limited.`);
            rateLimited.splice(userRLIndex, 1);
        } else if (userRL && !userRL.is_limited) {
            message.channel.send(`Rate limiting ${args.member.user.username}. They can only send messages once every ${cooldown} seconds.`);
            rateLimited[userRLIndex].is_limited = true;
        } else {
            message.channel.send(`Rate limiting ${args.member.user.username}. They can only send messages once every ${cooldown} seconds.`);
            rateLimited.push({
                id: args.member.user.id,
                last_msg: 0,
                is_limited: true,
                reset_time: resetTime(),
                remaining_msgs: max_messages
            });
        }
    }
}
