const { contextBridge, ipcRenderer } = require('electron')
const moment = require("moment")
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

function readVoicemailFiles() {
  const directoryPath = process.env.UNPROCESSED_VOICEMAILS_FOLDER
  const files = fs.readdirSync(directoryPath)
                  .filter(fname => !fs.lstatSync(directoryPath + "/" + fname).isDirectory())
                  .filter(fname => [".mp3", ".wav", ".m4a"].some(ext => path.extname(fname).endsWith(ext)))
                  .map(fname => directoryPath + "/" + fname);

  if (!fs.existsSync(process.env.UNPROCESSED_VOICEMAILS_FOLDER + "/processing")) {
      fs.mkdirSync(process.env.UNPROCESSED_VOICEMAILS_FOLDER + "/processing");
  }

  let id = 1
  const newFilePaths = []
  for (const file of files) {
      const stats = fs.statSync(file)
      const createdAt = moment(stats.birthtime).format("YYYY-MM-DD")
      const newFileName = createdAt + "-" + id + path.extname(file)
      const newFilePath = process.env.UNPROCESSED_VOICEMAILS_FOLDER + "/processing/" + newFileName
      fs.copyFileSync(file, newFilePath)
      id += 1
      newFilePaths.push(newFilePath)
  }
  return newFilePaths
}

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const fileNames = readVoicemailFiles()
  document.getElementById("fileList").innerHTML = fileNames.map(f => `<li>${f}</li>`).join("")
  document.getElementById("fileList").data = fileNames
})


contextBridge.exposeInMainWorld('electron',
    {
        send: (channel, payload) => ipcRenderer.invoke(channel, payload)
    }
)

