// Wrap everything so DOM is ready and to avoid "too many errors" from missing elements
document.addEventListener("DOMContentLoaded", function() {
    // Elements
    const todoItemsContainer = document.getElementById("todoItemsContainer");
    const addTodoButton = document.getElementById("addTodoButton");
    const saveTodoButton = document.getElementById("saveTodoButton");
    const userInputElement = document.getElementById("todoUserInput");

    // Helper: read list from localStorage safely
    function getTodoListFromLocalStorage() {
        try {
            const stringified = localStorage.getItem("todoList");
            const parsed = JSON.parse(stringified);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    // State
    let todoList = getTodoListFromLocalStorage();
    let todosCount = todoList.length > 0 ? Math.max(...todoList.map(t => t.uniqueNo)) : 0;

    // Save to localStorage
    saveTodoButton.addEventListener("click", function() {
        try {
            localStorage.setItem("todoList", JSON.stringify(todoList));
            alert("Saved successfully");
        } catch (e) {
            console.error("Save failed", e);
            alert("Could not save. Check browser storage settings.");
        }
    });

    // Delete a todo by id
    function onDeleteTodo(todoId) {
        const index = todoList.findIndex(function(t) {
            return "todo" + t.uniqueNo === todoId;
        });
        if (index === -1) return;

        // Remove from state
        todoList.splice(index, 1);

        // Remove from DOM if exists
        const el = document.getElementById(todoId);
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    // Toggle status
    function onTodoStatusChange(todoId, checkboxEl, labelEl) {
        const index = todoList.findIndex(function(t) {
            return "todo" + t.uniqueNo === todoId;
        });
        if (index === -1) return;

        const todoObj = todoList[index];
        todoObj.isChecked = !!checkboxEl.checked;

        // Update UI
        if (todoObj.isChecked) labelEl.classList.add("checked");
        else labelEl.classList.remove("checked");
    }

    // Create and append a todo DOM node
    function createAndAppendTodo(todo) {
        const todoId = "todo" + todo.uniqueNo;
        const checkboxId = "checkbox" + todo.uniqueNo;

        // Avoid duplicate DOM nodes
        if (document.getElementById(todoId)) return;

        const li = document.createElement("li");
        li.className = "todo-item";
        li.id = todoId;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "checkbox";
        checkbox.id = checkboxId;
        checkbox.checked = !!todo.isChecked;

        const label = document.createElement("div");
        label.className = "todo-label";
        label.textContent = todo.text;
        if (todo.isChecked) label.classList.add("checked");

        const actions = document.createElement("div");
        actions.className = "todo-actions";

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.type = "button";
        deleteBtn.textContent = "Delete";

        // Wire events
        checkbox.addEventListener("change", function() {
            onTodoStatusChange(todoId, checkbox, label);
        });

        deleteBtn.addEventListener("click", function() {
            onDeleteTodo(todoId);
        });

        // Build DOM
        actions.appendChild(deleteBtn);
        li.appendChild(checkbox);
        li.appendChild(label);
        li.appendChild(actions);
        todoItemsContainer.appendChild(li);
    }

    // Add new todo
    function onAddTodo() {
        const userInputValue = (userInputElement.value || "").trim();
        if (userInputValue === "") {
            alert("Enter valid text");
            return;
        }

        todosCount += 1;
        const newTodo = {
            text: userInputValue,
            uniqueNo: todosCount,
            isChecked: false
        };

        todoList.push(newTodo);
        createAndAppendTodo(newTodo);
        userInputElement.value = "";
    }

    // Wire add button and Enter key
    addTodoButton.addEventListener("click", onAddTodo);
    userInputElement.addEventListener("keydown", function(e) {
        if (e.key === "Enter") onAddTodo();
    });

    // Render existing todos on load
    for (const todo of todoList) {
        createAndAppendTodo(todo);
    }
});