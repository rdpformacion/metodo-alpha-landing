/* ═══════════════════════════════════════════════════════════
   📊 MÉTODO ALPHA · Tracking Propagator
   ═══════════════════════════════════════════════════════════
   Para la LANDING (metodoalphardp.netlify.app)
   
   Lee los UTMs y otros parámetros de tracking de la URL actual,
   y los añade automáticamente a todos los enlaces que llevan
   a la app (elrincondelpolicia.app).
   
   Así, cuando el alumno pulsa "Probar gratis" o cualquier CTA
   hacia la app, los UTMs viajan con él y la app puede atribuir
   correctamente la conversión a la campaña original.
   
   INSTALACIÓN:
   1. Subir este archivo a Netlify (raíz del sitio).
   2. Añadir <script src="/tracking-propagator.js" defer></script>
      en el <head> o antes de </body> del index.html.
   3. Desplegar.
   ═══════════════════════════════════════════════════════════ */
'use strict';
(function() {
    const TRACKING_PARAMS = [
        'utm_source', 'utm_medium', 'utm_campaign',
        'utm_content', 'utm_term',
        'fbclid', 'fbc', 'fbp', 'gclid'
    ];
    
    // Dominios destino donde propagar los UTMs (la app)
    const DOMINIOS_APP = [
        'elrincondelpolicia.app',
        'www.elrincondelpolicia.app'
    ];
    
    function log(...a) { console.log('[tracking-propagator]', ...a); }
    
    // ─────────────────────────────────────────────
    // 1. Leer UTMs de la URL actual
    // ─────────────────────────────────────────────
    function obtenerTrackingDeURL() {
        try {
            const params = new URLSearchParams(window.location.search);
            const tracking = {};
            TRACKING_PARAMS.forEach(key => {
                const v = params.get(key);
                if (v) tracking[key] = v;
            });
            return tracking;
        } catch (e) {
            return {};
        }
    }
    
    // ─────────────────────────────────────────────
    // 2. Persistir UTMs en localStorage para
    //    sobrevivir a navegación dentro de la landing
    //    (si el usuario va de /home a /precios y luego al CTA)
    // ─────────────────────────────────────────────
    const STORAGE_KEY = 'tracking_landing';
    
    function leerTrackingPersistido() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }
    
    function guardarTracking(tracking) {
        try {
            // Añadir timestamp para debugging
            tracking._capturado_en = Date.now();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tracking));
        } catch (e) {}
    }
    
    // ─────────────────────────────────────────────
    // 3. Consolidar: URL + persistido (URL tiene prioridad)
    // ─────────────────────────────────────────────
    function consolidarTracking() {
        const persistido = leerTrackingPersistido();
        const url = obtenerTrackingDeURL();
        
        // Mergear: persistido + URL (URL pisa)
        const final = Object.assign({}, persistido, url);
        delete final._capturado_en;
        
        return final;
    }
    
    // ─────────────────────────────────────────────
    // 4. Propagar a todos los <a> que apunten a la app
    // ─────────────────────────────────────────────
    function propagarEnLinks(tracking) {
        if (!tracking || Object.keys(tracking).length === 0) return 0;
        
        const links = document.querySelectorAll('a[href]');
        let propagados = 0;
        
        links.forEach(link => {
            try {
                const href = link.getAttribute('href');
                if (!href || href.startsWith('#') || href.startsWith('javascript:')
                    || href.startsWith('mailto:') || href.startsWith('tel:')) return;
                
                // Resolver URL relativa o absoluta
                const url = new URL(href, window.location.href);
                
                // Solo propagar a dominios de la app
                if (!DOMINIOS_APP.includes(url.hostname)) return;
                
                // Añadir cada UTM (sin sobrescribir si ya está puesto a mano)
                Object.keys(tracking).forEach(key => {
                    if (!url.searchParams.has(key)) {
                        url.searchParams.set(key, tracking[key]);
                    }
                });
                
                link.setAttribute('href', url.toString());
                propagados++;
            } catch (e) {}
        });
        
        return propagados;
    }
    
    // ─────────────────────────────────────────────
    // INIT
    // ─────────────────────────────────────────────
    function init() {
        const trackingURL = obtenerTrackingDeURL();
        
        // Si llegamos con UTMs nuevos en la URL, persistirlos
        if (Object.keys(trackingURL).length > 0) {
            guardarTracking(trackingURL);
            log('UTMs nuevos detectados y guardados:', trackingURL);
        }
        
        // Consolidar y propagar
        const tracking = consolidarTracking();
        if (Object.keys(tracking).length === 0) {
            log('Sin tracking activo, no hay nada que propagar');
            return;
        }
        
        const propagados = propagarEnLinks(tracking);
        log(`✅ Tracking propagado a ${propagados} enlaces de la app`);
        
        // Vigilar cambios dinámicos (por si la landing usa SPA, lazy loading, etc.)
        try {
            const observer = new MutationObserver(() => {
                propagarEnLinks(tracking);
            });
            observer.observe(document.body, { childList: true, subtree: true });
        } catch (e) {}
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Exponer API para debug
    window.TrackingPropagator = {
        get: consolidarTracking,
        clear: () => localStorage.removeItem(STORAGE_KEY),
        propagar: () => propagarEnLinks(consolidarTracking())
    };
})();
