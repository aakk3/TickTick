/* ============================================================
   GLOBAL VARIABLES
   ============================================================ */
const GRANDMA_PASSWORD = "maha123";
const GRANDPA_PASSWORD = "nabil123";

let currentUser = null;
let pendingUser = null;
let todos = [];

/* ============================================================
   LOGIN + PASSWORD
   ============================================================ */
function startLogin(user) {
  pendingUser = user;
  document.getElementById("passwordOverlay").style.display = "flex";
  document.getElementById("passwordInput").value = "";
  document.getElementById("passwordError").textContent = "";
}

function confirmPassword() {
  const input = document.getElementById("passwordInput").value;
  const correct = pendingUser === "grandma" ? GRANDMA_PASSWORD : GRANDPA_PASSWORD;

  if (input === correct) {
    currentUser = pendingUser;
    pendingUser = null;

    // Remember me
    if (document.getElementById("rememberMe").checked) {
      localStorage.setItem("remember_user", currentUser);
    }

    document.getElementById("passwordOverlay").style.display = "none";
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("todoSection").style.display = "block";

    loadTodos();
  } else {
    document.getElementById("passwordError").textContent = "Incorrect password.";
  }
}

function closePasswordPopup() {
  document.getElementById("passwordOverlay").style.display = "none";
}

/* ============================================================
   TABS
   ============================================================ */
function showTab(tab) {
  const tabs = ["tasks", "missed", "thanks", "settings"];
  tabs.forEach(t => {
    document.getElementById("tab_" + t).style.display = t === tab ? "block" : "none";
    const btn = document.getElementById("tabBtn_" + t);
    if (btn) btn.classList.toggle("active", t === tab);
  });
}

/* ============================================================
   TASKS
   ============================================================ */
function loadTodos() {
  const saved = localStorage.getItem("todos_" + currentUser);
  todos = saved ? JSON.parse(saved) : [];
  renderTodos();
}

function saveTodos() {
  localStorage.setItem("todos_" + currentUser, JSON.stringify(todos));
}

function addTodo() {
  const text = document.getElementById("todoInput").value.trim();
  const date = document.getElementById("todoDate").value;
  const priority = document.getElementById("todoPriority").value;

  if (!text || !date) return;

  todos.push({ text, date, priority, done: false });
  saveTodos();
  renderTodos();

  document.getElementById("todoInput").value = "";
  document.getElementById("todoDate").value = "";
}

function renderTodos() {
  const now = new Date().toISOString().split("T")[0];
  const activeList = document.getElementById("todoList");
  const missedList = document.getElementById("missedList");

  activeList.innerHTML = "";
  missedList.innerHTML = "";

  const priorityOrder = { high: 1, medium: 2, low: 3 };
  todos.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  todos.forEach((task, index) => {
    const li = document.createElement("li");
    li.classList.add(`priority-${task.priority}`);

    const main = document.createElement("div");
    main.className = "task-main";

    const title = document.createElement("div");
    title.className = "task-title";
    title.innerHTML = `${task.priority === "high" ? "🔴" : task.priority === "medium" ? "🟡" : "🟢"} ${task.text}`;

    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.textContent = "Due: " + task.date;

    if (task.date < now) meta.classList.add("expired");

    main.appendChild(title);
    main.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const doneBtn = document.createElement("button");
    doneBtn.className = "btn-small btn-done";
    doneBtn.textContent = task.done ? "Undo" : "Done";
    doneBtn.onclick = () => toggleDone(index);

    const delBtn = document.createElement("button");
    delBtn.className = "btn-small btn-delete";
    delBtn.textContent = "Delete";
    delBtn.onclick = () => deleteTask(index);

    actions.appendChild(doneBtn);
    actions.appendChild(delBtn);

    li.appendChild(main);
    li.appendChild(actions);

    if (task.date < now) missedList.appendChild(li);
    else activeList.appendChild(li);
  });
}

function logoutUser() {
  localStorage.removeItem("remember_user");
  currentUser = null;

  document.getElementById("todoSection").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
}


function toggleDone(i) {
  todos[i].done = !todos[i].done;
  saveTodos();
  renderTodos();
}

function deleteTask(i) {
  todos.splice(i, 1);
  saveTodos();
  renderTodos();
}

/* ============================================================
   SETTINGS — THEMES + FONT SIZE + THANK YOU TEXT
   ============================================================ */
function changeTheme() {
  const theme = document.getElementById("themeSelect").value;
  document.body.classList.remove("theme-pink", "theme-blue", "theme-green", "theme-dark");
  document.body.classList.add(theme);
  localStorage.setItem("app_theme", theme);
}

function changeFont() {
  const font = document.getElementById("fontSelect").value;
  document.body.classList.remove("font-small", "font-medium", "font-large");
  document.body.classList.add(font);
  localStorage.setItem("app_font", font);
}

function updateThankYou() {
  const text = document.getElementById("thankYouEditor").value;
  document.getElementById("thankYouText").innerHTML = text;
  localStorage.setItem("thank_you_text", text);
}

/* ============================================================
   DATA SETTINGS
   ============================================================ */
function clearTasks(user) {
  localStorage.removeItem("todos_" + user);
  if (currentUser === user) {
    todos = [];
    renderTodos();
  }
  alert("Tasks for " + user + " cleared.");
}

function clearAllTasks() {
  localStorage.removeItem("todos_grandma");
  localStorage.removeItem("todos_grandpa");
  todos = [];
  renderTodos();
  alert("All tasks cleared.");
}

function resetApp() {
  localStorage.clear();
  location.reload();
}

/* ============================================================
   LOAD SETTINGS + AUTO LOGIN
   ============================================================ */
window.onload = () => {
  const savedTheme = localStorage.getItem("app_theme");
  const savedFont = localStorage.getItem("app_font");
  const savedLetter = localStorage.getItem("thank_you_text");
  const rememberedUser = localStorage.getItem("remember_user");

  if (savedTheme) {
    document.body.classList.add(savedTheme);
    document.getElementById("themeSelect").value = savedTheme;
  }

  if (savedFont) {
    document.body.classList.add(savedFont);
    document.getElementById("fontSelect").value = savedFont;
  }

  if (savedLetter) {
    document.getElementById("thankYouText").innerHTML = savedLetter;
    document.getElementById("thankYouEditor").value = savedLetter;
  }

  // Auto-login
  if (rememberedUser) {
    currentUser = rememberedUser;
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("todoSection").style.display = "block";
    loadTodos();
  }
};
