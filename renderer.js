let loading = false

uploadButton.onclick = async function () {
    if (!loading) {
        loading = true
        uploadButton.innerHTML = "Uploading..."

        const fileList = document.getElementById("fileList").innerHTML.split("</li><li>").map(s => s.replaceAll("<li>", "").replaceAll("</li>", ""))
        if (fileList.length == 0 || fileList.length == 1 && fileList[0].trim() == "") {
            alert("No files to upload")
            loading = false
            uploadButton.innerHTML = "Upload"
            return;
        }
        const { error, result } = await window.electron.send("upload", { fileList })

        loading = false
        uploadButton.innerHTML = "Upload"

        if (error) {
            alert("Uh oh, something went wrong: " + error)
            return
        }

        alert("Uploaded files to otter.ai:" + result.join(", "))
        const newFileList = fileList.filter(f => !result.includes(f))
        document.getElementById("fileList").innerHTML = newFileList.map(f => `<li>${f}</li>`).join("")
        document.getElementById("successFileList").innerHTML = result.map(f => `<li>${f}</li>`).join("")
    }
}

readButton.onclick = async function () {
    if (!loading) {
        loading = true
        readButton.innerHTML = "Reading..."

        const folder = document.getElementById("folder").value
        const email = document.getElementById("email").value
        const password = document.getElementById("password").value
        const { error, result } = await window.electron.send("read", { folder, email, password })
        document.getElementById("fileList").innerHTML = result.map(f => `<li>${f}</li>`).join("")
        document.getElementById("uploadDiv").style.display = "block"

        readButton.innerHTML = "Refresh"
        loading = false
    }
}