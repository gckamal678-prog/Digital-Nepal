// Firebase SDK Modules Import (CDN Version)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Your Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDY_v7RHnkCTI6uyV4DNDjqoaIBGweg8c",
  authDomain: "digital-a2552.firebaseapp.com",
  databaseURL: "https://digital-a2552-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "digital-a2552",
  storageBucket: "digital-a2552.firebasestorage.app",
  messagingSenderId: "218135618179",
  appId: "1:218135618179:web:821b76920d3e5669ac31b6"
};

// Initialize Firebase & Database
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 1. Function to backup (save) data to the cloud
export async function backupToCloud(userId = "default_user") {
    try {
        const localData = {
            notes: JSON.parse(localStorage.getItem('advanced_notebook_notes') || '[]'),
            theme: localStorage.getItem('theme') || 'dark',
            language: localStorage.getItem('language') || 'en',
            currency: localStorage.getItem('currency') || 'NPR',
            updatedAt: new Date().toISOString()
        };

        await set(ref(db, 'users/' + userId), localData);
        return { success: true, message: "Data successfully saved to the cloud!" };
    } catch (error) {
        console.error("Cloud Backup Error:", error);
        return { success: false, message: error.message };
    }
}

// 2. Function to retrieve (restore/sync) data from the cloud
export async function restoreFromCloud(userId = "default_user") {
    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `users/${userId}`));
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            if (data.notes) localStorage.setItem('advanced_notebook_notes', JSON.stringify(data.notes));
            if (data.theme) localStorage.setItem('theme', data.theme);
            if (data.language) localStorage.setItem('language', data.language);
            if (data.currency) localStorage.setItem('currency', data.currency);
            
            return { success: true, message: "Data successfully synced from the cloud!" };
        } else {
            return { success: false, message: "No backup found in the cloud!" };
        }
    } catch (error) {
        console.error("Cloud Restore Error:", error);
        return { success: false, message: error.message };
    }
}

// 3. Function for admin to create a QR code valid for 5 minutes
export async function generateSecureFamilyQR(adminUid) {
    try {
        const expiryTime = Date.now() + (5 * 60 * 1000); // Adding 5 minutes to the current time
        
        // Save expiry time in Firebase
        await set(ref(db, 'users/' + adminUid + '/security/qrToken'), {
            exp: expiryTime
        });

        // Data package to create the QR code
        const securePayload = JSON.stringify({ uid: adminUid, exp: expiryTime });
        
        // Clear the QR display area and generate a new one
        const qrcodeElement = document.getElementById("qrcode");
        if (qrcodeElement) {
            qrcodeElement.innerHTML = "";
            new QRCode(qrcodeElement, {
                text: securePayload,
                width: 160,
                height: 160
            });
        }
        
        return { success: true, message: "Secure QR generated for 5 minutes!" };
    } catch (error) {
        console.error("QR Gen Error:", error);
        return { success: false, message: error.message };
    }
}

// 4. Function for family member to scan or verify the QR code
export async function verifyAndConnect(scannedPayload) {
    try {
        const data = JSON.parse(scannedPayload);
        const adminUid = data.uid;
        const qrExpiryTime = data.exp;
        
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `users/${adminUid}/security/qrToken`));
        
        if (!snapshot.exists()) {
            return { success: false, message: "Invalid QR code!" };
        }
        
        const serverData = snapshot.val();
        const currentTime = Date.now();
        
        // Check if time has expired
        if (currentTime > qrExpiryTime || currentTime > serverData.exp) {
            return { success: false, message: "This QR code has expired! Please request a new code for security." };
        }
        
        // If everything is correct, connect the ledger
        localStorage.setItem('connectedFamilyKey', adminUid);
        return { success: true, message: "Successfully connected to the family ledger!" };

    } catch (e) {
        console.error("Verify Error:", e);
        return { success: false, message: "This is an incorrect QR code!" };
    }
}
