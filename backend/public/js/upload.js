// 🔥 SOCKET CONNECTION
const socket = io();

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

// UI ELEMENTS
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const chooseBtn = document.getElementById("chooseBtn");
const uploadBtn = document.getElementById("uploadBtn");
const fileList = document.getElementById("fileList");
const statusText = document.getElementById("statusText");

let selectedFile = null;

// 🔥 SOCKET LISTENER
socket.on("uploadProgress", (data) => {
  console.log("Socket:", data);

  statusText.innerText = data.message;

  const progressBar = document.getElementById("progress");
  if (progressBar) {
    progressBar.style.width = data.percent + "%";
  }

  if (data.percent === 100) {
    setTimeout(() => {
      window.location.href = "/result";
    }, 2000);
  }
});

// FILE SELECT
chooseBtn.onclick = () => fileInput.click();

fileInput.onchange = () => {
  selectedFile = fileInput.files[0];
  showFile(selectedFile);
};

// DRAG & DROP
dropZone.ondragover = (e) => e.preventDefault();

dropZone.ondrop = (e) => {
  e.preventDefault();
  selectedFile = e.dataTransfer.files[0];
  showFile(selectedFile);
};

// SHOW FILE
function showFile(file) {
  fileList.innerHTML = `
    <div class="file-item">
      ${file.name}
      <div class="progress-bar">
        <div class="progress-fill" id="progress"></div>
      </div>
    </div>
  `;
}

// 🔥 FINAL UPLOAD FUNCTION (FIXED)
uploadBtn.onclick = async () => {
  if (!selectedFile) {
    alert("Select file first");
    return;
  }

  const token = localStorage.getItem("token");

  // ✅ FIX 1: STOP if no token
  if (!token) {
    alert("Please login first");
    return;
  }

  // ✅ FIX 2: Ensure socket connected
  if (!socket.id) {
    alert("Socket not connected yet. Try again.");
    return;
  }

  console.log("TOKEN:", token);
  console.log("Using socket ID:", socket.id);

  statusText.innerText = "Uploading...";

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const res = await fetch(`/api/upload?socketId=${socket.id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}` // ✅ IMPORTANT
      },
      body: formData
    });

    const data = await res.json();
    console.log("Final Result:", data);

    localStorage.setItem("result", JSON.stringify(data));

  } catch (err) {
    console.error("Upload error:", err);
    alert("Upload failed");
  }
};