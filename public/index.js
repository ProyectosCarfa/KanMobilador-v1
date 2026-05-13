require('./global/buttons.js');
const { ipcRenderer } = require('electron');

// ===================== MANEJO DE SECCIONES =====================
document.addEventListener('DOMContentLoaded', () => {

    console.log("✅ KANMOBILADOR - Sistema iniciado correctamente");

    // ==========================================
    // TERMINAL LOG
    // ==========================================

    const logComandos = document.getElementById('logComandos');

    function addLog(message, type = 'info') {

        if (!logComandos) return;

        const logLine = document.createElement('div');

        logLine.className = 'log-line';

        const icon =
            type === 'success'
                ? 'fa-circle-check'
                : type === 'error'
                    ? 'fa-circle-exclamation'
                    : 'fa-info-circle';

        logLine.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            ${message}
        `;

        logComandos.appendChild(logLine);

        logComandos.scrollTop =
            logComandos.scrollHeight;

        while (
            logComandos.children.length > 50
        ) {

            logComandos.removeChild(
                logComandos.firstChild
            );

        }

    }

    // ==========================================
    // RECIBIR LOGS DESDE MAIN
    // ==========================================

    ipcRenderer.on('log', (event, mensaje) => {

        let tipo = 'info';

        if (
            mensaje.includes('❌') ||
            mensaje.toLowerCase().includes('error')
        ) {

            tipo = 'error';

        }

        if (
            mensaje.includes('✅') ||
            mensaje.includes('🎉')
        ) {

            tipo = 'success';

        }

        addLog(mensaje, tipo);

    });

    // Función para cambiar de sección
    function changeSection(sectionName) {

        // Ocultar todas las secciones
        const allContents =
            document.querySelectorAll(
                '.section-content'
            );

        allContents.forEach(content => {

            content.classList.remove(
                'active-content'
            );

        });

        // Mostrar sección seleccionada
        const activeContent =
            document.getElementById(
                sectionName
            );

        if (activeContent) {

            activeContent.classList.add(
                'active-content'
            );

            console.log(
                `📱 Sección activada: ${sectionName}`
            );

        }

        // Quitar active
        const allMenuItems =
            document.querySelectorAll(
                '.menu-item'
            );

        allMenuItems.forEach(item => {

            item.classList.remove('active');

        });

        // Agregar active
        const activeMenuItem =
            document.querySelector(
                `.menu-item[data-section="${sectionName}"]`
            );

        if (activeMenuItem) {

            activeMenuItem.classList.add(
                'active'
            );

        }

    }

    // EVENTOS MENU
    const menuItems =
        document.querySelectorAll(
            '.menu-item'
        );

    menuItems.forEach(item => {

        item.addEventListener(
            'click',
            (e) => {

                e.preventDefault();

                const sectionName =
                    item.getAttribute(
                        'data-section'
                    );

                if (sectionName) {

                    changeSection(
                        sectionName
                    );

                    window.location.hash =
                        sectionName;

                }

            }
        );

    });

    // HASH
    if (window.location.hash) {

        const hash =
            window.location.hash.substring(1);

        if (
            document.getElementById(hash)
        ) {

            changeSection(hash);

        } else {

            changeSection('inicio');

        }

    } else {

        changeSection('inicio');

    }

    // ==========================================
    // CONEXIÓN
    // ==========================================

    const connectBtn =
        document.getElementById(
            'connectBtn'
        );

    const stopBtn =
        document.getElementById(
            'stopBtn'
        );

    const statusSpan =
        document.getElementById(
            'estatus'
        );

    // CONECTAR
    if (connectBtn) {

        connectBtn.addEventListener(
            'click',
            () => {

                if (statusSpan) {

                    statusSpan.textContent =
                        'Conectado ✓';

                    statusSpan.style.color =
                        '#a0ffb0';

                }

                connectBtn.innerHTML = `
                    <i class="fa-solid fa-check"></i>
                    Conectado
                `;

                connectBtn.disabled = true;

                if (stopBtn)
                    stopBtn.disabled = false;

                addLog(
                    'Dispositivo conectado exitosamente',
                    'success'
                );

                // SCRCPY
                ipcRenderer.send(
                    'abrir-scrcpy'
                );

                // ORIGINAL
                if (
                    window.iniciarConexionCompleta
                ) {

                    window.iniciarConexionCompleta();

                }

                // DISPOSITIVO
                const dispositivoNombre =
                    document.getElementById(
                        'nombre-dispositivo'
                    );

                if (dispositivoNombre) {

                    dispositivoNombre.textContent =
                        'Pixel 6 Pro';

                    const estatusDispo =
                        document.getElementById(
                            'estatus-dispo'
                        );

                    if (estatusDispo)
                        estatusDispo.textContent =
                            'Conectado ✓';

                }

            }
        );

    }

    // DETENER
    if (stopBtn) {

        stopBtn.addEventListener(
            'click',
            () => {

                if (statusSpan) {

                    statusSpan.textContent =
                        'No conectado';

                    statusSpan.style.color =
                        '#ff5e6e';

                }

                connectBtn.innerHTML = `
                    <i class="fa-solid fa-link"></i>
                    Conectar
                `;

                connectBtn.disabled = false;

                stopBtn.disabled = true;

                addLog(
                    'Dispositivo desconectado',
                    'info'
                );

                // SCRCPY
                ipcRenderer.send(
                    'detener-scrcpy'
                );

                // ORIGINAL
                if (window.matarScrcpy) {

                    window.matarScrcpy();

                }

                const dispositivoNombre =
                    document.getElementById(
                        'nombre-dispositivo'
                    );

                if (dispositivoNombre) {

                    dispositivoNombre.textContent =
                        'Nombre del dispositivo';

                    const estatusDispo =
                        document.getElementById(
                            'estatus-dispo'
                        );

                    if (estatusDispo)
                        estatusDispo.textContent =
                            'No conectado';

                }

            }
        );

        stopBtn.disabled = true;

    }

    // ==========================================
    // ACTUALIZACIONES
    // ==========================================

    function mostrarNotificacion(
        texto,
        tipo = 'info'
    ) {

        const noti =
            document.createElement('div');

        noti.className =
            'notificacion-update';

        noti.innerHTML = `
            <i class="fa-solid ${
                tipo === 'success'
                    ? 'fa-circle-check'
                    : tipo === 'error'
                        ? 'fa-circle-xmark'
                        : 'fa-circle-info'
            }"></i>

            <span>${texto}</span>
        `;

        document.body.appendChild(noti);

        setTimeout(() => {

            noti.classList.add('show');

        }, 100);

        setTimeout(() => {

            noti.classList.remove('show');

            setTimeout(() => {

                noti.remove();

            }, 300);

        }, 4000);

    }

    // MODAL UPDATE
    function mostrarModalActualizacion() {

        const modal =
            document.createElement('div');

        modal.className =
            'modal-update';

        modal.innerHTML = `
        
            <div class="modal-update-content">

                <i class="fa-solid fa-download"></i>

                <h2>
                    Nueva actualización disponible
                </h2>

                <p>
                    Hay una nueva versión de
                    KANMOBILADOR disponible.
                </p>

                <button id="btn-update-ok">
                    Actualizar ahora
                </button>

            </div>

        `;

        document.body.appendChild(modal);

        document
            .getElementById(
                'btn-update-ok'
            )
            .addEventListener(
                'click',
                () => {

                    modal.remove();

                    mostrarNotificacion(
                        'Descargando actualización...',
                        'info'
                    );

                    addLog(
                        '⬇ Descargando actualización...',
                        'info'
                    );

                }
            );

    }

    // ==========================================
    // EVENTOS UPDATE
    // ==========================================

    ipcRenderer.on(
        'update_available',
        () => {

            mostrarModalActualizacion();

        }
    );

    ipcRenderer.on(
        'update_not_available',
        () => {

            mostrarNotificacion(
                'Sin actualizaciones.',
                'success'
            );

        }
    );

    ipcRenderer.on(
        'update_downloaded',
        () => {

            mostrarNotificacion(
                'Actualización descargada. Reiniciando...',
                'success'
            );

        }
    );

    console.log(
        "🎮 Todos los sistemas están listos"
    );

});

// HASH
window.addEventListener(
    'hashchange',
    () => {

        const hash =
            window.location.hash.substring(1);

        const menuItem =
            document.querySelector(
                `.menu-item[data-section="${hash}"]`
            );

        if (menuItem) {

            menuItem.click();

        }

    }
);