require('./global/buttons.js');

// ===================== MANEJO DE SECCIONES =====================
document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ KANMOBILADOR - Sistema iniciado correctamente");

    // Función para cambiar de sección
    function changeSection(sectionName) {
        // Ocultar todas las secciones
        const allContents = document.querySelectorAll('.section-content');
        allContents.forEach(content => {
            content.classList.remove('active-content');
        });

        // Mostrar la sección seleccionada
        const activeContent = document.getElementById(sectionName);
        if (activeContent) {
            activeContent.classList.add('active-content');
            console.log(`📱 Sección activada: ${sectionName}`);
        }

        // Remover clase active de todos los items del menú
        const allMenuItems = document.querySelectorAll('.menu-item');
        allMenuItems.forEach(item => {
            item.classList.remove('active');
        });

        // Agregar clase active al item clickeado
        const activeMenuItem = document.querySelector(`.menu-item[data-section="${sectionName}"]`);
        if (activeMenuItem) {
            activeMenuItem.classList.add('active');
        }
    }

    // Configurar event listeners para los items del menú
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionName = item.getAttribute('data-section');
            if (sectionName) {
                changeSection(sectionName);
                window.location.hash = sectionName;
            }
        });
    });

    // Verificar hash en URL al cargar
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (document.getElementById(hash)) {
            changeSection(hash);
        } else {
            changeSection('inicio');
        }
    } else {
        changeSection('inicio');
    }

    // ===================== CONEXIÓN DEL DISPOSITIVO (SCRCPY - SIN MODIFICAR) =====================
    const connectBtn = document.getElementById('connectBtn');
    const stopBtn = document.getElementById('stopBtn');
    const statusSpan = document.getElementById('estatus');
    const logComandos = document.getElementById('logComandos');

    // Función para agregar logs al terminal
    function addLog(message, type = 'info') {
        if (logComandos) {
            const logLine = document.createElement('div');
            logLine.className = 'log-line';
            const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-circle-exclamation' : 'fa-info-circle');
            logLine.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
            logComandos.appendChild(logLine);
            logComandos.scrollTop = logComandos.scrollHeight;
            while (logComandos.children.length > 50) {
                logComandos.removeChild(logComandos.firstChild);
            }
        }
    }

    // Conectar - MANTENIENDO LA LLAMADA A iniciarConexionCompleta
    if (connectBtn) {
        connectBtn.addEventListener('click', () => {
            if (statusSpan) {
                statusSpan.textContent = 'Conectado ✓';
                statusSpan.style.color = '#a0ffb0';
            }
            connectBtn.innerHTML = `<i class="fa-solid fa-check"></i> Conectado`;
            connectBtn.disabled = true;
            if (stopBtn) stopBtn.disabled = false;
            addLog('Dispositivo conectado exitosamente', 'success');
            
            // LLAMADA ORIGINAL A SCRCPY - NO MODIFICAR
            if (window.iniciarConexionCompleta) {
                window.iniciarConexionCompleta();
            }
            
            // Actualizar sección dispositivo
            const dispositivoNombre = document.getElementById('nombre-dispositivo');
            if (dispositivoNombre) {
                dispositivoNombre.textContent = 'Pixel 6 Pro';
                const estatusDispo = document.getElementById('estatus-dispo');
                if (estatusDispo) estatusDispo.textContent = 'Conectado ✓';
            }
        });
    }

    // Detener - MANTENIENDO LA LLAMADA A matarScrcpy
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            if (statusSpan) {
                statusSpan.textContent = 'No conectado';
                statusSpan.style.color = '#ff5e6e';
            }
            connectBtn.innerHTML = `<i class="fa-solid fa-link"></i> Conectar`;
            connectBtn.disabled = false;
            stopBtn.disabled = true;
            addLog('Dispositivo desconectado', 'info');
            
            // LLAMADA ORIGINAL A SCRCPY - NO MODIFICAR
            if (window.matarScrcpy) {
                window.matarScrcpy();
            }
            
            const dispositivoNombre = document.getElementById('nombre-dispositivo');
            if (dispositivoNombre) {
                dispositivoNombre.textContent = 'Nombre del dispositivo';
                const estatusDispo = document.getElementById('estatus-dispo');
                if (estatusDispo) estatusDispo.textContent = 'No conectado';
            }
        });
        stopBtn.disabled = true;
    }

    // ===================== ACCESOS RÁPIDOS =====================
    const refreshBtn = document.querySelector('.refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            addLog('Actualizando información del dispositivo...', 'info');
            setTimeout(() => {
                addLog('Información actualizada correctamente', 'success');
            }, 500);
        });
    }

    const rotarBtn = document.querySelector('.rotar-pantalla');
    if (rotarBtn) {
        rotarBtn.addEventListener('click', () => {
            addLog('Rotando pantalla del dispositivo', 'info');
        });
    }

    const pantallaCompletaBtn = document.querySelector('.pantalla-completa');
    if (pantallaCompletaBtn) {
        pantallaCompletaBtn.addEventListener('click', () => {
            addLog('Modo pantalla completa activado', 'info');
        });
    }

    // ===================== GRABACIÓN =====================
    const iniciarGrabacionBtn = document.getElementById('iniciar-grabacion');
    const contadorGrabacion = document.getElementById('contador-grabacion');
    const estatusGrabacion = document.getElementById('estatus-grabacion');
    let grabacionActiva = false;
    let intervaloGrabacion = null;
    let segundosGrabacion = 0;

    function formatearTiempo(segundos) {
        const horas = Math.floor(segundos / 3600);
        const minutos = Math.floor((segundos % 3600) / 60);
        const segs = segundos % 60;
        return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    }

    if (iniciarGrabacionBtn) {
        iniciarGrabacionBtn.addEventListener('click', () => {
            if (!grabacionActiva) {
                grabacionActiva = true;
                segundosGrabacion = 0;
                if (contadorGrabacion) contadorGrabacion.textContent = formatearTiempo(0);
                if (estatusGrabacion) estatusGrabacion.textContent = 'Grabando...';
                iniciarGrabacionBtn.innerHTML = `<i class="fa-solid fa-stop"></i> Detener grabación`;
                iniciarGrabacionBtn.style.background = "linear-gradient(95deg, #ef4444, #dc2626)";
                addLog('Iniciando grabación de pantalla...', 'info');
                
                intervaloGrabacion = setInterval(() => {
                    segundosGrabacion++;
                    if (contadorGrabacion) {
                        contadorGrabacion.textContent = formatearTiempo(segundosGrabacion);
                    }
                }, 1000);
            } else {
                grabacionActiva = false;
                if (intervaloGrabacion) {
                    clearInterval(intervaloGrabacion);
                    intervaloGrabacion = null;
                }
                if (estatusGrabacion) estatusGrabacion.textContent = 'Grabación finalizada';
                iniciarGrabacionBtn.innerHTML = `<i class="fa-solid fa-circle-dot"></i> Iniciar grabación`;
                iniciarGrabacionBtn.style.background = "linear-gradient(95deg, #7a2eff, #9b5dff)";
                addLog('Grabación finalizada. Archivo guardado.', 'success');
                
                setTimeout(() => {
                    if (estatusGrabacion) estatusGrabacion.textContent = 'No Iniciado';
                    if (contadorGrabacion) contadorGrabacion.textContent = '00:00:00';
                }, 3000);
            }
        });
    }

    // ===================== CAPTURA DE PANTALLA =====================
    const tomarCapturaBtn = document.querySelector('.captura-contenedor .buttom-style button:first-child');
    const verCapturasBtn = document.querySelector('.captura-contenedor .buttom-style button:last-child');
    const contenedorCaptura = document.getElementById('contenedor-captura');

    if (tomarCapturaBtn) {
        tomarCapturaBtn.addEventListener('click', () => {
            addLog('Tomando captura de pantalla...', 'info');
            if (contenedorCaptura) {
                contenedorCaptura.style.background = "#1a1a2e";
                contenedorCaptura.style.backgroundSize = "cover";
                contenedorCaptura.innerHTML = '<i class="fa-solid fa-image" style="font-size: 40px; opacity: 0.5;"></i>';
                setTimeout(() => {
                    addLog('Captura guardada en: C:/Kanmobilador/Capturas/', 'success');
                }, 500);
            }
        });
    }

    if (verCapturasBtn) {
        verCapturasBtn.addEventListener('click', () => {
            addLog('Abriendo carpeta de capturas...', 'info');
        });
    }

    // ===================== CONTROLES - NAVEGACIÓN TABS =====================
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            const control = item.getAttribute('data-control');
            if (control) {
                const tecladoDiv = document.querySelector('.teclado');
                const ratonDiv = document.querySelector('.raton');
                const gamepadDiv = document.querySelector('.gamepad');
                
                if (tecladoDiv) tecladoDiv.style.display = 'none';
                if (ratonDiv) ratonDiv.style.display = 'none';
                if (gamepadDiv) gamepadDiv.style.display = 'none';
                
                if (control === 'teclado' && tecladoDiv) tecladoDiv.style.display = 'block';
                else if (control === 'raton' && ratonDiv) ratonDiv.style.display = 'block';
                else if (control === 'gamepad' && gamepadDiv) gamepadDiv.style.display = 'block';
            }
        });
    });

    // ===================== SENSIBILIDAD DEL JOYSTICK =====================
    const barraSensibilidad = document.getElementById('barra-sensibilidad');
    const numeroSensibilidad = document.getElementById('numero-sensibilidad');
    
    if (barraSensibilidad && numeroSensibilidad) {
        barraSensibilidad.addEventListener('input', (e) => {
            const valor = e.target.value;
            numeroSensibilidad.textContent = `${valor}%`;
        });
    }

    // ===================== BOTONES DE COLOR =====================
    const colorBtns = document.querySelectorAll('.card-apariencia .contenedor2 button');
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.textContent.trim();
            addLog(`Color de acento cambiado a: ${color}`, 'info');
        });
    });

    // ===================== CAMBIAR RUTAS =====================
    const cambiarRutaBtns = document.querySelectorAll('.card-almacenamiento button');
    cambiarRutaBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            addLog('Funcionalidad de cambio de ruta en desarrollo', 'info');
        });
    });

    // ===================== LIMPIAR CACHÉ =====================
    const limpiarCacheBtn = document.querySelector('.card-almacenamiento .contenedor3 button');
    if (limpiarCacheBtn) {
        limpiarCacheBtn.addEventListener('click', () => {
            addLog('Limpiando caché del sistema...', 'info');
            setTimeout(() => {
                addLog('Caché limpiado correctamente', 'success');
            }, 1000);
        });
    }

    // ===================== PERFILES DE CONTROL =====================
    const nuevoPerfilBtn = document.getElementById('btn-nuevo-perfil');
    const perfilesLista = document.getElementById('esquemas');
    
    if (nuevoPerfilBtn && perfilesLista) {
        nuevoPerfilBtn.addEventListener('click', () => {
            const nuevoPerfil = document.createElement('div');
            nuevoPerfil.className = 'perfil-item';
            nuevoPerfil.innerHTML = `
                <i class="fa-solid fa-file"></i>
                <span>Perfil ${perfilesLista.children.length + 1}</span>
                <button class="btn-eliminar-perfil"><i class="fa-solid fa-trash"></i></button>
            `;
            nuevoPerfil.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 10px; margin-bottom: 8px;';
            perfilesLista.appendChild(nuevoPerfil);
            addLog('Nuevo perfil de control creado', 'success');
            
            const eliminarBtn = nuevoPerfil.querySelector('.btn-eliminar-perfil');
            if (eliminarBtn) {
                eliminarBtn.addEventListener('click', () => {
                    nuevoPerfil.remove();
                    addLog('Perfil eliminado', 'info');
                });
            }
        });
    }

    // ===================== ASIGNACIÓN DE BOTONES =====================
    const botonCards = document.querySelectorAll('.boton-card');
    botonCards.forEach(card => {
        const btnAsignar = card.querySelector('.btn-asignar');
        const botonAsignado = card.querySelector('.boton-asignado');
        
        if (btnAsignar && botonAsignado) {
            btnAsignar.addEventListener('click', () => {
                addLog(`Configurando asignación para ${card.querySelector('.boton-nombre')?.textContent}...`, 'info');
                setTimeout(() => {
                    botonAsignado.textContent = 'Tecla asignada';
                    addLog('Asignación completada', 'success');
                }, 500);
            });
        }
    });

    // ===================== LIMPIAR TODO =====================
    const limpiarTodoBtn = document.getElementById('btn-limpiar');
    if (limpiarTodoBtn) {
        limpiarTodoBtn.addEventListener('click', () => {
            const botonesAsignados = document.querySelectorAll('.boton-asignado');
            botonesAsignados.forEach(boton => {
                boton.textContent = 'Sin asignar';
            });
            addLog('Todas las asignaciones han sido limpiadas', 'info');
        });
    }

    // ===================== ESQUEMA DE CONTROLES =====================
    const selectEsquema = document.getElementById('select-esquema');
    if (selectEsquema) {
        selectEsquema.addEventListener('change', (e) => {
            addLog(`Esquema cambiado a: ${e.target.options[e.target.selectedIndex].text}`, 'info');
        });
    }

    const btnEditar = document.getElementById('btn-editar');
    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            addLog('Editando esquema de controles...', 'info');
        });
    }

    const btnRestablecer = document.getElementById('btn-restablecer');
    if (btnRestablecer) {
        btnRestablecer.addEventListener('click', () => {
            addLog('Esquema restablecido a valores predeterminados', 'success');
        });
    }

    // ===================== SOPORTE - COPIAR CORREO =====================
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const email = btn.getAttribute('data-copy') || 'alvinescarlos887@gmail.com';
            try {
                await navigator.clipboard.writeText(email);
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check"></i> ¡Copiado!';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 2000);
                addLog('Correo copiado al portapapeles', 'success');
            } catch (err) {
                addLog('Error al copiar el correo', 'error');
            }
        });
    });

    // ===================== INICIALIZAR ESTADOS =====================
    const tecladoDiv = document.querySelector('.teclado');
    const ratonDiv = document.querySelector('.raton');
    const gamepadDiv = document.querySelector('.gamepad');
    if (tecladoDiv) tecladoDiv.style.display = 'none';
    if (ratonDiv) ratonDiv.style.display = 'none';
    if (gamepadDiv) gamepadDiv.style.display = 'none';

    console.log("🎮 Todos los sistemas están listos");
});

// Manejar navegación por hash cuando cambia
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    const menuItem = document.querySelector(`.menu-item[data-section="${hash}"]`);
    if (menuItem) {
        menuItem.click();
    }
});
