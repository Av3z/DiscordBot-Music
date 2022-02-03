const Discord = require('discord.js');
const config = require('./config-test.json');
const yt = require('ytdl-core');
const googleAPI = require('googleapis');

const youtubeAPI = new googleAPI.youtube_v3.Youtube({
    version: 'v3',
    auth: config.GOOGLE_API
});

const client = new Discord.Client({ intents: 32767});

const TOKEN = config.TOKEN;
const PREFIX = config.PREFIX;
const OPTIONS = config['YT-Options'];

const servers = {
    'server': {
        connection: null,
        dispatcher: null,
        queue: [],
        playing: false
    }
}

function memberOnChannel(msg) {
    if(!msg.member.voice.channel) {
        msg.reply('Por favor entre em algum canal de voz antes de utilizar este comando!');
        return false;
    }

    return true;
}

client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`));

client.on('message', async (msg) => {

    // Filters 
    if(!msg.guild) return;
    if(!msg.content.startsWith(PREFIX)) return;


    // commands
    if(msg.content.startsWith(PREFIX + 'play')){

        if(!memberOnChannel(msg)) return;
        servers.server.connection = await msg.member.voice.channel.join();

        let music = msg.content.slice(6);

            if(yt.validateURL(music)) {
                servers.server.queue.push(music);
                console.log("Adicionado a fila: " + music);
                console.log("Fila : " + servers.server.queue);
                playMusic();
            }else {
                youtubeAPI.search.list({
                    q: music,
                    part: 'snippet',
                    fields: 'items(id(videoId), snippet(title))',
                    type: 'video'
                
                }, function (error, result) {
                    if (error) {
                        console.log(error);
                        return;
                    }
                
                    if(result) {
                        var musicId = result.data.items[0].id.videoId
                        music = 'https://www.youtube.com/watch?v=' + musicId;
                        servers.server.queue.push(music);
                        console.log("Adicionado a fila: " + music);
                        console.log("Fila : " + servers.server.queue);
                        playMusic();
                    }
                });
               
            }  
    }

    if(msg.content.startsWith(PREFIX + 'stop')) {
        if(!memberOnChannel(msg)) return;

        msg.reply('Parando a musica.');
        servers.server.dispatcher.stop();
        servers.server.dispatcher = null;
    }

    if (msg.content.startsWith(PREFIX + 'leave')) {
        if(!memberOnChannel(msg)) return;

        msg.reply('Saindo do canal de voz!');
        msg.member.voice.channel.leave();
        servers.server.connection = null;
        servers.server.dispatcher = null;
    }

    if(msg.content.startsWith(PREFIX + 'ping')) {
        msg.reply(`Meu ping é : ${client.ws.ping} ms `);
    }


});

const playMusic = () => {
    if (servers.server.playing === false) {

        const music = servers.server.queue[0];

        servers.server.playing = true;
        servers.server.dispatcher = servers.server.connection.play(yt(music, OPTIONS));
        servers.server.dispatcher.on('finish', () => {

            servidores.server.queue.shift();
            servers.server.playing = false;

            if(servers.server.queue.length > 0) {
                playMusic();

            }else {

                servers.server.dispatcher = null;

            }
        })

    }
}

client.login(TOKEN);