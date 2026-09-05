    // Apply global settings (Theme, Font, Language, Effects) to the current page instantly
    applyToDocument() {
        // १. थिम (Dark / Light) - यो HTML मा लागु हुन्छ, त्यसैले body नभए पनि काम गर्छ
        const theme = this.get('theme', 'dark');
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // २. फन्ट साइज
        const fontSize = this.get('font_size', 'normal');
        if (fontSize === 'small') {
            document.documentElement.style.fontSize = '14px';
        } else if (fontSize === 'extra' || fontSize === 'large') {
            document.documentElement.style.fontSize = '20px';
        } else {
            document.documentElement.style.fontSize = '16px';
        }

        // Body स्टाइलहरू सेट गर्ने फंक्सन
        const applyBodyStyles = () => {
            if (!document.body) return;

            const fontFamily = this.get('font_family', 'Canva Sans');
            document.body.style.fontFamily = `'${fontFamily}', sans-serif`;

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

        // तुरुन्तै वा DOM लोड भएपछि चलाउने
        if (document.body) {
            applyBodyStyles();
        } else {
            document.addEventListener('DOMContentLoaded', applyBodyStyles);
        }
    },
