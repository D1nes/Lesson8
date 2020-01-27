import {flow, getRoot, types as t} from 'mobx-state-tree'
import uuid from 'uuid/v4'
import Api from "../../api/Api";

export const TodoModel = t
    .model("TodoModel",{
        id: t.identifier,
        title: t.string,
        isCompleted: t.optional(t.boolean, false),
        isFavorite: t.optional(t.boolean, false),
        isTogglingFavorite: false,
        isTogglingFavoriteError: false,
        isSendind: false,
        isSendingError: false
    })
    .actions((store) => ({
        send: flow(function* send() {
            store.isSending = true
            store.isSendingError = false

            try {
                const todo = yield Api.Todos.add(store)
                store.isSending = false

                getRoot(store).todos.replaceItem(todo.id, todo)
            } catch (error) {
                console.log(error)
                store.isSendingError = true
                store.isSending = false
            }
        }),

        toggleCompleted() {
            store.isCompleted = !store.isCompleted
            console.log('ok')
        },
        toggleFavorite: flow(function* toggleFavorite() {
            const oldValue = store.isFavorite

            store.isTogglingFavorite = true
            store.isTogglingFavoriteError = false
            store.isFavorite = !store.isFavorite

            try {
                yield Api.Todos.update({id: store.id, isFavorite: store.isFavorite })
                console.log('success')

            } catch (error) {
                console.log(error)
                store.isTogglingFavorite = true
                store.isFavorite = oldValue
            } finally {
                store.isTogglingFavorite = true
            }
        })
    }))

export const TodoListModel = t
    .model("TodoListModel",{
        list: t.array(TodoModel),
        isLoading: false,
        isLoadingError: false

    })
    .views((store) => ({
        get favoriteList() {
            return store.list.filter(item => item.isFavorite)
        }
    }))
    .actions((store) => ({
        add: flow(function* add(title) {
            const todo = TodoModel.create({
                id: uuid(),
                title
            })

            store.list.unshift(todo)

            yield todo.send()
        }),

        replaceItem(id, todo) {
            const index = store.list.findIndex(item => item.id === id)

            if(index > -1 ) {
                store.list[index] = todo
            }
        },

        getTodos: flow(function* getTodos() {
            store.isLoading = true
            store.isLoadingError = false

            try {
                const todos = yield Api.Todos.getAll()
                store.onLoadingTodosSuccess(todos)

            } catch (error) {
                console.log(error)
                store.onLoadingTodosError()
            } finally {
                store.isLoading = false
            }
        }),

        onLoadingTodosSuccess(groups) {
            store.list = groups
            store.isLoading = false
        },
        onLoadingTodosError() {
            store.isLoadingError = true
            store.isLoading = false
        }
    }))

