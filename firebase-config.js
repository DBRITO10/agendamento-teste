// Importe as funções necessárias dos SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Sua configuração do aplicativo web do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBSLPFwZT68GiwrKNtkPIgPB-7ybXtPTJo",
  authDomain: "teste-de-agendamento-f96f9.firebaseapp.com",
  projectId: "teste-de-agendamento-f96f9",
  storageBucket: "teste-de-agendamento-f96f9.firebasestorage.app",
  messagingSenderId: "1053441936208",
  appId: "1:1053441936208:web:33e4195f5a51f510647a55"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Inicialize os serviços que você vai usar
const auth = getAuth(app);
const db = getFirestore(app);

// Exporte as instâncias para que outros arquivos possam usá-las
export { auth, db };
