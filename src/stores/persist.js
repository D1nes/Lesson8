import { applySnapshot, onSnapshot} from "mobx-state-tree";

const PERSIST_KEY = 'PERSIST'

function createPersist(store, storage) {

    async function rehydrate() {
        const snapshot = await storage.getItem(PERSIST_KEY)

        if(snapshot) {
            applySnapshot(store, JSON.parse(snapshot))
        }
    }

    function purge() {
        storage.removeItem(PERSIST_KEY)
    }

    onSnapshot(store, (snapshot) => {
        storage.setItem(PERSIST_KEY, JSON.stringify(snapshot))
    })

    return {
        rehydrate,
        purge,
    }
}

export default createPersist
