if (!localStorage.theme) localStorage.theme = 'light'
let css = document.getElementById('css')
css.href = "./themes/" + localStorage.theme + ".css"

async function fetchquote() {
    document.getElementById('quote').innerText = "loading quote..."
    //let r = await fetch('https://ccjt.israeli.ovh/api/quotes/electroboom-nocensor')
    //let quote = await r.text()
    let quote = "DISABLED!!!"
    document.getElementById('quote').innerText = `"${quote}"`
}

fetchquote()

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

document.getElementById('theme-dropdown').addEventListener('change', (event) => {
    localStorage.theme = event.target.value
    css.setAttribute('href', "/assets/ŧhemes/" + localStorage.theme + '.css?nocache=' + Date.now());
})

document.addEventListener('DOMContentLoaded', async () =>{
    await getthemes()
    document.getElementById('theme-dropdown').value = localStorage.theme;
})