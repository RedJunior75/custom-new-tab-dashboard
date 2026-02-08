import { ToDoListWidget } from "../widgets/toDoListWidget.js";

const widgetContainer = document.getElementById("widget-container");
const openOptionsBtn = document.getElementById("openOptions");

// Ouvrir options
openOptionsBtn.addEventListener("click", () => {
  window.location.href = chrome.runtime.getURL("option/options.html");
});

// Charger tous les widgets
chrome.storage.sync.get({ widgets: [] }, (data) => {
  const widgets = data.widgets;
  widgets.forEach(widgetData => {
    if (widgetData.active && widgetData.type === "todo") {
      const widget = new ToDoListWidget(widgetData);
      widget.render(widgetContainer);
    }
  });
});

// Charger le fond
chrome.storage.sync.get(
  { backgroundType: "color", backgroundColor: "#0f172a", backgroundFile: "", gradientStart: "#ff0000", gradientEnd: "#0000ff" },
  (data) => {
    const canvas = document.getElementById("canvas");
    switch (data.backgroundType) {
      case "color":
        canvas.style.background = data.backgroundColor;
        break;
      case "file":
        canvas.style.background = `url(${data.backgroundFile}) center/cover no-repeat`;
        break;
      case "gradient":
        canvas.style.background = `linear-gradient(${data.gradientStart}, ${data.gradientEnd})`;
        break;
    }
  }
);
