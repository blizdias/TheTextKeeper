const { app, BrowserWindow, ipcMain, clipboard, dialog, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const { verifyUser, createUser } = require('../src/user-service');
const { readFile } = require('fs');
const isDevelopment = process.env.NODE_ENV === "development";

const textsFilePath = path.join(app.getPath('userData'), 'textsData.json'); 

if (!fs.existsSync(textsFilePath)) {
    fs.writeFileSync(textsFilePath, '[]', 'utf8');
}

function createWindow() {

    let window = new  BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), 
            contextIsolation: true, 
            enableRemoteModule: false,
            nodeIntegration: false, 
        }
    });

    window.webContents.on("did-finish-load", () => {
        window.show();
        window.focus();
    })

    if (isDevelopment) {
        window.loadURL("http://localhost:40992");
    } else {
        console.log("prod1");
        window.loadFile("app/dist/index.html");
    }
    
    global.window = window;
    //window.webContents.openDevTools()
    
}

async function initializeTextsFile() {
    try {
      await fsPromises.access(textsFilePath);  
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fsPromises.writeFile(textsFilePath, JSON.stringify([]));
      } else {
        throw error;
      }
    }
  }
  
initializeTextsFile();

//Copy to clipboard
ipcMain.handle('copy-text', async (event, text) => {
    clipboard.writeText(text);
    dialog.showMessageBox(window, {
        type: 'info',
        message: 'Text copied to the clipboard.'
    });
    return text;
});

// Alerts Handler
ipcMain.handle('show-alert', async (event, message, type) => {
    const transparentIcon = nativeImage.createEmpty();
    const focusedWindow = BrowserWindow.getFocusedWindow();
    return dialog.showMessageBox(focusedWindow, {
        type: type,
        message: message,
        buttons: ["OK"],
        icon: transparentIcon
    });
})


// Login IPC Handlers
ipcMain.handle('create-user', async (event, username, password, isAdmin) => {
    return createUser(username, password, isAdmin);
});
  
ipcMain.handle('login', async (event, username, password) => {
    return verifyUser(username, password);
});


// Handler to get texts

ipcMain.handle('get-texts', async (event)=>{
    try {
        const rawData = await fsPromises.readFile(textsFilePath, 'utf-8');
        const data = JSON.parse(rawData);
        console.log(data);
        return data;    
    } catch (error) {
        console.log('error reading the file');
    }  
})

  
// Handler to save edited text
ipcMain.handle('save-text', async (event, { id, title, text }) => {
    if(title === '') {
        dialog.showMessageBox(window, {
            type: 'info',
            message: 'Tittle cannot be empty.'
        });
        return { status: 'empty-title' };
    } else {
        const texts = JSON.parse(await fsPromises.readFile(textsFilePath, 'utf-8'));
        const textIndex = texts.findIndex(t => t.id === id);
        if (textIndex !== -1) {
            texts[textIndex] = { id, title, text };
            await fsPromises.writeFile(textsFilePath, JSON.stringify(texts, null, 2));
            return { status: 'success' };
        }       
        return { status: 'not-found' };
        }  
});
  
// Handler to add a new text
ipcMain.handle('add-text', async (event, { title, text }) => {
    const texts = JSON.parse(await fsPromises.readFile(textsFilePath, 'utf-8'));
    const newId = texts.length > 0 ? String(Number(texts[texts.length - 1].id) + 1) : '1';
    const newText = { id: newId, title, text };
    texts.push(newText);
    await fsPromises.writeFile(textsFilePath, JSON.stringify(texts, null, 2));
    return newText;
});

app.whenReady().then(() => { 
    
    createWindow();
    
    app.on("activate", () => {
        if(BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    })
})

app.on("window-all-closed", function () {
    if(process.platform !== "darwin") {
        app.quit();
    }
})



