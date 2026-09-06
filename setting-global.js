// ==========================================
// Global Settings & Firebase Family Ledger Manager
// ==========================================

const GlobalSettings = {
    // लोकल स्टोरेजबाट डाटा तान्ने
    get(key, defaultValue) {
        return localStorage.getItem(key) || defaultValue;
    },

    // लोकल स्टोरेजमा डाटा राख्ने
    set(key, value) {
        localStorage.setItem(key, value);
    },

    // Apply global settings (Theme, Font, Language, Effects) to the current page instantly
    applyToDocument() {
        // १. थिम (Dark / Light)
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

            const fontFamily = this.get('font_family', 'Poppins');
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

        if (document.body) {
            applyBodyStyles();
        } else {
            document.addEventListener('DOMContentLoaded', applyBodyStyles);
        }
    }
};

// पेज लोड हुनेबित्तिकै ग्लोबल सेटिङहरू स्वतः लागू गर्ने
document.addEventListener("DOMContentLoaded", () => {
    GlobalSettings.applyToDocument();
});


// ==========================================
// QR Scanner & Camera Management Functions
// ==========================================

// १. लाइभ क्यामेराबाट स्क्यान गर्ने फंक्सन
function startCameraScanner() {
    if (typeof Html5Qrcode === 'undefined') {
        if (typeof showToast === 'function') showToast("QR स्क्यानर लाइब्ररी लोड भएको छैन!", "error");
        return;
    }

    const html5QrCode = new Html5Qrcode("qr-reader");
    
    html5QrCode.start(
        { facingMode: "environment" }, // पछाडिको क्यामेरा प्रयोग गर्ने
        {
            fps: 10,
            qrbox: { width: 200, height: 200 }
        },
        async (decodedText, decodedResult) => {
            // स्क्यान सफल भएपछि यो चल्छ
            if (typeof verifyAndConnect === 'function') {
                const result = await verifyAndConnect(decodedText);
                if (typeof showToast === 'function') {
                    showToast(result.message, result.success ? "success" : "error");
                }
            }
            try {
                await html5QrCode.stop(); // स्क्यान भएपछि क्यामेरा बन्द गर्ने
            } catch(e) {}
        },
        (errorMessage) => {
            // स्क्यान हुँदै गर्दाका सामान्य इररहरू (वा बेवास्ता गर्ने)
        }
    ).catch((err) => {
        if (typeof showToast === 'function') {
            showToast("क्या메라 खोल्न सकिएन वा अनुमति मिलेन।", "error");
        }
    });
}

// २. ग्यालरीबाट फोटो अपलोड गरेर स्क्यान गर्ने फंक्सन
async function scanQrFromGallery(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (typeof Html5Qrcode === 'undefined') {
        if (typeof showToast === 'function') showToast("QR स्क्यानर लाइब्ररी लोड भएको छैन!", "error");
        return;
    }

    const html5QrCode = new Html5Qrcode("qr-reader");
    
    try {
        const decodedText = await html5QrCode.scanFile(file, true);
        // फोटोभित्रको QR सफल रूपमा पढेपछि यो चल्छ
        if (typeof verifyAndConnect === 'function') {
            const result = await verifyAndConnect(decodedText);
            if (typeof showToast === 'function') {
                showToast(result.message, result.success ? "success" : "error");
            }
        }
    } catch(err) {
        if (typeof showToast === 'function') {
            showToast("यो फोटोमा स्पष्ट QR कोड फेला परेन!", "error");
        }
    }
}
