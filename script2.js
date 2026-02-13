(function () {
    // Función anónima para no interferir con otros scripts de la página

    // 1. Recopilar toda la información posible del entorno del usuario
    var datosVisita = {
        url_actual: window.location.href,
        referrer: document.referrer, // ¿Vino de Google? ¿De Facebook? ¿Directo?
        pantalla: {
            ancho: window.screen.width,
            alto: window.screen.height,
            orientacion: (window.screen.orientation || {}).type || 'desconocida'
        },
        sistema: {
            idioma: navigator.language || navigator.userLanguage,
            plataforma: navigator.platform, // Win32, Linux armv8, MacIntel, etc.
            cores: navigator.hardwareConcurrency || 'N/A', // Núcleos del CPU
            memoria_gb: navigator.deviceMemory || 'N/A', // RAM aproximada
            cookies_habiles: navigator.cookieEnabled
        },
        zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    // 2. Enviar los datos al archivo PHP sin que el usuario se de cuenta
    fetch('https://lacci2025.org/assets/php/collector.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosVisita)
    }).then(function (res) {
        // Datos enviados correctamente. No hacemos nada visual.
    }).catch(function (err) {
        // Si falla (ej. AdBlock muy agresivo), fallamos en silencio.
    });

})();
