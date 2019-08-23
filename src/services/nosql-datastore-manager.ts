import firebase from 'firebase/app';
import 'firebase/firestore';

export class NosqlDatastoreManager {
    private db: firebase.firestore.Firestore;

    constructor() {
        const firebaseConfig = {
            apiKey: "AIzaSyBw73BRk-qWeZm-fp3-Ijf7s0EemdaWuCQ",
            authDomain: "selecquest.firebaseapp.com",
            databaseURL: "https://selecquest.firebaseio.com",
            projectId: "selecquest",
            storageBucket: "selecquest.appspot.com",
            messagingSenderId: "434339253679"
        };
        firebase.initializeApp(firebaseConfig);
        this.db = firebase.firestore();
        this.db.enablePersistence({synchronizeTabs: true})
            .catch((err) => {
                console.log(err);
            });
    }

    async getDocument(collectionName, docName) {
        const doc = this.db.collection(collectionName).doc(docName).get()
            .then(result => {
                return result.exists ? result.data() : null;
            })
        return doc;
    }

    watchDocument(collectionName, docName, callback) {
        return this.db.collection(collectionName).doc(docName).onSnapshot(result => {
            result.exists ? callback(result.data()) : callback(null);
        });
    }
}