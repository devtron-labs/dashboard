
const MANIFEST_METADATA_REQUIRED_FIELDS : string[] = ['name', 'namespace', 'labels', 'annotations'];

// Remove Auto-generated fields from kubernetes manifest
// input - jsonString
// output - jsonString
export function CleanKubeManifest(manifestJsonString: string): string {
    if (!manifestJsonString) {
        return manifestJsonString;
    }

    try{
        let obj = JSON.parse(manifestJsonString);

        // 1 - delete status
        delete obj['status'];

        // 2 - delete all fields from metadata except some predefined
        let metadata = obj['metadata'];
        if(metadata) {
            for (let key in metadata) {
                if (!MANIFEST_METADATA_REQUIRED_FIELDS.includes(key)){
                    delete metadata[key];
                }
            }
        }

        return JSON.stringify(obj);
    }catch (e){
        return manifestJsonString;
    }
}