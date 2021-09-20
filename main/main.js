const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu} = electron;

let mainWindow;
let openWindow;
let newWindow;

// Listen for app to be ready and open the mainWindow
app.on('ready', function(){
    // Create new Window
    mainWindow = new BrowserWindow({})
    // Load html into window
    mainWindow.loadURL(path.join(__dirname, 'mainWindow.html'));

    // Build menu
    let menu = Menu.buildFromTemplate(mainMenuTemplate);

    // Set menu
    Menu.setApplicationMenu(menu);

    // Quit app when mainWindow is being closed
    mainWindow.on('close', function(){
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
                    createNewWindow();
                }
            },
            {
                label:'Öffnen',
                click(){
                    createOpenWindow();
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

// Handle create openWindow
function createOpenWindow(){
    // Create new Window
    openWindow = new BrowserWindow({
        width: 500,
        height: 300
    })
    // Load html into window
    openWindow.loadURL(path.join(__dirname, 'openWindow.html'));

    // Release Memory when being closed
    openWindow.on('closed', function(){
        openWindow = null;
    });
}

// Handle create newWindow
function createNewWindow(){
    // Create new Window
    newWindow = new BrowserWindow({
        width: 500,
        height: 300
    })
    // Load html into window
    newWindow.loadURL(path.join(__dirname, 'newWindow.html'));

    // Release Memory when being closed
    newWindow.on('closed', function(){
        newWindow = null;
    });
}