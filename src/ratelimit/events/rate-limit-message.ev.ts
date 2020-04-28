import * as moment from 'moment';

import { Event } from '../../core/event';
import { TextChannel } from 'discord.js';
import { rateLimited, resetTime } from '../ratelimit.module';


export default class RateLimitMessage extends Event {
    constructor() {
        super('message');
    }

    async run(client, args) {
        let [ message ] = args;

        if (!(message.channel instanceof TextChannel)) {
            return;
        }

        if (message.author.id === client.user.id) {
            return;
        }

        let { cooldown, max_lines, max_messages } = client.settings.rate_limit;
        let userRLIndex = rateLimited.findIndex(user => user.id === message.author.id);
        let userRL = rateLimited[userRLIndex];

        if (userRL) {
            if (userRL.is_limited) {
                if (message.createdTimestamp - userRL.last_msg <= cooldown * 1000) {
                    await message.delete();
                } else if ((message.content.match(/\n/g) || []).length > max_lines) {
                    await message.delete();
                }
            } else {
                if (message.createdTimestamp <= rateLimited[userRLIndex].reset_time) {
                    rateLimited[userRLIndex].remaining_msgs -= 1;

                    if (rateLimited[userRLIndex].remaining_msgs <= 0) {
                        message.channel.send(`Woah, slow down there champ! You have been automatically rate-limited for sending messages a bit too quickly. If you think this is a mistake, ask a Moderator.`);
                        rateLimited[userRLIndex].is_limited = true;
                    }
                } else {
                    rateLimited[userRLIndex].reset_time = resetTime();
                    rateLimited[userRLIndex].remaining_msgs = max_messages;
                }
            }

            rateLimited[userRLIndex].last_msg = message.createdTimestamp;
        } else {
            rateLimited.push({
                id: message.author.id,
                last_msg: moment().unix() * 1000,
                is_limited: false,
                remaining_msgs: max_messages,
                reset_time: resetTime()
            });
        }
    }
}
