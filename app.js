const todoInput = getById("todoInput");
const todoButton = getById("todoButton");
const todoList = getByQuery("todoList");

class Store {
    stateKey = "state";

    observers = [];

    constructor(reducer) {
        this.reducer = reducer;
        this.proxy = new Proxy(this, {
            set: (target, key, value) => {
                target[key] = value;
                if (key === this.stateKey) {
                    this.observers.forEach(observer => {
                        observer(value);
                    })
                }
                return true;
            },
        });
    }

    dispatch(action) {
        if (!this.initialized) {
            throw new Error("Store is not initialized. Run init method after constructing store.");
        }
        this.proxy[this.stateKey] = this.reducer(this[this.stateKey], action);
    }

    subscribe(observer) {
        if (this.initialized) {
            console.warn("Adding observer after initializing store will not give observers a chance to render initial state");
        }
        this.observers = [...this.observers, observer];
    }

    init() {
        this.initialized = true;
        this.dispatch({});
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

store.init();

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