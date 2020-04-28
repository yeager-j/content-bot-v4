import * as Commando from 'discord.js-commando'
import * as admin from 'firebase-admin'

import * as npmPackage from '../package.json'
import * as dotenv from 'dotenv'
import { Module } from './core/module'
import { GeneralModule } from './general/general.module'
import { WarnModule } from './warn/warn.module'
import { RatelimitModule } from './ratelimit/ratelimit.module'
import { CoreModule } from './core/core.module'
import { MemesModule } from './memes/memes.module'
import { ArchiveModule } from './archive/archive.module';
import { GlobalBanModule } from './global-ban/global-ban.module';
import { MarkModule } from './mark/mark.module';
import { BotError } from './core/bot-error';
import { AntiJustusModule } from './anti-justus/anti-justus.module';
import {QuoteModule} from "./quote/quote.module";

const serviceAccount = require('../firebase-key.json');

dotenv.config();

let client = new Commando.Client({
    owner: '223596463777775617'
});

client.version = (<any>npmPackage).version;

const modules: Module[] = [
    new CoreModule(client),
    new GeneralModule(client),
    new WarnModule(client),
    new RatelimitModule(client),
    new MemesModule(client),
    new ArchiveModule(client),
    new GlobalBanModule(client),
    new MarkModule(client),
    new AntiJustusModule(client),
    new QuoteModule(client)
];

async function start() {
    if (!(modules[0] instanceof CoreModule)) {
        throw 'Core module is required and must be loaded first!';
    }

    client.on('debug', console.log)
        .on('error', console.error)
        .on('warn', console.warn);

    client.registry
        .registerGroups([
            ['general', 'General'],
            ['admin', 'Admin']
        ])
        .registerDefaultTypes()
        .registerDefaultGroups()
        .registerDefaultCommands({
            help: false
        });

    for (let module of modules) {
        console.log('============');
        console.log(`Initializing ${module.constructor.name}`);
        await module.init();
        console.log('============');
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://content-bot-86af6.firebaseio.com",
        storageBucket: "content-bot-86af6.appspot.com"
    });

    const db = admin.firestore();
    const settings = db.collection('core').doc('settings');

    settings.onSnapshot(settingsSnapshot => {
        client.settings = settingsSnapshot.data();

    }, err => {
        throw new BotError('Settings Error', err);
    });

    client.login(process.env.TOKEN);
}

start().catch(e => {
    throw new BotError('Error', e);
});

export { client }
