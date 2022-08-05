const MANIFEST_METADATA_REQUIRED_FIELDS: string[] = ['name', 'namespace', 'labels', 'annotations']

// Remove Auto-generated fields from kubernetes manifest
// input - jsonString
// output - jsonString
export function cleanKubeManifest(manifestJsonString: string): string {
    if (!manifestJsonString) {
        return manifestJsonString
    }

    try {
        const obj = JSON.parse(manifestJsonString)

        // 1 - delete status
        delete obj['status']

        // 2 - delete all fields from metadata except some predefined
        let metadata = obj['metadata']
        if (metadata) {
            for (let key in metadata) {
                if (!MANIFEST_METADATA_REQUIRED_FIELDS.includes(key)) {
                    delete metadata[key]
                }
            }
        }

        return JSON.stringify(obj)
    } catch (e) {
        return manifestJsonString
    }
}

export const decode = (data) => {
    return Object.keys(data)
        .map((m) => ({ key: m, value: data[m] ? atob(data[m]) : data[m] }))
        .reduce((agg, curr) => {
            agg[curr.key] = curr.value
            return agg
        }, {})
}

export const replaceLastOddBackslash = (str: string): string=>{
  let countBackSlash = 0
  const strArr = str.split('')
  for (let index = strArr.length-1; index >=0; index--) {
    const char = strArr[index];
    if(char === '\\'){
      countBackSlash++
    } else{
      break
    }
  }
  if(countBackSlash%2!==0){
    str+='\\'
  }
  return str
}
