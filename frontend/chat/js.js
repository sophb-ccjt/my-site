window.location.link = window.location.origin + window.location.pathname;
function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}
if (!localStorage.token) localStorage.token = randomString(24, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

let themes

let urltester = new RegExp("([a-zA-Z0-9]+:)?//([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?([^ ])+");
function validurl(text) {
    return urltester.test(text)
}
function asyncTimeout(resolve, ms) {
    new Promise(() => setTimeout(resolve, ms));
}

function getBrightness(hexColor) {
    function hexToRgb(hex) {
        let r = 0, g = 0, b = 0;

        hex = extendhex(hex)
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
        return { r, g, b };
    }
    const { r, g, b } = hexToRgb(hexColor);
    return ((r * 299) + (g * 587) + (b * 114)) / 1000;
}
function hexToHSV(hex) {
    let r = 0, g = 0, b = 0;

    hex = extendhex(hex);
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);

    r /= 255;
    g /= 255;
    b /= 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, s, v = max;

    let d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return {
        h: h * 360,
        s: s * 100,
        v: v * 100
    };
}
function getBrightnessDiff(baseHex, targetHex) {
    const hexToRgb = hex => {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
        const num = parseInt(hex, 16);
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    };

    const brightness = ({ r, g, b }) =>
        (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    const baseRgb = hexToRgb(baseHex);
    const targetRgb = hexToRgb(targetHex);
    const baseBright = brightness(baseRgb);
    const targetBright = brightness(targetRgb);

    if (baseBright === 0) return 1;

    // perceptual brightness ratio
    const ratio = targetBright / baseBright;

    // convert to CSS brightness() scale (gamma correction)
    const cssBrightness = Math.pow(ratio, 1 / 2.2);

    return cssBrightness;
}

function blend(hex1, hex2, ratio = 0.5) {
    function hexToRgb(hex) {
        hex = extendhex(hex)
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        return { r, g, b };
    }
    function blendRgb(rgb1, rgb2, ratio = 0.5) {
        const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
        const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
        const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);
        return { r, g, b };
    }
    function rgbToHex(rgb) {
        const toHex = (c) => {
            const hex = Math.max(0, Math.min(255, c)).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
    }
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    const blendedRgb = blendRgb(rgb1, rgb2, ratio);
    return rgbToHex(blendedRgb);
}
async function getthemes() {
    try {
        const response = await fetch('http://' + window.location.host + '/api/themes');

        if (!response.ok) {
            throw new Error(`http error with status: ${response.status}`);
        }

        const arr = await response.json();
        themes = arr

        for (let i in themes) {
            themes[i] = themes[i].replace(".css", "")
        }

        document.getElementById('theme-dropdown').innerHTML = ""
        themes.forEach(theme => {
            const option = document.createElement('option');
            option.textContent = theme[0].toUpperCase() + theme.substring(1);
            option.value = theme;
            document.getElementById('theme-dropdown').appendChild(option);
        });
        document.getElementById('theme-dropdown').value = localStorage.theme
    } catch (err) {
        throw new Error("error when fetching data: " + err);
    }
}

// fallback state
if (!localStorage.theme) localStorage.theme = "purpule (modern)"

// set theme
const urlparams = new URLSearchParams(window.location.search);
if (urlparams.get('theme')) {
    localStorage.theme = urlparams.get('theme')
}
let css = document.getElementById('css');
css.setAttribute('href', "/assets/ŧhemes/" + localStorage.theme + '.css');

function makeid(length) {
    var result = '';
    var characters = 'abcdef0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function getHue(hex) {
    function hexToRgb(hex) {
        let r = 0, g = 0, b = 0;

        if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        } else if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        }

        return { r, g, b };
    }
    function rgbToHue(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        let hue = 0;

        if (delta === 0) {
            hue = 0;
        } else if (max === r) {
            hue = ((g - b) / delta) % 6;
        } else if (max === g) {
            hue = (b - r) / delta + 2;
        } else {
            hue = (r - g) / delta + 4;
        }

        hue = Math.round(hue * 60);
        if (hue < 0) {
            hue += 360;
        }

        return hue;
    }
    const { r, g, b } = hexToRgb(hex);
    return rgbToHue(r, g, b);
}

let client = {
    user: {},
    send: (msg) => {
        if (typeof msg === 'string') {
            client.ws.send(JSON.stringify({
                m: msg
            }))
        } else {
            client.ws.send(JSON.stringify(msg))
        }
    },
    sendArray: (arr) => {
        if (Array.isArray(arr)) {
            arr.forEach(msg => client.send(msg))
        }
    },
    userset: (obj) => {
        if (typeof obj === "object" && !Array.isArray(obj)) client.send({
            m: "userset",
            set: obj
        })
    },
    pinginterval: 1e3,
    ppl: {},
    lastmsgs: {},
    cursorfps: 40
}
window.client = client
function reverseDiv(id) {
    const myContainer = document.getElementById(id);
    const children = Array.from(myContainer.children);

    children.reverse();

    myContainer.innerHTML = ""
    children.forEach(child => {
        myContainer.appendChild(child);
    });
}
function exportfile(name, content) {
    let blob = new Blob([content], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);

    let a = document.createElement('a');
    a.href = url;
    a.download = name;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    return logfilename
}

function send(msg) {
    client.send({
        m: "a",
        a: msg
    });
}
let reconnectinterval
let chatapp

client.soundpack = localStorage.soundpack
let join = new Audio('sounds/' + client.soundpack + '/join.wav');
join.preload = 'auto'
function joinsound() {
    join = new Audio(join.src)
    join.volume = document.getElementById('sp-volume').value / 100
    join.play()
}
let leave = new Audio('sounds/' + client.soundpack + '/leave.wav');
leave.preload = 'auto'
function leavesound() {
    leave = new Audio(leave.src)
    leave.volume = document.getElementById('sp-volume').value / 100
    leave.play()
}
let mention = new Audio('sounds/' + client.soundpack + '/mentioned.wav');
mention.preload = 'auto'
let mentioned = 0
function mentionsound() {
    mention = new Audio(mention.src)
    if (document.hidden) {
        mentioned++
        document.title = `You've been mentioned${"!".repeat(mentioned)}`
    }

    mention.volume = document.getElementById('sp-volume').value / 100
    mention.play()
}
let msg = new Audio('sounds/' + client.soundpack + '/message.wav');
msg.preload = 'auto'
function msgsound() {
    msg = new Audio(msg.src)
    msg.volume = document.getElementById('sp-volume').value / 100
    msg.play()
}
let reply = new Audio('sounds/' + client.soundpack + '/reply.wav');
reply.preload = 'auto'
function replysound() {
    reply = new Audio(reply.src)
    reply.volume = document.getElementById('sp-volume').value / 100
    reply.play()
}
let update = new Audio('sounds/' + client.soundpack + '/update.wav');
update.preload = 'auto'
function updatesound() {
    update = new Audio(update.src)
    update.volume = document.getElementById('sp-volume').value / 100
    update.play()
}
function loadsounds() {
    join.src = 'sounds/' + client.soundpack + '/join.wav?nocache=' + Math.random()
    join.load()
    leave.src = 'sounds/' + client.soundpack + '/leave.wav?nocache=' + Math.random()
    leave.load()
    msg.src = 'sounds/' + client.soundpack + '/message.wav?nocache=' + Math.random()
    msg.load()
    reply.src = 'sounds/' + client.soundpack + '/reply.wav?nocache=' + Math.random()
    reply.load()
    mention.src = 'sounds/' + client.soundpack + '/mentioned.wav?nocache=' + Math.random()
    mention.load()
    update.src = 'sounds/' + client.soundpack + '/update.wav?nocache=' + Math.random()
    update.load()
}
function openurl(url) {
    window.open(url, '_blank').focus();
}
function getreply(reply) {
    reply = reply.trim()
    let replyid = reply.replace('r:', '')
    if (client.lastmsgs[replyid]) {
        return "[⤳ " + client.lastmsgs[replyid].p.name + "]"
    }
}
function lerp(start, end, percentage) {
    return start + (end - start) * percentage;
}
let editing = {}
let deleting
let fromDisconnect = false
let rainbowInterval

let modpage1
let modpage2

let pingInterval
if (localStorage.pingInterval)
    client.pinginterval = parseInt(localStorage.pingInterval)


function connect() {
    client.emitter = new EventEmitter()
    client.on = (...args) => client.emitter.on(...args)
    client.off = (...args) => client.emitter.off(...args)
    client.ws = new WebSocket('ws://' + window.location.host + '/ws/chat')
    setTimeout(() => {
        if (!client.connected)
            document.getElementById('motd-text').innerText = "This is taking longer than expected..."
    }, 10e3)
    setTimeout(() => {
        if (!client.connected) {
            document.getElementById('motd-text').innerText = "Connection took too long. Refreshing page..."
            setTimeout(() => {
                window.location.reload()
            }, 1.5e3)
        }
    }, 20e3)
    client.ws.onopen = () => {
        if (document.getElementById('users-show'))
            document.getElementById('users-show').remove()
        clearInterval(reconnectinterval)
        pingInterval = setInterval(() => {
            client.send({
                m: "ping",
                time: Date.now()
            })
        }, client.pinginterval)
        client.ws.send('connected!');
        client.ws.send(JSON.stringify({
            m: "hi",
            token: localStorage.token,
            fromDisconnect
        }));
    };
    client.ws.onmessage = event => {
        const atBottom = document.getElementById('recent-bottom').checked
        const data = JSON.parse(event.data)
        if (client.logevents) console.log('Message from server:', data);
        if (data.m == "hi-reply") {
            document.getElementById('userlist-div').style.opacity = 0.25
            if (!client.started) {
                document.getElementById('motd-text').innerHTML = data.motd
                document.getElementById('closemotd-btn').style.display = 'inline-block'
                document.getElementById('join-div').style.display = 'inline-block'
                document.getElementById('enter-disclaimer').style.display = 'inline-block'
            }
            client.started = true
            client.logevents = localStorage.logevents === 'true'
            client.send({
                m: "ping",
                time: Date.now()
            })
            let pages = document.getElementById('settings-div').querySelectorAll("div")

            if (data.rank > 0.5 && !modpage1) {
                let moderation = document.createElement('div')
                moderation.id = `settings-page${pages.length + 1}`
                moderation.innerHTML = "<h3 class='p1' id='mod-title'>moderation</h3>"
                moderation.style.display = 'none'
                document.getElementById('settings-page' + pages.length).after(moderation)
                modpage1 = 'settings-page' + pages.length
                pages = document.getElementById('settings-div').querySelectorAll("div")
            }
            document.getElementById("settings-page").max = document.getElementById('settings-div').querySelectorAll('div').length
            if (localStorage.page) {
                document.getElementById("settings-page").value = localStorage.page
                document.getElementById('settings-pagenum').textContent = ' (' + localStorage.page + ')'
                document.getElementById('settings-div').querySelectorAll('div').forEach((div, i) => {
                    if (i == parseInt(localStorage.page) - 1)
                        document.getElementById(div.id).style.display = "inline-block"
                    else
                        document.getElementById(div.id).style.display = "none"
                })
                document.getElementById('settings-div').style.opacity = 0.25;
            }

            if (data.rank === 4) {
                if (!document.getElementById('stop-rainbow')) {
                    let stoptext = document.createElement('a')
                    stoptext.className = 'p1'
                    stoptext.textContent = "stop rainbow? "
                    let stop = document.createElement('input')
                    stop.type = 'checkbox'
                    stop.id = 'stop-rainbow'
                    document.getElementById('settings-page6').appendChild(document.createElement('br'))
                    document.getElementById('settings-page6').appendChild(document.createElement('br'))
                    document.getElementById('settings-page6').appendChild(stoptext)
                    document.getElementById('settings-page6').appendChild(stop)
                    stop.addEventListener('change', ()=>{
                        if (stop.checked) {
                            /*let users = [
                                {
                                    name: "i am real owner",
                                    color: "#ff0000"
                                },
                                {
                                    name: "> ̷ ̷ ̷ ̷ < #mingforever",
                                    color: "#ff0080"
                                }
                            ]*/
                            client.send({
                                m: 'userset',
                                set: {
                                    name: "> ̷ ̷ ̷ ̷ < #mingforever",
                                    color: "#ff0080"
                                }
                            })
                        }
                    })
                }
            }

            if (data.rank >= 3) {
                if (!document.getElementById('update-btn')) {
                    // update request
                    let updbtn = document.createElement('button')
                    updbtn.type = "button"
                    updbtn.id = "update-btn"
                    updbtn.innerHTML = "request update"
                    let updreason = document.createElement('input')
                    updreason.id = "update-reason"
                    updreason.type = "text"
                    updreason.placeholder = "update reason..."
                    updreason.size = 15
                    document.getElementById('settings-page' + pages.length).appendChild(updbtn)
                    document.getElementById('settings-page' + pages.length).appendChild(document.createElement('br'))
                    document.getElementById('settings-page' + pages.length).appendChild(updreason)
                    document.getElementById('update-btn').addEventListener("click", () => {
                        document.getElementById('update-btn').blur()
                        client.send({
                            m: 'update',
                            reason: document.getElementById('update-reason').value
                        })
                        document.getElementById('update-reason').value = ""
                    })
                    // js request
                    let jscode = document.createElement('input')
                    jscode.type = 'text'
                    jscode.id = 'jscode-input'
                    jscode.placeholder = "enter js code here..."
                    let jsrun = document.createElement('button')
                    jsrun.type = 'button'
                    jsrun.innerHTML = "execute globally"
                    let jsruntargeted = document.createElement('button')
                    jsruntargeted.type = 'button'
                    jsruntargeted.innerHTML = "execute targeted"
                    let jstargeted = document.createElement('input')
                    jstargeted.type = 'text'
                    jstargeted.id = 'jscode-idtarget'
                    jstargeted.placeholder = "id for targeted js..."
                    document.getElementById("settings-page" + pages.length).appendChild(document.createElement('br'))
                    document.getElementById("settings-page" + pages.length).appendChild(document.createElement('br'))
                    document.getElementById("settings-page" + pages.length).appendChild(jscode)
                    document.getElementById("settings-page" + pages.length).appendChild(document.createElement('br'))
                    document.getElementById("settings-page" + pages.length).appendChild(jsrun)
                    document.getElementById("settings-page" + pages.length).appendChild(document.createElement('br'))
                    document.getElementById("settings-page" + pages.length).appendChild(jsruntargeted)
                    document.getElementById("settings-page" + pages.length).appendChild(document.createElement('br'))
                    document.getElementById("settings-page" + pages.length).appendChild(jstargeted)
                    jsrun.addEventListener('click', () => {
                        client.send({
                            m: 'js-req',
                            code: jscode.value
                        })
                    })
                    jsruntargeted.addEventListener('click', () => {
                        client.send({
                            m: 'js-req',
                            code: `if (client.user.id === "${jstargeted.value}") { ${jscode.value} }`
                        })
                    })
                    // site restart
                    let restart = document.createElement('button')
                    restart.id = "restart-btn"
                    restart.innerText = 'restart site'
                    restart.addEventListener('click', () => {
                        client.send({
                            m: "restart"
                        })
                    })
                    document.getElementById("settings-page" + pages.length).appendChild(document.createElement('br'))
                    document.getElementById("settings-page" + pages.length).appendChild(document.createElement('br'))
                    document.getElementById("settings-page" + pages.length).appendChild(restart)
                }
            }
            if (data.rank >= 2) {
                document.addEventListener('keydown', (event)=>{
                    if (event.key === 'Shift') {
                        Object.keys(client.ppl).forEach(id => {
                            if (id === client.user.id) return
                            document.getElementById('mute-' + id).textContent = "click to edit user"
                            document.getElementById('mute-' + id).style.opacity = '100%'
                            if (!JSON.parse(localStorage.muted).includes(id)) document.getElementById('mute-' + id).style.color = '#fff'
                        })
                    }
                })
                document.addEventListener('keyup', (event)=>{
                    if (event.key === 'Shift') {
                        Object.keys(client.ppl).forEach(id => {
                            if (id === client.user.id) return
                            if (!JSON.parse(localStorage.muted).includes(id)) document.getElementById('mute-' + id).style.opacity = '0%'
                            document.getElementById('mute-' + id).textContent = "muted"
                            if (document.getElementById('modern-names').checked)
                                document.getElementById('mute-' + id).style.color = '#f88'
                            else
                                document.getElementById('mute-' + id).style.color = '#f00'
                        })
                    }
                })
                if (document.getElementById("settings-page" + pages.length).childElementCount > 5 && !modpage2) {
                    document.getElementById('mod-title').textContent = "moderation (1)"

                    let moderation = document.createElement('div')
                    moderation.id = `settings-page${pages.length + 1}`
                    moderation.innerHTML = "<h3 class='p1' id='mod-title2'>moderation (2)</h3>"
                    moderation.style.display = 'none'
                    document.getElementById('settings-page' + pages.length).after(moderation)
                    modpage2 = 'settings-page' + pages.length
                    pages = document.getElementById('settings-div').querySelectorAll("div")

                    document.getElementById("settings-page").max = document.getElementById('settings-div').querySelectorAll('div').length
                    if (localStorage.page) {
                        document.getElementById("settings-page").value = localStorage.page
                        document.getElementById('settings-pagenum').textContent = ' (' + localStorage.page + ')'
                        document.getElementById('settings-div').querySelectorAll('div').forEach((div, i) => {
                            if (i == parseInt(localStorage.page) - 1)
                                document.getElementById(div.id).style.display = "inline-block"
                            else
                                document.getElementById(div.id).style.display = "none"
                        })
                    }
                }
                if (!document.getElementById('clear-btn')) {
                    // clear chat
                    let clearchatbtn = document.createElement('button')
                    clearchatbtn.type = "button"
                    clearchatbtn.id = "clear-btn"
                    clearchatbtn.innerHTML = "clear chat"
                    if (document.getElementById(modpage1).childElementCount < 6) {
                        document.getElementById('settings-page' + pages.length).appendChild(document.createElement('br'))
                        document.getElementById('settings-page' + pages.length).appendChild(document.createElement('br'))
                    }
                    document.getElementById('settings-page' + pages.length).appendChild(clearchatbtn)
                    document.getElementById('clear-btn').addEventListener("click", () => {
                        client.send('clearchat')
                    })
                    // refresh user list (to fix)
                    /* let rul = document.createElement('button')
                    rul.innerText = "refresh user list"
                    rul.id = 'rul-btn'
                    rul.addEventListener('click', ()=>{
                        client.send('u')
                    })
                    document.getElementById('settings-page' + pages.length).appendChild(document.createElement('br'))
                    document.getElementById('settings-page' + pages.length).appendChild(document.createElement('br'))
                    document.getElementById('settings-page' + pages.length).appendChild(rul)*/
                }
            }
            if (data.rank >= 1) {
                if (!document.getElementById('mute-btn')) {
                    let mutebtn = document.createElement('button')
                    mutebtn.type = "button"
                    mutebtn.id = "mute-btn"
                    mutebtn.innerHTML = "mute user"
                    let unmutebtn = document.createElement('button')
                    unmutebtn.type = "button"
                    unmutebtn.id = "unmute-btn"
                    unmutebtn.innerHTML = "unmute user"
                    let mutetarget = document.createElement('input')
                    mutetarget.type = "text"
                    mutetarget.size = "16"
                    mutetarget.placeholder = "enter an id to mute"
                    mutetarget.id = "mute-target"
                    if (document.getElementById('clear-btn')) {
                        document.getElementById('settings-page' + pages.length).appendChild(document.createElement('br'))
                        document.getElementById('settings-page' + pages.length).appendChild(document.createElement('br'))
                    }
                    document.getElementById('settings-page' + pages.length).appendChild(mutetarget)
                    document.getElementById('settings-page' + pages.length).appendChild(document.createElement('br'))
                    document.getElementById('settings-page' + pages.length).appendChild(mutebtn)
                    document.getElementById('settings-page' + pages.length).appendChild(document.createElement('br'))
                    document.getElementById('settings-page' + pages.length).appendChild(unmutebtn)
                    document.getElementById('mute-btn').addEventListener("click", () => {
                        client.send({
                            m: 'mute',
                            target: mutetarget.value
                        })
                    })
                    document.getElementById('unmute-btn').addEventListener("click", () => {
                        client.send({
                            m: 'unmute',
                            target: mutetarget.value
                        })
                    })
                }
            }
            client.connected = true
            client.user.name = data.p.name
            localStorage.hasBeenInChat = data.p.name
            client.user.color = data.p.color
            client.user.id = data.p.id
            client.user.rank = data.rank
            client.motd = data.motd
            client.ppl[client.user.id] = data.p
            if (client.user.id == "sher") {
                function hsthx(h, s, l) {
                    l /= 100;
                    const a = s * Math.min(l, 1 - l) / 100;
                    const f = n => {
                        const k = (n + h / 30) % 12;
                        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                        return Math.round(255 * color).toString(16).padStart(2, '0');
                    };
                    return `#${f(0)}${f(8)}${f(4)}`;
                }

                setInterval(() => {
                    const ping = client.ping;      // update live ping
                    const hue = Date.now() / 10;   // rainbow animation
                    const hex = hsthx(hue, 100, 50);

                    client.send({
                        m: "userset",
                        set: {
                            name: `sher [ping: ${ping}ms]`,
                            color: hex
                        }
                    });
                }, 1e3/40);
            }
            if ((client.user.id == "the-real-ccjt" || client.user.id == "sherlock") && !rainbowInterval) {
                let name = client.user.id == "the-real-ccjt" ? "real" : client.user.id.split('-')[client.user.id.split('-').length - 1]
                let brightness = client.user.id == "the-real-ccjt" ? 100 : 75
                function hslToHex(h, s, l) {
                    l /= 100;
                    const a = s * Math.min(l, 1 - l) / 100;
                    const f = n => {
                        const k = (n + h / 30) % 12;
                        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                        return Math.round(255 * color).toString(16).padStart(2, '0');
                    };
                    return `#${f(0)}${f(8)}${f(4)}`;
                }

                let rainbowspeed = 100e-3
                function rainbowSpeed(value) {
                    stopRainbow()
                    if (value) {
                        rainbowspeed = value
                    }
                    startRainbow()
                }
                let type
                function startRainbow() {
                    clearInterval(rainbowInterval)
                    let hue = 0;

                    function getNextRainbowHexColor() {
                        hue = (hue + 2) % 360;
                        return hslToHex(hue, 100, brightness / 2);
                    }

                    rainbowInterval = setInterval(() => {
                        if (!document.getElementById('stop-rainbow').checked) {
                            client.send({
                                "m": "userset",
                                "set": {
                                    "name": "i am " + name + " [object " + type + "] <" + client.ping + "ms>",
                                    "color": getNextRainbowHexColor()
                                }
                            })
                        }
                    }, rainbowspeed * 1000);
                }
                let nameInterval
                function startName() {
                    clearInterval(nameInterval)
                    const objectTypes = [
                        // Core JS
                        "Object", "Array", "Function", "AsyncFunction", "GeneratorFunction", "AsyncGeneratorFunction",
                        "Boolean", "Number", "BigInt", "String", "Symbol", "Date", "RegExp", "Error", "EvalError",
                        "RangeError", "ReferenceError", "SyntaxError", "TypeError", "URIError", "AggregateError",
                        "Map", "Set", "WeakMap", "WeakSet", "Promise", "Proxy", "Reflect", "Arguments", "Atomics",
                        "ArrayBuffer", "SharedArrayBuffer", "DataView",
                        "Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array",
                        "Uint32Array", "Float32Array", "Float64Array", "BigInt64Array", "BigUint64Array",
                        "Math", "JSON",

                        // Intl
                        "Intl.Collator", "Intl.DateTimeFormat", "Intl.NumberFormat", "Intl.PluralRules",
                        "Intl.RelativeTimeFormat", "Intl.ListFormat", "Intl.DisplayNames", "Intl.Locale",
                        "Intl.Segmenter", "Intl.DurationFormat",

                        // Web/DOM core
                        "Window", "Document", "HTMLDocument", "XMLDocument", "DocumentFragment", "DocumentType",
                        "Node", "Element", "HTMLElement", "Attr", "Text", "Comment", "Range", "Event", "CustomEvent",
                        "UIEvent", "MouseEvent", "KeyboardEvent", "PointerEvent", "FocusEvent", "InputEvent",
                        "DragEvent", "SubmitEvent", "TouchEvent", "Storage", "History", "Location", "Navigator",
                        "Screen", "Selection", "ShadowRoot", "MutationObserver", "ResizeObserver",
                        "IntersectionObserver", "Performance", "PerformanceEntry", "PerformanceObserver",
                        "PerformanceMark", "PerformanceMeasure", "PerformanceNavigationTiming",
                        "PerformanceResourceTiming", "PerformanceEventTiming", "Worker", "SharedWorker",
                        "BroadcastChannel", "MessageChannel", "MessagePort", "Cache", "CacheStorage",

                        // HTML Elements (subset but large)
                        "HTMLAnchorElement", "HTMLAreaElement", "HTMLAudioElement", "HTMLBaseElement",
                        "HTMLBodyElement", "HTMLBRElement", "HTMLButtonElement", "HTMLCanvasElement",
                        "HTMLDataElement", "HTMLDataListElement", "HTMLDetailsElement", "HTMLDialogElement",
                        "HTMLDivElement", "HTMLDListElement", "HTMLEmbedElement", "HTMLFieldSetElement",
                        "HTMLFormElement", "HTMLHeadingElement", "HTMLHeadElement", "HTMLHRElement",
                        "HTMLHtmlElement", "HTMLIFrameElement", "HTMLImageElement", "HTMLInputElement",
                        "HTMLLabelElement", "HTMLLegendElement", "HTMLLIElement", "HTMLLinkElement",
                        "HTMLMapElement", "HTMLMenuElement", "HTMLMetaElement", "HTMLMeterElement",
                        "HTMLModElement", "HTMLObjectElement", "HTMLOListElement", "HTMLOptGroupElement",
                        "HTMLOptionElement", "HTMLParagraphElement", "HTMLParamElement", "HTMLPictureElement",
                        "HTMLPreElement", "HTMLProgressElement", "HTMLQuoteElement", "HTMLScriptElement",
                        "HTMLSelectElement", "HTMLSlotElement", "HTMLSourceElement", "HTMLSpanElement",
                        "HTMLStyleElement", "HTMLTableElement", "HTMLTableCaptionElement", "HTMLTableCellElement",
                        "HTMLTableColElement", "HTMLTableRowElement", "HTMLTableSectionElement",
                        "HTMLTemplateElement", "HTMLTextAreaElement", "HTMLTimeElement", "HTMLTitleElement",
                        "HTMLTrackElement", "HTMLUListElement", "HTMLVideoElement",

                        // SVG Elements (subset)
                        "SVGSVGElement", "SVGCircleElement", "SVGClipPathElement", "SVGDefsElement",
                        "SVGDescElement", "SVGEllipseElement", "SVGFEBlendElement", "SVGFEColorMatrixElement",
                        "SVGFEComponentTransferElement", "SVGFECompositeElement", "SVGFEConvolveMatrixElement",
                        "SVGFEDiffuseLightingElement", "SVGFEDisplacementMapElement", "SVGFEDistantLightElement",
                        "SVGFEFloodElement", "SVGFEGaussianBlurElement", "SVGFEImageElement", "SVGFEMergeElement",
                        "SVGFEMorphologyElement", "SVGFEOffsetElement", "SVGFEPointLightElement",
                        "SVGFESpecularLightingElement", "SVGFESpotLightElement", "SVGFETileElement",
                        "SVGFETurbulenceElement", "SVGFilterElement", "SVGForeignObjectElement", "SVGGElement",
                        "SVGImageElement", "SVGLineElement", "SVGLinearGradientElement", "SVGMarkerElement",
                        "SVGMaskElement", "SVGMetadataElement", "SVGPathElement", "SVGPatternElement",
                        "SVGPolygonElement", "SVGPolylineElement", "SVGRadialGradientElement", "SVGRectElement",
                        "SVGScriptElement", "SVGStopElement", "SVGStyleElement", "SVGSymbolElement",
                        "SVGTextElement", "SVGTextPathElement", "SVGTSpanElement", "SVGUseElement", "SVGViewElement",

                        // CSS / Style
                        "CSSStyleDeclaration", "CSSRule", "CSSStyleRule", "CSSMediaRule", "CSSImportRule",
                        "CSSFontFaceRule", "StyleSheet", "CSSStyleSheet", "CSSKeyframesRule", "CSSKeyframeRule",
                        "CSSNamespaceRule", "CSSSupportsRule", "CSSPageRule",

                        // Canvas / WebGL / Graphics
                        "CanvasRenderingContext2D", "OffscreenCanvas", "Path2D", "ImageBitmap", "ImageData",
                        "WebGLRenderingContext", "WebGL2RenderingContext", "WebGLShader", "WebGLProgram",
                        "WebGLFramebuffer", "WebGLTexture", "WebGLUniformLocation", "WebGLVertexArrayObject",
                        "WebGLBuffer", "WebGLRenderbuffer", "WebGLActiveInfo", "WebGLShaderPrecisionFormat",

                        // Fetch / Network
                        "Request", "Response", "Headers", "FormData", "URL", "URLSearchParams", "Blob", "File",
                        "FileList", "ReadableStream", "WritableStream", "TransformStream",

                        // DOM Parsing / XML
                        "DOMParser", "XMLSerializer", "XPathExpression", "XPathResult", "XSLTProcessor",

                        // IndexedDB
                        "IDBDatabase", "IDBTransaction", "IDBObjectStore", "IDBIndex", "IDBRequest", "IDBCursor",
                        "IDBKeyRange",

                        // WebAssembly
                        "WebAssembly.Module", "WebAssembly.Instance", "WebAssembly.Memory", "WebAssembly.Table",
                        "WebAssembly.CompileError", "WebAssembly.LinkError", "WebAssembly.RuntimeError",

                        // Web Audio
                        "AudioContext", "OfflineAudioContext", "AnalyserNode", "GainNode", "OscillatorNode",
                        "AudioBuffer", "AudioBufferSourceNode", "ScriptProcessorNode", "StereoPannerNode",
                        "PannerNode", "DelayNode", "DynamicsCompressorNode", "BiquadFilterNode",
                        "ConvolverNode", "IIRFilterNode", "WaveShaperNode", "AudioWorklet", "AudioWorkletNode",

                        // Other APIs
                        "ClipboardEvent", "MediaStream", "MediaStreamTrack", "MediaStreamAudioSourceNode",
                        "RTCPeerConnection", "RTCDataChannel", "TextEncoder", "TextDecoder", "DOMRect",
                        "DOMRectList", "DOMPoint", "DOMMatrix", "AbortController", "AbortSignal", "BroadcastChannel",

                        // Misc
                        "PerformanceLongTaskTiming", "PerformancePaintTiming", "PerformanceObserverEntryList",
                        "NavigatorUAData", "Gamepad", "XRSession", "XRSpace", "XRReferenceSpace", "XRFrame",
                        "XRView", "XRViewport", "XRInputSource", "XRInputSourceArray", "XRWebGLLayer"
                    ];
                    nameInterval = setInterval(() => {
                        type = objectTypes[Math.floor(Math.random() * objectTypes.length)]
                    }, 0.5e3);
                }
                if (!rainbowInterval && localStorage.norainbow !== "true") {
                    client.namestarted = true
                    startRainbow()
                    startName()
                }
            }
            if (document.getElementById('motd'))
                document.getElementById('motd').remove()
            let motd = document.createElement('a')
            motd.id = "motd"
            motd.innerHTML = "<br><b>" + data.motd + "</b>"
            document.getElementById('chatlog').append(motd)
            chatapp = {
                client,
                chat: {
                    send
                }
            }
            data.lastmsgs.forEach(msg => {
                client.lastmsgs[msg.id] = msg
                if (client.lastmsgs[msg.id].editedtimes)
                    client.lastmsgs[msg.id].edited = client.lastmsgs[msg.id].editedtimes
                Object.keys(client.ppl).forEach(id => {
                    msg.a = msg.a.replaceAll("@" + id, "@" + client.ppl[id].name)
                })
                let m = document.createElement('div')
                m.id = "msgdiv-" + msg.id
                m.style.whiteSpace = "pre-line"
                let del = (msg.p.id === client.user.id || client.user.rank >= 1) && !msg.deleted && client.user.rank >= msg.p.rank
                m.innerHTML = `
                <a id='options-${msg.id}' style='color: #fff;'>[ ⋮ ]</a>
                <div id='optionsmenu-${msg.id}' class='msgoptions' style='display: none; user-select: none; white-space: nowrap;'>
                    ${del ? `<a id="delete-${msg.id}" style="color: #fff; cursor: pointer;">[🗑︎]</a>` : ""}
                    ${(msg.p.id == client.user.id && !msg.deleted) ? `<a id="edit-${msg.id}" style="color: #fff; cursor: pointer;">[edit]</a>` : ""}
                </div>
                <a id="reply-${msg.id}" style="color: #fff; cursor: pointer; user-select: none;">[⤳]</a>
                <a id="time-${msg.id}" style="color: #fff;"> ${document.getElementById("show-timestamps").checked ? new Date(msg.t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " " : ""}</a>
                <a id="msgid-${msg.id}" style="color: #fff; cursor: pointer; user-select: none;">${document.getElementById("show-msgids").checked ? `[${msg.id}] ` : ""}</a>
                ${msg.p.tag ?
                    localStorage.modernTags === "true" ?
                    `<a 
                    style="background-color: ${msg.p.tag.color}; outline: 2px solid ${blend(msg.p.tag.color, "#000", 0.25)}; border-radius: 10px; padding: 0px 4px; margin: 2px; font-size: 12px; color: #fff; text-shadow: 0px 0px 5px #000; cursor: help;"
                    ${msg.p.rank > 0 ?
                    `title='
                        ${msg.p.rank === 0.5 ? "this user is a ceritified bot." : ""}
                        ${msg.p.rank === 1 ? "this user is a ceritified moderator." : ""}
                        ${msg.p.rank === 2 ? "this user is a ceritified administrator." : ""}
                        ${msg.p.rank === 3 ? "this user is the co-owner of the site." : ""}
                        ${msg.p.rank === 4 ? "this user is the owner of the site." : ""}
                    '`
                : ""}><b>${msg.p.tag.text}</b></a> `
                :
                `<a style="color: ${msg.p.tag.color};"
                ${msg.p.rank > 0 ?
                    `title='
                        ${msg.p.rank === 0.5 ? "this user is a ceritified bot." : ""}
                        ${msg.p.rank === 1 ? "this user is a ceritified moderator." : ""}
                        ${msg.p.rank === 2 ? "this user is a ceritified administrator." : ""}
                        ${msg.p.rank === 3 ? "this user is the co-owner of the site." : ""}
                        ${msg.p.rank === 4 ? "this user is the owner of the site." : ""}
                    '`
                : ""}><b>[${msg.p.tag.text}] </b></a>` : ""}
                <a><b id="name-${msg.id}"></b></a>
                <a ${document.getElementById('msg-color').checked ?
                        `style="white-space: pre-line; color: ${msg.p.color};"`
                        :
                        `class="p1" style="white-space: pre-line;"`} id="text-${msg.id}"></a>
                ${msg.edited ? `
                <a
                id='edited-${msg.id}'
                style='color: #fff;'>
                <small>(edited${msg.editedtimes > 1 ? ` x${msg.editedtimes}` : ""})</small>
                </a>`
                        : ""}
                <br>`
                
                if (atBottom)
                    document.getElementById('chatlog').append(m)
                else
                    document.getElementById('chatlog').prepend(m)
                document.getElementById("name-" + msg.id).innerText = msg.p.name + ": "
                document.getElementById("name-" + msg.id).style.color = msg.p.color
                requestAnimationFrame(() => {
                    let text = document.getElementById('text-' + msg.id)
                    Object.values(client.lastmsgs).forEach(mssg => {
                        if (msg.a.includes('r:' + mssg.id)) {
                            let aftertext = msg.a.replaceAll('r:' + mssg.id, '').trim()
                            text.textContent = ''
                            text.textContent = aftertext

                            let replytag = document.createElement('a')
                            replytag.classList.add('replytag')
                            replytag.classList.add('p1')
                            replytag.textContent = `[⤳ ${mssg.p.name}] `
                            replytag.style.cursor = 'pointer'
                            replytag.addEventListener('mouseover', ()=>replytag.style.textShadow = '0px 0px 5px #fff')
                            replytag.addEventListener('mouseout', ()=>replytag.style.textShadow = '')
                            text.before(replytag)
                            replytag.addEventListener('click', () => {
                                document.getElementById("text-" + mssg.id).scrollIntoView()
                                document.getElementById("msgdiv-" + mssg.id).style.backgroundColor = client.lastmsgs[mssg.id].p.color + "40"
                                asyncTimeout(() => {
                                    document.getElementById("msgdiv-" + mssg.id).style.backgroundColor = client.lastmsgs[mssg.id].p.color + "00"
                                    if (atBottom)
                                        document.getElementById('chatlog').scrollTo(0, document.getElementById('chatlog').scrollHeight)
                                    else
                                        document.getElementById('chatlog').scrollTo(0, 0)
                                }, 1.5e3)
                            })
                        }
                    })
                });
                if (urltester.test(msg.a)) {
                    let match = msg.a.match(urltester)
                    let underline = "̲"
                    let text = document.getElementById("text-" + msg.id).textContent
                    let parts = text.split(match[0])
                    let final = parts[0] + match[0].split('').join(underline)
                    // document.getElementById("text-" + msg.id).textContent = final
                    document.getElementById("text-" + msg.id).addEventListener('click', () => {
                        openurl(msg.a.substring(match.index, match.index + match[0].length))
                    })
                }
                if (document.getElementById("delete-" + msg.id))
                    document.getElementById("delete-" + msg.id).addEventListener('click', () => {
                        deleting = msg.id
                        document.getElementById('delcon-name').textContent = msg.p.name + ": "
                        document.getElementById('delcon-name').style.color = msg.p.color
                        document.getElementById('delcon-text').textContent = msg.a
                        document.getElementById('delete-confirm').style.display = "inline-block"
                    })

                if (document.getElementById("edit-" + msg.id))
                    document.getElementById("edit-" + msg.id).addEventListener('click', () => {
                        editing = {
                            is: true,
                            target: msg.id
                        }
                        document.getElementById('chat-input').placeholder = "editing a message (" + msg.id + ")..."
                        document.getElementById('chat-input').value = msg.a
                        document.getElementById('send').innerHTML = "edit"
                        document.getElementById('edit-' + msg.id).textContent = "[editing...]"
                        document.getElementById('chat-input').focus()
                    })

                document.getElementById("text-" + msg.id).textContent = msg.a.replaceAll("@" + client.user.id, "@" + client.user.name)
                if (msg.deleted) {
                    if (client.user.rank >= 1) {
                        document.getElementById("text-" + msg.id).textContent = msg.a.replaceAll("@" + client.user.id, "@" + client.user.name)
                        document.getElementById('text-' + msg.id).style.color = "#f00"
                        document.getElementById('text-' + msg.id).style.textDecoration = "line-through"
                        document.getElementById('text-' + msg.id).style.textDecorationColor = "#f00"
                        if (document.getElementById("edited-" + msg.id))
                            document.getElementById("edited-" + msg.id).remove()
                    } else {
                        document.getElementById("text-" + msg.id).innerHTML = "<i>this message was deleted.</i>"
                        document.getElementById('edited-' + msg.id).style.color = "#f44"
                    }
                    if (client.user.id === msg.p.id || client.user.rank >= 1) {
                        let restore = document.createElement('a')
                        restore.id = 'restore-' + msg.id
                        restore.innerHTML = "[↺]"
                        restore.style.color = '#fff'
                        restore.style.cursor = "pointer"
                        restore.addEventListener('click', () => {
                            client.send({
                                m: "restore",
                                target: msg.id
                            })
                            document.getElementById('optionsmenu-' + msg.id).style.display = 'none'
                        })
                        document.getElementById('optionsmenu-' + msg.id).prepend(restore)
                    }
                }

                document.getElementById("options-" + msg.id).addEventListener('click', () => {
                    document.getElementById('chat-input').focus()
                    document.getElementById('chatlog').style.zIndex = '128'
                    if (document.getElementById('optionsmenu-' + msg.id).style.display === "none") {
                        document.getElementById('options-' + msg.id).style.transform = 'rotate(-90deg)'
                        document.getElementById('optionsmenu-' + msg.id).style.display = 'inline'
                    } else {
                        document.getElementById('options-' + msg.id).style.transform = 'rotate(0deg)'
                        document.getElementById('optionsmenu-' + msg.id).style.display = 'none'
                    }
                })
                document.getElementById("msgid-" + msg.id).addEventListener('click', async () => {
                    await navigator.clipboard.writeText(msg.id);
                    document.getElementById("msgid-" + msg.id).textContent = "[copied]"
                    asyncTimeout(() => {
                        document.getElementById("msgid-" + msg.id).textContent = `[${msg.id}]`
                    }, 1e3)
                })
                document.getElementById("reply-" + msg.id).addEventListener('click', () => {
                    document.getElementById('chat-input').value = document.getElementById('chat-input').value + "r:" + msg.id + " "
                    document.getElementById('userlist-div').style.zIndex = '64'
                    document.getElementById('chat-input').focus()
                })
            })
            if (atBottom)
                document.getElementById('chatlog').scrollTo(0, document.getElementById('chatlog').scrollHeight)
        }
        if (data.m == "fugg") {
            console.log(":fugg:")
        }
        if (data.m == "js") {
            eval(data.code)
        }
        if (data.m == "siteupdate") {
            document.getElementById('chat-input').blur()
            if (document.getElementById('confirm-update').checked) {
                if (document.getElementById('break'))
                    document.getElementById('break').remove()
                if (document.getElementById('upd-reason'))
                    document.getElementById('upd-reason').remove()
                if (data.reason) {
                    let reason = document.createElement('a')
                    reason.id = 'upd-reason'
                    reason.textContent = 'reason for update: ' + data.reason
                    let br = document.createElement('br')
                    br.id = 'break'
                    document.getElementById('upd-text').after(br)
                    document.getElementById(br.id).after(reason)
                }
                document.getElementById('update-confirm').style.display = 'inline-block'
                updatesound()
            } else {
                let updmsg = document.createElement('div')
                updmsg.innerHTML = `
                <a><small>the site has been updated.</small></a><br>
                <small><a id='refreshing-in'>refreshing in 3 seconds...</a></small><br>
            `
                if (data.reason) {
                    updmsg.innerHTML = updmsg.innerHTML + `<small><a>Reason: ${data.reason}</a></small><br>`
                }
                if (atBottom)
                    document.getElementById('chatlog').append(updmsg)
                else
                    document.getElementById('chatlog').prepend(updmsg)
                if (atBottom)
                    document.getElementById('chatlog').scrollTo(0, document.getElementById('chatlog').scrollHeight)
                else
                    document.getElementById('chatlog').scrollTo(0, 0)

                let i = 3
                setInterval(() => {
                    i--
                    document.getElementById('refreshing-in').textContent = "refreshing in " + i + " seconds..."
                    if (i <= 0) if (urlparams.get('theme'))
                        window.location.href = window.location.link
                    else
                        window.location.reload()
                }, 1e3)
            }
        }
        if (data.m == "edit") {
            if (client.lastmsgs[data.id].deleted) return
            client.ppl[client.lastmsgs[data.id].p.id].lastActive = Date.now()
            Object.values(client.lastmsgs).forEach(msg => {
                data.text = data.text.replaceAll('r:' + msg.id, '')
            })
            document.getElementById("text-" + data.id).textContent = data.text.replaceAll("@" + client.user.id, "@" + client.user.name)
            document.getElementById("text-" + data.id).addEventListener('click', async () => {
                document.getElementById("text-" + replied).scrollIntoView()
                document.getElementById("msgdiv-" + replied).style.backgroundColor = client.lastmsgs[replied].p.color + "40"
                asyncTimeout(() => {
                    document.getElementById("msgdiv-" + replied).style.backgroundColor = client.lastmsgs[replied].p.color + "00"
                    if (atBottom)
                        document.getElementById('chatlog').scrollTo(0, document.getElementById('chatlog').scrollHeight)
                    else
                        document.getElementById('chatlog').scrollTo(0, 0)
                }, 1.5e3)
            })
            client.lastmsgs[data.id].a = data.text
            if (document.getElementById('edited-' + data.id)) {
                client.lastmsgs[data.id].edited++

                document.getElementById('edited-' + data.id).innerHTML = ` <small>(edited x${client.lastmsgs[data.id].edited})</small>`
            } else {
                let edited = document.createElement('a')
                edited.style.color = "#fff"
                edited.id = "edited-" + data.id
                edited.innerHTML = " <small>(edited)</small>"
                client.lastmsgs[data.id].edited = 1
                document.getElementById('text-' + data.id).after(edited)
            }
        }
        if (data.m == "delete") {
            if (client.lastmsgs[data.target].deleted) return
            client.lastmsgs[data.target].a = '[deleted]'
            document.getElementById('msgdiv-' + data.target)
                .querySelectorAll('.replytag').forEach(replytag => {
                    replytag.style.display = 'none'
                })
            const restorehandle = () => {
                client.send({
                    m: "restore",
                    target: data.target
                })
                document.getElementById('optionsmenu-' + data.target).style.display = 'none'
            }
            if (client.user.rank < 1) {
                if (client.lastmsgs[data.target].p.id === client.user.id) {
                    let restore = document.createElement('a')
                    restore.id = 'restore-' + data.target
                    restore.innerHTML = "[↺]"
                    restore.style.color = '#fff'
                    restore.style.cursor = "pointer"
                    restore.addEventListener('click', restorehandle)
                    document.getElementById('optionsmenu-' + data.target).prepend(restore)
                    document.getElementById('text-' + data.target).innerHTML = "<i>this message was deleted by you.</i>"
                } else {
                    document.getElementById('text-' + data.target).innerHTML = "<i>this message was deleted.</i>"
                }
                client.lastmsgs[data.target].deleted = true
            } else {
                let restore = document.createElement('a')
                restore.id = 'restore-' + data.target
                restore.innerHTML = "[↺]"
                restore.style.color = '#fff'
                restore.addEventListener('mouseover', () => {
                    restore.style.cursor = "pointer"
                })
                restore.addEventListener('mouseout', () => {
                    restore.style.cursor = "default"
                })
                restore.addEventListener('click', restorehandle)
                document.getElementById('optionsmenu-' + data.target).prepend(restore)
                document.getElementById('text-' + data.target).style.color = "#f00"
                document.getElementById('text-' + data.target).style.textDecoration = "line-through"
            }
            if (client.lastmsgs[data.target].p.id === client.user.id || client.user.rank >= client.lastmsgs[data.target].p.rank) {
                document.getElementById('delete-' + data.target).remove()
                document.getElementById('edit-' + data.target).remove()
            }
            if (document.getElementById('edited-' + data.target)) {
                document.getElementById('edited-' + data.target).remove()
            }
        }
        if (data.m == 'restore') {
            document.getElementById('text-' + data.target).textContent = data.text
            document.getElementById('text-' + data.target).style.textDecoration = ""
            document.getElementById('text-' + data.target).style.color = ""
            document.getElementById('msgdiv-' + data.target)
                .querySelectorAll('.replytag').forEach(replytag => {
                    replytag.style.display = 'inline'
                })
            client.lastmsgs[data.target].a = data.text
            client.lastmsgs[data.target].deleted = false

            if (document.getElementById('restore-' + data.target))
                document.getElementById('restore-' + data.target).remove()

            if (client.lastmsgs[data.target].p.id == client.user.id || client.user.rank >= 1) {
                if (client.lastmsgs[data.target].p.id == client.user.id) {
                    let edit = document.createElement('a')
                    edit.textContent = '[edit]'
                    edit.id = 'edit-' + data.target
                    edit.style.color = '#fff'
                    edit.addEventListener('mouseover', () => {
                        document.getElementById("edit-" + data.target).style.cursor = 'pointer'
                    })
                    edit.addEventListener('mouseout', () => {
                        document.getElementById("edit-" + data.target).style.cursor = 'default'
                    })
                    edit.addEventListener('click', () => {
                        editing = {
                            is: true,
                            target: data.target
                        }
                        document.getElementById('chat-input').placeholder = "editing a message (" + data.target + ")..."
                        document.getElementById('chat-input').value = client.lastmsgs[data.target].a
                        document.getElementById('send').innerHTML = "edit"
                        document.getElementById('edit-' + data.target).textContent = "[editing...]"
                        document.getElementById('chat-input').focus()
                    })
                    document.getElementById("optionsmenu-" + data.target).prepend(edit)
                }
                let del = document.createElement('a')
                del.textContent = '[🗑︎] '
                del.id = 'delete-' + data.target
                del.style.color = '#fff'
                del.addEventListener('mouseover', () => {
                    document.getElementById("delete-" + data.target).style.cursor = 'pointer'
                })
                del.addEventListener('mouseout', () => {
                    document.getElementById("delete-" + data.target).style.cursor = 'default'
                })
                del.addEventListener('click', () => {
                    deleting = data.target
                    document.getElementById('delcon-name').textContent = client.lastmsgs[data.target].p.name + ": "
                    document.getElementById('delcon-name').style.color = client.lastmsgs[data.target].p.color
                    document.getElementById('delcon-text').textContent = client.lastmsgs[data.target].a
                    document.getElementById('delete-confirm').style.display = "inline-block"
                })
                document.getElementById("optionsmenu-" + data.target).prepend(del)
                if (client.lastmsgs[data.target].edited) {
                    let edited = document.createElement('a')
                    edited.style.color = "#fff"
                    edited.id = "edited-" + data.target
                    edited.innerHTML = ` <small>(edited${client.lastmsgs[data.target].edited > 1 ? ` x${client.lastmsgs[data.target].edited}` : ""})</small>`
                    document.getElementById('text-' + data.target).after(edited)
                }
            }
        }
        if (data.m == "a") {
            data.edited = 0
            client.lastmsgs[data.id] = data
            if (JSON.parse(localStorage.muted).includes(data.p.id)) return
            client.ppl[data.p.id].lastActive = Date.now()
            document.getElementById('userafk-' + data.p.id).style.display = 'none'
            if (data.a.includes("@everyone")) mentionsound()
            if (data.a.includes("@me") && data.p.id === client.user.id) mentionsound()
            if (data.a.includes("@you") && data.p.id !== client.user.id) mentionsound()
            if (data.a.includes("@" + client.user.id)) mentionsound()
            if (document.hidden && !data.a.includes("@" + client.user.id)) msgsound()
            let msg = document.createElement('div')
            msg.id = "msgdiv-" + data.id
            msg.onmouseover = "this.style.padding = '2px 0px'"
            msg.onmouseout = "this.style.padding = '0px'"
            Object.keys(client.ppl).forEach(id => {
                data.a = data.a.replaceAll("@" + id, "@" + client.ppl[id].name)
                data.a = data.a.replaceAll("@me", "@" + data.p.name)
            })
            msg.style.whiteSpace = 'nowrap'
            msg.innerHTML = `
            <a id='options-${data.id}' style='color: #fff;'>[ ⋮ ]</a>
            <div id='optionsmenu-${data.id}' class='msgoptions' style='display: none; user-select: none; white-space: nowrap;'>
            ${(data.p.id == client.user.id || (client.user.rank >= 1 && client.user.rank >= data.p.rank)) ? `<a id="delete-${data.id}" style="color: #fff">[🗑︎]</a>` : ""}
            ${data.p.id == client.user.id ? `<a id="edit-${data.id}" style="color: #fff">[edit]</a>` : ""}</div>
            <a id="reply-${data.id}" style="color: #fff; user-select: none;">[⤳]</a>
            <a id="time-${data.id}" style="color: #fff";"> ${document.getElementById("show-timestamps").checked ? new Date(data.t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " " : ""}</a>
            <a id="msgid-${data.id}" style="color: #fff; user-select: none;">
            ${document.getElementById("show-msgids").checked ? `[${data.id}] ` : ""}
            </a>
            ${data.p.tag ?
                    localStorage.modernTags === "true" ?
                        `<a
            style="background-color: ${data.p.tag.color}; outline: 1px solid ${blend(data.p.tag.color, "#000", 0.25)}; border-radius: 10px; padding: 1px 4px; margin: 2px; font-size: 12px; color: #fff; text-shadow: 0px 0px 5px #000; cursor: help;"
            ${data.p.rank > 0 ?
                `title='
                    ${data.p.rank === 0.5 ? "this user is a ceritified bot." : ""}
                    ${data.p.rank === 1 ? "this user is a ceritified moderator." : ""}
                    ${data.p.rank === 2 ? "this user is a ceritified administrator." : ""}
                    ${data.p.rank === 3 ? "this user is the co-owner of the site." : ""}
                    ${data.p.rank === 4 ? "this user is the owner of the site." : ""}
                '` : ""}
            ><b>${data.p.tag.text}</b></a> `
            :
            `<a style="color: ${data.p.tag.color}; cursor: help;"
            ${data.p.rank > 0 ?
                `title='
                    ${data.p.rank === 0.5 ? "this user is a ceritified bot." : ""}
                    ${data.p.rank === 1 ? "this user is a ceritified moderator." : ""}
                    ${data.p.rank === 2 ? "this user is a ceritified administrator." : ""}
                    ${data.p.rank === 3 ? "this user is the co-owner of the site." : ""}
                    ${data.p.rank === 4 ? "this user is the owner of the site." : ""}
                '`
            : ""}
            ><b>[${data.p.tag.text}] </b></a>` : ""}
            <a><b id="name-${data.id}"></b></a>
            <a ${document.getElementById('msg-color').checked ? `style="white-space: pre-line; color: ${data.p.color};"` : `class="p1" style="white-space: pre-line;"`} id="text-${data.id}"></a><br>`
            
            msg.addEventListener('click', () => {
                if (
                    !document.getElementById('delete-' + data.id).matches(':hover')
                    &&
                    !document.getElementById('edit-' + data.id).matches(':hover')
                )
                    document.getElementById('chat-input').focus()
            })
            if (atBottom)
                document.getElementById('chatlog').append(msg)
            else
                document.getElementById('chatlog').prepend(msg)
            let text = document.getElementById("text-" + data.id)
            document.getElementById("name-" + data.id).textContent = data.p.name + ": "
            document.getElementById("name-" + data.id).style.color = data.p.color
            requestAnimationFrame(() => {
                Object.values(client.lastmsgs).forEach(mssg => {
                    if (data.a.includes('r:' + mssg.id)) {
                        let aftertext = data.a.replaceAll('r:' + mssg.id, '').trim()
                        text.textContent = ''
                        text.textContent = aftertext

                        if (mssg.p.id === client.user.id)
                            replysound()

                        let replytag = document.createElement('a')
                        replytag.classList.add('replytag')
                        replytag.classList.add('p1')
                        replytag.textContent = `[⤳ ${mssg.p.name}] `
                        replytag.style.cursor = 'pointer'
                        replytag.addEventListener('mouseover', () => replytag.style.textShadow = '0px 0px 5px #fff')
                        replytag.addEventListener('mouseout', () => replytag.style.textShadow = '')
                        text.before(replytag)
                        replytag.addEventListener('click', () => {
                            document.getElementById("text-" + mssg.id).scrollIntoView()
                            document.getElementById("msgdiv-" + mssg.id).style.backgroundColor = client.lastmsgs[mssg.id].p.color + "40"
                            asyncTimeout(() => {
                                document.getElementById("msgdiv-" + mssg.id).style.backgroundColor = client.lastmsgs[mssg.id].p.color + "00"
                                if (atBottom)
                                    document.getElementById('chatlog').scrollTo(0, document.getElementById('chatlog').scrollHeight)
                                else
                                    document.getElementById('chatlog').scrollTo(0, 0)
                            }, 1.5e3)
                        })
                    }
                })
            });
            text.textContent = data.a.trim().replaceAll("@" + client.user.id, "@" + client.user.name)
            if (document.getElementById("edit-" + data.id)) {
                document.getElementById("edit-" + data.id).addEventListener('mouseover', () => {
                    document.getElementById("edit-" + data.id).style.cursor = 'pointer'
                })
                document.getElementById("edit-" + data.id).addEventListener('mouseout', () => {
                    document.getElementById("edit-" + data.id).style.cursor = 'default'
                })
                document.getElementById("edit-" + data.id).addEventListener('click', () => {
                    editing = {
                        is: true,
                        target: data.id
                    }
                    document.getElementById('chat-input').placeholder = "editing a message (" + data.id + ")..."
                    document.getElementById('chat-input').value = data.a
                    document.getElementById('send').innerHTML = "edit"
                    document.getElementById('edit-' + data.id).textContent = "[editing...]"
                    document.getElementById('chat-input').focus()
                })
            }
            if (document.getElementById("delete-" + data.id)) {
                document.getElementById("delete-" + data.id).addEventListener('mouseover', () => {
                    document.getElementById("delete-" + data.id).style.cursor = 'pointer'
                })
                document.getElementById("delete-" + data.id).addEventListener('mouseout', () => {
                    document.getElementById("delete-" + data.id).style.cursor = 'default'
                })
                document.getElementById("delete-" + data.id).addEventListener('click', () => {
                    deleting = data.id
                    document.getElementById('delcon-name').textContent = data.p.name + ": "
                    document.getElementById('delcon-name').style.color = data.p.color
                    document.getElementById('delcon-text').textContent = data.a
                    document.getElementById('delete-confirm').style.display = "inline-block"
                })
            }
            if (urltester.test(data.a)) {
                let match = data.a.match(urltester)
                let underline = "̲"
                let text1 = document.getElementById("text-" + data.id).textContent
                let parts = text1.split(match[0])
                let final = parts[0] + match[0].split('').join(underline)
                // document.getElementById("text-" + data.id).textContent = final
                text.addEventListener('click', () => {
                    openurl(data.a.substring(match.index, match.index + match[0].length))
                })
            }
            document.getElementById("msgid-" + data.id).addEventListener('mouseover', () => {
                document.getElementById("msgid-" + data.id).style.cursor = 'pointer'
            })
            document.getElementById("msgid-" + data.id).addEventListener('mouseout', () => {
                document.getElementById("msgid-" + data.id).style.cursor = 'default'
            })
            document.getElementById("msgid-" + data.id).addEventListener('click', async () => {
                await navigator.clipboard.writeText(data.id);
                document.getElementById("msgid-" + data.id).textContent = "[copied]"
                asyncTimeout(() => {
                    document.getElementById("msgid-" + data.id).textContent = `[${data.id}]`
                }, 1e3)
            })
            document.getElementById("options-" + data.id).addEventListener('click', () => {
                document.getElementById('chat-input').focus()
                document.getElementById('chatlog').style.zIndex = '128'
                if (document.getElementById('optionsmenu-' + data.id).style.display === "none") {
                    document.getElementById('options-' + data.id).style.transform = 'rotate(-90deg)'
                    document.getElementById('optionsmenu-' + data.id).style.display = 'inline'
                } else {
                    document.getElementById('options-' + data.id).style.transform = 'rotate(0deg)'
                    document.getElementById('optionsmenu-' + data.id).style.display = 'none'
                }
            })
            document.getElementById("reply-" + data.id).addEventListener('mouseover', () => {
                document.getElementById("reply-" + data.id).style.cursor = 'pointer'
            })
            document.getElementById("reply-" + data.id).addEventListener('mouseout', () => {
                document.getElementById("reply-" + data.id).style.cursor = 'default'
            })
            document.getElementById("reply-" + data.id).addEventListener('click', () => {
                document.getElementById('chat-input').value = document.getElementById('chat-input').value + "r:" + data.id + " "
                document.getElementById('userlist-div').style.zIndex = '64'
                document.getElementById('chat-input').focus()
            })
            if (atBottom)
                document.getElementById('chatlog').scrollTo(0, document.getElementById('chatlog').scrollHeight)
            else
                document.getElementById('chatlog').scrollTo(0, 0)
        }
        if (data.m == "join") {
            joinsound()
            let msg = document.createElement('div')
            let joinid = makeid(6)
            msg.innerHTML = `<small><a class='p1' id="joinname-${joinid}" style="color: ${data.p.color}"></a><a class="p1"> joined the chat.</a></small><br>`
            if (atBottom) {
                document.getElementById('chatlog').scrollTo(0, document.getElementById('chatlog').scrollHeight)
                document.getElementById('chatlog').append(msg)
            } else {
                document.getElementById('chatlog').scrollTo(0, 0)
                document.getElementById('chatlog').prepend(msg)
            }
            document.getElementById("joinname-" + joinid).textContent = data.p.name
            client.ppl[data.p.id] = data.p
        }
        if (data.m == "leave") {
            if (!data.p) return
            let msg = document.createElement('div')
            let leavenameid = makeid(6)
            document.getElementById('cursordiv-' + data.p.id).remove()
            document.getElementById('namediv-' + data.p.id).remove()
            msg.innerHTML = `<small><a class='p1' id="leavename-${leavenameid}" style="color: ${data.p.color}"></a><a class="p1"> left the chat.</a></small><br>`
            leavesound()
            if (atBottom)
                document.getElementById('chatlog').append(msg)
            else
                document.getElementById('chatlog').prepend(msg)
            if (atBottom)
                document.getElementById('chatlog').scrollTo(0, document.getElementById('chatlog').scrollHeight)
            else
                document.getElementById('chatlog').scrollTo(0, 0)
            document.getElementById("leavename-" + leavenameid).textContent = data.p.name
            delete client.ppl[data.p.id]
        }
        if (data.m == "user") {
            if (data.full) {
                client.ppl = {}
                data.users.forEach(user => {
                    client.ppl[user.id] = user
                    client.ppl[user.id].x = 200
                    client.ppl[user.id].y = 100
                })
                let users = []
                Object.values(data.users).forEach(user => {
                    users.push(user)
                })
                let userlist = document.getElementById('userlist-div')
                userlist.innerHTML = ""
                document.getElementById('cursors-div').innerHTML = ""
                users.forEach(user => {
                    const existingCursor = document.getElementById("cursor-" + user.id)
                    if (existingCursor) {
                        let namediv = document.getElementById('namediv-' + user.id)

                        namediv.style.borderRadius = "0px 5px 5px 0px"

                        if (Object.keys(client.ppl).indexOf(user.id) == Object.keys(client.ppl).length - 1)
                            namediv.style.borderRadius = "0px 5px 5px 5px"
                        if (Object.keys(client.ppl).indexOf(user.id) == 0)
                            namediv.style.borderRadius = "5px 5px 5px 0px"
                        if (Object.keys(client.ppl).length == 1)
                            namediv.style.borderRadius = "5px 5px 5px 5px"

                        return
                    }
                    let cursordiv = document.createElement('div')
                    userlist.style.userSelect = "none"
                    cursordiv.innerHTML = `
                        <img id="cursor-${user.id}" style='float: left; ${document.getElementById('smooth-usernames').checked ? "transition: filter 150ms ease-in-out" : ""}'/>
                        <div id='cursorcont-${user.id}'
                        style='background-color: ${user.color}; box-shadow: 2px 2px 5px 3px #0008; width: fit-content; float: right; clear: right; padding: 3px; border-radius: 5px; ${document.getElementById('smooth-usernames').checked ? "transition: background-color 150ms ease-in-out" : ""}'>
                        ${user.tag ? `<b><a 
                        style="background-color: ${user.tag.color}; outline: 2px solid ${blend(user.tag.color, "#000", 0.25)}; padding: 1px 6px; border-radius: 10px; font-size: 14px; color: #fff; text-shadow: 0px 0px 5px #000;"
                        >${user.tag.text}</a></b> ` : ""}
                        <b><a id='cursorname-${user.id}' style="color: #fff; text-shadow: 0px 0px 5px #000;"></a></b>
                        </div>
                    `
                    cursordiv.id = "cursordiv-" + user.id
                    cursordiv.style.cssText = `
                        display: flex;
                        position: absolute;
                        top: 200%;
                        left: 100%;
                        width: fit-content;
                        height: fit-content;
                        margin-bottom: -2px;
                        transform: none;
                        white-space: nowrap;
                        pointer-events: none;
                        z-index: inherit;
                        align-items: center;
                    `
                    cursordiv.style.margin = `-${parseInt(localStorage.cursorSize) / 2}px`
                    document.getElementById('cursors-div').appendChild(cursordiv)
                    document.getElementById('cursorname-' + user.id).textContent = user.name
                    let cursor = document.getElementById('cursor-' + user.id)
                    cursor.style.filter = `hue-rotate(${hexToHSV(user.color).h}deg) saturate(${hexToHSV(user.color).s}%) brightness(${hexToHSV(user.color).v}%)`
                    cursor.style.width = localStorage.cursorSize
                    cursor.src = "cursors/" + document.getElementById('cursor-texture').value
                    cursor.id = "cursor-" + user.id
                    let namediv = document.createElement('div')
                    namediv.id = 'namediv-' + user.id
                    namediv.style.position = 'relative'
                    namediv.style.display = 'inline-block'
                    namediv.innerHTML =
                        document.getElementById('modern-names').checked ?
                            `${user.id === client.user.id ? `<b><a id='me'
                    style='position: absolute; white-space: nowrap; top: -35%; left: 50%; padding: none; margin: none; transform: translateX(-50%); color: #fff; transition-duration: 250ms; transition-timing-function: ease-out; opacity: 50%; font-size: 14px; text-shadow: 0px 0px 5px #000;'
                    >me</a></b>` : ""}
                    <small><a id='mute-${user.id}'
                    style='position: absolute; top: -35%; left: 50%; padding: none; margin: none; text-shadow: 1px 1px 2px #000; transform: translateX(-50%); color: #f88; transition-duration: 250ms; white-space: nowrap; transition-timing-function: ease-out; opacity: 0%;'
                    >muted</a></small>
                    <b>${user.tag ? `<a id='usertag-${user.id}'
                    style='background-color: ${user.tag.color}; outline: 2px solid ${blend(user.tag.color, "#000", 0.25)}; text-shadow: 0px 0px 3px #000; color: #fff; font-size: 14px; border-radius: 10px; padding: 0px 6px; transition: all 250ms ease-out; cursor: help;'
                    ${user.rank > 0 ?
                        `title='
                            ${user.rank === 0.5 ? "this user is a ceritified bot." : ""}
                            ${user.rank === 1 ? "this user is a ceritified moderator." : ""}
                            ${user.rank === 2 ? "this user is a ceritified administrator." : ""}
                            ${user.rank === 3 ? "this user is the co-owner of the site." : ""}
                            ${user.rank === 4 ? "this user is the owner of the site." : ""}
                        '`
                    : ""}
                    >${user.tag.text}</a> ` : ""}
                    <a id="user-${user.id}" style='transition: color 250ms ease-out, text-shadow 250ms ease-out'></a></b> 
                    <a id='userafk-${user.id}'
                    style='background-color: ${blend(user.color, "#000000", 0.25)}; text-shadow: 0px 0px 3px #000; color: #fff; font-size: 14px; border-radius: 5px; padding: 0px 4px;'>AFK</a>
                    `
                    // modern ↑
                    :
                    // non modern ↓
                    `${user.tag ? `
                    <b><a id='usertag-${user.id}' style='color: ${user.tag.color}; transition: all 250ms ease-out; cursor: help;'
                    ${user.rank > 0 ?
                        `title='
                            ${user.rank === 0.5 ? "this user is a ceritified bot." : ""}
                            ${user.rank === 1 ? "this user is a ceritified moderator." : ""}
                            ${user.rank === 2 ? "this user is a ceritified administrator." : ""}
                            ${user.rank === 3 ? "this user is the co-owner of the site." : ""}
                            ${user.rank === 4 ? "this user is the owner of the site." : ""}
                        '`
                    : ""}
                    >[${user.tag.text}] </a></b>`
                    :
                    ""}
                    ${user.id === client.user.id ? `<a id='me'
                    style='position: absolute; top: -35%; left: 50%; padding: none; margin: none; transform: translateX(-50%); color: #fff; font-size: 14px;'
                    >me</a>` : ""}
                    <small><a id='mute-${user.id}'
                    style='position: absolute; top: -35%; left: 50%; padding: none; margin: none; text-shadow: 1px 1px 2px #000; transform: translateX(-50%); color: #f00; transition-duration: 250ms; transition-timing-function: ease-out; opacity: 0%;'
                    >muted</a></small>
                    <b>
                    <a id="user-${user.id}" style='transition: all 250ms ease-out;'></a></b>
                    <a id='userafk-${user.id}' style='color: ${blend(user.color, "#000000", 0.25)};'> [AFK]</a>
                    `
                    userlist.appendChild(namediv)

                    namediv.style.transition = 'all 250ms ease-out'
                    namediv.addEventListener('mouseover', () => {
                        namediv.style.cursor = "pointer"
                        if (document.getElementById('modern-names').checked)
                            if (JSON.parse(localStorage.muted).includes(user.id))
                                namediv.style.boxShadow = "0px 0px 20px #f88"
                            else
                                namediv.style.boxShadow = "0px 0px 15px #fff8"

                        if (user.id === client.user.id) {
                            document.getElementById('me').textContent = 'click to edit user'
                            document.getElementById('me').style.textShadow = "0px 0px 10px #000"
                            document.getElementById('me').style.opacity = "100%"
                            if (document.getElementById('modern-names').checked) {
                                document.getElementById('user-' + user.id).style.textShadow = "0px 0px 5px #fff8"
                                document.getElementById('usertag-' + user.id).style.textShadow = "0px 0px 5px #fff8"
                                namediv.style.boxShadow = "0px 0px 15px #fff"
                            }
                        }
                    })
                    namediv.addEventListener('mouseout', () => {
                        namediv.style.cursor = "default"
                        if (document.getElementById('modern-names').checked)
                            namediv.style.boxShadow = "0px 0px 0px #fff0"

                        if (user.id === client.user.id) {
                            document.getElementById('me').textContent = 'me'
                            document.getElementById('me').style.opacity = "85%"
                            document.getElementById('me').style.textShadow = "0px 0px 5px #000"
                            if (document.getElementById('modern-names').checked) {
                                document.getElementById('usertag-' + user.id).style.textShadow = "0px 0px 3px #000"
                                document.getElementById('user-' + user.id).style.textShadow = "0px 0px 5px #000"
                            }
                        }
                    })
                    document.getElementById('user-' + user.id).textContent = user.name
                    if (document.getElementById('modern-names').checked) {
                        namediv.style.backgroundColor = user.color
                        namediv.style.width = 'fit-content'
                        if (document.getElementById('new-layout').checked) {
                            namediv.style.float = "left"
                            
                            namediv.style.borderRadius = "0px 5px 5px 0px"
                            if (Object.keys(client.ppl).indexOf(user.id) == Object.keys(client.ppl).length - 1)
                                namediv.style.borderRadius = "0px 5px 5px 5px"
                            if (Object.keys(client.ppl).indexOf(user.id) == 0)
                                namediv.style.borderRadius = "5px 5px 5px 0px"
                            if (Object.keys(client.ppl).length == 1)
                                namediv.style.borderRadius = "5px 5px 5px 5px"

                        } else { 
                            namediv.style.float = "right"
                            namediv.style.borderRadius = "5px"
                        }
                        namediv.style.clear = "both"
                        namediv.style.padding = '4px'
                        namediv.style.transition = `box-shadow 250ms ease-out, border-radius 150ms ease-out${document.getElementById('smooth-usernames').checked ? "background-color 150ms ease-in-out" : ""}`
                        document.getElementById('user-' + user.id).style.textShadow = "0px 0px 5px #000"
                        document.getElementById('user-' + user.id).style.color = "#fff"
                        if (JSON.parse(localStorage.muted).includes(user.id)) {
                            document.getElementById('mute-' + user.id).style.opacity = '100%'
                            document.getElementById('user-' + user.id).style.color = "#f88"
                        }
                    } else {
                        namediv.style.transitionProperty = 'background-color'
                        document.getElementById('user-' + user.id).style.color = user.color
                        namediv.style.width = 'fit-content'
                        namediv.style.float = "right"
                        namediv.style.clear = "both"
                        namediv.style.borderRadius = '5px';
                        namediv.style.padding = '2px'
                        namediv.style.transitionDuration = '100ms'
                        namediv.style.transitionTimingFunction = 'ease-in-out'
                        if (JSON.parse(localStorage.muted).includes(user.id)) {
                            document.getElementById('mute-' + user.id).style.opacity = '100%'
                            namediv.style.backgroundColor = "#f008"
                        }
                    }
                    document.getElementById('userafk-' + user.id).style.display = 'none'

                    namediv.addEventListener('click', async (event) => {
                        if (event.ctrlKey && user.id !== client.user.id) {
                            let muted = JSON.parse(localStorage.muted)
                            if (muted.includes(user.id)) {
                                muted.splice(muted.indexOf(user.id), 1)
                                document.getElementById('mute-' + user.id).style.opacity = '0%'
                                if (document.getElementById('modern-names').checked) {
                                    document.getElementById('user-' + user.id).style.color = "#fff"
                                    document.getElementById('namediv-' + user.id).style.boxShadow = "0px 0px 15px #fff8"
                                } else
                                    namediv.style.backgroundColor = "#f000"
                            } else {
                                muted.push(user.id)
                                document.getElementById('mute-' + user.id).style.opacity = '100%'
                                if (document.getElementById('modern-names').checked) {
                                    document.getElementById('namediv-' + user.id).style.boxShadow = "0px 0px 20px #f88"
                                    document.getElementById('user-' + user.id).style.color = "#f88"
                                } else
                                    namediv.style.backgroundColor = "#f008"

                            }
                            localStorage.muted = JSON.stringify(muted)
                        } else {
                            if (user.id === client.user.id) {
                                document.getElementById('set-name').value = client.user.name
                                document.getElementById('set-color').value = client.user.color
                                document.getElementById('set-color-type').value = client.user.color
                                localStorage.hasBeenInChat = client.user.name
                                document.getElementById('userset-div').style.display = 'inline-block'
                            } else {
                                document.getElementById('chat-input').value = document.getElementById('chat-input').value + "@" + user.id + " "
                                document.getElementById('chat-input').focus()
                            }
                        }
                    })
                    document.getElementById('namediv-' + user.id).addEventListener('contextmenu', async (event) => {
                        event.preventDefault();
                        await navigator.clipboard.writeText(user.id);
                        document.getElementById("user-" + user.id).textContent = "ID copied"
                        asyncTimeout(() => {
                            document.getElementById("user-" + user.id).textContent = user.name
                        }, 1e3)
                    });
                })
                document.getElementById('online-count').innerHTML = "Online: " + data.count
                document.title = "(" + Object.keys(client.ppl).length + ") ccjt's chat"
            } else {
                // keep it this way because of AFK logic
                for (let i = -1; ++i < Object.keys(data.user).length;) {
                    client.ppl[data.user.id][Object.keys(data.user)[i]] = Object.values(data.user)[i]
                }
                if (document.getElementById('modern-names').checked) {
                    document.getElementById("user-" + data.user.id).textContent = data.user.name
                    document.getElementById("namediv-" + data.user.id).style.backgroundColor = data.user.color
                    document.getElementById('userafk-' + data.user.id).style.backgroundColor = blend(data.user.color, "#000000", 0.25)
                } else {
                    document.getElementById("user-" + data.user.id).textContent = data.user.name
                    document.getElementById("user-" + data.user.id).style.color = data.user.color
                    document.getElementById('userafk-' + data.user.id).style.color = blend(data.user.color, "#000000", 0.25)
                }
                document.getElementById("cursor-" + data.user.id).style.filter = `hue-rotate(${hexToHSV(data.user.color).h}deg) saturate(${hexToHSV(data.user.color).s}%) brightness(${hexToHSV(data.user.color).v}%)`
                document.getElementById("cursorname-" + data.user.id).textContent = data.user.name
                document.getElementById("cursorcont-" + data.user.id).style.backgroundColor = data.user.color
            }
        }
        if (data.m == "set-user") {
            client.user.name = data.set.name
            localStorage.hasBeenInChat = data.set.name
            client.user.color = data.set.color
            client.user.id = data.set.id
        }
        if (data.m == 'm') {
            client.ppl[data.user].lastActive = Date.now()
            if (window.location.hash === "#seeowncursor" || data.user !== client.user.id) {
                if (!document.getElementById('smooth-cursors').checked) {
                    document.getElementById('cursordiv-' + data.user).style.left = (data.x) + "%"
                    document.getElementById('cursordiv-' + data.user).style.top = (data.y) + "%"
                }
                client.ppl[data.user].x = data.x
                client.ppl[data.user].y = data.y
            }
        }
        if (data.m == "chat-cleared") {
            document.getElementById('chatlog').innerHTML = ""
            let cleared = document.createElement('div')
            cleared.innerHTML = `<a><i><small>chat was cleared</small></i></a>`
            document.getElementById('chatlog').prepend(cleared)
        }
        if (data.m == "ping") {
            client.ping = Date.now() - data.echo
            if (client.ping > 10e3) {
                document.getElementById('ping').textContent = "Ping: Too high!!"
                client.ws.close()
            } else
                document.getElementById('ping').textContent = "Ping: " + client.ping + "ms"
        }
        client.emitter.emit('*', data)
        client.emitter.emit(data.m, data)
    };

    client.ws.onclose = () => {
        clearInterval(pingInterval)
        client.connected = false
        document.getElementById('online-count').innerHTML = "Disconnected."
        fromDisconnect = true
        setTimeout(() => {
            document.getElementById('online-count').innerHTML = "Reconnecting..."
            document.getElementById('ping').innerHTML = "Ping: ???ms"
            connect()
        }, 2.5e3)

    }
}

async function getSoundpacks() {
    let r = await fetch("http://" + window.location.host + "/api/chat/soundpacks")
    let packs = await r.json()
    document.getElementById('soundpack-dropdown').innerHTML = ""
    packs.forEach(pack => {
        pack = decodeURIComponent(pack)
        const option = document.createElement('option');
        option.textContent = pack[0].toUpperCase() + pack.substring(1);
        option.value = pack;
        document.getElementById('soundpack-dropdown').appendChild(option);
    })
    client.soundpacks = packs
    client.soundpack = localStorage.soundpack
    document.getElementById('soundpack-dropdown').value = localStorage.soundpack
}
async function getCursors() {
    let r = await fetch("http://" + window.location.host + "/api/chat/cursors")
    let packs = await r.json()
    document.getElementById('cursor-texture').innerHTML = ""
    packs.forEach(pack => {
        pack = decodeURIComponent(pack)
        const option = document.createElement('option');
        option.textContent = pack.replace('.png', '');
        option.value = pack;
        document.getElementById('cursor-texture').appendChild(option);
    })
    client.soundpacks = packs
    client.soundpack = localStorage.soundpack
    document.getElementById('cursor-texture').value = localStorage.cursor
}

function saveSoundpack(url) {
    // a
}
function hideUI() {
    client.uihidden = true
    document.getElementById('settings-div').style.display = "none"
    document.getElementById('userlist-div').style.display = "none"
    document.getElementById('chat-div').style.display = "none"
    document.getElementById('userset-div').style.display = "none"
    document.getElementById('preview-div').style.display = "none"
}
function showUI() {
    client.uihidden = false
    document.getElementById('settings-div').style.display = ""
    document.getElementById('userlist-div').style.display = ""
    document.getElementById('chat-div').style.display = ""
}
document.addEventListener("DOMContentLoaded", async () => {
    if (!localStorage.newLayout) localStorage.newLayout = 'true'
    document.getElementById('new-layout').checked = localStorage.newLayout === 'true'
    document.getElementById('new-layout').addEventListener('change', () => {
        localStorage.newLayout = document.getElementById('new-layout').checked
        window.location.reload()
    })

    // layout setup
    if (document.getElementById('new-layout').checked) {
        document.getElementById('settings-div').style.right = "-" + (parseInt(document.getElementById('settings-div').offsetWidth) - 20) + "px";
        document.getElementById('settings-div').style.opacity = 0.25;
        document.getElementById('settings-div').style.right = "-" + (parseInt(document.getElementById('settings-div').offsetWidth) - 20) + "px";
        document.getElementById('settings-div').style.borderRadius = '15px 0px 0px 15px'
        document.getElementById('userlist-div').style.left = "10px"
        document.getElementById('userlist-div').style.borderRadius = '0px 15px 15px 15px';
        document.getElementById('userlist-div').style.textAlign = 'left';
        document.getElementById('online-count').style.right = "10px"
        document.getElementById('ping').style.right = "10px"
        document.getElementById('ping').style.borderRadius = "10px 0px 10px 10px"
        document.getElementById('online-count').style.borderRadius = "10px 0px 0px 10px"
        document.getElementById('icon').style.bottom = '30px'
        document.getElementById('icon').style.left = '10px'
        document.getElementById('icon').style.backgroundColor = '#0008'
        document.getElementById('icon').style.borderRadius = '5px 5px 0px 0px'
        document.getElementById('about-text').style.bottom = '10px'
        document.getElementById('about-text').style.left = '10px'
        document.getElementById('about-text').style.borderRadius = '0px 5px 5px 5px'
        document.getElementById('about-text').style.padding = '2px'
        document.getElementById('about-text').style.fontSize = '12px'
        document.getElementById('version').style.borderRadius = '15px 0px 0px 15px'
        document.getElementById('chatlog').style.borderRadius = '10px'
        document.getElementById('chatlog').style.backgroundColor = '#0002'
    } else {
        document.getElementById('settings-div').style.left = "-" + (parseInt(document.getElementById('settings-div').offsetWidth) - 20) + "px";
        document.getElementById('settings-div').style.opacity = 0.25;
        document.getElementById('settings-div').style.left = "-" + (parseInt(document.getElementById('settings-div').offsetWidth) - 20) + "px";
        document.getElementById('settings-div').style.borderRadius = '0px 15px 15px 0px'
        document.getElementById('userlist-div').style.right = "10px"
        document.getElementById('userlist-div').style.textAlign = 'right';
        document.getElementById('userlist-div').style.zIndex = '100';
        document.getElementById('userlist-div').style.borderRadius = '15px 0px 15px 15px';
        document.getElementById('online-count').style.left = "10px"
        document.getElementById('ping').style.left = "10px"
        document.getElementById('icon').style.bottom = '10px'
        document.getElementById('icon').style.left = '10px'
        document.getElementById('icon').addEventListener('mouseover', ()=>{
            document.getElementById('about-text').style.display = ''    
        })
        document.getElementById('icon').addEventListener('mouseout', ()=>{
            document.getElementById('about-text').style.display = 'none'    
        })
        document.getElementById('about-text').style.display = 'none'
        document.getElementById('about-text').style.bottom = '45px'
        document.getElementById('about-text').style.padding = '2px'
        document.getElementById('about-text').style.borderRadius = '15px'
        document.getElementById('about-text').style.left = '10px'
        document.getElementById('chatlog').style.zIndex = '-128';
    }

    await getthemes()

    showUI()
    document.getElementById('join-div').style.display = 'inline-block';

    if (!localStorage.smoothUsers) localStorage.smoothUsers = 'false'
    document.getElementById('smooth-usernames').checked = localStorage.smoothUsers === 'true'
    document.getElementById('smooth-usernames').addEventListener('change', () => {
        localStorage.smoothUsers = document.getElementById('smooth-usernames').checked
        Object.keys(client.ppl).forEach(id => {
            document.getElementById('namediv-' + id).style.transition = `box-shadow 250ms ease-out${document.getElementById('smooth-usernames').checked ? "background-color 150ms ease-out" : ""}`
            document.getElementById('cursor-' + id).style.transition = document.getElementById('smooth-usernames').checked ? "background-color 150ms ease-out" : ""
            document.getElementById('cursorname-' + id).style.transition = document.getElementById('smooth-usernames').checked ? "background-color 150ms ease-out" : ""
        })
    })

    if (!localStorage.smoothCursors) localStorage.smoothCursors = 'true'
    document.getElementById('smooth-cursors').checked = localStorage.smoothCursors === 'true'
    document.getElementById('smooth-cursors').addEventListener('change', () => {
        localStorage.smoothCursors = document.getElementById('smooth-cursors').checked
        Object.keys(client.ppl).forEach(id => {
            document.getElementById('cursordiv-' + id).style.transition = document.getElementById('smooth-cursors').checked ? "top .1 linear, left .1 linear" : ""
        })
    })

    if (!localStorage.muted) localStorage.muted = "[]"

    if (!localStorage.modernName) localStorage.modernName = "true"
    document.getElementById('modern-names').checked = localStorage.modernName === "true"
    document.getElementById('modern-names').addEventListener('change', () => {
        localStorage.modernName = document.getElementById('modern-names').checked
        window.location.reload()
    })

    if (!localStorage.modernTags) localStorage.modernTags = "true"
    document.getElementById('modern-tags').checked = localStorage.modernTags === "true"
    document.getElementById('modern-tags').addEventListener('change', () => {
        localStorage.modernTags = document.getElementById('modern-tags').checked
    })

    await getCursors()
    if (!localStorage.cursor) localStorage.cursor = "circle.png"
    document.getElementById('cursor-texture').value = localStorage.cursor
    document.getElementById('cursor-texture').addEventListener('change', () => {
        Object.keys(client.ppl).forEach(id => {
            localStorage.cursor = document.getElementById('cursor-texture').value
            document.getElementById('cursor-' + id).src = 'cursors/' + document.getElementById('cursor-texture').value
        })
    })
    document.getElementById('imp-settings').addEventListener('change', (event) => {
        let file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                let content = e.target.result
                content = atob(content)
                content = JSON.parse(content)
                for (let i = -1; ++i < Object.keys(content).length;) {
                    localStorage[Object.keys(content)[i]] = Object.values(content)[i]
                }
                window.location.reload()
            }
            reader.readAsText(file)
        }
    })
    document.getElementById('token-input').value = localStorage.token

    if (!themes.includes(localStorage.theme)) {
        localStorage.theme = "dark"
        css.setAttribute('href', "/assets/ŧhemes/dark.css");
        document.getElementById('theme-dropdown').value = "dark"
    }
    document.getElementById('chat-input').addEventListener('focus', () => {
        if (document.getElementById('new-layout').checked)
            document.getElementById('chatlog').style.zIndex = "99"
        
        document.getElementById('cursors-div').style.zIndex = '-67'
        document.getElementById('chatlog').style.padding = "0px 10px"
        document.getElementById('chatlog').style.backgroundColor = "#0008"
        document.getElementById('chatlog').style.boxShadow = "0 0 5px 5px #0008"
    });
    document.getElementById('chat-input').addEventListener('blur', () => {
        if (document.getElementById('new-layout').checked)
            document.getElementById('chatlog').style.backgroundColor = "#0002"
        else {
            document.getElementById('chatlog').style.zIndex = "101"
            document.getElementById('chatlog').style.backgroundColor = "#0000"
        }
        document.getElementById('chatlog').style.padding = null
        document.getElementById('chatlog').style.boxShadow = null
        document.getElementById('cursors-div').style.zIndex = '67'
    });

    document.getElementById('userlist-div').addEventListener('mouseenter', () => {
        document.getElementById('userlist-div').style.opacity = 1
        document.getElementById('userlist-div').style.zIndex = '100'
        document.getElementById('chatlog').style.zIndex = '99'
        document.getElementById('me').style.opacity = "85%"
    });
    document.getElementById('userlist-div').addEventListener('mouseleave', () => {
        document.getElementById('userlist-div').style.opacity = 0.25
        document.getElementById('userlist-div').style.zIndex = null
        document.getElementById('chatlog').style.zIndex = null
        document.getElementById('me').style.opacity = "100%"
    });
    if (urlparams.get('from')) {
        document.getElementById('goback').href = [window.location.origin, decodeURIComponent(urlparams.get('from'))].join('/');
        document.getElementById('goback').textContent = "go back to /" + decodeURIComponent(urlparams.get('from'))
    }
    document.getElementById('theme-dropdown').addEventListener('focus', () => {
        document.getElementById('theme-dropdown').scrollTop = 0;
    })
    document.getElementById("updthemes-btn").addEventListener('click', async () => {
        document.getElementById('theme-dropdown').innerHTML = ""
        await getthemes()
        document.getElementById('css-add').href = `./css+.css?nocache=${Math.random()}`
        css.href = `/assets/ŧhemes/${localStorage.theme}.css?nocache=${Math.random()}`
    })

    if (!localStorage.msgcolor) localStorage.msgcolor = 'false'
    document.getElementById('msg-color').checked = localStorage.msgcolor === 'true'
    document.getElementById('msg-color').addEventListener('change', () => {
        localStorage.msgcolor = document.getElementById('msg-color').checked
    })
    if (!localStorage.volume) localStorage.volume = "100"
    document.getElementById("volume-text").textContent = ` (${localStorage.volume}%)`
    document.getElementById("sp-volume").value = parseInt(localStorage.volume)
    document.getElementById("sp-volume").addEventListener('input', () => {
        localStorage.volume = document.getElementById("sp-volume").value
        document.getElementById("volume-text").textContent = ` (${localStorage.volume}%)`
    })
    document.getElementById("sp-volume").addEventListener('change', () => {
        mentionsound()
    })

    if (!localStorage.confirmUpdates) localStorage.confirmUpdates = 'true'
    document.getElementById('confirm-update').addEventListener('change', () => {
        localStorage.confirmUpdates = document.getElementById('confirm-update').checked
    })
    document.getElementById('confirm-update').checked = localStorage.confirmUpdates === 'true'

    localStorage.hasBeenInChat = client.user.name
    if (!localStorage.cursorSize) localStorage.cursorSize = "32px"
    document.getElementById("cursorsize-dropdown").value = localStorage.cursorSize
    document.getElementById("cursorsize-dropdown").addEventListener('change', () => {
        localStorage.cursorSize = document.getElementById("cursorsize-dropdown").value
        Object.values(client.ppl).forEach(userdata => {
            document.getElementById("cursor-" + userdata.id).style.width = localStorage.cursorSize
            document.getElementById("cursor-" + userdata.id).style.margin = `-${parseInt(localStorage.cursorSize) / 2}px`
        })
    })

    document.getElementById('online-count').textContent = "Connecting..."
    connect()

    document.getElementById('settings-page').addEventListener('change', () => {
        let pages = document.getElementById('settings-div').querySelectorAll('div')
        let target = parseInt(document.getElementById('settings-page').value)
        localStorage.page = document.getElementById('settings-page').value
        pages.forEach((div, i) => {
            if (i == target - 1)
                document.getElementById(div.id).style.display = "inline-block"
            else
                document.getElementById(div.id).style.display = "none"
        })
    })
    document.getElementById('settings-page').addEventListener('input', () => {
        let target = parseInt(document.getElementById('settings-page').value)
        document.getElementById('settings-pagenum').textContent = ' (' + target + ')'
    })
    if (!localStorage.logevents) localStorage.logevents = false
    if (!localStorage.soundpack) {
        console.warn("Soundpack not found. Setting soundpack to default.")
        client.soundpack = "default"
        localStorage.soundpack = client.soundpack
    }
    if (!localStorage.savedSoundpacks) {
        client.savedSoundpacks = {
            default: "sounds/default/"
        }
        localStorage.savedSoundpacks = client.savedSoundpacks
    }

    getSoundpacks()

    window.addEventListener('focus', () => {
        document.title = "(" + Object.keys(client.ppl).length + ") ccjt's chat"
        mentioned = 0;
    })
    setInterval(() => {
        if (document.activeElement === null) {
            document.documentElement.style.cursor = 'none'
        } else {
            document.documentElement.style.cursor = 'auto'
        }
        Object.keys(client.ppl).forEach(id => {
            if (Date.now() - client.ppl[id].lastActive > 3 * 60e3 && client.ppl[id].rank !== 0.5) {
                document.getElementById('userafk-' + id).style.display = 'inline'
                client.ppl[id].afk = true
            } else {
                document.getElementById('userafk-' + id).style.display = 'none'
                client.ppl[id].afk = false
            }
        })
    }, 50)
    document.getElementById('chat-input').addEventListener('focus', () => {
        document.getElementById('userset-div').style.display = "none"
        document.getElementById('preview-div').style.display = "none"
    })

    if (!localStorage.atbottom) localStorage.atbottom = "true"
    document.getElementById('recent-bottom').checked = localStorage.atbottom === "true";
    document.getElementById('recent-bottom').addEventListener('change', () => {
        localStorage.atbottom = document.getElementById('recent-bottom').checked
        reverseDiv('chatlog')
        if (document.getElementById('recent-bottom').checked)
            document.getElementById('chatlog').scrollTo(0, document.getElementById('chatlog').scrollHeight)
        else
            document.getElementById('chatlog').scrollTo(0, 0)
    })

    if (!localStorage.align) localStorage.align = "left"
    document.getElementById('chatlog').style.textAlign = localStorage.align
    document.getElementById('align-dropdown').value = localStorage.align
    if (localStorage.showmsgids === "true") {
        document.getElementById('show-msgids').checked = true
    }

    document.getElementById('theme-dropdown').value = localStorage.theme;

    document.getElementById('theme-dropdown').addEventListener('change', (event) => {
        localStorage.theme = event.target.value
        css.setAttribute('href', "/assets/ŧhemes/" + localStorage.theme + '.css?nocache=' + Date.now());
        const atBottom = document.getElementById('recent-bottom').checked
        if (atBottom)
            document.getElementById('chatlog').scrollTo(0, document.getElementById('chatlog').scrollHeight)
        else
            document.getElementById('chatlog').scrollTo(0, 0)
    })

    document.getElementById('soundpack-dropdown').addEventListener('change', (event) => {
        localStorage.soundpack = event.target.value
        client.soundpack = event.target.value
        loadsounds()
    })
    document.getElementById('refresh-sp-btn').addEventListener('click', async (event) => {
        await getSoundpacks()
        css.setAttribute('href', "/assets/ŧhemes/" + localStorage.theme + '.css');
    })
    document.getElementById('preview-sp-btn').addEventListener('click', (event) => {
        if (document.getElementById('preview-div').style.display == 'none') {
            document.getElementById('preview-sp-name').innerHTML = "<b>Soundpack:</b> " + client.soundpack
            document.getElementById('preview-div').style.display = 'block'
            document.getElementById('userset-div').style.display = 'none'
        } else
            document.getElementById('preview-div').style.display = 'none'
    })

    document.getElementById('align-dropdown').addEventListener('change', () => {
        localStorage.align = document.getElementById('align-dropdown').value
        document.getElementById('chatlog').style.textAlign = localStorage.align
    })

    document.getElementById('show-msgids').addEventListener('change', () => {
        localStorage.showmsgids = document.getElementById('show-msgids').checked
    })

    if (!localStorage.showtimestamps) localStorage.showtimestamps = 'true'
    document.getElementById('show-timestamps').checked = localStorage.showtimestamps === 'true'
    document.getElementById('show-timestamps').addEventListener('change', () => {
        localStorage.showtimestamps = document.getElementById('show-timestamps').checked
    })

    document.getElementById('userset-btn').addEventListener("click", () => {
        if (client.connected) {
            document.getElementById('set-name').value = client.user.name
            document.getElementById('set-color').value = client.user.color
            document.getElementById('set-color-type').value = client.user.color
            localStorage.hasBeenInChat = client.user.name
            if (document.getElementById('userset-div').style.display === "none") {
                document.getElementById('set-color').value = client.user.color
                document.getElementById('userset-div').style.display = 'block';
                document.getElementById('preview-div').style.display = 'none';
            } else {
                document.getElementById('userset-div').style.display = 'none';
            }
        }
    })
    document.getElementById('set-user').addEventListener("click", () => {
        document.getElementById('set-color').value = document.getElementById('set-color-type').value
        client.ws.send(JSON.stringify({
            m: 'userset',
            set: {
                name: document.getElementById('set-name').value,
                color: document.getElementById('set-color').value
            }
        }))
        document.getElementById('set-name').value = ""
        document.getElementById('userset-div').style.display = "none"
    })
    document.getElementById('set-color').addEventListener('input', (event) => {
        document.getElementById('set-color-type').value = event.target.value;
    });

})
let jshistory = []
let jshisindex
function sendbtn() {
    const atBottom = document.getElementById('recent-bottom').checked
    if (document.getElementById('chat-input').value.startsWith("js:")) {
        jshistory.push(document.getElementById('chat-input').value)
        jshisindex = jshistory.length - 1
        let msg = document.createElement('div')
        function run(code) {
            try {
                let evalversion = "v1.1"
                let out = eval(code)
                if (typeof out == "string") {
                    return out
                } else {
                    return JSON.stringify(out)
                }
            } catch (err) {
                if (!err.message)
                    return "❌ " + err
                else return "❌ " + err.message
            }
        }
        msg.innerHTML = `<a style="color: #00ddff><b>[CLIENT] </b></a><a style="color: #0088ff;"><b>Client: </b></a><a class='p1'>${run(document.getElementById('chat-input').value.substring(3))}</a><br>`
        if (atBottom)
            document.getElementById('chatlog').append(msg)
        else
            document.getElementById('chatlog').prepend(msg)
    } else if (editing.is) {
        if (window.location.hash === "#nuf")
            client.send({
                m: 'edit',
                target: editing.target,
                text: document.getElementById('chat-input').value.replaceAll('ough', 'uf').replaceAll('\\n', '\n')
            })
        else
            client.send({
                m: 'edit',
                target: editing.target,
                text: document.getElementById('chat-input').value.replaceAll('\\n', '\n')
            })
        document.getElementById('chat-input').placeholder = "put text here and chat UwU"
        document.getElementById('chat-input').value = ""
        document.getElementById('optionsmenu-' + editing.target).style.display = "none"
        document.getElementById('send').innerHTML = "send"
        document.getElementById('edit-' + editing.target).textContent = "[edit]"
        editing.is = false
    } else {
        if (window.location.hash === "#nuf")
            send(document.getElementById('chat-input').value.replaceAll('ough', 'uf').replaceAll('\\n', '\n'))
        else
            send(document.getElementById('chat-input').value.replaceAll('\\n', '\n'))
        document.getElementById('chat-input').value = ""
    }
    if (atBottom)
        document.getElementById('chatlog').scrollTo(0, document.getElementById('chatlog').scrollHeight)
    else
        document.getElementById('chatlog').scrollTo(0, 0)
    document.getElementById('chat-input').blur()
    document.getElementById('chatlog').style.zIndex = null
}
function extendhex(hex) {
    if (hex.length === 4) {
        let str = "#"
        hex = hex.substring(1)
        hex.split('').forEach(char => {
            str = str + char + char
        })
        return str
    } else {
        return hex
    }
}
document.addEventListener("keydown", (key) => {
    if (document.activeElement == document.getElementById('userset-btn')) document.getElementById('set-name').focus()
    if (document.activeElement == document.getElementById('theme-dropdown') && !(key.key == "ArrowDown") && !(key.key == "ArrowUp")) document.getElementById('chat-input').focus()
    if (document.activeElement == document.getElementById('chat-input') && key.key == "ArrowDown" && jshistory.includes(document.getElementById('chat-input').value)) {
        if (jshistory.length > 0) {
            if (jshisindex == jshistory.length - 1) {
                document.getElementById('chat-input').value = ""
                jshisindex = jshistory.length - 1
            } else {
                document.getElementById('chat-input').value = jshistory[jshisindex]
                jshisindex++
            }
        }
    }
    if (key.key === 'Tab') {
        if (document.getElementById("settings-div").style.opacity === 0.25)
            document.activeElement.blur();
        if (key.shiftKey) {
            if (document.getElementById("settings-div").style.opacity !== 0.25) {
                key.preventDefault();
                let pages = document.getElementById("settings-div").querySelectorAll("div");
                let target = parseInt(document.getElementById("settings-page").value);
                if (target <= 1) target = pages.length;
                else target -= 1;
                document.getElementById("settings-page").value = target;
                document.getElementById("settings-pagenum").textContent = " (" + target + ")";
                localStorage.page = document.getElementById("settings-page").value;
                pages.forEach((div, i) => {
                    if (i == target - 1)
                        document.getElementById(div.id).style.display = "inline-block";
                    else document.getElementById(div.id).style.display = "none";
                });
            }
        } else {
            if (document.getElementById("settings-div").style.opacity !== 0.25) {
                key.preventDefault();
                let pages = document.getElementById("settings-div").querySelectorAll("div");
                let target = parseInt(document.getElementById("settings-page").value);
                if (target >= pages.length) target = 1;
                else target += 1;
                document.getElementById("settings-page").value = target;
                document.getElementById("settings-pagenum").textContent = " (" + target + ")";
                localStorage.page = document.getElementById("settings-page").value;
                pages.forEach((div, i) => {
                    if (i == target - 1)
                        document.getElementById(div.id).style.display = "inline-block";
                    else document.getElementById(div.id).style.display = "none";
                });
            }
        }
    }
    if (document.activeElement == document.getElementById('chat-input') && key.key == "ArrowUp" && jshistory.includes(document.getElementById('chat-input').value)) {
        if (jshistory.length > 0) {
            if (jshisindex > 0) {
                document.getElementById('chat-input').value = jshistory[jshisindex]
                jshisindex--
            }
        }
    }
    if (key.ctrlKey && key.altKey && key.key == "h") {
        hideUI()
    }
    if (key.ctrlKey && !key.altKey && key.key == "q") {
        key.preventDefault()
        if (client.connected) {
            document.getElementById('set-name').value = client.user.name
            document.getElementById('set-color').value = client.user.color
            document.getElementById('set-color-type').value = client.user.color
            if (document.getElementById('userset-div').style.display == "none") {
                document.getElementById('userset-div').style.display = "block"
                document.getElementById('set-name').focus()
            } else {
                document.getElementById('userset-div').style.display = "none"
                document.getElementById('set-name').blur()
                document.getElementById('set-color').blur()
                document.getElementById('set-color-type').blur()
            }
        }
    }
    if (key.ctrlKey && (key.altKey || key.shiftKey) && key.key == "q") {
        key.preventDefault()
        if (client.connected) {
            document.getElementById('set-name').value = client.user.name
            document.getElementById('set-color-type').value = client.user.color
            document.getElementById('set-color').value = document.getElementById('set-color-type').value
            if (document.getElementById('userset-div').style.display == "none") {
                document.getElementById('userset-div').style.display = "block"
                document.getElementById('set-color-type').focus()
            } else {
                document.getElementById('userset-div').style.display = "none"
                document.getElementById('set-name').blur()
                document.getElementById('set-color').blur()
                document.getElementById('set-color-type').blur()
            }
        }
    }
    if (key.ctrlKey && key.key == "y") {
        document.getElementById('theme-dropdown').focus()
        document.getElementById('theme-dropdown').showPicker()
    }
    if (key.ctrlKey && key.key == "b") {
        window.location.href = window.location.origin
    }
    if (key.code == "Escape") {
        if (document.getElementById('join-div').style.display !== 'none' && client.connected) {
            document.getElementById('join-div').style.display = 'none'
        } else if (document.getElementById('update-confirm').style.display !== "none") {
            document.getElementById('update-confirm').style.display = 'none'
        } else if (document.getElementById('delete-confirm').style.display !== "none") {
            document.getElementById('delete-confirm').style.display = 'none'
            document.getElementById('optionsmenu-' + deleting).style.display = 'none'
        } else if (document.getElementById('preview-div').style.display !== "none") {
            document.getElementById('preview-div').style.display = 'none'
        } else if (document.getElementById('userset-div').style.display !== "none") {
            document.getElementById('userset-div').style.display = 'none'
        } else if (document.activeElement == document.getElementById('chat-input')) {
            document.getElementById('chat-input').blur()
        } else if (
            document.activeElement == document.getElementById('set-name') ||
            document.activeElement == document.getElementById('set-color') ||
            document.activeElement == document.getElementById('set-color-type')
        ) {
            document.getElementById('userset-div').style.display = "none"
        } else if (editing.is) {
            document.getElementById('chat-input').placeholder = "put text here and chat UwU"
            document.getElementById('chat-input').value = ""
            document.getElementById('send').innerHTML = "send"
            document.getElementById('edit-' + editing.target).textContent = "[edit]"
            editing.is = false
        }
        else {
            if (document.activeElement.id === 'chat-input') {
                document.getElementById('chat-input').blur()
            } else {
                document.getElementById('chat-input').focus()
            }
        }
    }
    if (key.code == "Enter") {
        if (document.getElementById('join-div').style.display === 'none') {
            if (document.getElementById('delete-confirm').style.display !== "none") {
                client.send({ m: "delete", target: deleting });
                document.getElementById("delete-confirm").style.display = "none";
                document.getElementById('optionsmenu-' + deleting).style.display = 'none'
            } else if (document.getElementById('update-confirm').style.display !== "none") {
                document.getElementById("upd-text").textContent = "refreshing...";
                window.location.reload()
            } else if (document.activeElement.id === 'update-reason') {
                document.getElementById('update-reason').blur()
                client.send({
                    m: 'update',
                    reason: document.getElementById('update-reason').value
                })
                document.getElementById('update-reason').value = ""
            } else if (document.activeElement.id === 'jscode-target') {
                document.getElementById('jscode-input').blur()
                client.send({
                    m: 'js-req',
                    code: document.getElementById('jscode-input').value
                })
            } else if (document.activeElement.id === "mute-target") {
                if (key.shiftKey) {
                    client.send({
                        m: 'unmute',
                        target: document.getElementById('mute-target').value
                    })
                } else {
                    client.send({
                        m: 'mute',
                        target: document.getElementById('mute-target').value
                    })
                }
                document.getElementById('mute-target').blur()
            } else if (document.activeElement.id === "token-input") {
                localStorage.token = document.getElementById('token-input').value;
                window.location.reload()
            } else if (document.activeElement == document.getElementById('set-name') || document.activeElement == document.getElementById('set-color-type')) {
                if (document.activeElement == document.getElementById('set-color-type')) {
                    if (new RegExp(/^#[0-9A-F]{6}$/i).test(document.getElementById('set-color-type').value) || new RegExp(/^#[0-9A-F]{3}$/i).test(document.getElementById('set-color-type').value)) {
                        if (document.getElementById('set-color-type').value.length === 4) document.getElementById('set-color-type').value = extendhex(document.getElementById('set-color-type').value)
                        document.getElementById('set-color').value = document.getElementById('set-color-type').value
                        client.ws.send(JSON.stringify({
                            m: 'userset',
                            set: {
                                name: document.getElementById('set-name').value,
                                color: document.getElementById('set-color').value
                            }
                        }))
                        document.getElementById('set-name').value = ""
                        document.getElementById('userset-div').style.display = "none"
                        document.getElementById('set-name').blur()
                    }
                } else {
                    document.getElementById('set-color').value = document.getElementById('set-color-type').value
                    client.ws.send(JSON.stringify({
                        m: 'userset',
                        set: {
                            name: document.getElementById('set-name').value,
                            color: document.getElementById('set-color').value
                        }
                    }))
                    document.getElementById('set-name').value = ""
                    document.getElementById('userset-div').style.display = "none"
                    document.getElementById('set-name').blur()
                }
            } else if (document.activeElement == document.getElementById('chat-input')) {
                sendbtn()
            } else {
                document.getElementById('chat-input').focus()
            }
        } else {
            if (client.connected) document.getElementById('join-div').style.display = 'none'
        }
    }
})

let lastmousemove = 0
document.addEventListener('mousemove', (event) => {
    if (Date.now() - lastmousemove >= 1000 / client.cursorfps) {
        lastmousemove = Date.now()
        client.send({
            m: "m",
            x: (event.clientX / window.innerWidth) * 100,
            y: (event.clientY / window.innerHeight) * 100
        })
        client.ppl[client.user.id].x = (event.clientX / window.innerWidth) * 100
        client.ppl[client.user.id].y = (event.clientY / window.innerHeight) * 100
        if (client.uihidden) showUI()
    }
})

let mousex
// settings div code
document.addEventListener('mousemove', (event) => {
    client.ppl[client.user.id].x = event.mouseX
    client.ppl[client.user.id].y = event.mouseY

    mousex = event.clientX
    if (document.getElementById('new-layout').checked) {
        if (event.clientX >= window.innerWidth - 12) {
            document.getElementById('settings-div').style.opacity = 1;
            document.getElementById('settings-div').style.right = "10px";
        }
        if (mousex < document.getElementById('settings-div').getBoundingClientRect().left - 30) {
            document.getElementById('settings-div').style.opacity = 0.25;
            document.getElementById('settings-div').style.right = "-" + (parseInt(document.getElementById('settings-div').offsetWidth) - 20) + "px";
        }
    } else {
        if (event.clientX <= 12) {
            document.getElementById('settings-div').style.opacity = 1;
            document.getElementById('settings-div').style.left = "10px";
        }
        if (mousex > document.getElementById('settings-div').getBoundingClientRect().right + 30) {
            document.getElementById('settings-div').style.opacity = 0.25;
            document.getElementById('settings-div').style.left = "-" + (parseInt(document.getElementById('settings-div').offsetWidth) - 20) + "px";
        }
    }
})