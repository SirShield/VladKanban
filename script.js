// Global variable to store the dragged element
let dragged;

// Function to allow dragging
document.addEventListener("dragstart", function(event) {
    dragged = event.target;
    event.target.style.opacity = 0.5;
});

// Function to reset opacity after drag
document.addEventListener("dragend", function(event) {
    event.target.style.opacity = "";
});

// Allow drag over the drop targets
document.addEventListener("dragover", function(event) {
    event.preventDefault();
});

// Function to handle drop and append the dragged element to the new column
document.addEventListener("drop", function(event) {
    event.preventDefault();
    if (event.target.classList.contains("kanban-column")) {
        event.target.appendChild(dragged);
        saveBoardState(); // Save the board state after moving a task
    }
});

// Function to save board state to LocalStorage (including columns)
function saveBoardState() {
    let boardState = {
        columns: document.getElementById('kanban-board').innerHTML,
        categoryOptions: document.getElementById('task-category').innerHTML
    };
    localStorage.setItem('kanbanBoard', JSON.stringify(boardState));
}

// Function to load board state from LocalStorage (including columns)
function loadBoardState() {
    let savedState = localStorage.getItem('kanbanBoard');
    if (savedState) {
        let boardState = JSON.parse(savedState);
        
        // Ensure that the values are valid before inserting them into the page
        if (boardState.columns && boardState.columns !== "undefined") {
            document.getElementById('kanban-board').innerHTML = boardState.columns;
        } else {
            document.getElementById('kanban-board').innerHTML = ""; // Empty the board if state is invalid
        }

        // Curățăm opțiunile dropdown și le adăugăm din nou
        document.getElementById('task-category').innerHTML = '<option value="">Select a column</option>';
        if (boardState.categoryOptions && boardState.categoryOptions !== "undefined") {
            document.getElementById('task-category').innerHTML += boardState.categoryOptions;
        }
    } else {
        // Clear the board if there's no valid data
        document.getElementById('kanban-board').innerHTML = "";
        document.getElementById('task-category').innerHTML = '<option value="">Select a column</option>';
    }

    // Re-adăugăm butoanele de ștergere la coloanele și taskurile existente
    addDeleteButtons();
    addDeleteColumnButtons();
}

// Function to add delete buttons to existing tasks when the page loads
function addDeleteButtons() {
    let cards = document.querySelectorAll('.kanban-card');
    cards.forEach(card => {
        // Verificăm dacă butonul de ștergere există deja
        if (!card.querySelector('.delete-task-button')) {
            let deleteButton = document.createElement('button');
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-task-button";
            deleteButton.onclick = function() {
                card.remove(); // Remove the task
                saveBoardState(); // Save the state after deletion
            };
            card.appendChild(deleteButton); // Attach the delete button to the task
        }
    });
}

// Function to add delete buttons to existing columns when the page loads
function addDeleteColumnButtons() {
    let columns = document.querySelectorAll('.kanban-column');
    columns.forEach(column => {
        // Verificăm dacă butonul de ștergere există deja
        if (!column.querySelector('.delete-column-button')) {
            let deleteColumnButton = document.createElement('button');
            deleteColumnButton.textContent = "Delete Column";
            deleteColumnButton.className = "delete-column-button";
            deleteColumnButton.onclick = function() {
                column.remove(); // Remove the column
                document.querySelector(`#task-category option[value="${column.id}"]`).remove(); // Remove from dropdown
                saveBoardState(); // Save state after deleting the column
            };
            column.appendChild(deleteColumnButton); // Attach the delete button to the column
        }
    });
}

// Function to add a new task
document.getElementById('add-task-button').addEventListener('click', function() {
    let taskText = document.getElementById('new-task-input').value;
    let taskCategory = document.getElementById('task-category').value;

    if (taskText !== "" && taskCategory !== "") {
        let newTask = document.createElement('div');
        newTask.className = 'kanban-card';
        newTask.setAttribute('draggable', 'true');
        newTask.setAttribute('contenteditable', 'true');
        newTask.textContent = taskText;

        // Add the delete button to the new task
        let deleteButton = document.createElement('button');
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-task-button";
        deleteButton.onclick = function() {
            newTask.remove(); // Remove the task
            saveBoardState(); // Save the state after deletion
        };

        // Append the delete button to the task
        newTask.appendChild(deleteButton);

        document.getElementById(taskCategory).appendChild(newTask);

        // Re-apply drag event listeners for the new task
        addDragListeners(newTask);

        // Reset input field
        document.getElementById('new-task-input').value = "";

        saveBoardState(); // Save the board state after adding a task
    }
});

// Function to add a new column
document.getElementById('add-column-button').addEventListener('click', function() {
    let columnName = document.getElementById('new-column-name').value;
    let columnColor = document.getElementById('new-column-color').value;

    if (columnName !== "") {
        let newColumn = document.createElement('div');
        newColumn.className = 'kanban-column';
        let columnId = columnName.toLowerCase().replace(/\s+/g, '-') + '-column';
        newColumn.id = columnId;

        // Set the column color and header
        let columnHeader = document.createElement('h3');
        columnHeader.style.backgroundColor = columnColor;
        columnHeader.textContent = columnName;

        // Add delete button for the column
        let deleteColumnButton = document.createElement('button');
        deleteColumnButton.textContent = "Delete Column";
        deleteColumnButton.className = "delete-column-button";
        deleteColumnButton.onclick = function() {
            newColumn.remove(); // Remove the column
            document.querySelector(`#task-category option[value="${columnId}"]`).remove(); // Remove from dropdown
            saveBoardState(); // Save state after deleting the column
        };

        newColumn.appendChild(columnHeader);
        newColumn.appendChild(deleteColumnButton);

        document.getElementById('kanban-board').appendChild(newColumn);

        // Add the new column to the dropdown options
        let newOption = document.createElement('option');
        newOption.value = columnId;
        newOption.textContent = columnName;
        document.getElementById('task-category').appendChild(newOption);

        // Clear input fields
        document.getElementById('new-column-name').value = "";
        document.getElementById('new-column-color').value = "#cccccc";

        saveBoardState(); // Save the board state after adding a column
    }
});

// Load the board state when the page is loaded
window.onload = function() {
    loadBoardState();
    addDragListeners(); // Re-add drag listeners after loading the board state
};

// Function to add drag event listeners for each task
function addDragListeners(task) {
    if (!task) { // If no specific task is provided, apply listeners to all tasks
        let cards = document.querySelectorAll('.kanban-card');
        cards.forEach(card => {
            card.addEventListener('dragstart', function(event) {
                dragged = event.target;
                event.target.style.opacity = 0.5;
            });
            card.addEventListener('dragend', function(event) {
                event.target.style.opacity = "";
            });
        });
    } else { // Apply listeners to a specific task (newly added task)
        task.addEventListener('dragstart', function(event) {
            dragged = event.target;
            event.target.style.opacity = 0.5;
        });
        task.addEventListener('dragend', function(event) {
            event.target.style.opacity = "";
        });
    }
}
