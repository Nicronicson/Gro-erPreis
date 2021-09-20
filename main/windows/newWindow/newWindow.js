const electron = require('electron');
const {ipcRenderer} = electron;

const form = document.querySelector('form');
form.addEventListener('submit', submitForm);

function submitForm(e){
    e.preventDefault();
    let projectName = document.querySelector('#item').value;

    //TODO: Logic to save file
    // ipcRenderer.send('project:create', project);
}