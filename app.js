const todoInput = getById("todoInput");
const todoButton = getById("todoButton");
const todoList = getByQuery("todoList");

function addTodo(todoText) {
    dispatch({ type: "add", payload: todoText });
}

function onAddTodo() {
    addTodo(todoInput.value);
    todoInput.value = "";
    renderTodos();
    todoInput.focus();
}

function removeTodo(id) {
    dispatch({ type: "remove", payload: id });
}

function onRemoveTodo(id) {
    removeTodo(id);
    renderTodos();
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
function renderTodos() {
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

// Reducer stuff
const initialStsate = {
    nextId: 1,
    todos: []
};

function reducer(state = initialStsate, action) {
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
}

let state = reducer(undefined, {});

function dispatch(action) {
    state = reducer(state, action);
}