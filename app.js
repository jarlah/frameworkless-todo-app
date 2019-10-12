class Store {
    state;
    reducer;
    observers = [];

    constructor(reducer) {
        this.reducer = reducer;
        this.state = reducer(undefined, {});
        const instance = this;
        this.handler = {
            set: function (target, key, value) {
                target[key] = value;
                if (key === "state") {
                    instance.observers.forEach(observer => {
                        observer(value);
                    })
                }
                return true;
            },
        };
        this.proxy = new Proxy(this, this.handler);
    }

    dispatch(action) {
        this.proxy.state = this.reducer(this.state, action);
    }

    subscribe(observer) {
        this.observers = [...this.observers, observer];
    }
}

const store = new Store((state = { nextId: 1, todos: [] }, action) => {
    switch (action.type) {
        case "remove":
            return {
                ...state,
                todos: state.todos.filter(todo => todo.id !== action.payload)
            };
        case "add":
            return {
                ...state,
                todos: [
                    ...state.todos,
                    { id: state.nextId, text: action.payload }
                ],
                nextId: state.nextId + 1
            };
        default:
            return state;
    }
});

store.subscribe(renderTodos);

const todoInput = getById("todoInput");
const todoButton = getById("todoButton");
const todoList = getByQuery("todoList");

function onAddTodo() {
    store.dispatch({ type: "add", payload: todoInput.value })
    todoInput.value = "";
    todoInput.focus();
}

function onRemoveTodo(id) {
    store.dispatch({ type: "remove", payload: id });
    todoInput.focus();
}

// Event listeners
todoButton.addEventListener("click", onAddTodo);
todoInput.addEventListener('keypress', function (e) {
    const key = e.which || e.keyCode;
    if (key === 13) {
        onAddTodo()
    }
});

// Render operations
function renderTodos(state) {
    todoList.innerHTML = state.todos.map(createTodo).join("\n");
}

function createTodo(todo) {
    return `<div onclick="onRemoveTodo(${todo.id})" class="todo"># ${todo.id} : ${todo.text}</div>`;
}

// Dom operations
function getById(name) {
    return document.getElementById(name);
}

function getByQuery(query) {
    return document.querySelector(query);
}