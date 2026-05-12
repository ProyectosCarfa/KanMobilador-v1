const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { exec } = require('child_process');
const os = require('os');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let ventana;

// ==========================================
// DETECTAR ENTORNO
// ==========================================

const isDev = !app.isPackaged;

const BASE_PATH = isDev
    ? __dirname
    : process.resourcesPath;

// ==========================================
// SCRCPY
// ==========================================

const SCRCPY_DIR = path.join(
    BASE_PATH,
    'scrcpy-win64-v3.3.4'
);

// ==========================================
// CREAR VENTANA
// ==========================================

function crearVentana() {

    ventana = new BrowserWindow({

        width: 1060,
        height: 500,

        // icon: path.join(__dirname, 'public/assets/icon.ico'),

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }

    });

    ventana.loadFile('public/index.html');

    // SOLO EN DESARROLLO
    if (isDev) {
        ventana.webContents.openDevTools();
    }

    // BUSCAR ACTUALIZACIONES
    autoUpdater.checkForUpdatesAndNotify();

}

// ==========================================
// APP READY
// ==========================================

app.whenReady().then(() => {

    crearVentana();

});

// ==========================================
// ACTUALIZACIONES
// ==========================================

autoUpdater.on('update-available', () => {

    dialog.showMessageBox({

        type: 'info',
        title: 'KANMOBILADOR',
        message: 'Nueva actualización disponible.'

    });

});

autoUpdater.on('update-downloaded', () => {

    dialog.showMessageBox({

        type: 'info',
        title: 'KANMOBILADOR',
        message: 'Actualización descargada. Reiniciando aplicación.',
        buttons: ['Reiniciar']

    }).then(() => {

        autoUpdater.quitAndInstall();

    });

});

autoUpdater.on('error', (err) => {

    console.log('Error updater:', err);

});

// ==========================================
// ABRIR SCRCPY
// ==========================================

ipcMain.on('abrir-scrcpy', () => {

    const rutaBat = path.join(
        SCRCPY_DIR,
        'scrcpywifi.bat'
    );

    ventana.webContents.send(
        'log',
        '🚀 Iniciando scrcpy...'
    );

    ventana.webContents.send(
        'log',
        rutaBat
    );

    const proceso = exec(
        `cmd /c "${rutaBat}"`,
        {
            cwd: SCRCPY_DIR
        }
    );

    proceso.stdout.on('data', (data) => {

        ventana.webContents.send(
            'log',
            data.toString()
        );

    });

    proceso.stderr.on('data', (data) => {

        ventana.webContents.send(
            'log',
            '❌ ' + data.toString()
        );

    });

});

// ==========================================
// DETENER SCRCPY
// ==========================================

ipcMain.on('detener-scrcpy', () => {

    exec('taskkill /IM scrcpy.exe /F');
    exec('taskkill /IM adb.exe /F');

    ventana.webContents.send(
        'log',
        '🛑 scrcpy cerrado'
    );

});

// ==========================================
// COMANDOS PERSONALIZADOS
// ==========================================

ipcMain.on('ejecutar-comando', (event, comando) => {

    ventana.webContents.send(
        'log',
        `💻 ${comando}`
    );

    const proceso = exec(
        `cmd /c ${comando}`,
        {
            cwd: SCRCPY_DIR
        }
    );

    proceso.stdout.on('data', (data) => {

        ventana.webContents.send(
            'log',
            data.toString()
        );

    });

    proceso.stderr.on('data', (data) => {

        ventana.webContents.send(
            'log',
            data.toString()
        );

    });

});

// ==========================================
// ESCANEAR RED
// ==========================================

ipcMain.on('escanear-red', async () => {

    const interfaces = os.networkInterfaces();

    let ipLocal = null;

    for (let nombre in interfaces) {

        for (let net of interfaces[nombre]) {

            if (
                net.family === 'IPv4' &&
                !net.internal
            ) {

                ipLocal = net.address;
                break;

            }

        }

    }

    if (!ipLocal) {

        ventana.webContents.send(
            'log',
            '❌ No se detectó red'
        );

        return;

    }

    ventana.webContents.send(
        'log',
        `🌐 IP Local: ${ipLocal}`
    );

});