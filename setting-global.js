// ==========================================
// Global Settings & Firebase Family Ledger Manager
// ==========================================

const GlobalSettings = {
    // Retrieve data from local storage
    get(key, defaultValue) {
        return localStorage.getItem(key) || defaultValue;
    },

    // Save data to local storage
    set(key, value) {
        localStorage.setItem(key, value);
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

        // 2. Font Size
        const fontSize = this.get('font_size', 'normal');
        if (fontSize === 'small') {
            document.documentElement.style.fontSize = '14px';
        } else if (fontSize === 'extra' || fontSize === 'large') {
            document.documentElement.style.fontSize = '20px';
        } else {
            document.documentElement.style.fontSize = '16px';
        }

        // Function to set body styles
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

// Automatically apply global settings as soon as the page loads
document.addEventListener("DOMContentLoaded", () => {
    GlobalSettings.applyToDocument();
});


// ==========================================
// QR Scanner & Camera Management Functions
// ==========================================

// 1. Function to scan using the live camera
function startCameraScanner() {
    if (typeof Html5Qrcode === 'undefined') {
        if (typeof showToast === 'function') showToast("QR scanner library is not loaded!", "error");
        return;
    }

    const html5QrCode = new Html5Qrcode("qr-reader");
    
    html5QrCode.start(
        { facingMode: "environment" }, // Use the back camera
        {
            fps: 10,
            qrbox: { width: 200, height: 200 }
        },
        async (decodedText, decodedResult) => {
            // Runs when the scan is successful
            if (typeof verifyAndConnect === 'function') {
                const result = await verifyAndConnect(decodedText);
                if (typeof showToast === 'function') {
                    showToast(result.message, result.success ? "success" : "error");
                }
            }
            try {
                await html5QrCode.stop(); // Stop the camera after a successful scan
            } catch(e) {}
        },
        (errorMessage) => {
            // Minor scan errors can be ignored during active scanning
        }
    ).catch((err) => {
        if (typeof showToast === 'function') {
            showToast("Unable to open the camera or permission denied.", "error");
        }
    });
}

// 2. Function to upload and scan an image from the gallery
async function scanQrFromGallery(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (typeof Html5Qrcode === 'undefined') {
        if (typeof showToast === 'function') showToast("QR scanner library is not loaded!", "error");
        return;
    }

    const html5QrCode = new Html5Qrcode("qr-reader");
    
    try {
        const decodedText = await html5QrCode.scanFile(file, true);
        // Runs when the QR code inside the photo is successfully read
        if (typeof verifyAndConnect === 'function') {
            const result = await verifyAndConnect(decodedText);
            if (typeof showToast === 'function') {
                showToast(result.message, result.success ? "success" : "error");
            }
        }
    } catch(err) {
        if (typeof showToast === 'function') {
            showToast("No clear QR code found in this image!", "error");
        }
    }
}
