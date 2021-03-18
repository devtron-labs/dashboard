import { Routes } from '../../config';
import { get, post, trash, put } from '../../services/api';
import { createGitCommitUrl, handleUTCTime, ISTTimeModal } from '../common';

export function deploymentGroupList() {
    const url = Routes.DEPLOYMENT_GROUP_LIST;
    return get(url).then(response=>{
        return {
            code: response.code,
            result: response.result || []
        }
    })
}

export function triggerGroupDeploy(request) {
    const url = `${Routes.DEPLOYMENT_GROUP_DEPLOY}`;
    return post(url, request);
}

export function deleteDeploymentGroup(deploymentGroupId: number | string) {
    const url = `${Routes.DEPLOYMENT_GROUP_DELETE}/${deploymentGroupId}`;
    return trash(url);
}

export function getCDMaterialList(deploymentGroupId) {
    const url = `${Routes.DEPLOYMENT_GROUP_MATERIAL}/${deploymentGroupId}`;
    return get(url).then((response) => {
        let list = response.result.ci_artifacts ? response.result.ci_artifacts.map((material, index) => {
            return {
                id: material.id,
                deployedTime: material.deployed_time && material.deployed_time.length ? handleUTCTime(material.deployed_time, true) : "Not Deployed",
                materialInfo: material.material_info ? material.material_info.map((mat) => {
                    return {
                        modifiedTime: mat.modifiedTime ? ISTTimeModal(mat.modifiedTime) : "",
                        commitLink: createGitCommitUrl(mat.url, mat.revision),
                        author: mat.author || "",
                        message: mat.message || "",
                        revision: mat.revision || "",
                        tag: mat.tag || "",
                    }
                }) : [],
                image: material.image.split(':')[1],
                buildTime: material.build_time || "",
                isSelected: index == 0,
                showSourceInfo: false,
                deployed: material.deployed || false,
                latest: material.latest || false
            }
        }) : [];
        return {
            code: response.code,
            result: list,
        }
    })
}

export function getCiPipelineApps(ciPipelineId){
    return get(`deployment-group/dg/fetch/env/apps/${ciPipelineId}`)
}

export function getLinkedCiPipelines(deploymentGroupId){
    return get(`${Routes.LINKED_CI_PIPELINES}/${deploymentGroupId}`)
}

export function createUpdateDeploymentGroup(id, payload){
    return id > 0 ? put(`deployment-group/dg/update`, payload) : post(`deployment-group/dg/create`, payload)
}

export function getDeploymentGroupDetails(deploymentGroupId){
    return get(`deployment-group/dg/${deploymentGroupId}`)
}

export function getDeploymentGroupDetail(deploymentGroupId: number){
    return post(Routes.APP_LIST, {
        "environments": [],
        "statuses": [],
        "teams": [],
        "appNameSearch": "",
        "sortOrder": "",
        "sortBy": "",
        "offset": 0,
        "size": 500,
        deploymentGroupId
    })
}

export function pauseResumeDeploymentGroup({deploymentGroupId, requestType}){
    return post(`app/stop-start-dg`, {deploymentGroupId: Number(deploymentGroupId), requestType})
}
