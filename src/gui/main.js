const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const dialog = electron.dialog;
const path = require("path");
const { UniversalScriptGenerator } = require("../core/script-generator");

let mainWindow;
let generator;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../../assets/icons/scrypgen.png"),
    title: "ScrypGen - Transform Ideas into Code",
    backgroundColor: "#0a0a0f", // Alsania deep navy
    show: false,
  });

  // Load the HTML file
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Show window when ready to prevent visual flash
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Initialize the script generator
  const config = {
    defaultLanguage: "auto",
    pythonVersion: "3.8",
    bashShell: "/bin/bash",
    outputDirectory: "./generated_scripts",
    templateDirectory: "./templates",
    enableAI: false,
    enableNLP: true,
    validateScripts: true,
    sandboxExecution: false,
    alsaniaCompliance: true,
  };

  const logger = {
    info: (msg, meta) => console.log(`ℹ️ ${msg}`, meta || ""),
    warn: (msg, meta) => console.log(`⚠️ ${msg}`, meta || ""),
    error: (msg, meta) => console.error(`💥 ${msg}`, meta || ""),
    debug: (msg, meta) =>
      process.env.DEBUG && console.log(`🐛 ${msg}`, meta || ""),
  };

  generator = new UniversalScriptGenerator(config, logger);

  // Open DevTools in development
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// App event handlers
app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for script generation
ipcMain.handle("generate-script", async (event, request) => {
  try {
    const result = await generator.generateScript(request);
    return result;
  } catch (error) {
    return {
      success: false,
      code: "",
      language: "bash",
      metadata: {},
      errors: [`Generation failed: ${error.message}`],
      warnings: [],
      suggestions: [],
      integrationFiles: [],
    };
  }
});

ipcMain.handle("save-script", async (event, code, suggestedName) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: "Save Script",
    defaultPath: suggestedName,
    filters: [
      { name: "Bash Scripts", extensions: ["sh"] },
      { name: "Python Scripts", extensions: ["py"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (!result.canceled) {
    const fs = require("fs").promises;
    await fs.writeFile(result.filePath, code);

    // Make executable if it's a bash script
    if (result.filePath.endsWith(".sh")) {
      const { chmod } = require("fs").promises;
      await chmod(result.filePath, 0o755);
    }

    return { success: true, filePath: result.filePath };
  }

  return { success: false };
});

ipcMain.handle("show-about", () => {
  dialog.showMessageBox(mainWindow, {
    type: "info",
    title: "About ScrypGen",
    message: "ScrypGen - Transform Ideas into Code",
    detail:
      "A revolutionary tool that transforms natural language descriptions into production-ready Python and Bash scripts.\n\nBuilt with Alsania Protocol v1.0\nCreated by Sigma, Powered by Echo",
  });
});
