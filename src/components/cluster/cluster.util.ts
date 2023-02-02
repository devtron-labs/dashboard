import { OptionType } from '../app/types';
import { convertToOptionsList } from '../common';
import { ClusterComponentType, ClusterComponentStatusType, ClusterComponentStatus } from './cluster.type';

export function getEnvName(components: ClusterComponentType[], agentInstallationStage): string {


    let nonTerminatingStatus: ClusterComponentStatusType[] = [];
    if (agentInstallationStage === 1) { //progressing
        nonTerminatingStatus = [ClusterComponentStatus.REQUEST_ACCEPTED, ClusterComponentStatus.ENQUEUED, ClusterComponentStatus.DEPLOY_INIT, ClusterComponentStatus.GIT_SUCCESS, ClusterComponentStatus.ACD_SUCCESS];
    }

    else if (agentInstallationStage === 2) { //success
        nonTerminatingStatus = [ClusterComponentStatus.DEPLOY_SUCCESS];
    }

    else if (agentInstallationStage === 3) { //failed
        nonTerminatingStatus = [ClusterComponentStatus.QUE_ERROR, ClusterComponentStatus.DEQUE_ERROR, ClusterComponentStatus.TRIGGER_ERROR, ClusterComponentStatus.GIT_ERROR, ClusterComponentStatus.ACD_ERROR];
    }

    let str = nonTerminatingStatus.join('');
    let c = components?.find(c => str.search(c.status) >= 0);
    return c?.envName;
}

export function getClusterTerminalParamsData(
    params: URLSearchParams,
    imageList: OptionType[],
    namespaceList: OptionType[],
    nodeList: OptionType[],
    clusterShellList: OptionType[],
): { selectedImage: OptionType; selectedNamespace: OptionType; selectedNode: OptionType; selectedShell: OptionType } {
    const _selectedImage = imageList?.find((image) => image.value === params.get('image'))
    const _selectedNamespace = namespaceList?.find((namespace) => namespace.value === params.get('namespace'))
    const _selectedNode = nodeList?.find((node) => node.value === params.get('node'))
    const _selectedShell = clusterShellList?.find((shell) => shell.value === params.get('shell'))

    return {
        selectedImage: _selectedImage,
        selectedNamespace: _selectedNamespace,
        selectedNode: _selectedNode,
        selectedShell: _selectedShell,
    }
}

  