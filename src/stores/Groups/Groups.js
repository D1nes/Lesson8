import {types as t, flow, getRoot} from 'mobx-state-tree'
import { TodoModel } from "../Todo/Todo";
import uuid from "uuid/v4";
import Api from "../../api/Api"

const GroupModel = t
    .model("GroupModel",{
        id: t.string,
        title: t.string,
        todos: t.array(t.reference(TodoModel)),
        isSending: false,
        isSendingError: false
    })
    .actions((store) => ({
        send: flow(function* send() {
            store.isSending = true
            store.isSendingError = false

            try {
                const group = yield Api.Groups.add(store)
                group.isSending = false

                getRoot(store).groups.replaceItem(store.id, group)

                console.log('success')
            } catch (error) {
                console.log(error)
                store.isSendingError = true
                store.isSending = false
            }
        }),

        addTodo(todo) {
            store.todos.unshift(todo)
        }
    }))


export const GroupListModel = t
    .model("GroupListModel",{
        list: t.array(GroupModel),
        isLoading: false,
        isLoadingError: false
    })
    .actions((store) => ({
        add: flow(function* (title) {
            const group = GroupModel.create({
                id: uuid(),
                title
            })

            store.list.unshift(group)

            yield group.send()
        }),

        replaceItem(id, group) {
            const index = store.list.findIndex(item => item.id === id)

            if(index > -1 ) {
                store.list[index] = group
            }
        },

        getGroups: flow(function* getGroups() {
            store.isLoading = true
            store.isLoadingError = false

            try {
                const groups = yield Api.Groups.getAll()
                store.onLoadingGroupsSuccess(groups)

            } catch (error) {
                console.log(error)
                store.onLoadingGroupsError()
            } finally {
                store.isLoading = false
            }
        }),

        onLoadingGroupsSuccess(groups) {
            store.list = groups
            store.isLoading = false
        },
        onLoadingGroupsError() {
            store.isLoadingError = true
            store.isLoading = false
        }
    }))
