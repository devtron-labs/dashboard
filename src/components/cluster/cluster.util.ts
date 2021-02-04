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