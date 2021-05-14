import { get, post, put, trash } from '../../../services/api';

export function updateManifest(nodeName, namespace, manifest) {
    const URL = '';
    return put(URL, manifest);
}