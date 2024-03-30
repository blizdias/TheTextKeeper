const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script is running');

contextBridge.exposeInMainWorld('electron', {
    createUser: (username, password, isAdmin) => ipcRenderer.invoke('create-user', username, password, isAdmin),
    login: (username, password) => ipcRenderer.invoke('login', username, password),
    saveText: async (textData) => ipcRenderer.invoke('save-text', textData),
    saveTitle: async (textData) => ipcRenderer.invoke('save-text', textData),
    addText: async (textData) => ipcRenderer.invoke('add-text', textData),
    getTexts: () => ipcRenderer.invoke('get-texts'),
    copyText: async (text) => ipcRenderer.invoke('copy-text', text),
    showAlert: async (message, type) => ipcRenderer.invoke('show-alert', message, type)
});

