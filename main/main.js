const electron = require('electron');
const url = require('url');
const path = require('path');

const yaml = require('js-yaml');
const fs = require('fs');

const {app, BrowserWindow, Menu, ipcMain, dialog} = electron;

let mainWindow;
let presentWindow;
// let openWindow;
// let newWindow;

let currentProjectPath;
let currentProject;

// Listen for app to be ready and open the mainWindow
app.on('ready', function(){
    // Create new Window
    mainWindow = new BrowserWindow({})
    // Load html into window
    mainWindow.loadURL(path.join(__dirname, 'windows', 'mainWindow', 'mainWindow.html'));

    // Build menu
    let menu = Menu.buildFromTemplate(mainMenuTemplate);

    // Set menu
    Menu.setApplicationMenu(menu);

    // When mainWindow is about to close
    mainWindow.on('close', function(){
        // Save Project if any is opened
        if(currentProject != null){
            fs.writeFileSync(currentProjectPath, yaml.dump(currentProject));
        }

        // Quit App
        app.quit();
    });
});

// Create menu template
const mainMenuTemplate = [
    {
        label:'Projekt',
        submenu:[
            {
                label:'Neu',
                click(){
                    createProjectDialog();
                }
            },
            {
                label:'Öffnen',
                click(){
                    openProjectDialog();
                }
            }
        ]
    },
    {
        label:'Presentation',
        submenu:[
            {
                label:'Beginnen',
                accelerator: process.platform == 'darwin' ? 'Command+B' : 'CTRL+B',
                click(){
                    
                }
            },
            {
                label:'Stoppen',
                accelerator: process.platform == 'darwin' ? 'Command+S' : 'CTRL+S',
                click(){
                    
                }
            }
        ]
    }
];

// If on mac, add empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// Add developer tools if not in prod
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle Dev Tools',
                accelerator: process.platform == 'darwin' ? 'Command+D' : 'CTRL+D',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}

function createProjectDialog(){
    // Create Project Dialog
    dialog.showSaveDialog(mainWindow, {
        defaultPath: 'name',
        filters: [
            {name: 'YAML', extensions: ['yml']}
        ]
    }).then(result => {
        console.log(result.canceled);
        console.log(result.filePath);
        if(!result.canceled){
            fs.writeFileSync(result.filePath, yaml.dump({
                kategorie: [
                    {
                        name: 'Zeug',
                        fragen: [
                            {
                                frage: 'Wer ist doof?',
                                richtig: 'der Leser',
                                falsch: [
                                    'Hans Dieter'
                                ]
                            }
                        ]
                    }
                ]                      
            }));
            
            openProject(result.filePath, yaml.load(fs.readFileSync(result.filePath, 'utf-8')));
        }
    }).catch(err => {
        console.log(err);
    })
}

function openProjectDialog(){
    // Open Project Dialog
    dialog.showOpenDialog(mainWindow, {
        filters: [
            {name: 'YAML', extensions: ['yml']}
        ],
        properties: [
            'openFile'
        ]
    }).then(result => {
        console.log(result.canceled);
        console.log(result.filePaths);
        if(!result.canceled){
            //TODO: add logic if file is valid
            try {
                openProject(result.filePaths[0], yaml.load(fs.readFileSync(result.filePaths[0], 'utf-8')));
            } catch (err) {
                console.log(err);
            }
        }
    }).catch(err => {
        console.log(err);
    })
}

function openProject(projectPath, project){
    // Close presentation if active
    if(presentWindow != null){
        presentWindow.close();
    }

    // Save Project if any is opened
    if(currentProject != null){
        fs.writeFileSync(currentProjectPath, yaml.dump(currentProject));
    }

    currentProject = project;
    currentProjectPath = projectPath;
}

/* Handle create openWindow
function createOpenWindow(){
    // Create new Window
    openWindow = new BrowserWindow({
        width: 500,
        height: 300
    })
    // Load html into window
    openWindow.loadURL(path.join(__dirname, 'windows', 'openWindow', 'openWindow.html'));

    // Release Memory when being closed
    openWindow.on('closed', function(){
        openWindow = null;
    });
// */

/* Handle create newWindow
function createNewWindow(){
    // Create new Window
    newWindow = new BrowserWindow({
        width: 500,
        height: 300
    })
    // Load html into window
    newWindow.loadURL(path.join(__dirname, 'windows', 'newWindow', 'newWindow.html'));

    // Release Memory when being closed
    newWindow.on('closed', function(){
        newWindow = null;
    });
} */

/* Catch project:create
ipcMain.on('project:create', openProject); */
/* Catch project:open
ipcMain.on('project:open', openProject); */