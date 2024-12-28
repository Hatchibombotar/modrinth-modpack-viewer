import './style.css'
import JSZip from 'jszip'
import { saveAs } from "file-saver"
import favicon from "/favicon.png?url"
import { Data, loadData, saveData } from './data'
// import packIcon from './floatato.webp'

const packIcon = "https://minecraft.wiki/images/Block_of_Amber.png"
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div class="min-h-screen bg-slate-50 flex flex-col">

<header class="px-3 py-2 flex items-center gap-2">
  <a href="${getRoot()}"><img class="h-8 w-8" src=${favicon}></a>
  <div>
    <h1>Modrinth Modpack Viewer</h1>
    <p>
      Created by <a class="underline" target="_blank" href="https://hatchibombotar.com">Hatchibombotar</a>
    </p>
  </div>
</header>
<div class="flex flex-col items-center justify-center my-auto">
  <div class="rounded-xl bg-white border p-4" id="main-container">
  </div>
</div>

</div>
`


function downloadURI(uri: string, name: string) {
  console.log("downloading: " + name)
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // delete link;
}

function init() {
  const data = loadData()

  const container = document.querySelector<HTMLDivElement>("#main-container")!
  if (data == null) {
    createUploadScreen(container)
  } else {
    createDownloadScreen(container, data)
  }
}
init()

function createDownloadScreen(container: HTMLDivElement, data: Data) {
  container.innerHTML = `
  <div class="flex items-center gap-3">
    <img class="h-12 w-12" src=${packIcon}></img>
    <div>
      <h1 class="font-bold text-lg">${data.name}</h1>
      <p class="text-sm text-slate-700">v${data.versionId}</p>
    </div>
  </div>
  <div class="mt-2 flex flex-wrap gap-2">
    <button id="download-all" class="bg-slate-200 hover:bg-slate-200/50 font-medium rounded-lg px-2 py-1">Download All</button>
    <!--- <button id="download-all-as-modpack" class="bg-green-400 hover:bg-green-400/50 font-medium rounded-lg px-2 py-1">Download as Modpack</button> -->
  </div>
  <hr class="my-4"></hr>
  <div class="flex flex-col gap-2">
    ${data.files.map((mod) => {
    return `<div class="bg-slate-50 border rounded-lg flex items-center gap-2 px-2 py-2">
        <p class="">${mod[0].replace("mods/", "")}</p>
        <a href=${mod[1]} class="bg-slate-200 hover:bg-slate-200/50 rounded-lg px-2 py-1 ml-auto text-sm font-medium">Download</a>
      </div>`
  }).join("")
    }
  </div>
  <hr class="my-4"></hr>
  <h2 class="font-semibold mb-1">Dependencies</h2>
  <ul class="flex flex-col gap list-disc list-inside">
    ${data.dependencies.map(([dependency, version]) => {
      return `<li class="">${dependency} ${version}</li>`
    }).join("")
    }
  </ul>`

  document.querySelector<HTMLButtonElement>('#download-all')!.addEventListener("click", () => {
    for (const i in data.files) {
      const file = data.files[i]
      const path = file[0]
      const download = file[1]
      setTimeout(
        () => {
          downloadURI(download, path.replace("mods/", ""))
        },
        Number(i) * 500
      )
    }
  })

  // document.querySelector<HTMLButtonElement>('#download-all-as-modpack')!.addEventListener("click", () => {
  //   downloadAsModrinthPack(data)
  // })
}

function createUploadScreen(container: HTMLDivElement) {
  container.innerHTML = `
    <h2>Upload <span class="font-mono text-slate-700">modrinth.index.json</span></h2>

    <textarea class="border rounded w-full" id="textarea"></textarea>
    <button id="upload" class="bg-slate-200 hover:bg-slate-200/50 font-medium ml-auto rounded-lg px-2 py-1">Upload!</button>
  `

  document.querySelector<HTMLButtonElement>('#upload')!.addEventListener("click", () => {
    const value = document.querySelector<HTMLTextAreaElement>('#textarea')!.value

    const rawdata = JSON.parse(value)

    saveData({
      name: rawdata.name,
      files: rawdata.files.map(
        (file: any) => ([file.path, file.downloads[0]])
      ),
      versionId: rawdata.versionId,
      dependencies: Object.entries(rawdata.dependencies)
    })

    // document.location.href = getRoot() + "?data=" + encodeURIComponent(value)
  })
}

function getRoot() {
  return document.location.origin + document.location.pathname
}


function downloadAsModrinthPack(data: Data) {
  var zip = new JSZip();

  zip.file("modrinth.index.json", JSON.stringify({
    "game": "minecraft",
    "formatVersion": 1,
    "versionId": data.versionId,
    "name": data.name,
    "summary": "",
    "files":
      data.files.map(x => ({
        path: x[0],
        downloads: [
          x[1]
        ]
      }))
    ,
    "dependencies": Object.fromEntries(data.dependencies)
  }, null, 4));

  const fileName = data.name + " " + data.versionId + ".mrpack"

  zip.generateAsync({ type: "blob" })
    .then(function (content) {
      // see FileSaver.js
      saveAs(content, fileName);
    });
}