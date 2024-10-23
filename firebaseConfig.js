  
    import { initializeApp } from 'firebase/app';
    import { getDatabase } from 'firebase/database';

    const firebaseConfig = {
        apiKey: "AIzaSyDPReLcPGn73_UNRGBEot31VfgdDSlqDec",
        authDomain: "ontravelapp.firebaseapp.com",
        databaseURL: "https://ontravelapp-default-rtdb.firebaseio.com",
        projectId: "ontravelapp",
        storageBucket: "ontravelapp.appspot.com",
        messagingSenderId: "274273968964",
        appId: "1:274273968964:web:0f69df6916b1185aa5ed11"
    };

    // Inicialize o Firebase
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    export { database };
