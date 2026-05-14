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

// IMPORTANTE
// Evita errores de certificados en GitHub
autoUpdater.forceDevUpdateConfig = false;

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
    ventana.setMenu(null);




    ventana.loadFile('public/index.html');

    // SOLO DEVTOOLS EN DESARROLLO
    if (isDev) {

        ventana.webContents.openDevTools();

    }

    // ==========================================
    // CUANDO CARGA LA VENTANA
    // ==========================================

    ventana.webContents.on('did-finish-load', () => {

        console.log('Ventana cargada');

        // SOLO EN APP INSTALADA
        if (!isDev) {

            console.log('Buscando actualizaciones...');

            setTimeout(() => {

                autoUpdater.checkForUpdates();

            }, 3000);

        } else {

            console.log('🛠 Modo desarrollo');

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
// EVENTOS AUTOUPDATER
// ==========================================

// BUSCANDO UPDATE
autoUpdater.on('checking-for-update', () => {

    console.log('🔍 Verificando actualizaciones...');

    if (ventana) {

        ventana.webContents.send(
            'log',
            '🔍 Buscando actualizaciones...'
        );

    }

});

// UPDATE DISPONIBLE
autoUpdater.on('update-available', (info) => {

    console.log('✅ Nueva actualización disponible');

    console.log(info);

    if (ventana) {

        ventana.webContents.send(
            'update_available'
        );

        ventana.webContents.send(
            'log',
            `✅ Nueva versión encontrada: v${info.version}`
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

        ventana.webContents.send(
            'log',
            '✅ Estás usando la última versión'
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
autoUpdater.on('update-downloaded', (info) => {

    console.log('🎉 Actualización descargada');

    console.log(info);

    if (ventana) {

        ventana.webContents.send(
            'update_downloaded'
        );

        ventana.webContents.send(
            'log',
            '🎉 Actualización descargada correctamente'
        );

    }

    // INSTALAR UPDATE
    setTimeout(() => {

        autoUpdater.quitAndInstall(
            false,
            true
        );

    }, 5000);

});

// ERROR
autoUpdater.on('error', (err) => {

    console.log('🚨 ERROR AUTOUPDATER');

    console.log(err);

    if (ventana) {

        ventana.webContents.send(
            'log',
            `❌ Error updater: ${err == null ? "desconocido" : err.message}`
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

// DETECTAR DISPOSITIVO
ipcMain.on('conectar-adb-pro', () => {

    const fs = require('fs');

    const rutaIP = path.join(SCRCPY_DIR, 'ip.txt');

    const proceso = exec(`cmd /c "cd /d ${SCRCPY_DIR} && adb.exe shell ip route"`);

    let output = "";

    proceso.stdout.on('data', (data) => {
        output += data.toString();
        ventana.webContents.send('log', data.toString());
    });

    proceso.on('close', () => {

        // const match = output.match(/wlan0.*src\s+(\d+\.\d+\.\d+\.\d+)/);
        const match = output.match(/src\s+(\d+\.\d+\.\d+\.\d+)/);

        if (!match) {
            ventana.webContents.send('log', '❌ No se encontró IP WiFi (wlan0)');
            ventana.webContents.send('log', 'Desactiva datos móviles y usa WiFi');
            return;
        }

        // const ip = match[1];

        // fs.writeFileSync(rutaIP, ip);

        // ventana.webContents.send('log', `IP WiFi guardada: ${ip}`);
        // ventana.webContents.send('log', 'Ahora sí inicia conexión');
        const ip = match[1];

        fs.writeFileSync(rutaIP, ip);

        ventana.webContents.send(
            'log',
            `💾 IP WiFi guardada: ${ip}`
        );

        // ACTIVAR TCPIP
        exec(
            `cmd /c "cd /d ${SCRCPY_DIR} && adb.exe tcpip 5555"`,
            () => {

                ventana.webContents.send(
                    'log',
                    '📡 ADB TCPIP activado'
                );

                // CONECTAR
                exec(
                    `cmd /c "cd /d ${SCRCPY_DIR} && adb.exe connect ${ip}:5555"`,
                    (error, stdout, stderr) => {

                        if (stdout) {

                            ventana.webContents.send(
                                'log',
                                stdout
                            );

                        }

                        if (stderr) {

                            ventana.webContents.send(
                                'log',
                                stderr
                            );

                        }

                        ventana.webContents.send(
                            'log',
                            '🚀 Dispositivo listo para scrcpy'
                        );

                    }
                );

            }
        );
    });

});




// ATAJOS DE TECLADOS
// ==========================================
// ATAJOS DE TECLADO
// ==========================================

const { globalShortcut } = require('electron');

app.whenReady().then(() => {

    // RECARGAR APP
    globalShortcut.register('CommandOrControl+R', () => {

        if (ventana) {

            ventana.reload();

        }

    });

});