// Firebase se inicializa con variables de entorno (.env)
//
// Pasos para configurar:
// 1. Ir a https://console.firebase.google.com/ y crear un proyecto
// 2. En el proyecto: Project Settings > General > Your apps > Add app (Web)
// 3. Copiar los valores al archivo .env (usa .env.example como plantilla)
// 4. En Firebase Console habilita: Authentication > Sign-in method > Google
// 5. En Firebase Console habilita: Firestore Database (modo producción)
// 6. En Firestore, agregarr estas reglas en la pestaña "Rules":
//
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /users/{userId}/{document=**} {
//          allow read, write: if request.auth != null && request.auth.uid == userId;
//        }
//        match /reviews/{reviewId} {
//          allow read: if true;
//          allow write: if request.auth != null;
//        }
//      }
//    }

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)

export default app
