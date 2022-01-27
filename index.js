const Discord = require('discord.js');
const config = require('./config.json');
const yt = require('ytdl-core');

const client = new Discord.Client({ intents: 32767});

const TOKEN = config.TOKEN;
const PREFIX = config.PREFIX;
const OPTIONS = config['YT-Options'];

let dispatcher = null;

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
    if (msg.content.startsWith(PREFIX + 'leave')) {
        msg.reply('Saindo do canal de voz!');
        msg.member.voice.channel.leave();
        dispatcher = null;
    }

    if(msg.content.startsWith(PREFIX + 'play')){
        let music = msg.content.slice(6);
        if(yt.validateURL(music)) {
            dispatcher = await msg.member.voice.channel.join();
            dispatcher.play(yt(music, OPTIONS));
        }else {
            msg.reply('Link inválido!');
        }
    }

    if(msg.content.startsWith(PREFIX + 'stop')) {
        if(dispatcher === null) {
            msg.reply("Você não esta tocando nenhuma musica para parar!");
            return;
        };
        dispatcher.stop();
        dispatcher = null;
    }


});


client.login(TOKEN);