const STORAGE_KEY = "tasks.v1";

let tasks = load();
let filter = "all";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const emptyMsg = document.getElementById("empty-msg");
const filterBtns = document.querySelectorAll(".filter-btn");

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask(text) {
  tasks.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text,
    done: false,
    createdAt: Date.now(),
  });
  save();
  render();
}

function toggleTask(id) {
  const t = tasks.find((t) => t.id === id);
  if (t) {
    t.done = !t.done;
    save();
    render();
  }
}

function updateTask(id, text) {
  const t = tasks.find((t) => t.id === id);
  if (t && text.trim()) {
    t.text = text.trim();
    save();
  }
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  save();
  render();
}

function render() {
  const visible = tasks.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  list.innerHTML = "";
  emptyMsg.classList.toggle("show", visible.length === 0);

  for (const t of visible) {
    const li = document.createElement("li");
    li.className = "task-item" + (t.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = t.done;
    checkbox.addEventListener("change", () => toggleTask(t.id));

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = t.text;
    span.addEventListener("dblclick", () => startEdit(li, t));

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "×";
    delBtn.title = "削除";
    delBtn.addEventListener("click", () => deleteTask(t.id));

    li.append(checkbox, span, delBtn);
    list.appendChild(li);
  }
}

function startEdit(li, task) {
  const span = li.querySelector(".task-text");
  const editor = document.createElement("input");
  editor.type = "text";
  editor.className = "task-edit";
  editor.value = task.text;
  span.replaceWith(editor);
  editor.focus();
  editor.select();

  const commit = () => updateTask(task.id, editor.value);
  editor.addEventListener("blur", commit);
  editor.addEventListener("keydown", (e) => {
    if (e.key === "Enter") editor.blur();
    if (e.key === "Escape") render();
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text);
  input.value = "";
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    filterBtns.forEach((b) => b.classList.toggle("active", b === btn));
    render();
  });
});

render();
