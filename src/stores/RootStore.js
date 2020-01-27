import {onSnapshot, types as t} from 'mobx-state-tree';
import localForage from "localforage";
import { TodoListModel } from "./Todo/Todo";
import { GroupListModel } from "./Groups/Groups";
import createPersist from "./persist";
import {autorun} from "mobx";

const RootStore = t
    .model("RootStore",{
        todos: t.optional(TodoListModel, {}),
        groups: t.optional(GroupListModel, {})
    })

const rootStore = RootStore.create({})
const persist = createPersist(rootStore, localForage)


autorun(() => persist.rehydrate())

onSnapshot(rootStore, (snapshot => console.log(snapshot)))
export default rootStore

