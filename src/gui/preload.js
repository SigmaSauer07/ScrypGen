const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  generateScript: (request) => ipcRenderer.invoke("generate-script", request),
  saveScript: (code, suggestedName) =>
    ipcRenderer.invoke("save-script", code, suggestedName),
  showAbout: () => ipcRenderer.invoke("show-about"),

  // Event listeners
  onScriptGenerated: (callback) => ipcRenderer.on("script-generated", callback),
  onScriptSaved: (callback) => ipcRenderer.on("script-saved", callback),

  // Remove listeners
  removeAllListeners: (event) => ipcRenderer.removeAllListeners(event),
});
