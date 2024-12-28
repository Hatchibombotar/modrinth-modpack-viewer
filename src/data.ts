
export type Data = {
    name: string
    files: [path: string, download: string][]
    dependencies: [dependency: string, version: string][]
    versionId: string
}

export function saveData(data: Data) {
    const newURL = new URL(
        document.location.origin + document.location.pathname
    )

    newURL.searchParams.set("name", encodeURIComponent(data.name))
    newURL.searchParams.set("versionId", encodeURIComponent(data.versionId))
    newURL.searchParams.set("files", encodeURIComponent(JSON.stringify(data.files)))
    newURL.searchParams.set("dependencies", encodeURIComponent(JSON.stringify(data.dependencies)))

    document.location.href = newURL.toString()
}

export function loadData(): Data | undefined {
    const params = new URL(document.location.href)
        .searchParams;
    const nameParam = params.get("name")
    if (nameParam == null) {
        return
    }
    const filesParam = params.get("files")
    if (filesParam == null) {
        return
    }
    const dependenciesParam = params.get("dependencies")
    if (dependenciesParam == null) {
        return
    }
    const versionParam = params.get("versionId")
    if (versionParam == null) {
        return
    }
    const name = decodeURIComponent(nameParam)
    const files = JSON.parse(decodeURIComponent(filesParam))
    const dependencies = JSON.parse(decodeURIComponent(dependenciesParam))
    const versionId = decodeURIComponent(versionParam)

    return {
        versionId,
        name,
        files,
        dependencies
    }
}