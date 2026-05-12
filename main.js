const { app, BrowserWindow, ipcMain } = require('electron');
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
// CONFIG AUTOUPDATER
// ==========================================

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// ==========================================
// CREAR VENTANA
// ==========================================

function crearVentana() {

    ventana = new BrowserWindow({

        width: 1060,
        height: 500,

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }

    });

    ventana.loadFile('public/index.html');

    // DEVTOOLS SOLO EN DESARROLLO
    if (isDev) {

        ventana.webContents.openDevTools();

    }

    // CUANDO TERMINE DE CARGAR
    ventana.webContents.on('did-finish-load', () => {

        console.log('✅ Ventana cargada');

        // SOLO BUSCAR UPDATES EN PRODUCCIÓN
        if (!isDev) {

            console.log('🔍 Buscando actualizaciones...');

            autoUpdater.checkForUpdatesAndNotify();

        } else {

            console.log('🛠 Modo desarrollo: updates desactivados');

            // PROBAR NOTIFICACIÓN MANUAL
            setTimeout(() => {

                ventana.webContents.send(
                    'update_not_available'
                );

            }, 2000);

        }

    });

}

// ==========================================
// APP READY
// ==========================================

app.whenReady().then(() => {

    crearVentana();

});

// ==========================================
// CERRAR APP
// ==========================================

app.on('window-all-closed', () => {

    if (process.platform !== 'darwin') {

        app.quit();

    }

});

// ==========================================
// REABRIR EN MAC
// ==========================================

app.on('activate', () => {

    if (BrowserWindow.getAllWindows().length === 0) {

        crearVentana();

    }

});

// ==========================================
// EVENTOS UPDATE
// ==========================================

// BUSCANDO
autoUpdater.on('checking-for-update', () => {

    console.log('🔍 Verificando actualizaciones...');

});

// UPDATE DISPONIBLE
autoUpdater.on('update-available', (info) => {

    console.log('✅ Nueva actualización encontrada');

    console.log(info);

    if (ventana) {

        ventana.webContents.send(
            'update_available'
        );

    }

});

// NO HAY UPDATE
autoUpdater.on('update-not-available', (info) => {

    console.log('❌ No hay actualizaciones');

    console.log(info);

    if (ventana) {

        ventana.webContents.send(
            'update_not_available'
        );

    }

});

// PROGRESO DESCARGA
autoUpdater.on('download-progress', (progressObj) => {

    const porcentaje = Math.round(
        progressObj.percent
    );

    console.log(
        `⬇ Descargando actualización: ${porcentaje}%`
    );

    if (ventana) {

        ventana.webContents.send(
            'log',
            `⬇ Descargando actualización: ${porcentaje}%`
        );

    }

});

// DESCARGA COMPLETA
autoUpdater.on('update-downloaded', () => {

    console.log('🎉 Actualización descargada');

    if (ventana) {

        ventana.webContents.send(
            'update_downloaded'
        );

    }

    // ESPERAR PARA VER NOTIFICACIÓN
    setTimeout(() => {

        autoUpdater.quitAndInstall();

    }, 4000);

});

// ERROR
autoUpdater.on('error', (err) => {

    console.log('🚨 ERROR AUTOUPDATER');

    console.log(err);

    if (ventana) {

        ventana.webContents.send(
            'log',
            '❌ Error buscando actualización'
        );

    }

});

// ==========================================
// ABRIR SCRCPY
// ==========================================

ipcMain.on('abrir-scrcpy', () => {

    const rutaBat = path.join(
        SCRCPY_DIR,
        'scrcpywifi.bat'
    );

    if (!ventana) return;

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

        if (ventana) {

            ventana.webContents.send(
                'log',
                data.toString()
            );

        }

    });

    proceso.stderr.on('data', (data) => {

        if (ventana) {

            ventana.webContents.send(
                'log',
                '❌ ' + data.toString()
            );

        }

    });

});

// ==========================================
// DETENER SCRCPY
// ==========================================

ipcMain.on('detener-scrcpy', () => {

    exec('taskkill /IM scrcpy.exe /F');
    exec('taskkill /IM adb.exe /F');

    if (ventana) {

        ventana.webContents.send(
            'log',
            '🛑 scrcpy cerrado'
        );

    }

});

// ==========================================
// COMANDOS PERSONALIZADOS
// ==========================================

ipcMain.on('ejecutar-comando', (event, comando) => {

    if (!ventana) return;

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

        if (ventana) {

            ventana.webContents.send(
                'log',
                data.toString()
            );

        }

    });

    proceso.stderr.on('data', (data) => {

        if (ventana) {

            ventana.webContents.send(
                'log',
                data.toString()
            );

        }

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

        if (ventana) {

            ventana.webContents.send(
                'log',
                '❌ No se detectó red'
            );

        }

        return;

    }

    if (ventana) {

        ventana.webContents.send(
            'log',
            `🌐 IP Local: ${ipLocal}`
        );

    }

});