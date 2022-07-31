// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain } = require('electron')
const puppeteer = require('puppeteer');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile('index.html')
  mainWindow.webContents.openDevTools()
}

async function uploadAudioFiles(filesToUpload) {
  console.log("Starting upload of", filesToUpload.length, "files")
  const browser = await puppeteer.launch({ headless: false });

  // Open new tab and log in
  const page = await browser.newPage();
  await page.goto("https://otter.ai/signin");
  await page.waitForSelector("#otter-email-input")
  await page.type("#otter-email-input", process.env.OTTERAI_EMAIL);
  await page.click("#otter-sign-in")
  await page.waitForTimeout(1000)
  await page.waitForSelector("#otter-password")
  await page.type("#otter-password", process.env.OTTERAI_PASS);
  await page.click("#otter-password-next")
  await page.waitForTimeout(3000)

  // Select import file
  await page.click("button[mattooltip='Import audio or video file']")
  await page.waitForTimeout(3000)

  // Upload files
  const uploadSuccesses = []
  for (const file of filesToUpload) {
      const browse = await page.$("input[type='file']")
      console.log("Uploading " + file)
      //await browse.uploadFile(file);
      //await page.waitForTimeout(50000)
      uploadSuccesses.push(file)
  }
  browser.close();

  return uploadSuccesses
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle("upload", async (event, data) => {
  if (data.fileList) {
    const ret = { error: null, result: await uploadAudioFiles(data.fileList) }
    return ret
  } else {
    return { error: "Message corrupted (no fileList)", result: null }
  }
})