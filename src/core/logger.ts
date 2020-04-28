import { client } from '../index';

export class Logger {
    public static async log(type, message, sendDM = false) {
        console[type](message);

        if (!sendDM) {
            return;
        }

        for (let owner of client.owners) {
            let user = await client.fetchUser(owner);

            try {
                let dm = await user.createDM();
                let color = 0;

                switch (type) {
                    case 'log':
                        color = 32768;
                        break;
                    case 'info':
                        color = 4376052;
                        break;
                    case 'warn':
                        color = 16755468;
                        break;
                    case 'error':
                        color = 13372171;
                        break;
                }

                if (typeof message === 'object') {
                    await dm.send({embed: {
                        "title": "Bot Log",
                        "description": `\`\`\`javascript\n${JSON.stringify(message, undefined, 4)} \n \`\`\``,
                        "color": color
                    }});
                } else {
                    await dm.send({embed: {
                        "title": "Bot Log",
                        "description": message,
                        "color": color
                    }});
                }
            } catch (e) {
                Logger.log('error', e);
                throw 'Could not send a log to the owner!';
            }
        }
    }
}
