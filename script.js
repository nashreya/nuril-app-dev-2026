const STORAGE_KEY = "ledger.tasks.v1";

/** @type {{id: string, text: string, done: boolean, createdAt: number}[]} */
let tasks = [];

// DOM references 
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const formError = document.getElementById("formError");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const deleteAllBtn = document.getElementById("deleteAllBtn");
const openCountEl = document.getElementById("openCount");
const doneCountEl = document.getElementById("doneCount");
const todayDateEl = document.getElementById("todayDate");
const charLimit = document.getElementById("charLimit");

// Persistence 
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(tasks)) {
      tasks = [];
    }
  } catch (err) {
    console.error("Could not read saved tasks, starting fresh.", err);
    tasks = [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error("Could not save tasks to Local Storage.", err);
  }
}

// Rendering 
function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-row" + (task.done ? " is-done" : "");
    li.dataset.id = task.id;

    //  Check button 
    const checkBtn = document.createElement("button");
    checkBtn.type = "button";
    checkBtn.className = "task-row__check";

    checkBtn.setAttribute(
      "aria-label",
      task.done ? "Mark as not done" : "Mark as done"
    );

    checkBtn.setAttribute("aria-pressed", String(task.done));

    checkBtn.innerHTML =
      '<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M1.5 6.2L4.5 9.2L10.5 2.5" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round"/></svg>';

    checkBtn.addEventListener("click", () => toggleDone(task.id));

    //  Task text 
    const span = document.createElement("span");
    span.className = "task-row__text";
    span.textContent = task.text;

    //  Edit button 
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "task-row__edit";
    editBtn.setAttribute("aria-label", `Edit "${task.text}"`);
    editBtn.textContent = "Edit";

    editBtn.addEventListener("click", () => editTask(task.id));

    //  Delete button 
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "task-row__delete";
    delBtn.setAttribute("aria-label", `Delete "${task.text}"`);
    delBtn.textContent = "×";

    delBtn.addEventListener("click", () => deleteTask(task.id));

    li.append(checkBtn, span, editBtn, delBtn);
    taskList.appendChild(li);
  });

  emptyState.classList.toggle("is-visible", tasks.length === 0);

  updateCounts();
}

function updateCounts() {
  const done = tasks.filter((t) => t.done).length;

  openCountEl.textContent = tasks.length - done;
  doneCountEl.textContent = done;
}

//  Update Task 
function editTask(id) {
  const task = tasks.find((task) => task.id === id);

  if (!task) return;

  const li = document.querySelector(`.task-row[data-id="${id}"]`);

  if (!li) return;

  const textSpan = li.querySelector(".task-row__text");
  const editBtn = li.querySelector(".task-row__edit");

  // Input field
  const editInput = document.createElement("input");

  editInput.type = "text";
  editInput.value = task.text;
  editInput.maxLength = 120;
  editInput.className = "task-row__edit-input";

  // Replace text with input
  li.replaceChild(editInput, textSpan);

  // Change Edit button to Save
  editBtn.textContent = "Save";

  // Save when button is clicked
  editBtn.onclick = () => {
    const newText = editInput.value.trim();

    if (newText.length === 0) {
      editInput.focus();
      return;
    }

    updateTask(id, newText);
  };

  editInput.focus();

  // Allow Enter key to save
  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const newText = editInput.value.trim();

      if (newText.length === 0) {
        editInput.focus();
        return;
      }

      updateTask(id, newText);
    }
  });
}

function updateTask(id, newText) {
  tasks = tasks.map((task) =>
    task.id === id
      ? { ...task, text: newText }
      : task
  );

  saveTasks();
  renderTasks();
}

// Task operations 
function addTask(text) {
  const task = {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()),
    text,
    done: false,
    createdAt: Date.now(),
  };

  tasks.push(task);

  saveTasks();
  renderTasks();
}

function toggleDone(id) {
  tasks = tasks.map((task) =>
    task.id === id
      ? { ...task, done: !task.done }
      : task
  );

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);

  saveTasks();
  renderTasks();
}

// 2 seconds loading state for task clearing
function deleteAllTasks() {
  return new Promise((resolve) => {
    setTimeout(() => {
      tasks = [];

      saveTasks();
      renderTasks();

      resolve();
    }, 2000);
  });
}

// Form handling & validation 
function showError(message) {
  formError.textContent = message;
  taskForm.classList.add("entry-row--invalid");
}

function clearError() {
  formError.textContent = "";
  taskForm.classList.remove("entry-row--invalid");
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const value = taskInput.value.trim();

  if (value.length === 0) {
    showError("Must add task.");
    taskInput.focus();
    return;
  }

  clearError();

  addTask(value);

  taskForm.reset();
  charLimit.classList.remove("is-visible");
  taskInput.focus();
});

taskInput.addEventListener("input", () => {
  if (formError.textContent) {
    clearError();
  }
});

// 120 maximum characters reached

taskInput.addEventListener("input", () => {
  charLimit.classList.toggle("is-visible", taskInput.value.length >= 120);
});

//  Delete All 

deleteAllBtn.addEventListener("click", async () => {

  if (tasks.length === 0) return;

  const label = deleteAllBtn.querySelector(".btn__label");
  const loading = deleteAllBtn.querySelector(".btn__loading");

  // Show "Clearing..."
  deleteAllBtn.disabled = true;
  label.hidden = true;
  loading.hidden = false;

  await deleteAllTasks();

  // Show "Delete All" again
  loading.hidden = true;
  label.hidden = false;
  deleteAllBtn.disabled = false;

});

// Init
function setToday() {
  const today = new Date();

  todayDateEl.textContent = today.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function init() {
  setToday();
  loadTasks();
  renderTasks();
}

init();
