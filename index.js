const Discord = require('discord.js');
const config = require('./config.json');
const yt = require('ytdl-core');

const client = new Discord.Client({ intents: 32767});

const TOKEN = config.TOKEN;
const PREFIX = config.PREFIX;
const OPTIONS = config['YT-Options'];

const servers = {
    'server': {
        connection: null,
        dispatcher: null
    }
}

client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`));

client.on('message', async (msg) => {

    // Filters 
    if(!msg.guild) return;
    if(!msg.content.startsWith(PREFIX)) return;
    if(!msg.member.voice.channel) {
        msg.reply('Por favor entre em algum canal de voz antes de utilizar este comando!');
        return;
    }


    // commands
    if(msg.content.startsWith(PREFIX + 'play')){

        servers.server.connection = await msg.member.voice.channel.join();

        let music = msg.content.slice(6);

            if(yt.validateURL(music)) {
                servers.server.dispatcher = servers.server.connection.play(yt(music, OPTIONS));
            }else {
                msg.reply('Seu link é inválido!');
            }
        
    }

    if(msg.content.startsWith(PREFIX + 'stop')) {
        msg.reply('Parando a musica.');
        servers.server.dispatcher.stop();
        servers.server.dispatcher = null;
    }

    if (msg.content.startsWith(PREFIX + 'leave')) {
        msg.reply('Saindo do canal de voz!');
        msg.member.voice.channel.leave();
        servers.server.connection = null;
        servers.server.dispatcher = null;
    }


});


client.login(TOKEN);