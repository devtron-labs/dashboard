import { Routes } from '../../config';
import { post, put, get, trash } from '../../services/api';

export function getDockerRegistryConfig(id: string): Promise<any> {
    const URL = `${Routes.DOCKER_REGISTRY_CONFIG}/${id}`;
    return get(URL);    
}

export function saveRegistryConfig(request, id): Promise<any> {
    const URL = `${Routes.DOCKER_REGISTRY_CONFIG}`;
    return post(URL, request)
}

export function updateRegistryConfig(request, id: string): Promise<any> {
    const URL = `${Routes.DOCKER_REGISTRY_CONFIG}`;
    return put(URL, request);
}

export function deleteDockerReg(request):Promise<any>{
    return trash(`${Routes.DOCKER_REGISTRY_CONFIG}`, request);
}
