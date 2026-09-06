// Firebase SDK Modules Import (CDN Version)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// तपाईंको Firebase Config
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

// 1. डाटा क्लाउडमा ब्याकअप (Save) गर्ने Function
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
        return { success: true, message: "Cloud मा डाटा सफल रूपमा सेभ भयो!" };
    } catch (error) {
        console.error("Cloud Backup Error:", error);
        return { success: false, message: error.message };
    }
}

// 2. क्लाउडबाट डाटा तान्ने (Restore/Sync) गर्ने Function
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
            
            return { success: true, message: "क्लाउडबाट डाटा सफलतापुर्वक Sync भयो!" };
        } else {
            return { success: false, message: "क्लाउडमा कुनै ब्याकअप भेटिएन!" };
        }
    } catch (error) {
        console.error("Cloud Restore Error:", error);
        return { success: false, message: error.message };
    }
}

// 3. एडमिनले ५ मिनेटको म्याद भएको QR बनाउने Function
export async function generateSecureFamilyQR(adminUid) {
    try {
        const expiryTime = Date.now() + (5 * 60 * 1000); // करेन्ट समयमा ५ मिनेट थपेको
        
        // फायरबेसमा एक्सपायरी समय सेभ गर्ने
        await set(ref(db, 'users/' + adminUid + '/security/qrToken'), {
            exp: expiryTime
        });

        // QR कोड बनाउने डाटा प्याकेज
        const securePayload = JSON.stringify({ uid: adminUid, exp: expiryTime });
        
        // QR देखाउने ठाउँ खाली गरेर नयाँ बनाउने
        const qrcodeElement = document.getElementById("qrcode");
        if (qrcodeElement) {
            qrcodeElement.innerHTML = "";
            new QRCode(qrcodeElement, {
                text: securePayload,
                width: 160,
                height: 160
            });
        }
        
        return { success: true, message: "५ मिनेटको लागि सुरक्षित QR जेनेरेट भयो!" };
    } catch (error) {
        console.error("QR Gen Error:", error);
        return { success: false, message: error.message };
    }
}

// 4. परिवारको सदस्यले QR स्क्यान वा भेरिफाइ गर्ने Function
export async function verifyAndConnect(scannedPayload) {
    try {
        const data = JSON.parse(scannedPayload);
        const adminUid = data.uid;
        const qrExpiryTime = data.exp;
        
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `users/${adminUid}/security/qrToken`));
        
        if (!snapshot.exists()) {
            return { success: false, message: "अमान्य QR कोड!" };
        }
        
        const serverData = snapshot.val();
        const currentTime = Date.now();
        
        // समय नाघ्यो कि नाइँ जाँच गर्ने
        if (currentTime > qrExpiryTime || currentTime > serverData.exp) {
            return { success: false, message: "यो QR कोडको म्याद समाप्त भयो! सुरक्षाको लागि नयाँ कोड माग्नुहोस्।" };
        }
        
        // सबै ठीक छ भने लेजर जोड्ने
        localStorage.setItem('connectedFamilyKey', adminUid);
        return { success: true, message: "सफलतापूर्वक परिवारको लेजरसँग जोडियो!" };

    } catch (e) {
        console.error("Verify Error:", e);
        return { success: false, message: "यो गलत QR कोड हो!" };
    }
}
