let loading = false

uploadButton.onclick = async function () {
    if (!loading) {
        loading = true
        uploadButton.innerHTML = "Uploading..."

        const fileList = document.getElementById("fileList").innerHTML.split("</li><li>").map(s => s.replaceAll("<li>", "").replaceAll("</li>", ""))
        const { error, result } = await window.electron.send("upload", { fileList })

        loading = false
        uploadButton.innerHTML = "Upload"

        if (error) {
            alert("err")
            alert(error)
            return
        }

        alert("Uploaded files to otter.ai:" + result.join(", "))
        const newFileList = fileList.filter(f => !result.includes(f))
        document.getElementById("fileList").innerHTML = newFileList.map(f => `<li>${f}</li>`).join("")
        document.getElementById("successFileList").innerHTML = result.map(f => `<li>${f}</li>`).join("")
    }
}