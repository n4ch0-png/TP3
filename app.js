import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import chalk from "chalk";

// Constructor Tarea
function Tarea(data) {
  this.id = data.id;
  this.title = data.title;
  this.descripcion = data.descripcion;
  this.estado = data.estado;
  this.dificultad = data.dificultad;
  this.vencimiento = data.vencimiento;
  this.creacion = data.creacion;
  this.ultimaEdicion = data.ultimaEdicion;
  this.costo = data.costo;
}

Tarea.prototype.brief = function (i) {
  const idx = `${i + 1}.`.padEnd(4);
  return `${idx} ${chalk.bold(this.title)} ${chalk.dim(`(${this.estado})`)} - ${this.dificultad}`;
};

Tarea.prototype.showDetails = function () {
  const formatDate = (iso) => {
    if (!iso) return "Sin datos";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Inválida";
    return d.toLocaleString();
  };

  console.log(chalk.gray("=".repeat(50)));
  console.log(chalk.bold("Título:"), this.title);
  console.log(chalk.bold("Descripción:"), this.descripcion);
  console.log(chalk.bold("Estado:"), this.estado);
  console.log(chalk.bold("Dificultad:"), this.dificultad);
  console.log(chalk.bold("Vencimiento:"), formatDate(this.vencimiento));
  console.log(chalk.bold("Creación:"), formatDate(this.creacion));
  console.log(chalk.bold("Última edición:"), formatDate(this.ultimaEdicion));
  if (this.costo) console.log(chalk.bold("Costo:"), this.costo);
  console.log(chalk.gray("=".repeat(50)));
};

// Constructor TaskList
function TaskList() {
  this.tasks = loadTasks();
}

TaskList.prototype.add = function (tarea) {
  this.tasks.push(tarea);
  saveTasks(this.tasks);
};

TaskList.prototype.findById = function (id) {
  return this.tasks.find((t) => t.id === id);
};

TaskList.prototype.filterByState = function (estado) {
  return this.tasks.filter((t) => t.estado === estado);
};

// Constantes
const DATA_FILE = path.join(process.cwd(), "tasks.json");
const STATES = ["Pendiente", "En curso", "Terminada", "Cancelada"];
const DIFFICULTIES = ["Fácil", "Medio", "Difícil"];

// Persistencia
function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

function loadTasks() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const arr = JSON.parse(raw || "[]");

    // reconstruir objetos Tarea desde JSON
    return arr.map((data) => new Tarea(data));
  } catch (err) {
    console.error(chalk.red("Error leyendo tasks.json:"), err);
    return [];
  }
}

function saveTasks(tasks) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), "utf8");
  } catch (err) {
    console.error(chalk.red("Error guardando tasks.json:"), err);
  }
}

// Utilidades
function nowISO() {
  return new Date().toISOString();
}

function nextId(tasks) {
  const max = tasks.reduce((m, t) => Math.max(m, Number(t.id || 0)), 0);
  return String(max + 1);
}

// Menú Principal
async function mainMenu() {
  const { opt } = await inquirer.prompt({
    name: "opt",
    type: "list",
    message: "¿Qué deseas hacer?",
    choices: [
      { name: "Ver Mis Tareas", value: "view" },
      { name: "Buscar una Tarea", value: "search" },
      { name: "Agregar una Tarea", value: "add" },
      { name: "Detalles / Editar una Tarea", value: "detail" },
      { name: "Finalizar / Cambiar Estado", value: "finalize" },
      { name: "Salir", value: "exit" },
    ],
  });
  return opt;
}

// Ver tareas
async function viewTasksFlow(lista) {
  const { f } = await inquirer.prompt({
    name: "f",
    type: "list",
    message: "¿Qué tareas deseas ver?",
    choices: [
      { name: "Todas", value: "all" },
      { name: "Pendientes", value: "Pendiente" },
      { name: "En curso", value: "En curso" },
      { name: "Terminadas", value: "Terminada" },
      { name: "Volver", value: "back" },
    ],
  });

  if (f === "back") return;

  let list = lista.tasks;
  if (f !== "all") list = lista.filterByState(f);

  if (list.length === 0) {
    console.log(chalk.yellow("No hay tareas con esa condición."));
    return;
  }

  const choices = list.map((t, i) => ({
    name: t.brief(i),
    value: t.id,
  }));

  choices.push({ name: "Volver", value: "back" });

  const { id } = await inquirer.prompt({
    name: "id",
    type: "list",
    message: "Selecciona una tarea:",
    choices,
  });

  if (id === "back") return;

  const task = lista.findById(id);
  if (task) task.showDetails();

  await inquirer.prompt({
    name: "ok",
    type: "input",
    message: "Enter para continuar...",
  });
}

// Agregar tarea 
async function addTaskFlow(lista) {
  console.log(chalk.green("Creando nueva tarea:"));
  const answers = await inquirer.prompt([
    {
      name: "title",
      type: "input",
      message: "Título:",
      validate: (v) => (v.trim() ? true : "No puede estar vacío."),
    },
    { name: "descripcion", type: "input", message: "Descripción:", default: "" },
    { name: "estado", type: "list", message: "Estado:", choices: STATES },
    { name: "dificultad", type: "list", message: "Dificultad:", choices: DIFFICULTIES },
    { name: "vencimiento", type: "input", message: "Vencimiento (DD-MM-YYYY):", default: "" },
    { name: "costo", type: "input", message: "Costo:", default: "" },
  ]);

  const nueva = new Tarea({
    id: nextId(lista.tasks),
    title: answers.title.trim(),
    descripcion: answers.descripcion.trim(),
    estado: answers.estado,
    dificultad: answers.dificultad,
    vencimiento: answers.vencimiento ? new Date(answers.vencimiento).toISOString() : null,
    creacion: nowISO(),
    ultimaEdicion: null,
    costo: answers.costo || null,
  });

  lista.add(nueva);
  console.log(chalk.green("Tarea creada correctamente."));
}

// Loop principal
async function runApp() {
  console.clear();
  console.log(chalk.cyan.bold("ToDo List"));

  const lista = new TaskList();

  while (true) {
    const opt = await mainMenu();

    switch (opt) {
      case "view":
        await viewTasksFlow(lista);
        break;

      case "add":
        await addTaskFlow(lista);
        break;

      case "exit":
        console.log(chalk.green("Saliendo... ¡Hasta la próxima!"));
        return;

      default:
        console.log(chalk.yellow("Opción aún no implementada."));
    }
  }
}

runApp().catch((err) => console.error(chalk.red("Error en la app:"), err));