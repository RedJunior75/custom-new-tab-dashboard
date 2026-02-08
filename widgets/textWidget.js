export class TextWidget {
  constructor({ id, title, content, x = 50, y = 50 }) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.x = x;
    this.y = y;
  }

  render(container) {
    const div = document.createElement("div");
    div.classList.add("widget");
    div.style.left = this.x + "px";
    div.style.top = this.y + "px";

    div.innerHTML = `<strong>${this.title}</strong><div>${this.content}</div>`;
    container.appendChild(div);

    let offsetX, offsetY;
    div.addEventListener("mousedown", (e) => {
      offsetX = e.clientX - div.offsetLeft;
      offsetY = e.clientY - div.offsetTop;

      function move(e) {
        div.style.left = e.clientX - offsetX + "px";
        div.style.top = e.clientY - offsetY + "px";
      }

      function up() {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      }

      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    });
  }
}

