import LocalStorage from 'localforage';
import uuid from 'uuid/v4';

const TodosApi = {
    add(body) {
        return fetchData('todos', { method: 'post', body });
    },

    remove(id) {
        return fetchData(`todos/${id}`, { method: 'delete' });
    },

    removeMany(ids) {
        return fetchData('todos/remove', { method: 'post', body: ids });
    },

    getAll() {
        return fetchData('todos');
    },

    getById(id) {
        return fetchData(`todos/${id}`);
    },

    update(id, body) {
        return fetchData(`todos/${id}`, { method: 'patch', body });
    },
};

const GroupsApi = {
    getAll() {
        return fetchData('groups');
    },

    getById(id) {
        return fetchData(`groups/${id}`);
    },

    getTodos(id) {
        return fetchData(`groups/${id}/todos`);
    },

    add(body) {
        return fetchData('groups', { method: 'post', body });
    },

    addTodo(id, body) {
        return fetchData(`groups/${id}`, { method: 'post', body });
    },

    remove(id) {
        return fetchData(`groups/${id}`, { method: 'delete' });
    },

    removeMany(ids) {
        return fetchData('groups/remove', { method: 'post', body: ids });
    },

    update(id, body) {
        return fetchData(`groups/${id}`, { method: 'patch', body });
    },
};

export default {
    Todos: TodosApi,
    Groups: GroupsApi,
};

function Todo(data) {
    return {
        id: data.id,
        title: data.title,
        isCompleted: data.isCompleted,
        isFavorite: data.isFavorite,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    };
}

function Group(data) {
    return {
        id: data.id,
        title: data.title,
        todos: data.todos || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    };
}

const methods = {
    post: 'post',
    get: 'get',
    patch: 'patch',
    delete: 'delete',
};

// LocalStorage.clear();

function saveCache(cache) {
    return LocalStorage.setItem('cache', JSON.stringify(cache));
}

async function getCache() {
    const cache = await LocalStorage.getItem('cache');

    if (!cache) {
        return {
            todos: [],
            groups: [],
        };
    }

    const parsed = JSON.parse(cache);

    if (!parsed.todos) {
        parsed.todos = [];
    }
    if (!parsed.groups) {
        parsed.groups = [];
    }

    return parsed;
}

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function randomDelay() {
    return new Promise((res) => {
        const delay = getRandomArbitrary(500, 2000);

        setTimeout(res, delay);
    });
}

function getId(endpoint) {
    return endpoint.split('/')[1];
}

async function fetchData(endpoint, options = {}) {
    if (!options.method) {
        options.method = methods.get;
    }

    // getting cached data from store
    const cache = await getCache();

    const resource = endpoint.split('/')[0];
    const handler = resource === 'todos' ? handleTodoRequest : handleGroupRequest;

    const res = await handler(endpoint, options, cache);

    await randomDelay();

    return res;
}

async function handleTodoRequest(endpoint, options, cache) {
    const id = getId(endpoint);

    switch (options.method) {
        case methods.get: {
            if (id) {
                return getTodoById(id, cache);
            }
            return getTodos(cache);
        }

        case methods.post: {
            if (endpoint === 'todos/remove') {
                return removeTodos(options, cache);
            }

            return createTodo(options, cache);
        }

        case methods.patch: {
            return updateTodo(id, options, cache);
        }

        case methods.delete: {
            return removeTodo(id, options, cache);
        }

        default:
            return cache.todos;
    }
}

async function handleGroupRequest(endpoint, options, cache) {
    const id = getId(endpoint);

    switch (options.method) {
        case methods.get: {
            const endpointParts = endpoint.split('/');
            const needTodoList = endpointParts[2] === 'todos';

            if (needTodoList) {
                return getGroupTodos(id, options, cache);
            }

            if (id) {
                return getGroupById(id, options, cache);
            }

            return getGroups(cache);
        }

        case methods.post: {
            if (endpoint === 'groups/remove') {
                return removeGroups(options, cache);
            }

            if (id) {
                return addGroupTodo(id, options, cache);
            }

            return createGroup(options, cache);
        }

        case methods.patch: {
            return updateGroup(id, options, cache);
        }

        case methods.delete: {
            return removeGroup(id, options, cache);
        }

        default:
            return cache.groups;
    }
}

// Todos methods
async function getTodos(cache) {
    return cache.todos;
}

async function getTodoById(id, cache) {
    return cache.todos.find((i) => i.id === id);
}

async function removeTodos(options, cache) {
    const newTodos = cache.todos.filter(
        (todo) => !options.body.includes(todo.id),
    );

    await saveCache({
        ...cache,
        todos: newTodos,
    });

    return { success: true };
}

async function createTodo(options, cache) {
    const timestamp = new Date().getTime();
    const newTodo = Todo({
        ...options.body,
        id: uuid(),
        createdAt: timestamp,
        updatedAt: timestamp,
    });
    const newTodos = [newTodo].concat(cache.todos);

    await saveCache({
        ...cache,
        todos: newTodos,
    });

    return newTodo;
}

async function updateTodo(id, options, cache) {
    let newTodo;

    const newTodos = cache.todos.map((todo) => {
        if (todo.id !== id) {
            return todo;
        }

        newTodo = Todo({
            ...todo,
            ...options.body,
            updatedAt: new Date().getTime(),
        });

        return newTodo;
    });

    await saveCache({
        ...cache,
        todos: newTodos,
    });

    return newTodo;
}

async function removeTodo(id, options, cache) {
    const newTodos = cache.todos.filter((todo) => todo.id !== id);

    await saveCache({
        ...cache,
        todos: newTodos,
    });

    return { success: true };
}

// Groups methods
async function getGroups(cache) {
    return cache.groups;
}

async function getGroupById(id, options, cache) {
    return cache.groups.find((i) => i.id === id);
}

async function createGroup(options, cache) {
    const timestamp = new Date().getTime();

    const todos = options.body.todos || [];

    const newGroup = Group({
        ...options.body,
        todos: todos.map((item) => item.id || item),
        id: uuid(),
        createdAt: timestamp,
        updatedAt: timestamp,
    });
    const newGroups = [newGroup].concat(cache.groups);

    const newCache = {
        ...cache,
        groups: newGroups,
    };

    await saveCache(newCache);

    return newGroup;
}

async function updateGroup(id, options, cache) {
    let newGroup;

    const newGroups = cache.groups.map((group) => {
        if (group.id !== id) {
            return group;
        }

        const todos = options.body.todos || group.todos;
        newGroup = Group({
            ...group,
            ...options.body,
            todos: todos.map((item) => item.id || item),
            updatedAt: new Date().getTime(),
        });

        return newGroup;
    });

    await saveCache({ ...cache, groups: newGroups });

    return newGroup;
}

async function getGroupTodos(id, options, cache) {
    const group = cache.groups.find((i) => i.id === id);
    if (!group.todos) {
        group.todos = [];
    }

    const todos = group.todos.map((todoId) =>
        cache.todos.find((todo) => todo.id === todoId),
    );

    return todos;
}

async function removeGroups(options, cache) {
    const newGroups = cache.groups.filter(
        (group) => !options.body.includes(group.id),
    );

    await saveCache({ ...cache, groups: newGroups });

    return { success: true };
}

async function removeGroup(id, options, cache) {
    const newGroups = cache.groups.filter((todo) => todo.id !== id);

    await saveCache({ ...cache, groups: newGroups });

    return { success: true };
}

async function addGroupTodo(id, options, cache) {
    const timestamp = new Date().getTime();
    let newGroup;

    const newGroups = cache.groups.map((group) => {
        if (group.id !== id) {
            return group;
        }

        newGroup = Group({
            ...group,
            updatedAt: timestamp,
            todos: [options.body.id || options.body].concat(group.todos || []),
        });

        return newGroup;
    });

    const newCache = {
        ...cache,
        groups: newGroups,
    };

    await saveCache(newCache);

    return { success: true };
}
