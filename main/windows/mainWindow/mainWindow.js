const type = {
    ADD: 'add',
	KATEGORIE: 'kategorie',
    TEAM: 'team',
    ERR: 'err'
}

const electron = require('electron');
const {ipcRenderer} = electron;

// Create Mode --------------------------------------------------
ipcRenderer.on('main:initiateProjectCreateMode', (e, project) => {
    try{
        // Clear body
        body = document.querySelector('body');
        body.innerHTML = '';

        // Add content

        // TeamHeader
        teamHeader = document.createElement('div');
        teamHeader.id = 'teamHeader';
        body.appendChild(teamHeader);

        let teamHeaderBoxes = [];

        project.teams.forEach(team => {
            teamHeaderBox = document.createElement('div');
            teamHeaderBox.className = 'team boxes hover';
            teamHeaderBox.innerText = team;
            teamHeaderBox.addEventListener('click', interactWithBox);
            teamHeaderBox.addEventListener('dblclick', renameBox);

            teamHeaderBoxes.push(teamHeaderBox);
        });
        
        // Heading box
        teamHeaderBox = document.createElement('div');
        teamHeaderBox.className = 'team boxes blue';
        teamHeaderBox.innerText = 'Teams →';

        teamHeaderBoxes.unshift(teamHeaderBox);

        // Add box
        teamHeaderBox = document.createElement('div');
        teamHeaderBox.className = 'add team boxes hover green';
        teamHeaderBox.innerText = '+';
        teamHeaderBox.addEventListener('click', interactWithBox);

        teamHeaderBoxes.push(teamHeaderBox);

        teamHeaderBoxes.forEach(box => {
            teamHeader.appendChild(box);
        });
        
        // TopicBar
        topicBar = document.createElement('div');
        topicBar.id = 'topicBar';
        body.appendChild(topicBar);

        let topicBarBoxes = [];

        project.kategorie.forEach(kategorie => {
            // Get light color
            lightStandartKategorieColor = getLightColor(kategorie.color);

            topicBarBox = document.createElement('div');
            topicBarBox.className = 'kategorie boxes hover';
            topicBarBox.innerText = kategorie.name;
            topicBarBox.style.borderColor =  'rgb(' 
                + kategorie.color[0] + ','
                + kategorie.color[1] + ','
                + kategorie.color[2] + ')';
            topicBarBox.style.backgroundColor = 'rgb(' 
                + lightStandartKategorieColor[0] + ','
                + lightStandartKategorieColor[1] + ','
                + lightStandartKategorieColor[2] + ')';
            topicBarBox.addEventListener('click', interactWithBox);
            topicBarBox.addEventListener('dblclick', renameBox);

            topicBarBoxes.push(topicBarBox);
        });
        
        // Heading box
        topicBarBox = document.createElement('div');
        topicBarBox.className = 'kategorie boxes blue';
        topicBarBox.innerText = '↓ Kategorien ↓';

        topicBarBoxes.unshift(topicBarBox);

        // Add box
        topicBarBox = document.createElement('div');
        topicBarBox.className = 'add kategorie boxes hover green';
        topicBarBox.innerText = '+';
        topicBarBox.addEventListener('click', interactWithBox);

        topicBarBoxes.push(topicBarBox);

        topicBarBoxes.forEach(box => {
            topicBar.appendChild(box);
        });

    } catch(err){
        console.log(err);

        body = document.querySelector('body');
        body.innerHTML = '';

        // Add content
        element = document.createElement('h1');
        element.innerText = err;
        body.appendChild(element);
    }
});

// Interact (Single-Click) ----------

function interactWithBox(e){
    // box = geklickte Box
    box = e.target;

    // Find type
    boxType = findType(box);

    switch(boxType[0]){
        case type.KATEGORIE:
            if(boxType.length > 1 && boxType[1] === type.ADD){
                // Standards for 'Kategorie'
                standardKategorieName = 'Kategorie';
                standartKategorieColor = [70, 70, 70];

                // Save
                ipcRenderer.send('project:change.add', {
                    text: standardKategorieName,
                    color: standartKategorieColor,
                    type: boxType
                });

                // Find parent
                topicBar = document.getElementById('topicBar');

                // Get light color
                lightStandartKategorieColor = getLightColor(standartKategorieColor);

                // Create newTopicBarBox
                topicBarBox = document.createElement('div');
                topicBarBox.className = 'kategorie boxes hover';
                topicBarBox.innerText = standardKategorieName;
                topicBarBox.style.borderColor =  'rgb(' 
                + standartKategorieColor[0] + ','
                + standartKategorieColor[1] + ','
                + standartKategorieColor[2] + ')';
                topicBarBox.style.backgroundColor = 'rgb(' 
                + lightStandartKategorieColor[0] + ','
                + lightStandartKategorieColor[1] + ','
                + lightStandartKategorieColor[2] + ')';
                topicBarBox.addEventListener('click', interactWithBox);
                topicBarBox.addEventListener('dblclick', renameBox);

                teamHeader.insertBefore(topicBarBox, box);
            }else{
                // TODO: other Boxes
            }
            break;
        case type.TEAM:
            if(boxType.length > 1 && boxType[1] === type.ADD){
                // Standard 'Team' name
                standardTeamName = 'Team';

                // Save
                ipcRenderer.send('project:change.add', {
                    text: standardTeamName,          
                    type: boxType
                });

                // Find parent
                teamHeader = document.getElementById('teamHeader');

                // create newTeamHeaderBox
                teamHeaderBox = document.createElement('div');
                teamHeaderBox.className = 'team boxes hover';
                teamHeaderBox.innerText = standardTeamName;
                teamHeaderBox.addEventListener('click', interactWithBox);
                teamHeaderBox.addEventListener('dblclick', renameBox);

                teamHeader.insertBefore(teamHeaderBox, box);
            }else{
                // TODO: other Boxes
            }
            break;
    }
}

// Rename ----------

// Save the previous text to save the change later
var box;
var oldText;
var input;

function renameBox(e){
    // box = geklickte Box
    box = e.target;

    // Temporary removal of the listener
    box.removeEventListener('dblclick', renameBox);

    oldText = box.innerText;
    box.innerText = '';
    input = document.createElement('input');
    input.value = oldText;
    document.addEventListener('click', ifOutsideSaveChanges);
    e.target.appendChild(input);
    input.focus();
    input.select();
}

// Saves when outside of the box
function ifOutsideSaveChanges(e){
    if(!box.contains(e.target)){
        saveChangeRename()
    }
}

// Listener to accept an Enter when changing Boxes
document.addEventListener('keyup', function(e){
    if(e.key === 'Enter' && document.activeElement === input){
        saveChangeRename()
    }
});

//TODO: Funktioniert nicht wenn mehrere Kategorien gleich heißen --> ID-System

function saveChangeRename(){
    // Find type
    boxType = findType(box);

    // Save
    ipcRenderer.send('project:change.rename', {
        oldText: oldText,
        newText: input.value,
        type: boxType
    });

    // Remove listener
    document.removeEventListener('click', ifOutsideSaveChanges);

    // Restore listener
    box.addEventListener('dblclick', renameBox);

    // Change text on screen
    box.innerHTML = ''
    box.innerText = input.value
}

// General ----------

function findType(box){
    boxType = [];
    if(box.className.includes(type.KATEGORIE)){
        boxType.push(type.KATEGORIE);
    }else if(box.className.includes(type.TEAM)){
        boxType.push(type.TEAM);
    }

    if(box.className.includes(type.ADD)){
        boxType.push(type.ADD);
    }

    return boxType;
}

function getLightColor(color){
    return [
        color[0] + 80 < 255 ? color[0] + 80 : 255,
        color[1] + 80 < 255 ? color[1] + 80 : 255,
        color[2] + 80 < 255 ? color[2] + 80 : 255
    ]
}

// Present Mode --------------------------------------------------
ipcRenderer.on('main:initiateProjectPresentMode', (e, project, valid) => {
    try{
        // Clear body
        body = document.querySelector('body');
        body.innerHTML = '';

        // Throw error if not valid
        if(!valid){
            throw 'Project is not valid!';
        }

        // Add content


    }catch(err){
        console.log(err);

        body = document.querySelector('body');
        body.innerHTML = '';

        // Add content
        element = document.createElement('h1');
        element.innerText = err;
        body.appendChild(element);
    }
});