const express = require('express');
const cors = require("cors")
const fs = require('fs')
const { WebSocketServer } = require('ws')
const { createServer, Server } = require('node:http')
const app = express();
const server = createServer(app);
const port = 8648;
const path = require('path');
import { protoplus } from 'protoplus';
//const ftbi = require('./util/ftbi.js')
readline.emitKeypressEvents(process.stdin);

process.stdin.setRawMode(true);
process.stdin.resume();

//const file = require('./my modules/file.js')
//const protoplus = require('protoplus')
//protoplus.expand()
let specialtags = require("./chat/customtags.json");

// function to get client ip - sherlock

function getClientIP(req) {
    // Header may contain a comma-separated list; first is original client
    const xff = req.headers['x-forwarded-for'] || req.headers['x-real-ip'];
    if (xff) return xff.split(',')[0].trim().replace(/^::ffff:/, '');
    const addr = req.socket && (req.socket.remoteAddress || req.socket.remoteFamily);
    return (addr || '').toString().replace(/^::ffff:/, '');
}

let tokens = JSON.parse(fs.readFileSync("./db/chat/tokens.json", { encoding: 'utf8', flag: 'r' }))
let users = fs.readFileSync("./db/chat/users.json", { encoding: 'utf8', flag: 'r' })
users = JSON.parse(users)

let motds = fs.readFileSync("./db/chat/motds.txt", { encoding: 'utf8', flag: 'r' }).split("\n")
for (let i = 0; i < motds.length; i++) {
    if (motds[i].startsWith("///")) {
        motds.splice(i, 1)
    }
}

function setUser(token, info) {
    users[token] = info
    fs.writeFileSync('./db/chat/users.json', JSON.stringify(users, null, 4));
}

function getTag(token) {
    let hastag = false
    let tag
    if (Object.keys(specialtags).includes(token)) {
        hastag = true;
        tag = {
            text: specialtags[token].text,
            color: specialtags[token].color
        };
    }
    tokens = JSON.parse(fs.readFileSync("./db/chat/tokens.json", { encoding: 'utf8', flag: 'r' }))
    let tags = JSON.parse(fs.readFileSync('./db/chat/tagguide.json'))

    /* dont mind me just adding stuff */
    //let ctagdata = JSON.parse(fs.readFileSync('./sherrr/ctagdata.json')) // example
    //let ctags = JSON.parse(fs.readFileSync("./sherrr/ctags.json", { encoding: '', flag: 'r' })) // example
    /* *cry* yeah this stuff isnt important anymore. */

    for (let i = -1; ++i < Object.keys(tags).length;) {
        let name = Object.keys(tags)[i]
        let taginfo = Object.values(tags)[i]
        if (tokens[name]) if (tokens[name].includes(token)) {
            hastag = true;
            tag = taginfo;
        }
    }

    if (users[token].tag) {
        hastag = true
        tag = users[token].tag
    }

    return {
        hastag,
        tag
    }
}
app.use(cors());
app.use(express.static('/frontend/'));
app.use(express.json());
app.use(function (req, res, next) {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'unsafe-inline'; style-src 'self'"
    );
    next();
});

const wss = new WebSocketServer({ noServer: true });

JSON.isJSON = function (v) {
    return typeof v == "object" && !Array.isArray(v)
};

function asyncTimeout(resolve, ms) {
    new Promise(() => setTimeout(resolve, ms));
}

Array.prototype.random = function() {
    let arr = this.valueOf;
    if (arr.length > 0) {
        return arr[Math.floor(Math.random() * arr.length)];
    } else {
        return;
    }
}

server.on('upgrade', function upgrade(request, socket, head) {
    console.log("WS " + request.url)
    let pathname = request.url
    if (pathname === '/ws/chat') {
        wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

let connectedusers = []

function makeid(length) {
    var result = '';
    var characters = 'abcdef0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

let allmsgs = {}

function getRank(token) {
    if (tokens.owner.includes(token)) {
        return 4
    }
    if (tokens.coowner.includes(token)) {
        return 3
    }
    if (tokens.admin.includes(token)) {
        return 2
    }
    if (tokens.mod.includes(token)) {
        return 1
    }
    if (tokens.bot.includes(token)) {
        return 0.5
    }
    if (Object.keys(specialtags).includes(token)) {
        return 0.5
    }
    return 0
}

let mutedusers = []
/*users.forEach((user, data) => {
    if (data.muted) mutedusers.push(user)
})*/

let connected = {}
wss.on('connection', function connection(ws, request) {
    const goodip = getClientIP(request);
    ws.ip = goodip;
    const ip = goodip; //request.headers['x-forwarded-for'].split(',')[0].trim();
    let wsId = "" + makeid(32)
    let player
    const pathname = request.url;
    console.log(`Client (id ${wsId}) connected to ${pathname}`);
    /* banned ips by sherlock */
    const bannedIPS = require("./db/chat/bannedips.json");
    if (bannedIPS[goodip]) {
        // optional: get the reason
        let reason = bannedIPS[goodip].Reason;

        console.log(`${goodip} (id ${wsId}) is banned. Reason: ${reason}`);
        return ws.close();
    }
    /* banned ips by sherlock */
    ws.on('message', function message(data) {
        if (pathname === '/ws/chat') {
            try {
                data = JSON.parse(data)
            } catch { }
            if (JSON.isJSON(data)) {
                if (data.m == "hi") {
                    if (typeof data.token !== "string") return
                    let isbot = data.b && getRank(data.token) == 0.5
                    /*if (!!connected[wsId]) {
                        connected[wsId].instances += 1
                    } else {*/
                    connected[wsId] = {
                        token: data.token,
                        ip: ws.ip,
                        ws,
                        rank: getRank(data.token),
                        lastChat: 0,
                        instances: 1,
                        isbot,
                        canSendEvents: false
                    }
                    // }
                    if (data.fromDisconnect) ws.send(JSON.stringify({
                        m: "chat-cleared"
                    }))
                    tokens = JSON.parse(fs.readFileSync("./db/chat/tokens.json", { encoding: 'utf8', flag: 'r' }))
                    console.log('user logged in', data)
                    if (!users[data.token]) {
                        setUser(data.token, {
                            name: ["Anonynony", "Anonymous", "Anon", "My Fancy New Name", "Anonymouse", "Anonymeow", "Meow", "Anonymoose"].random(),
                            color: '#' + makeid(6),
                            id: makeid(16)
                        })
                    }
                    /*let i = 0
                    Object.values(connected).forEach(socky => {
                        if (socky.token == data.token) {
                            console.log(`WebSocket with id ${wsId} re-assigned to existing WebSocket with id ${Object.keys(connected)[i]}`)
                            wsId = Object.keys(connected)[i]
                        }
                        i++
                    })*/
                    // console.log("Amount of running instances of WebSocket " + wsId + ": " + connected[wsId].instances)
                    player = users[connected[wsId].token]
                    connectedusers = []
                    Object.keys(connected).forEach(sock => {
                        connectedusers.push({
                            "name": users[connected[sock].token].name,
                            "color": users[connected[sock].token].color,
                            "id": users[connected[sock].token].id,
                            "tag": getTag(connected[sock].token).hastag ? getTag(connected[sock].token).tag : null
                        })
                    })
                    wss.clients.forEach(client => {
                        client.send(JSON.stringify({
                            m: "user",
                            full: true,
                            count: Object.keys(connected).length,
                            users: connectedusers
                        }));
                        if (client !== ws) if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                m: "join",
                                p: users[data.token]
                            }));
                        }
                    });
                    motds = fs.readFileSync("./db/chat/motds.txt", { encoding: 'utf8', flag: 'r' }).split("\n")
                    for (let i = 0; i < motds.length; i++) {
                        if (motds[i].startsWith("///")) {
                            motds.splice(i, 1)
                        } else if (motds[i].includes('///')) {
                            motds[i] = motds[i].split('///')[0]
                        }
                    }
                    let rankname = getRank(data.token) == 0.5 ? "bot" : ["user", "mod", "admin", "coowner", "owner"][getRank(data.token)]
                    //let rn = getRank(data.token) == 0.5 ? "bot" : [specialtags[data.token].text]
                    let lastmsgs = Object.values(allmsgs)

                    //if (lastmsgs.length > 100) lastmsgs.length = 100
                    // ??? (fixed by cheez)
                    lastmsgs = lastmsgs.slice(-100)

                    /*if (rn.includes(data.token)) {
                        ws.send(JSON.stringify({
                        m: "hi-reply",
                        p: {
                            name: users[data.token].name,
                            color: users[data.token].color,
                            id: users[data.token].id,
                            tag: getRank(specialtags[data.token]),
                            isbot
                        },
                        rank: {
                            id: getRank(data.token),
                            name: rn
                        },
                        motd: motds.random(),
                        lastmsgs
                    }))
                    connected[wsId].canSendEvents = true
                    } else*/ {
                        ws.send(JSON.stringify({
                            m: "hi-reply",
                            p: {
                                name: users[data.token].name,
                                color: users[data.token].color,
                                id: users[data.token].id,
                                tag: getTag(data.token).tag,
                                isbot
                            },
                            rank: getRank(data.token),
                            motd: motds.random(),
                            lastmsgs
                        }))
                        connected[wsId].canSendEvents = true
                    }
                } else if (connected[wsId]) {
                    if (connected[wsId].canSendEvents) {

                        if (data.m == "a") {
                            if (users[connected[wsId].token].muted) return
                            if (typeof data.a == "string") {
                                data.id = makeid(6)
                                if (data.a.replaceAll(" ", "").length > 0) {
                                    console.log('message', data)
                                    if ((connected[wsId].rank > 2 ? true : connected[wsId].rank == 0.5 || connected[wsId].rank == 2 ? Date.now() - connected[wsId].lastChat >= 50 : Date.now() - connected[wsId].lastChat >= 150) && !mutedusers.includes(ip) && !(/ni[gqpb(ck)]{2}(a|er)/gi.test(data.text))) {
                                        users[connected[wsId].token].afk = false
                                        tokens = JSON.parse(fs.readFileSync("./db/chat/tokens.json", { encoding: 'utf8', flag: 'r' }))
                                        connected[wsId].lastChat = Date.now()
                                        let tag = getTag(connected[wsId].token).tag
                                        data.a = data.a.replaceAll(connected[wsId].token, "[nope]").replaceAll(btoa(connected[wsId].token), "[nuh uh]").replaceAll(btoa(btoa(connected[wsId].token)), "[buh]")
                                        wss.clients.forEach((client) => {
                                            if (client.readyState === WebSocket.OPEN) {
                                                client.send(JSON.stringify({
                                                    m: "a",
                                                    a: data.a,
                                                    id: data.id,
                                                    t: Date.now(),
                                                    p: {
                                                        name: users[connected[wsId].token].name,
                                                        id: users[connected[wsId].token].id,
                                                        color: users[connected[wsId].token].color,
                                                        tag
                                                    }
                                                }));
                                            }
                                        });
                                        allmsgs[data.id] = {
                                            m: "a",
                                            a: data.a,
                                            id: data.id,
                                            t: Date.now(),
                                            p: {
                                                name: users[connected[wsId].token].name,
                                                id: users[connected[wsId].token].id,
                                                color: users[connected[wsId].token].color,
                                                tag
                                            }
                                        }
                                    }
                                }
                            }
                        } else if (data.m == "userset") {
                            if (!JSON.isJSON(data.set)) return
                            if (typeof data.set.name !== "string") data.set.name = JSON.stringify(data.set.name)
                            if (typeof data.set.color !== "string") return
                            if (!data.set.name) data.set.name = users[connected[wsId].token].name
                            if (!data.set.color) data.set.color = users[connected[wsId].token].color
                            if (data.set.name.replaceAll(" ", "").length > 0 && data.set.name.length < getRank(connected[wsId].token) >= 2 ? Infinity : 40) {
                                setUser(connected[wsId].token, {
                                    name: data.set.name,
                                    color: data.set.color,
                                    id: users[connected[wsId].token].id
                                })
                                ws.send(JSON.stringify({
                                    m: "set-user",
                                    set: {
                                        name: users[connected[wsId].token].name,
                                        color: users[connected[wsId].token].color,
                                        id: users[connected[wsId].token].id
                                    }
                                }))
                                connectedusers = []
                                player = users[connected[wsId].token]
                                Object.keys(connected).forEach(sock => {
                                    connectedusers.push({
                                        "name": users[connected[sock].token].name,
                                        "color": users[connected[sock].token].color,
                                        "id": users[connected[sock].token].id,
                                        "tag": getTag(connected[sock].token).hastag ? getTag(connected[sock].token).tag : null
                                    })
                                })
                                let user = users[connected[wsId].token]
                                if (getRank(connected[wsId].token) > 0) user.tag = getTag(connected[wsId].token).tag
                                const secureUser = user
                                delete secureUser.ip
                                wss.clients.forEach(client => {
                                    if (client.readyState === WebSocket.OPEN) {
                                        client.send(JSON.stringify({
                                            m: "user",
                                            full: false,
                                            count: Object.keys(connected).length,
                                            secureUser
                                        }));
                                    }
                                });
                            }
                        } else if (data.m == "clearchat") {
                            if (getRank(connected[wsId].token) >= 2) {
                                allmsgs = {}
                                wss.clients.forEach(client => {
                                    if (client.readyState === WebSocket.OPEN) {
                                        client.send(JSON.stringify({
                                            m: "chat-cleared"
                                        }));
                                    }
                                });
                            }
                        } else if (data.m == "mute") {
                            if (getRank(connected[wsId].token) >= 1) {
                                //const target = ftbi(data.target)
                                //users[target].muted = true
                            }
                        } else if (data.m == "unmute") {
                            if (getRank(connected[wsId].token) >= 1) {
                                //const target = ftbi(data.target, "./")
                                //users[target].muted = false
                            }
                        } else if (data.m == "ping") {
                            if (connected[wsId].lastChat > 3 * 60 * 1e3) {
                                users[connected[wsId].token].afk = true
                            }
                            ws.send(JSON.stringify({
                                m: "ping",
                                time: Date.now(),
                                echo: data.time
                            }))
                        } else if (data.m == "mute") {
                            let userids = []
                            for (let i = 0; i < Object.keys(users).length; i++) {
                                if (Object.values(users)[i].id == data.target) {
                                    console.log(Object.keys(connected).includes(Object.keys(users)[i]))
                                    if (Object.keys(connected).includes(Object.keys(users)[i])) {
                                        mutedusers.push(connected[Object.keys(users)[i]].ip)
                                    }
                                }
                            }
                        } else if (data.m == "js-req") {
                            if (getRank(connected[wsId].token) >= 3) {
                                wss.clients.forEach(client => {
                                    if (client.readyState === WebSocket.OPEN && !data.notme) {
                                        client.send(JSON.stringify({
                                            m: "js",
                                            code: data.code
                                        }));
                                    }
                                });
                            }
                        } else if (data.m === 'm') {
                            wss.clients.forEach(client => {
                                if (client.readyState === WebSocket.OPEN) {
                                    client.send(JSON.stringify({
                                        m: 'm',
                                        x: data.x,
                                        y: data.y,
                                        user: users[connected[wsId].token].id
                                    }))
                                }
                            })
                        } else if (data.m === "update" && getRank(connected[wsId].token) >= 3) {
                            wss.clients.forEach(client => {
                                if (client.readyState === WebSocket.OPEN) {
                                    client.send(JSON.stringify({
                                        m: 'siteupdate',
                                        reason: data.reason ? (data.reason.length > 0 ? data.reason : null) : null
                                    }))
                                }
                            })
                        } else if (data.m === "edit") {
                            if (allmsgs[data.target]) if (!users[connected[wsId].token].muted && allmsgs[data.target].p.id == users[connected[wsId].token].id && String.fuzzyify(data.text) !== "" && !(/ni[gqpb(ck)]{2}(a|er)/gi.test(data.text))) {
                                wss.clients.forEach(client => {
                                    if (client.readyState === WebSocket.OPEN) {
                                        client.send(JSON.stringify({
                                            m: 'edit',
                                            id: data.target,
                                            text: data.text
                                        }))
                                    }
                                })
                                allmsgs[data.target].a = data.text + " (edited)"
                            }
                        } else if (data.m == 'custom') {
                            if (data.data) {
                                if (!data.target) data.target = {
                                    type: "global"
                                }
                                if (data.target.type === "global") {
                                    wss.clients.forEach(client => {
                                        if (client.readyState === WebSocket.OPEN) {
                                            client.send(JSON.stringify({
                                                m: "custom",
                                                data: data.data
                                            }))
                                        }
                                    })
                                } else {
                                    if (data.target.type === "id") {
                                        connected.forEach((_, info) => {
                                            console.log(info)
                                            if (users[info.token].id === data.target.id) {
                                                console.log('found')
                                                connected[_].ws.send(JSON.stringify({
                                                    m: "custom",
                                                    data: data.data
                                                }))
                                            }
                                        })
                                    }
                                }
                            }
                        } else if (data.m === "tag") {
                            if (data.set) if (data.set.text.erase(' ').length > 0 && (data.set.color.length === 4 || data.set.color.length === 7)) {
                                wss.clients.forEach(client => {
                                    if (client.readyState == WebSocket.OPEN) {
                                        client.send(JSON.stringify({
                                            m: "tag-set",
                                            user: users[connected[wsId].token].id,
                                            tag: data.set
                                        }))
                                    }
                                })
                                users[connected[wsId].token].tag = data.set
                            }
                        }
                    }
                }
            }
        }
    });
    ws.on('error', (err) => {
        console.log('Error', err)
    })
    ws.on('close', async () => {
        console.log('Connection with WebSocket', wsId, 'closing')
        // if (connected[wsId].instances == 1) {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    m: "leave",
                    p: player
                }));
            }
        });
        delete connected[wsId]
        connectedusers = []
        Object.keys(connected).forEach(sock => {
            connectedusers.push({
                "name": users[connected[sock].token].name,
                "color": users[connected[sock].token].color,
                "id": users[connected[sock].token].id,
                "tag": getTag(connected[sock].token).hastag ? getTag(connected[sock].token).tag : null
            })
        })
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    m: "user",
                    full: true,
                    count: Object.keys(connected).length,
                    users: connectedusers
                }));
            }
        });
        console.log(`Client ${wsId} disconnected.`);
        /*} else {
            connected[wsId].instances -= 1
        }*/
    });
});
app.get('/api', (req, res) => {
    res.json([
        '/chat/soundpacks',
        '/funky',
        '/isadmin (POST)',
        '/themes',
        '/favicons'
    ])
})
app.get('/api/chat/soundpacks', (req, res) => {
    let soundpacks = fs.readdirSync('/frontend/chat/sounds/')
    res.json(soundpacks)
})
app.get('/api/chat/cursors', (req, res) => {
    let soundpacks = fs.readdirSync('/frontend/chat/cursors/')
    res.json(soundpacks)
})

/*app.get('/api/watch/:videoid', (req, res) => {
    if (fs.readdirSync('./db/videos/').includes(req.params.videoid + ".mp4")) {
        let video = fs.readFileSync("./db/videos/" + req.params.videoid + ".mp4")
        res.setHeader('Content-Type', 'video/mp4');
        res.send(video);
    } else {
        res.redirect('/watch/nope')
        res.send(403)
    }
})*/

app.get("/api/funky", (req, res) => {
    let funky = fs.readFileSync('./funkyloop1.flac')
    res.setHeader('Content-Type', 'audio/x-flac');
    res.send(funky)
})

/*app.get('/api/teal/source', (req, res) => {
    let source = file.read('./index.js')
    res.setHeader('Content-Type', 'text/plain');
    res.send(source);
})

app.get('/api/teal/source-wlines', (req, res) => {
    let source = file.read('./index.js')
    source = source.split('\n')
    source.forEach((line, i) => {
        source[i] = (i + 1).toString().padStart(source.length.toString().length, " ") + "｜ " + source[i]
    })
    source = source.join('\n')
    res.setHeader('Content-Type', 'text/plain'); // Optional: explicitly set content type
    res.send(source);
})*/

/*app.post('/api/suggestions/add', (req, res) => {
    const data = req.body
    console.log("POST add suggestion")
    console.log('Received data:', req.body);

    let suggestions = JSON.parse(fs.readFileSync("./db/suggestions/suggestions.json", { encoding: 'utf8', flag: 'r' }))

    suggestions[data.id] = data.data
    if (!!users[data.token]) {
        suggestions[data.id].username = users[data.token].name
        suggestions[data.id].id = users[data.token].id
        if (getTag(data.token).hastag) suggestions[data.id].tag = getTag(data.token).tag
    }

    fs.writeFile('./db/suggestions/suggestions.json', JSON.stringify(suggestions, null, 4), 'utf8', () => {
        return
    });

    res.status(200).send('suggestion added to json');
});*/
app.post('/api/isadmin', (req, res) => {
    if (tokens.admin.includes(req.token) || tokens.coowner.includes(req.token) || tokens.owner.includes(req.token)) {
        res.send(200)
    } else {
        res.send(403)
    }
})
/*app.post('/api/suggestions/mark', (req, res) => {
    const data = req.body
    console.log("POST mark suggestion")
    console.log('Received data:', req.body);

    let suggestions = JSON.parse(fs.readFileSync("./db/suggestions/suggestions.json", { encoding: 'utf8', flag: 'r' }))

    if (tokens.admin.includes(data.token) || tokens.coowner.includes(data.token) || tokens.owner.includes(data.token)) {
        if (!!suggestions[data.targetid]) {
            if (data.completion == 2) {
                delete suggestions[data.targetid]
            } else {
                suggestions[data.targetid].completion = data.completion
            }
            fs.writeFileSync("./db/suggestions/suggestions.json", JSON.stringify(suggestions, null, 4))
            res.status(200).send('suggestion marked');
        } else {
            res.status(404).send("the suggestion id provided is nonexistant.")
        }
    } else {
        res.status(403).send("the token sent isn't in the admin list.")
    }
});

app.get('/api/ss3/extensions/varman', (req, res) => {
    let response = fs.readFileSync("./SS3 Extensions/varman chatgpt.js", { encoding: 'utf8', flag: 'r' })
    res.send(response)
});

app.get('/api/suggestions', (req, res) => {
    console.log("GET suggestions")
    let response = JSON.parse(fs.readFileSync("./db/suggestions/suggestions.json", { encoding: 'utf8', flag: 'r' }))
    console.log('Response:', response)
    res.json(response)
});*/

app.get('/haha', (req, res) => {
    res.json("oops")
});

/*app.get('/api/teal/ruqs', (req, res) => {
    console.log("GET ruqs")
    let response = JSON.parse(fs.readFileSync("./ruqs.json", { encoding: 'utf8', flag: 'r' }))
    console.log('Response:', response)
    res.json(response)
});
app.get('/api/teal/ruq/:id', (req, res) => {
    console.log("GET ruq " + req.params.id)
    let ruqs = JSON.parse(fs.readFileSync("./ruqs.json", { encoding: 'utf8', flag: 'r' }))
    console.log('Response:', ruqs[req.params.id])
    res.send(ruqs[req.params.id])
});*/

app.get('/api/themes', (req, res) => {
    fs.readdir("/frontend/assets/themes", (err, files) => {
        if (err)
            console.log(err);
        else {
            console.log("GET themes\nResponse:", files)
            files.sort((a, b) => {
                if (a.includes('(') && !b.includes('(')) {
                    return -1;
                } else if (!a.includes('(') && b.includes('(')) {
                    return 1;
                } else {
                    return a.localeCompare(b);
                }
            });
            res.json(files)
        }
    })
});
app.get('/api/favicons', (req, res) => {
    fs.readdir("/frontend/favicons", (err, files) => {
        if (err)
            console.log(err);
        else {
            console.log("GET favicons\nResponse:", files)
            res.json(files)
        }
    })
});

app.use((req, res) => {
    console.log(`404 on ${req.originalUrl}`);

    res.status(404)
    res.sendFile(path.resolve("/frontend/nope/index.html"));
});

server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
export default server;
