import * as Commando from 'discord.js-commando'
import { exec } from 'child_process'

export default class Update extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'update',
            group: 'general',
            memberName: 'update',
            description: 'Causes the bot to stop and update.'
        })
    }

    hasPermission(msg) {
        return msg.client.isOwner(msg.author);
    }

    async run(message, args) {
        await message.channel.send(`Updating bot... Be right back!`);

        exec('sh scripts/update.sh', (error, stdout, stderr) => {
            console.log(`${stdout}`);
            console.log(`${stderr}`);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        });
    }
}
