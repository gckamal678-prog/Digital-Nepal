// Global App Configuration & Settings Bridge
const GlobalSettings = {
    // Get setting value from localStorage with defaults
    get(key, defaultValue = null) {
        return localStorage.getItem(key) !== null ? localStorage.getItem(key) : defaultValue;
    },

    // Set setting value to localStorage
    set(key, value) {
        localStorage.setItem(key, value);
        this.applyToDocument();
    },

    // Get active currency symbol
    getCurrencySymbol() {
        const curr = this.get('currency', 'NPR');
        return curr === 'INR' ? '₹' : 'Rs';
    },

    // Format money/amount with current currency
    formatAmount(amount) {
        const symbol = this.getCurrencySymbol();
        const num = parseFloat(amount || 0).toLocaleString();
        return `${symbol} ${num}`;
    },

    // Apply global settings (Theme, Font, Language, Effects) to the current page instantly
    applyToDocument() {
        // 1. Theme (Dark / Light)
        const theme = this.get('theme', 'dark');
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // 2. Font Size (Matched with settings.html options: small, normal, extra)
        const fontSize = this.get('font_size', 'normal');
        if (fontSize === 'small') {
            document.documentElement.style.fontSize = '14px';
        } else if (fontSize === 'extra' || fontSize === 'large') {
            document.documentElement.style.fontSize = '20px';
        } else {
            document.documentElement.style.fontSize = '16px';
        }

        // Apply body-level styles once DOM is available
        const applyBodyStyles = () => {
            if (!document.body) return;

            // 3. Font Family
            const fontFamily = this.get('font_family', 'Canva Sans');
            document.body.style.fontFamily = `'${fontFamily}', sans-serif`;

            // 4. Font Style (Normal, Bold, Italic)
            const fontStyle = this.get('font_style', 'normal');
            if (fontStyle === 'bold') {
                document.body.style.fontWeight = '700';
                document.body.style.fontStyle = 'normal';
            } else if (fontStyle === 'italic') {
                document.body.style.fontWeight = '400';
                document.body.style.fontStyle = 'italic';
            } else {
                document.body.style.fontWeight = '400';
                document.body.style.fontStyle = 'normal';
            }

            // 5. Text Effects (Shadow, Outline, Background, Hollow)
            const textEffect = this.get('text_effect', 'none');
            document.body.style.textShadow = '';
            document.body.style.backgroundColor = '';
            document.body.style.webkitTextStroke = '';
            document.body.style.color = '';

            if (textEffect === 'shadow') {
                document.body.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';
            } else if (textEffect === 'outline') {
                document.body.style.webkitTextStroke = '0.5px currentColor';
            } else if (textEffect === 'background') {
                document.body.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
            } else if (textEffect === 'hollow') {
                document.body.style.webkitTextStroke = '1px currentColor';
                document.body.style.color = 'transparent';
            }
        };

        if (document.body) {
            applyBodyStyles();
        } else {
            document.addEventListener('DOMContentLoaded', applyBodyStyles);
        }

        // 6. Card Shape / Border Radius
        const cardShape = this.get('card_shape', 'rounded-2xl');
        window.currentCardShape = cardShape;
    },

    // Universal Translation Helper
    translate(key, dictionary) {
        const lang = this.get('language', 'en');
        if (dictionary && dictionary[lang] && dictionary[lang][key]) {
            return dictionary[lang][key];
        }
        if (dictionary && dictionary['en'] && dictionary['en'][key]) {
            return dictionary['en'][key];
        }
        return key;
    }
};

// Auto-apply settings as soon as the script is loaded
GlobalSettings.applyToDocument();

// Re-apply when DOM is fully loaded to ensure body styles attach correctly
document.addEventListener('DOMContentLoaded', () => {
    GlobalSettings.applyToDocument();
});

// Listen to storage changes across tabs/pages for real-time sync
window.addEventListener('storage', (e) => {
    GlobalSettings.applyToDocument();
    if (typeof window.onSettingsChanged === 'function') {
        window.onSettingsChanged(e);
    }
});
