import { ToDoListWidget } from "../widgets/toDoListWidget.js";

const bgRadios = document.querySelectorAll('input[name="bgType"]');
const colorInput = document.getElementById("colorInput");
const fileUrlInput = document.getElementById("fileUrlInput");
const fileInput = document.getElementById("fileInput");
const gradientStart = document.getElementById("gradientStart");
const gradientEnd = document.getElementById("gradientEnd");

const urlBtn = document.getElementById("urlBtn");
const fileBtn = document.getElementById("fileBtn");
const saveBtn = document.getElementById("saveBtn");
const backBtn = document.getElementById("backBtn");

const addWidgetBtn = document.getElementById("addWidget");
const widgetsListDiv = document.getElementById("widgetsList");

// --- Gestion fond ---
function updateInputs() {
  const selectedType = document.querySelector('input[name="bgType"]:checked').value;
  colorInput.disabled = selectedType !== "color";
  fileUrlInput.disabled = selectedType !== "file";
  fileInput.disabled = selectedType !== "file";
  gradientStart.disabled = selectedType !== "gradient";
  gradientEnd.disabled = selectedType !== "gradient";
}

bgRadios.forEach(r => r.addEventListener("change", updateInputs));

chrome.storage.sync.get(
  { backgroundType: "color", backgroundColor:"#0f172a", backgroundFile:"", gradientStart:"#ff0000", gradientEnd:"#0000ff" },
  (data) => {
    document.querySelector(`input[name="bgType"][value="${data.backgroundType}"]`).checked = true;
    colorInput.value = data.backgroundColor;
    fileUrlInput.value = data.backgroundFile;
    gradientStart.value = data.gradientStart;
    gradientEnd.value = data.gradientEnd;
    updateInputs();
  }
);

urlBtn.addEventListener("click", () => fileUrlInput.focus());
fileBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => fileUrlInput.value = reader.result;
  reader.readAsDataURL(file);
});

saveBtn.addEventListener("click", () => {
  const selectedType = document.querySelector('input[name="bgType"]:checked').value;
  const storageData = { backgroundType: selectedType };
  if (selectedType==="color") storageData.backgroundColor=colorInput.value;
  if (selectedType==="file") storageData.backgroundFile=fileUrlInput.value.trim();
  if (selectedType==="gradient") {
    storageData.gradientStart=gradientStart.value;
    storageData.gradientEnd=gradientEnd.value;
  }
  chrome.storage.sync.set(storageData,()=>alert("Fond sauvegardé !"));
});

// Retour
backBtn.addEventListener("click", () => {
  window.location.href = chrome.runtime.getURL("newtab/newtab.html");
});

// --- Gestion Widgets ---
function renderWidgetsList() {
  widgetsListDiv.innerHTML = "";
  chrome.storage.sync.get({ widgets: [] }, (data) => {
    data.widgets.forEach((w,i) => {
      if (w.type==="todo") {
        const div = document.createElement("div");
        div.textContent = w.title || "To-Do Widget";
        const delBtn = document.createElement("button");
        delBtn.textContent = "✖";
        delBtn.addEventListener("click", () => {
          data.widgets.splice(i,1);
          chrome.storage.sync.set({ widgets: data.widgets }, renderWidgetsList);
        });
        div.appendChild(delBtn);
        widgetsListDiv.appendChild(div);
      }
    });
  });
}

addWidgetBtn.addEventListener("click", () => {
  chrome.storage.sync.get({ widgets: [] }, (data) => {
    const newWidget = new ToDoListWidget({
      id: Date.now().toString(),
      title: "Nouvelle To-Do",
      tasks: [],
      x: 50,
      y: 50,
      active:true
    });
    data.widgets.push({ ...newWidget, type:"todo" });
    chrome.storage.sync.set({ widgets: data.widgets }, renderWidgetsList);
  });
});

renderWidgetsList();
