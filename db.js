// إعدادات الاتصال بقاعدة البيانات الخاصة بك
const firebaseConfig = {
    apiKey: "AIzaSyAALdrdgsEixMWIyDJib-sZSTzPdGqLyRA",
    authDomain: "huroufgame.firebaseapp.com",
    databaseURL: "https://huroufgame-default-rtdb.firebaseio.com", // الرابط من صورتك!
    projectId: "huroufgame",
    storageBucket: "huroufgame.firebasestorage.app",
    messagingSenderId: "664425991766",
    appId: "1:664425991766:web:b694b3010c9b6ab006f5f7"
};

// تشغيل السحر (تهيئة Firebase)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

console.log("تم الاتصال بقاعدة البيانات بنجاح! 🚀");