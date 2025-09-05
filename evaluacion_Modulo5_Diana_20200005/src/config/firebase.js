import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// Para Expo, AsyncStorage ya está incluido automáticamente
import { API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID } from '@env';

// Configuración de Firebase para Expo
const firebaseConfig = {
    apiKey: API_KEY,
    authDomain: AUTH_DOMAIN,
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
    messagingSenderId: MESSAGING_SENDER_ID,
    appId: APP_ID
};

console.log("Valor de configuración Firebase:", firebaseConfig);

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios (Expo maneja la persistencia automáticamente)
const database = getFirestore(app);
const auth = getAuth(app);

console.log('Firebase inicializado para Expo');
console.log('Auth disponible:', !!auth);
console.log('Database disponible:', !!database);

export { database, auth };