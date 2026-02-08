export class BaseWidget {
  constructor({ id, title, content, active = true, x = 50, y = 50 }) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.active = active;
    this.x = x;
    this.y = y;
    this.el = null;
  }

  render(container) {
    const el = document.createElement("div");
    el.classList.add("widget");
    el.dataset.id = this.id;
    el.style.left = this.x + "px";
    el.style.top = this.y + "px";
    el.style.display = this.active ? "block" : "none";
    el.innerHTML = `<h3>${this.title}</h3><p>${this.content}</p>`;

    container.appendChild(el);
    this.el = el;

    this.initDrag();
  }

  update({ title, content, active, x, y }) {
    if (title !== undefined) this.title = title;
    if (content !== undefined) this.content = content;
    if (active !== undefined) this.active = active;
    if (x !== undefined) this.x = x;
    if (y !== undefined) this.y = y;

    if (this.el) {
      this.el.querySelector("h3").textContent = this.title;
      this.el.querySelector("p").textContent = this.content;
      this.el.style.display = this.active ? "block" : "none";
      this.el.style.left = this.x + "px";
      this.el.style.top = this.y + "px";
    }
  }

  initDrag() {
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;

    const onMouseDown = (e) => {
      isDragging = true;
      offsetX = e.clientX - this.el.offsetLeft;
      offsetY = e.clientY - this.el.offsetTop;
      this.el.classList.add("dragging");
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      this.x = e.clientX - offsetX;
      this.y = e.clientY - offsetY;
      this.el.style.left = this.x + "px";
      this.el.style.top = this.y + "px";
    };

    const onMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        this.el.classList.remove("dragging");
        chrome.storage.sync.get({ widgets: [] }, (data) => {
          const widgets = data.widgets.map(w => w.id === this.id ? { ...w, x: this.x, y: this.y } : w);
          chrome.storage.sync.set({ widgets });
        });
      }
    };

    this.el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }
}
