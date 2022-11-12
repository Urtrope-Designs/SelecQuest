import { initializeApp, setLogLevel } from 'firebase/app';
import { doc, Firestore, getDoc, getFirestore, onSnapshot } from 'firebase/firestore';

export class NosqlDatastoreManager {
    private db: Firestore;

    constructor() {
        const firebaseConfig = {
            apiKey: "AIzaSyBw73BRk-qWeZm-fp3-Ijf7s0EemdaWuCQ",
            authDomain: "selecquest.firebaseapp.com",
            databaseURL: "https://selecquest.firebaseio.com",
            projectId: "selecquest",
            storageBucket: "selecquest.appspot.com",
            messagingSenderId: "434339253679"
        };
        setLogLevel('verbose');
        const app = initializeApp(firebaseConfig);
        this.db = getFirestore(app);
        // enableIndexedDbPersistence(this.db)
        //     .catch((err) => {
        //         console.log(err);
        //     });
    }

    async getDocument(collectionName: string, docName: string) {
        const docRef = doc(this.db, collectionName, docName);
        const docSnap = await getDoc(docRef);

        return docSnap?.data();
    }

    watchDocument(collectionName: string, docName: string, callback: any) {
        return onSnapshot(doc(this.db, collectionName, docName), (result => {
            callback(result?.data());
        }));
    }
}