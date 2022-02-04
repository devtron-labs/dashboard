import { get, post, trash } from '../../services/api';
import { Routes } from '../../config';

export function createProject(project) {
    const URL = `${Routes.PROJECT}`;
    let request = {
        name: project.name,
        active: project.active
    }
    return post(URL, request);
}

export function getProjectList() {
    const URL = `${Routes.PROJECT_LIST}`;
    return get(URL).then((response) => {
        return {
            code: response.code,
            result: response.result ? response.result.map((project) => {
                return {
                    ...project,
                    isCollapsed: true
                }
            }) : []
        }
    })
}

export function deleteProject(request) {
    return trash(`${Routes.PROJECT}`, request);
}