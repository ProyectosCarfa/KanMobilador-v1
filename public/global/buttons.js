const { ipcRenderer } = require('electron');

// ======================================
// LOGS
// ======================================

function agregarLog(texto) {

    const logContainer =
        document.getElementById("logComandos");

    if (!logContainer) return;

    const linea = document.createElement("div");

    linea.classList.add("log-line");

    linea.innerHTML = texto;

    logContainer.appendChild(linea);

    logContainer.scrollTop =
        logContainer.scrollHeight;
}

// ======================================
// ESCUCHAR LOGS
// ======================================

ipcRenderer.on('log', (event, data) => {
    agregarLog(data);
});

// ======================================
// CONECTAR
// ======================================

window.iniciarConexionCompleta = () => {

    agregarLog("🚀 Conectando dispositivo...");

    ipcRenderer.send('abrir-scrcpy');

};

// ======================================
// DETENER
// ======================================

window.matarScrcpy = () => {

    agregarLog("🛑 Cerrando scrcpy...");

    ipcRenderer.send('detener-scrcpy');

};

// ======================================
// REINICIAR ADB
// ======================================

window.reiniciarServicioADB = () => {

    ipcRenderer.send('reiniciar-adb');

};

// ======================================
// FULLSCREEN
// ======================================

window.fullscreenScrcpy = () => {

    ipcRenderer.send(
        'ejecutar-comando',
        'scrcpy.exe --fullscreen'
    );

};

// ======================================
// SCREENSHOT
// ======================================

window.screenshotScrcpy = () => {

    ipcRenderer.send(
        'ejecutar-comando',
        'adb.exe exec-out screencap -p > captura.png'
    );

};

// ======================================
// ESCANEAR RED
// ======================================

window.buscarDispositivosRed = () => {

    ipcRenderer.send('escanear-red');

};

// ===DETECTAR DISPOSITIVO====
    window.conectarADB = () => {

        agregarLog("🔌 Detectando dispositivo por USB...");
        agregarLog("📱 Asegúrate de aceptar la depuración en tu celular");

        ipcRenderer.send('conectar-adb-pro');

    };