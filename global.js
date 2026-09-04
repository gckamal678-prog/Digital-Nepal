// global-settings.js - Centralized Theme, Typography, Font Style, and Settings Bridge
class GlobalSettingsManager {
    constructor() {
        this.init();
    }

    init() {
        // Apply saved settings immediately on script load
        this.applyAll();
        
        // Listen for storage changes across tabs/pages
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('app_')) {
                this.applyAll();
            }
        });
    }

    get(key, defaultValue) {
        const val = localStorage.getItem('app_' + key);
        return val !== null ? val : defaultValue;
    }

    set(key, value) {
        localStorage.setItem('app_' + key, value);
        this.applyAll();
    }

    applyAll() {
        this.applyTheme();
        this.applyTypography();
    }

    applyTheme() {
        const theme = this.get('theme', 'dark');
        const htmlEl = document.documentElement;
        if (theme === 'light') {
            htmlEl.classList.remove('dark');
            htmlEl.classList.add('light');
        } else {
            htmlEl.classList.remove('light');
            htmlEl.classList.add('dark');
        }
    }

    applyTypography() {
        const fontSize = this.get('font_size', 'normal');
        const fontFamily = this.get('font_family', 'Canva Sans');
        const fontStyle = this.get('font_style', 'normal');
        const textEffect = this.get('text_effect', 'normal');

        // Apply styles to document body or root container
        document.body.style.fontFamily = `'${fontFamily}', sans-serif`;
        
        // Font Size handling
        let sizeClass = 'text-xs';
        if (fontSize === 'small') sizeClass = 'text-[10px]';
        if (fontSize === 'extra') sizeClass = 'text-sm';
        
        // Font Style handling (normal, bold, italic)
        document.body.style.fontWeight = fontStyle === 'bold' ? '700' : '400';
        document.body.style.fontStyle = fontStyle === 'italic' ? 'italic' : 'normal';

        // Optional Text Effects custom CSS injection
        let customStyleEl = document.getElementById('global-text-effects');
        if (!customStyleEl) {
            customStyleEl = document.createElement('style');
            customStyleEl.id = 'global-text-effects';
            document.head.appendChild(customStyleEl);
        }

        if (textEffect === 'shadow') {
            customStyleEl.innerHTML = `body { text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }`;
        } else if (textEffect === 'outline') {
            customStyleEl.innerHTML = `body { -webkit-text-stroke: 0.5px rgba(99, 102, 241, 0.5); }`;
        } else if (textEffect === 'background') {
            customStyleEl.innerHTML = `body { background-image: radial-gradient(circle, rgba(99,102,241,0.05) 10%, transparent 10%); background-size: 16px 16px; }`;
        } else if (textEffect === 'hollow') {
            customStyleEl.innerHTML = `body { color: transparent; -webkit-text-stroke: 1px currentColor; }`;
        } else {
            customStyleEl.innerHTML = ``;
        }
    }
}

// Initialize Global Settings instance globally
const GlobalSettings = new GlobalSettingsManager();
