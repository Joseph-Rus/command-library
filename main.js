const { app, BrowserWindow, globalShortcut, Menu, ipcMain } = require("electron");
const fs = require('fs');
const path = require('path');
require('@electron/remote/main').initialize();

// Set application name
app.setName('Command Library');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 400,
    minWidth: 500,
    minHeight: 400,
    title: 'Command Library',
    icon: './icons/main.png',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    titleBarStyle: 'hiddenInset',
    transparent: true,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    backgroundMaterial: 'under-window',
    frame: true,
    hasShadow: true
  });

  mainWindow.loadFile("app/index.html");
  require('@electron/remote/main').enable(mainWindow.webContents);

  // Create the menu bar
  const template = [
    {
      label: 'Command Library',
      submenu: [
        {
          label: 'About Command Library',
          role: 'about'
        },
        { type: 'separator' },
        {
          label: 'Settings...',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.executeJavaScript('window.commandLibrary.showModal("settings");');
          }
        },
        { type: 'separator' },
        {
          label: 'Import Commands...',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            mainWindow.webContents.executeJavaScript('document.getElementById("importFile").click();');
          }
        },
        {
          label: 'Export Commands...',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.executeJavaScript('window.commandLibrary.exportCommands();');
          }
        },
        { type: 'separator' },
        {
          label: 'Hide Command Library',
          accelerator: 'CmdOrCtrl+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'CmdOrCtrl+Shift+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: 'Quit Command Library',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Command',
      submenu: [
        {
          label: 'Add New Command',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.executeJavaScript('window.commandLibrary.showModal("add");');
          }
        },
        { type: 'separator' },
        {
          label: 'Search Commands',
          accelerator: 'CmdOrCtrl+K',
          click: () => {
            mainWindow.webContents.executeJavaScript('window.commandLibrary.focusSearch();');
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        { type: 'separator' },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow.webContents.reloadIgnoringCache();
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        },
        { type: 'separator' },
        {
          label: 'Actual Size',
          accelerator: 'CmdOrCtrl+0',
          role: 'resetzoom'
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          role: 'zoomin'
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          role: 'zoomout'
        },
        { type: 'separator' },
        {
          label: 'Toggle Fullscreen',
          accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
          role: 'togglefullscreen'
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // IPC handlers for window transparency
  ipcMain.on('set-window-opacity', (event, opacity) => {
    mainWindow.setOpacity(opacity);
  });

  ipcMain.on('get-window-opacity', (event) => {
    event.returnValue = mainWindow.getOpacity();
  });

  // Storage handlers
  const userDataPath = app.getPath('userData');
  const commandsFilePath = path.join(userDataPath, 'commands.json');

  // Load commands from file
  ipcMain.handle('load-commands', async () => {
    try {
      if (fs.existsSync(commandsFilePath)) {
        const data = fs.readFileSync(commandsFilePath, 'utf8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error loading commands:', error);
      return [];
    }
  });

  // Save commands to file
  ipcMain.handle('save-commands', async (event, commands) => {
    try {
      fs.writeFileSync(commandsFilePath, JSON.stringify(commands, null, 2));
      return { success: true };
    } catch (error) {
      console.error('Error saving commands:', error);
      return { success: false, error: error.message };
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  return mainWindow;
}

app.whenReady().then(() => {
  // Ensure app name is set
  app.setName('Command Library');
  
  createWindow();
  
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      const mainWindow = windows[0];
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});