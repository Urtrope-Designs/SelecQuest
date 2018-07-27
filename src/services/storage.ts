import LocalForage from 'localforage';
import CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
 
export default class Storage {
 
    dbPromise;
 
    constructor(){
 
        this.dbPromise = new Promise((resolve, reject) => {
 
            let db;
 
            let config = {
                name: '_selecqueststorage',
                storeName: '_selecquestkv',
                driverOrder: ['sqlite', 'indexeddb', 'websql', 'localstorage']
            }
 
            LocalForage.defineDriver(CordovaSQLiteDriver).then(() => {
                db = LocalForage.createInstance(config);
            })
                .then(() => db.setDriver(this.getDriverOrder(config.driverOrder)))
                .then(() => {
                    resolve(db);
                })
                .catch(reason => reject(reason));
 
        }); 
    }
 
    ready(): Promise<any> {
        return this.dbPromise;
    }
 
    getDriverOrder(driverOrder){
 
        return driverOrder.map((driver) => {
 
            switch(driver){
                case 'sqlite':
                    return CordovaSQLiteDriver._driver;
                case 'indexeddb':
                    return LocalForage.INDEXEDDB;
                case 'websql':
                    return LocalForage.WEBSQL;
                case 'localstorage':
                    return LocalForage.LOCALSTORAGE;
            }
 
        });
 
    }
 
    get(key: string): Promise<any> {
        return this.dbPromise.then(db => db.getItem(key));
    }
 
    set(key: string, value: any): Promise<any> {
        return this.dbPromise.then(db => db.setItem(key, value));
    }
 
    remove(key: string): Promise<any> {
        return this.dbPromise.then(db => db.removeItem(key));
    }
 
    clear(): Promise<any> {
        return this.dbPromise.then(db => db.clear());
    }
 
}