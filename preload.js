const { contextBridge, ipcRenderer } = require('electron')
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();


// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  params = JSON.parse(fs.readFileSync("./data.json", "utf8").toString())
  if (params.folder) {
    document.getElementById("folder").value = params.folder
  }

  if (params.email) {
    document.getElementById("email").value = params.email
  }

  if (params.password) {
    document.getElementById("password").value = params.password
  }
})


contextBridge.exposeInMainWorld('electron',
    {
        send: (channel, payload) => ipcRenderer.invoke(channel, payload)
    }
)

