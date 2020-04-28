import * as Commando from 'discord.js-commando';
import * as Jimp from 'jimp';
import * as fs from 'fs-extra';

export default class QuoteCmd extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'quote',
            group: 'general',
            memberName: 'quote',
            description: 'Makes a fun quote!',
            args: [
                {
                    key: 'quote',
                    label: 'quote',
                    prompt: 'What is the quote?',
                    type: 'string',
                    max: 144
                }
            ]
        })
    }

    hasPermission(msg) {
        return msg.member.hasPermission('ATTACH_FILES');
    }

    async run(message, args) {
        let fileName = './static/images/justus.png';
        let loadedImage;

        try {
            await fs.copy('./static/images/justus.png', './static/images/justus-temp.png');
        } catch (e) {
            console.error(e);
        }

        Jimp.read(fileName)
            .then((image) => {
                loadedImage = image;
                return (Jimp as any).loadFont(Jimp.FONT_SANS_16_BLACK);
            })
            .then((font) => {
                loadedImage.print(font, 30, 15, args.quote, 350)
                    .write('./static/images/justus-temp.png', () => {
                        message.channel.send('', {
                            file: './static/images/justus-temp.png'
                        });
                    });
            })
            .catch(function (err) {
                console.error(err);
            });
    }
}
