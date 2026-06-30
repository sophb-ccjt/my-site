if (!localStorage.theme) localStorage.theme = 'light'
let css = document.getElementById('css')
css.href = "../themes/" + localStorage.theme + ".css"