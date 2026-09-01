const STORAGE_KEY = "devtasks.tasks";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const filterButtons = document.querySelectorAll(".filter-button");

let tasks = loadTasks();
let activeFilter = "all";

function loadTasks() {
  const storedTasks = localStorage.getItem(STORAGE_KEY);

  if (!storedTasks) {
    return [];
  }

  try {
    const parsedTasks = JSON.parse(storedTasks);
    return Array.isArray(parsedTasks) ? parsedTasks : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "pending") {
      return !task.completed;
    }

    if (activeFilter === "completed") {
      return task.completed;
    }

    return true;
  });

  taskList.replaceChildren();
  emptyState.hidden = filteredTasks.length > 0;
  emptyState.textContent = tasks.length === 0
    ? "Todavía no hay tareas. Agrega la primera."
    : `No hay tareas ${activeFilter === "pending" ? "pendientes" : "completadas"}.`;

  filteredTasks.forEach((task) => {
    const item = document.createElement("li");
    const toggle = document.createElement("input");
    const text = document.createElement("span");
    const deleteButton = document.createElement("button");

    item.className = `task-item${task.completed ? " completed" : ""}`;

    toggle.className = "task-toggle";
    toggle.type = "checkbox";
    toggle.checked = task.completed;
    toggle.setAttribute("aria-label", `Marcar “${task.text}” como ${task.completed ? "pendiente" : "completada"}`);
    toggle.addEventListener("change", () => toggleTask(task.id));

    text.className = "task-text";
    text.textContent = task.text;

    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Eliminar";
    deleteButton.setAttribute("aria-label", `Eliminar “${task.text}”`);
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    item.append(toggle, text, deleteButton);
    taskList.append(item);
  });
}

function addTask(text) {
  tasks.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    completed: false,
  });

  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task,
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const taskText = taskInput.value.trim();

  if (!taskText) {
    taskInput.setCustomValidity("Escribe una tarea antes de agregarla.");
    taskInput.reportValidity();
    return;
  }

  addTask(taskText);
  taskForm.reset();
  taskInput.focus();
});

taskInput.addEventListener("input", () => {
  taskInput.setCustomValidity("");
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("active", isActive);
      filterButton.setAttribute("aria-pressed", isActive.toString());
    });

    renderTasks();
  });
});

renderTasks();
