export class ToDoListWidget {
  constructor({ id, title, tasks = [], x = 150, y = 50, active = true }) {
    this.id = id;
    this.title = title;
    this.tasks = tasks;
    this.x = x;
    this.y = y;
    this.active = active;
  }

  render(container) {
    if (!this.active) return;

    const div = document.createElement("div");
    div.classList.add("widget");
    div.style.left = this.x + "px";
    div.style.top = this.y + "px";

    div.innerHTML = `
      <div class="widget-header">
        <strong>${this.title}</strong>
        <button class="delete-widget">✖</button>
      </div>
      <div class="task-list"></div>
      <div class="add-task">
        <input type="text" placeholder="Nouvelle tâche...">
        <button>+</button>
      </div>
    `;
    container.appendChild(div);

    const taskListDiv = div.querySelector(".task-list");
    const addInput = div.querySelector(".add-task input");
    const addBtn = div.querySelector(".add-task button");
    const deleteWidgetBtn = div.querySelector(".delete-widget");

    const renderTasks = () => {
      taskListDiv.innerHTML = "";
      this.tasks.forEach((task, index) => {
        const taskDiv = document.createElement("div");
        taskDiv.classList.add("task");
        taskDiv.innerHTML = `
          <input type="checkbox" id="task-${this.id}-${index}" ${task.done ? "checked" : ""}>
          <label for="task-${this.id}-${index}">${task.text}</label>
          <button class="delete-task">✖</button>
        `;
        taskListDiv.appendChild(taskDiv);

        const checkbox = taskDiv.querySelector("input");
        checkbox.addEventListener("change", () => {
          task.done = checkbox.checked;
          this.save();
        });

        const delBtn = taskDiv.querySelector(".delete-task");
        delBtn.addEventListener("click", () => {
          this.tasks.splice(index, 1);
          renderTasks();
          this.save();
        });
      });
    };

    renderTasks();

    addBtn.addEventListener("click", () => {
      const text = addInput.value.trim();
      if (!text) return;
      this.tasks.push({ text, done: false });
      addInput.value = "";
      renderTasks();
      this.save();
    });
    addInput.addEventListener("keypress", e => { if(e.key==="Enter") addBtn.click(); });

    deleteWidgetBtn.addEventListener("click", () => {
      this.active = false;
      div.remove();
      this.save();
    });

    // Drag & drop
    let offsetX, offsetY;
    div.addEventListener("mousedown", (e) => {
      if (["INPUT","BUTTON","LABEL"].includes(e.target.tagName)) return;
      offsetX = e.clientX - div.offsetLeft;
      offsetY = e.clientY - div.offsetTop;

      const move = (e) => {
        div.style.left = e.clientX - offsetX + "px";
        div.style.top = e.clientY - offsetY + "px";
      };

      const up = () => {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
        this.x = div.offsetLeft;
        this.y = div.offsetTop;
        this.save();
      };

      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    });
  }

  save() {
    chrome.storage.sync.get({ widgets: [] }, (data) => {
      const widgets = data.widgets;
      const idx = widgets.findIndex(w => w.id === this.id);
      if (idx >= 0) widgets[idx] = { ...widgets[idx], ...this };
      else widgets.push({ ...this, type:"todo" });
      chrome.storage.sync.set({ widgets });
    });
  }
}
