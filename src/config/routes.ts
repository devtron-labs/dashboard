import { AppConfigStatus } from './';

export interface NavItem {
    title: string;
    href: string;
    stage: number;
    isLocked: boolean;
}

export const URLS = {
    CHARTS: '/chart-store',
    APP: '/app',
    APP_DETAILS: 'details', //
    APP_TRIGGER: 'trigger',
    APP_CI_DETAILS: 'ci-details',
    APP_CD_DETAILS: 'cd-details',
    APP_DEPLOYMENT_METRICS: 'deployment-metrics',
    APP_CONFIG: 'edit',
    APP_GIT_CONFIG: 'materials',
    APP_DOCKER_CONFIG: 'docker-build-config',
    APP_DEPLOYMENT_CONFIG: 'deployment-template',
    APP_WORKFLOW_CONFIG: 'workflow',
    APP_CM_CONFIG: 'configmap',
    APP_CS_CONFIG: 'secrets',
    APP_ENV_OVERRIDE_CONFIG: 'env-override',
    APP_CI_CONFIG: 'ci-pipeline',
    APP_CD_CONFIG: 'cd-pipeline',
    APP_EXTERNAL_CI_CONFIG: 'external-ci',
    APP_LINKED_CI_CONFIG: 'linked-ci',
    LOGIN_ADMIN: '/login/admin', //
    LOGIN_SSO: '/login/sso',
    GLOBAL_CONFIG: '/global-config',
    GLOBAL_CONFIG_GIT: '/global-config/git',
    GLOBAL_CONFIG_DOCKER: '/global-config/docker',
    GLOBAL_CONFIG_CLUSTER: '/global-config/cluster-env',
    GLOBAL_CONFIG_AUTH: '/global-config/auth',
    GLOBAL_CONFIG_NOTIFIER: '/global-config/notifier',
    GLOBAL_CONFIG_NOTIFIER_ADD_NEW: '/global-config/notifier/edit',
    GLOBAL_CONFIG_PROJECT: '/global-config/projects',
    DEPLOYMENT_GROUPS: '/deployment-groups',
    SECURITY: '/security'
};

export enum APP_COMPOSE_STAGE {
    SOURCE_CONFIG = 'MATERIAL',
    CI_CONFIG = 'CI_CONFIG',
    DEPLOYMENT_TEMPLATE = 'DEPLOYMENT_TEMPLATE',
    WORKFLOW_EDITOR = 'WORKFLOW_EDITOR',
    CONFIG_MAPS = 'CONFIG_MAPS',
    SECRETS = 'SECRETS',
    ENV_OVERRIDE = 'ENV_OVERRIDE',
};

export const ORDERED_APP_COMPOSE_ROUTES: {stage: string, path: string}[] = [
        { stage: APP_COMPOSE_STAGE.SOURCE_CONFIG, path: URLS.APP_GIT_CONFIG },
        { stage: APP_COMPOSE_STAGE.CI_CONFIG, path: URLS.APP_DOCKER_CONFIG },
        { stage: APP_COMPOSE_STAGE.DEPLOYMENT_TEMPLATE, path: URLS.APP_DEPLOYMENT_CONFIG },
        { stage: APP_COMPOSE_STAGE.WORKFLOW_EDITOR, path: URLS.APP_WORKFLOW_CONFIG },
        { stage: APP_COMPOSE_STAGE.CONFIG_MAPS, path: URLS.APP_CM_CONFIG },
        { stage: APP_COMPOSE_STAGE.SECRETS, path: URLS.APP_CS_CONFIG },
        { stage: APP_COMPOSE_STAGE.ENV_OVERRIDE, path: URLS.APP_ENV_OVERRIDE_CONFIG }
    ];

export const getAppComposeURL = (appId: string, appStage?: APP_COMPOSE_STAGE):string => {
    if(!appStage) return `${URLS.APP}/${appId}/${URLS.APP_CONFIG}`;
    for(let stageDetail of ORDERED_APP_COMPOSE_ROUTES){
        const {stage, path} = stageDetail
        if(stage === appStage) return `${URLS.APP}/${appId}/${URLS.APP_CONFIG}/${path}`
    }
    return `${URLS.APP}/${appId}/${URLS.APP_CONFIG}/${URLS.APP_GIT_CONFIG}`;
}

export function getAppDetailsURL(appId: number | string, envId?: number |  string):string{
    let url = `${URLS.APP}/${appId}/${URLS.APP_DETAILS}`
    if(envId){
        url = `${url}/${envId}`
    }
    return url
}

export function getAppTriggerURL(appId: number | string): string {
    return `${URLS.APP}/${appId}/${URLS.APP_TRIGGER}`
}
export function getAppCIURL(appId: number | string, ciPipelineId: number | string, buildId: number | string): string {
    let url = `${URLS.APP}/${appId}/${URLS.APP_CI_DETAILS}`
    if(ciPipelineId){
        url = `${url}/${ciPipelineId}`
        if (buildId) {
            url = `${url}/${buildId}`
        }
    }
    return url
}
export function getAppCDURL(appId: number | string, envId?: number | string, cdPipelineId?:number | string, triggerId?:number | string): string {
    let url = `${URLS.APP}/${appId}/${URLS.APP_CD_DETAILS}`
    if(envId){
        url = `${url}/${envId}`
        if(cdPipelineId){
            url = `${url}/${cdPipelineId}`
            if(triggerId){
                url = `${url}/${triggerId}`
            }
        }
    }
    return url
}
export function getAppDeploymentMetricsURL(appId: number | string): string {
    return `${URLS.APP}/${appId}/${URLS.APP_DEPLOYMENT_METRICS}`
}

enum APP_CONFIG_STAGES{
    APP= 'APP',
    MATERIAL = 'MATERIAL',
    TEMPLATE = 'TEMPLATE',
    CI_PIPELINE = 'CI_PIPELINE',
    CHART = 'CHART',
    CD_PIPELINE = 'CD_PIPELINE',
    CHART_ENV_CONFIG = 'CHART_ENV_CONFIG',
}

interface StageStatusResponseItem {
    stage: number;
    stageName: APP_CONFIG_STAGES;
    status: boolean;
    required: boolean;
}

//@responseArr: Array from Stage Status
export function getNextStageURL(responseArr: StageStatusResponseItem[], appId: string): string {
    let requiredStages = [APP_CONFIG_STAGES.APP, APP_CONFIG_STAGES.MATERIAL, APP_CONFIG_STAGES.TEMPLATE, APP_CONFIG_STAGES.CHART];
    let statusMap:Map<APP_CONFIG_STAGES, boolean> = new Map();
    for (let i = 0; i < responseArr.length; i++) {
        statusMap.set(responseArr[i].stageName, responseArr[i].status);
    }
    let goToStage:APP_CONFIG_STAGES=APP_CONFIG_STAGES.CHART;
    
    for (let i = 0; i < requiredStages.length; i++) {
        goToStage = requiredStages[i];
        let status = statusMap.get(goToStage);
        if (!status) break;
    }

    switch (goToStage) {
        case 'CHART':
            if (statusMap.has(APP_CONFIG_STAGES.CHART)) return getAppComposeURL(appId, APP_COMPOSE_STAGE.WORKFLOW_EDITOR);
            else return getAppComposeURL(appId, APP_COMPOSE_STAGE.DEPLOYMENT_TEMPLATE);
        case 'TEMPLATE':
            return getAppComposeURL(appId, APP_COMPOSE_STAGE.CI_CONFIG);
        case 'MATERIAL':
            return getAppComposeURL(appId, APP_COMPOSE_STAGE.SOURCE_CONFIG);
        case 'APP':
            return `${URLS.APP}`;
    }
    return getAppComposeURL(appId, APP_COMPOSE_STAGE.WORKFLOW_EDITOR);
}

export function getNavItems(
    responseArr: StageStatusResponseItem[],
    appId,
): { navItems: NavItem[]; configStatus: number } {
    let statusMap = new Map();
    for (let i = 0; i < responseArr.length; i++) {
        statusMap.set(responseArr[i].stageName, responseArr[i].status);
    }
    let navItems = [
        {
            title: 'Git Material',
            href: getAppComposeURL(appId, APP_COMPOSE_STAGE.SOURCE_CONFIG),
            stage: AppConfigStatus.MATERIAL,
            isLocked: !statusMap.get('APP'),
        },
        {
            title: 'Docker Build Config',
            href: getAppComposeURL(appId, APP_COMPOSE_STAGE.CI_CONFIG),
            stage: AppConfigStatus.TEMPLATE,
            isLocked: !statusMap.get('MATERIAL'),
        },
        {
            title: 'Deployment Template',
            href: getAppComposeURL(appId, APP_COMPOSE_STAGE.DEPLOYMENT_TEMPLATE),
            stage: AppConfigStatus.CHARTS,
            isLocked: !statusMap.get('TEMPLATE'),
        },
        {
            title: 'Workflow Editor',
            href: getAppComposeURL(appId, APP_COMPOSE_STAGE.WORKFLOW_EDITOR),
            stage: AppConfigStatus.WORKFLOW,
            isLocked: !statusMap.get('CHART'),
        },
        {
            title: 'ConfigMaps',
            href: getAppComposeURL(appId, APP_COMPOSE_STAGE.CONFIG_MAPS),
            stage: AppConfigStatus.CONFIGMAP,
            isLocked: !statusMap.get('CHART'),
        },
        {
            title: 'Secrets',
            href: getAppComposeURL(appId, APP_COMPOSE_STAGE.SECRETS),
            stage: AppConfigStatus.SECRETS,
            isLocked: !statusMap.get('CHART'),
        },
        {
            title: 'Environment Override',
            href: getAppComposeURL(appId, APP_COMPOSE_STAGE.ENV_OVERRIDE),
            stage: AppConfigStatus.ENV_OVERRIDE,
            isLocked: !statusMap.get('CHART'),
        },
    ];
    let configStatus = AppConfigStatus.ENV_OVERRIDE;
    for (let i = 0; i < navItems.length; i++) {
        if (navItems[i].isLocked) {
            configStatus = navItems[i].stage;
            break;
        }
    }
    return { configStatus: configStatus - 1, navItems };
}

export function isCIPipelineCreated(responseArr: StageStatusResponseItem[]): boolean {
    let ciPipeline = responseArr.find((item) => item.stageName === 'CI_PIPELINE');
    return ciPipeline.status;
}