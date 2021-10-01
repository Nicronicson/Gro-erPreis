const type = {
    ADD: 'add',
	KATEGORIE: 'kategorie',
    TEAM: 'team',
    ERR: 'err'
}

const electron = require('electron');
const url = require('url');
const path = require('path');

const yaml = require('js-yaml');
const fs = require('fs');

const {app, BrowserWindow, Menu, ipcMain, dialog} = electron;

let mainWindow;
let controlWindow;
let presentWindow;

var currentProjectPath;
var currentProject;

let game;

// Listen for app to be ready and open the mainWindow
app.on('ready', function(){
    // Create new Window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })
    // Load html into window
    mainWindow.loadURL(path.join(__dirname, 'windows', 'mainWindow', 'mainWindow.html'));

    // Build menu
    let menu = Menu.buildFromTemplate(mainMenuTemplate);

    // Set menu
    Menu.setApplicationMenu(menu);

    // When mainWindow is about to close
    mainWindow.on('close', function(){
        // Save Project if any is opened
        saveProject();

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
                click(){
                    // Start presentation
                    startPresentation();
                }
            },
            {
                label:'Stoppen',
                click(){
                    // End presentation
                    endPresentation();
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
        if(!result.canceled){
            fs.writeFileSync(result.filePath, yaml.dump({
                teams: [
                    'Team Arschlöscher'
                ],
                kategorie: [
                    {
                        name: 'Zeug',
                        color: [70, 70, 70],
                        fragen: [
                            {
                                frage: 'Wer ist doof?',
                                richtig: 'Der Ventilator',
                                falsch: [
                                    'Hans Dieter',
                                    'Johann Josef',
                                    'Johannes Jeske'
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
        if(!result.canceled){
            try {
                project = yaml.load(fs.readFileSync(result.filePaths[0], 'utf-8'));

                // Check if file is most likely valid <-- wrong
                // console.log(project.kategorie[0].fragen[0].falsch[0]);

                openProject(result.filePaths[0], project);
            } catch (err) {
                console.log(err);
            }
        }
    }).catch(err => {
        console.log(err);
    })
}

// Called when opening a project
function openProject(projectPath, project){
    // End presentation if active
    endPresentation();

    // Save Project if any is opened
    saveProject();

    currentProject = project;
    currentProjectPath = projectPath;

    // initiateProjectCreateMode on mainWindow
    mainWindow.webContents.send('main:initiateProjectCreateMode', currentProject);
}

// Called when the project needs to be saved (closing, opening a project, ...)
function saveProject(){
    // Save Project if any is opened
    if(currentProject != null){
        fs.writeFileSync(currentProjectPath, yaml.dump(currentProject));
    }
}

// Edits to the current project --------------------------------------------------

// Listeners ----------

// Handle project change.rename
ipcMain.on('project:change.rename', changeProjectRename);

// Handle project change.add
ipcMain.on('project:change.add', changeProjectAdd);

// Functions ----------

function changeProjectRename(e, projectInfos){
    switch(projectInfos.type[0]){
        case type.KATEGORIE:
            i = 0;
            while(currentProject.kategorie[i].name !== projectInfos.oldText){
                i++;
            }
            currentProject.kategorie[i].name = projectInfos.newText;
            break;
        case type.TEAM:
            i = 0;
            while(currentProject.teams[i] !== projectInfos.oldText){
                i++;
            }
            currentProject.teams[i] = projectInfos.newText;
            break;
    }
}

function changeProjectAdd(e, projectInfos){
    switch(projectInfos.type[0]){
        case type.KATEGORIE:
            currentProject.kategorie.push({
                name: projectInfos.text,
                color: projectInfos.color,
                fragen: [
                    {
                        frage: 'Frage?',
                        richtig: 'Richtige Antwort',
                        falsch: [
                            '1. Falsche Antwort',
                            '2. Falsche Antwort',
                            '3. Falsche Antwort'
                        ]
                    }
                ]
            });
            break;
        case type.TEAM:
            currentProject.teams.push(projectInfos.text)
            break;
    }
}

// Presentation --------------------------------------------------

// Classes ----------
class Game{
    teams;
    wrongAnswers;
    categories;

    constructor(teams, categories){
        this.teams = teams;
        this.categories = categories;
    }
}

class Team{
    name;
    points;
    correctQuestions;

    constructor(name){
        this.name = name;
        this.points = 0;
    }
}

class Category{
    name;
    color;
    questions;

    constructor(name, color, questions){
        this.name = name;
        this.color = color;
        this.questions = questions;
    }
}

class Question{
    questionText;
    rightAnswer;
    wrongAnswers;

    constructor(questionText, rightAnswer, wrongAnswers){
        this.questionText = questionText;
        this.rightAnswer = rightAnswer;
        this.wrongAnswers = wrongAnswers;
    }
}

// Functions ----------
function validateProject(project){
    valid = true;
    if(project.teams.length < 2){
        valid = false;
    }
    project.kategorie.forEach(kategorie => {
        if(kategorie.fragen.length !== project.kategorie[0].fragen.length){
            valid = false;
        }
    });
    return valid;
}

function startPresentation(){
    valid = validateProject(currentProject);

    if(valid){
        initializeGame();
        // Open other windows
    }

    // initiateProjectPresentMode on mainWindow
    mainWindow.webContents.send('main:initiateProjectPresentMode', currentProject, valid);
}

function initializeGame(project){
    
}

function endPresentation(){
    if(presentWindow != null){
        presentWindow.close();
    }
    if(controlWindow != null){
        controlWindow.close();
    }

    game = null;

    // initiateProjectCreateMode on mainWindow
    mainWindow.webContents.send('main:initiateProjectCreateMode', currentProject);
}