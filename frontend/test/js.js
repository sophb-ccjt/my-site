if (!localStorage.theme) localStorage.theme = 'light'
let css = document.getElementById('css')
css.href = "/assets/ŧhemes/" + localStorage.theme + ".css"