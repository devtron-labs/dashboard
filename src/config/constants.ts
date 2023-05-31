import { DOCUMENTATION_HOME_PAGE } from '@devtron-labs/devtron-fe-common-lib'
export const DEFAULT_STATUS = 'Checking Status...'
export const DEFAULTK8SVERSION = 'v1.16.0'
export const TOKEN_COOKIE_NAME = 'argocd.token'
export const DEVTRON_DEFAULT_RELEASE_NAME = 'devtron'
export const DEVTRON_DEFAULT_NAMESPACE = 'devtroncd'
export const DEVTRON_DEFAULT_CLUSTER_ID = '1'

export const Routes = {
    GET: 'get',
    UPDATE: 'update',
    API_VERSION_V2: 'v2',
    LOGIN: 'api/v1/session',
    SOURCE_CONFIG_GET: 'app/get',
    USER_CHECK_ROLE: 'user/check/roles',

    CHART_REFERENCES_MIN: 'chartref/autocomplete',
    CI_CONFIG_GET: 'app/ci-pipeline',
    CI_CONFIG_UPDATE: 'app/ci-pipeline/template/patch',
    CI_PIPELINE_PATCH: 'app/ci-pipeline/patch',
    CI_CONFIG_OVERRIDE_GET: 'app/wf/all/component-names',

    CI_PIPELINE_TRIGGER: 'app/ci-pipeline/trigger',
    CLUSTER: 'cluster',
    VALIDATE: 'cluster/validate',
    SAVECLUSTER: 'cluster/saveClusters',    CLUSTER_DESCRIPTION: 'cluster/description',
    CLUSTER_NOTE: 'cluster/description/note',

    CD_CONFIG: 'app/cd-pipeline',
    EXTERNAL_CI_CONFIG: 'app/external-ci',
    CD_CONFIG_PATCH: 'app/cd-pipeline/patch',
    SPECIFIC_DEPLOYMENT_CONFIG: 'app/history/deployed-configuration/all',
    RECENT_DEPLOYMENT_CONFIG: 'app/history/deployed-configuration/latest/deployed',
    LATEST_DEPLOYMENT_CONFIG: 'app/deployment-configuration/latest/saved',
    WORKFLOW_EDITOR: 'edit/workflow',

    CD_MATERIAL_GET: 'app/cd-pipeline',
    CD_TRIGGER_POST: 'app/cd-pipeline/trigger',
    CD_TRIGGER_STATUS: 'app/vsm',

    DEPLOYMENT_TEMPLATE: 'app/template',
    DEPLOYMENT_TEMPLATE_UPDATE: 'app/template/update',

    DEPLOYMENT_STRATEGY: 'app/cd-pipeline/strategies',
    ENVIRONMENT_CONFIG: 'app/env',
    PIPELINE_CONFIG: 'app/cd-pipeline/pipeline-config',

    APP_CHECKLIST: 'global/checklist',

    APP: 'app',
    APP_LIST: 'app/list',
    APP_LIST_V1: 'v1',
    APP_LIST_V2: 'v2',
    APP_LIST_MIN: 'app/autocomplete',
    APP_DETAIL: 'app/detail',
    APP_CONFIG_STATUS: 'app/stage/status',
    APP_OTHER_ENVIRONMENT: 'app/other-env',
    APP_OTHER_ENVIRONMENT_MIN: 'app/other-env/min',
    APP_CI_PIPELINE: 'ci-pipeline/min',
    APP_LABELS: 'app/edit',

    JOB_CI_DETAIL: 'job/ci-pipeline/list',

    BULK_UPDATE_APIVERSION: 'batch/v1beta1',
    BULK_UPDATE_KIND: 'application',

    DEPLOYMENT_GROUP_LIST: 'deployment-group/dg/fetch/all',
    DEPLOYMENT_GROUP_DEPLOY: 'deployment-group/release/trigger',
    DEPLOYMENT_GROUP_MATERIAL: 'deployment-group/dg/material',
    DEPLOYMENT_GROUP_DELETE: 'deployment-group/dg/delete',
    LINKED_CI_PIPELINES: 'deployment-group/dg/fetch/ci',

    HOST_URL: 'attributes',
    GIT_MATERIAL: 'app/material',
    NOTIFIER: 'notification',
    PROJECT: 'team',
    PROJECT_LIST: 'team',
    PROJECT_LIST_MIN: 'team/autocomplete',
    TEAM_USER: 'team/app/user', //TODO: PROJECT_USER
    DOCKER_REGISTRY_CONFIG: 'docker/registry',
    DOCKER_REGISTRY_MIN: 'docker/registry/autocomplete',
    GITOPS: 'gitops/config',
    GITOPS_VALIDATE: 'gitops/validate',
    GITOPS_CONFIGURED: 'gitops/configured',
    GIT_PROVIDER: 'git/provider',
    GIT_HOST: 'git/host',
    CHART_LIST_SUBPATH: 'list',
    CHART_LIST_SUBPATH_MIN: 'list/min',
    GIT_PROVIDER_MIN: 'git/provider/autocomplete',
    MIGRATION_TOOLS: 'config/mig-tools',
    DATABASE: 'config/databases',
    DB_MIGRATION_CONFIGURATION: 'config/db-migration-config',
    PROPERTIES: 'config/properties',
    PROPERTY_OPTIONS: 'properties-options',
    ENVIRONMENT: 'env',
    ACTIVE_ENVIRONMENT: 'env/active',
    ENVIRONMENT_LIST: 'list/environments',
    ENVIRONMENT_LIST_MIN: 'env/autocomplete',
    ENVIRONMENT_LIST_MIN_HELM_PROJECTS: 'env/autocomplete/helm',

    REFRESH_MATERIAL: 'app/ci-pipeline/refresh-material',
    COMMIT_INFO: 'app/commit-info',
    APPLICATIONS: 'api/v1/applications',
    API_TOKEN: 'api-token',
    API_TOKEN_WEBHOOK: 'api-token/webhook',
    USER_CREATE: 'user/create',
    USER_UPDATE: 'user/update',
    USER_LIST: 'user/all',
    ALL_USERS_LIST: 'user/detail/get',
    ALL_GROUPS_LIST: 'user/role/group/detailed/get',

    DEPLOYMENT_METRICS: 'deployment-metrics',
    APP_CONFIG_MAP_GET: 'configmap/applevel/get',
    APP_CONFIG_MAP_UPDATE: 'configmap/update/applevel',
    APP_CONFIG_MAP_SAVE: 'configmap/create/applevel',
    ENV_CONFIG_MAP_GET: 'configmap/envlevel/get',
    ENV_CONFIG_MAP_UPDATE: 'configmap/update/envlevel',
    ENV_CONFIG_MAP_SAVE: 'configmap/create/envlevel',
    PIPELINE_CONFIG_MAP_GET: 'configmap/pipelinelevel/get',
    PIPELINE_CONFIG_MAP_SAVE: 'configmap/create/pipelinelevel',
    PIPELINE_CONFIG_MAP_UPDATE: 'configmap/update/pipelinelevel',
    CHART_INSTALLED: 'app-store/installed-app',
    CHART_AVAILABLE: 'app-store',
    CHART_STORE: 'app-store',
    CHART_REPO: 'chart-repo',
    CHART_RESYNC: 'sync-charts',
    CHART_STORE_VALUES: 'values',
    CHART_STORE_DEPLOYMENT: 'deployment',
    CHART_VALUES: 'template/values',
    CHART_VALUES_LIST_CATEGORIZED: 'application/values/list',
    CHART_VALUES_LIST_TEMPLATE: 'template/values/list',
    CHART_GROUP: 'chart-group',
    CHART_GROUP_LIST: 'chart-group/list',
    APP_CREATE_CONFIG_MAP: 'config/global/cm',
    APP_CREATE_SECRET: 'config/global/cs',
    WORKFLOW: 'app/app-wf',
    APP_WF: 'app-wf',
    ENV_WORKFLOW: 'env',
    WORKFLOW_STATUS: 'workflow/status',
    ATTRIBUTES_USER: 'attributes/user',
    APP_WORKFLOW_STATUS: 'app/workflow/status',
    APP_CREATE_ENV_SECRET: 'config/environment/cs',
    APP_CREATE_ENV_CONFIG_MAP: 'config/environment/cm',
    APP_META_INFO: 'app/meta/info',
    HELM_APP_META_INFO: 'app/helm/meta/info',
    CLUSTER_ENV_MAPPING: 'env',
    APP_VERSION: 'version',
    HELM_RELEASE_INFO_API: 'application/release-info',
    HELM_RELEASE_DEPLOYMENT_HISTORY_API: 'application/deployment-history',
    HELM_RELEASE_DEPLOYMENT_MANIFEST_DETAILS_API: 'application/deployment-history/info',
    HELM_RELEASE_APP_DETAIL_API: 'application/app',
    MANIFEST: 'k8s/resource',
    DESIRED_MANIFEST: 'application/desired-manifest',
    EVENTS: 'k8s/events',
    LOGS: 'k8s/pods/logs',
    DELETE_RESOURCE: 'k8s/resource/delete',
    CREATE_RESOURCE: 'k8s/resource/create',
    HELM_RELEASE_APP_DELETE_API: 'application/delete',
    HELM_RELEASE_APP_UPDATE_WITHOUT_LINKING_API: 'application/update',
    UPDATE_APP_API: 'app-store/deployment/application/update',
    HELM_LINK_TO_CHART_STORE_API: 'app-store/deployment/application/helm/link-to-chart-store',
    HELM_DEPLOYMENT_ROLLBACK_API: 'application/rollback',
    NAMESPACE: 'env/namespace',
    APP_STORE_INSTALLED_APP: 'app-store/installed-app',
    APP_RELEASE_DEPLOYMENT_HISTORY_API: 'app-store/installed-app/deployment-history',
    APP_RELEASE_DEPLOYMENT_DETAIL_API: 'app-store/installed-app/deployment-history/info',
    PLUGIN_LIST: 'plugin/global/list',
    PLUGIN_DETAIL: 'plugin/global',
    GLOBAL_VARIABLES: 'plugin/global/list/global-variable',
    DASHBOARD_ACCESSED: 'dashboard-event/dashboardAccessed',
    DASHBOARD_LOGGEDIN: 'dashboard-event/dashboardLoggedIn',
    HELM_APP_HIBERNATE_API: 'application/hibernate',
    HELM_APP_UNHIBERNATE_API: 'application/unhibernate',
    EXTERNAL_LINKS_API: 'external-links',
    GET_ALL_APPS: 'app/allApps',
    MODULE_INFO_API: 'module',
    SERVER_INFO_API: 'server',
    LOG_PODNAME_API: 'k8s/resource/inception/info',
    RELEASE_NOTES_API: 'release/notes',
    MODULES_API: 'modules',
    CUSTOM_CHART_LIST: 'deployment/template/fetch',
    VALIDATE_CUSTOM_CHART: 'deployment/template/validate',
    UPLOAD_CUSTOM_CHART: 'deployment/template/upload',
    CLUSTER_LIST: 'k8s/capacity/cluster/list',
    CLUSTER_LIST_MIN: 'k8s/capacity/cluster/list/raw',
    CLUSTER_CAPACITY: 'k8s/capacity/cluster',
    NODE_LIST: 'k8s/capacity/node/list',
    NODE_CAPACITY: 'k8s/capacity/node',
    TAINTS_EDIT: 'k8s/capacity/node/taints/edit',
    HELM_APP_TEMPLATE_CHART: 'application/template-chart',
    TELEMETRY_EVENT: 'telemetry/event',
    DEPLOYMENT_STATUS: 'app/deployment-status/timeline',
    HELM_DEPLOYMENT_STATUS_TIMELINE_INSTALLED_APP: 'app-store/deployment-status/timeline',
    MANUAL_SYNC: 'app/deployment-status/manual-sync',
    MODULE_CONFIGURED: 'module/config',
    SSO: 'sso',
    SSO_LIST: 'sso/list',
    SSO_CREATE: 'sso/create',
    SSO_UPDATE: 'sso/update',
    INGRESS_SERVICE_MANIFEST: 'app/resource/urls',
    EA_INGRESS_SERVICE_MANIFEST: 'k8s/resource/urls',
    CLUSTER_TERMINAL: 'user/terminal',
    START: 'start',
    DISCONNECT_RETRY: 'disconnectAndRetry',
    UPDATE_SHELL: 'update/shell',
    CLUSTER_NAMESPACE: 'cluster/namespaces',
    DISCONNECT: 'disconnect',
    STOP: 'stop',
    POD_MANIFEST: 'pod/manifest',
    POD_EVENTS: 'pod/events',
    UPDATE_HELM_APP_META_INFO: 'app-store/deployment/application/update/project',
    API_RESOURCE: 'k8s/api-resources',
    K8S_RESOURCE_LIST: 'k8s/resource/list',
    K8S_RESOURCE_CREATE: 'k8s/resources/apply',
    CLUSTER_LIST_PERMISSION: 'cluster/auth-list',
    ENVIRONMENT_APPS: 'env/app-grouping',
    ENV_APPLICATIONS: 'applications',
    ENV_DEPLOYMENT_STATUS: 'deployment/status',
    JOB: 'job',
    JOB_LIST: 'job/list',
    JOB_CI_PIPELINE_LIST: 'job/ci-pipeline/list',
    USER_ROLE_GROUP: 'user/role/group',
    APP_FILTER_LIST: 'app/app-listing/autocomplete',
    APP_LIST_GROUP: 'app/list/group',
    CUSTOM_ROLES: 'rbac/role',
    GROUPS: 'groups',
    GROUP: 'group',
    ROTATE_PODS: 'app/rotate-pods',
    DEFAULT_STRATEGY: 'app/cd-pipeline/defaultStrategy/'
}

export const ViewType = {
    EMPTY: 'EMPTY',
    LOADING: 'LOADING',
    FORM: 'FORM',
    ERROR: 'ERROR',
}

export const AppConfigStatus = {
    LOADING: -1,
    APP: 0,
    MATERIAL: 1,
    TEMPLATE: 2,
    CHARTS: 3,
    WORKFLOW: 4,
    CONFIGMAP: 5,
    SECRETS: 6,
    ENV_OVERRIDE: 7,
    END: 10,
}

export const PATTERNS = {
    STRING: /[A-Za-z0-9]+$/,
    APP_NAME: '^[a-z][a-z0-9-.]*[a-z0-9]$/*',
    CD_PIPELINE_NAME: `^[a-z]+[a-z0-9\-\?]*[a-z0-9]+$`,
    CONFIG_MAP_AND_SECRET_KEY: /^[-._a-zA-Z0-9]+$/,
    CONFIGMAP_AND_SECRET_NAME: /^[a-z0-9][a-z0-9-.]*[a-z0-9]$/,
    ALL_DIGITS_BETWEEN_0_AND_7: /^[0-7]*$/,
    APP_LABEL_CHIP: /^.+:.+$/,
    CONFIG_MAP_AND_SECRET_MULTPLS_KEYS: /^[-._a-zA-Z0-9\,\?\s]*[-._a-zA-Z0-9\s]$/,
    VARIABLE: /^[A-z0-9-_]+$/,
    API_TOKEN: '^[a-z0-9][a-z0-9_-]*[a-z0-9]$/*',
    NAMESPACE: '^[a-z0-9]+([a-z0-9-?]*[a-z0-9])?$',
    URL: /^(http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}(:[0-9]{1,5})?(\/.*)?$/,
    KUBERNETES_KEY:
        /^((http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}\/?)*[A-Za-z0-9][A-Za-z0-9-._]{0,253}$/,
    KUBERNETES_VALUE: /^([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]$/,
    KUBERNETES_KEY_PREFIX: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/,
    KUBERNETES_KEY_NAME: /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])$/,
    START_END_ALPHANUMERIC: /^([A-Za-z0-9]).*[A-Za-z0-9]$|^[A-Za-z0-9]{1}$/,
    ALPHANUMERIC_WITH_SPECIAL_CHAR: /^[A-Za-z0-9._-]+$/, // allow alphanumeric,(.) ,(-),(_)
}

export const TriggerType = {
    Auto: 'AUTOMATIC',
    Manual: 'MANUAL',
}

export const SourceTypeMap = {
    BranchFixed: 'SOURCE_TYPE_BRANCH_FIXED',
    WEBHOOK: 'WEBHOOK',
    BranchRegex: 'SOURCE_TYPE_BRANCH_REGEX',
}

export const Moment12HourFormat = 'ddd, DD MMM YYYY, hh:mm A'
export const MomentDateFormat = 'ddd, DD MMM YYYY'
export const Moment12HourExportFormat = 'DD-MMM-YYYY hh.mm A'

export const DOCUMENTATION = {
    HOME_PAGE: DOCUMENTATION_HOME_PAGE,
    APP_CREATE: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/applications/create-application`,
    APP_CREATE_MATERIAL: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/applications/creating-application/git-material`,
    APP_CREATE_CI_CONFIG: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/applications/creating-application/docker-build-configuration`,
    APP_ROLLOUT_DEPLOYMENT_TEMPLATE: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/applications/creating-application/deployment-template/rollout-deployment`,
    APP_DEPLOYMENT_TEMPLATE: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/applications/creating-application/deployment-template`,
    APP_CREATE_CONFIG_MAP: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/applications/creating-application/config-maps`,
    APP_CREATE_SECRET: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/applications/creating-application/secrets`,
    APP_CREATE_WORKFLOW: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/applications/creating-application/workflow`,
    APP_CREATE_ENVIRONMENT_OVERRIDE: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/applications/creating-application/environment-overrides`,
    BULK_UPDATE: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/bulk-update`,
    CHART_DEPLOY: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/deploy-chart`,
    CHART_GROUP: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/deploy-chart/chart-group`,
    CHART_LIST: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/deploy-chart/overview-of-charts`,
    CUSTOM_VALUES: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/deploy-chart/overview-of-charts#custom-values`,
    SECURITY: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/security-features`,
    GLOBAL_CONFIG_GITOPS: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/getting-started/global-configurations/gitops`,
    GLOBAL_CONFIG_GIT: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/getting-started/global-configurations/git-accounts`,
    GLOBAL_CONFIG_DOCKER: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/getting-started/global-configurations/docker-registries`,
    GLOBAL_CONFIG_CLUSTER: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/getting-started/global-configurations/cluster-and-environments`,
    GLOBAL_CONFIG_AUTH: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/global-configurations/authorization/user-access`,
    GLOBAL_CONFIG_CHART: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/getting-started/global-configurations/chart-repo`,
    GLOBAL_CONFIG_NOTIFICATION: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/getting-started/global-configurations/manage-notification`,
    GLOBAL_CONFIG_PROJECT: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/getting-started/global-configurations/projects`,
    GLOBAL_CONFIG_SSO: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/getting-started/global-configurations/sso-login`,
    GLOBAL_CONFIG_USER: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/getting-started/global-configurations/authorization/user-access`,
    GLOBAL_CONFIG_GROUPS: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/getting-started/global-configurations/authorization/permission-groups`,
    HYPERION: `${DOCUMENTATION_HOME_PAGE}/#hyperion`,
    BUILD_STAGE: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/applications/creating-application/ci-pipeline#build-stage`,
    PRE_POST_BUILD_STAGE: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/applications/creating-application/ci-pipeline/ci-build-pre-post-plugins`,
    CUSTOM_CHART: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/getting-started/global-configurations/custom-charts`,
    CUSTOM_CHART_PRE_REQUISITES: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/getting-started/global-configurations/custom-charts#prerequisites`,
    ADMIN_PASSWORD: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/install/install-devtron#devtron-admin-credentials`,
    EXTERNAL_LINKS: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/getting-started/global-configurations/external-links`,
    GLOBAL_CONFIG_GIT_ACCESS_LINK: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/getting-started/global-configurations/gitops#4.-git-access-credential`,
    DEVTRON_UPGRADE: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/getting-started/upgrade`,
    APP_METRICS: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/applications/app-details/app-metrics`,
    EXTERNAL_SECRET: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/applications/creating-application/secrets#external-secrets`,
    BLOB_STORAGE: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/getting-started/install/installation-configuration#configuration-of-blob-storage`,
    ROLLOUT: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/applications/creating-application/deployment-template/rollout-deployment`,
    JOB_CRONJOB: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/applications/creating-application/deployment-template/job-and-cronjob`,
    DEPLOYMENT: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/applications/creating-application/deployment-template/deployment`,
    WEBHOOK_API_TOKEN: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/getting-started/global-configurations/authorization/api-tokens`,
    WEBHOOK_CI: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/applications/creating-application/ci-pipeline#3.-deploy-image-from-external-service`,
    APP_TAGS: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/applications/create-application#tags`,
    APP_OVERVIEW_TAGS: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/applications/overview#manage-tags`,
    K8S_RESOURCES_PERMISSIONS: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/global-configurations/authorization/user-access#kubernetes-resources-permissions`,
    APP_CI_CONFIG_BUILD_WITHOUT_DOCKER: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/applications/creating-application/docker-build-configuration#build-docker-image-without-dockerfile`,
    JOB_SOURCE_CODE: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/jobs/configuration-job`,
    JOB_WORKFLOW_EDITOR: `${DOCUMENTATION_HOME_PAGE}/v/v0.6/usage/jobs/workflow-editor-job`,
}

export const DEVTRON_NODE_DEPLOY_VIDEO = 'https://www.youtube.com/watch?v=9u-pKiWV-tM&t=1s'

export const PREVIEW_DEVTRON = 'https://preview.devtron.ai/dashboard'

export const NETSHOOT_LINK = 'https://github.com/nicolaka/netshoot'

export const BUSYBOX_LINK = 'https://busybox.net/'

export const DISCORD_LINK = 'https://discord.devtron.ai/'

export const OPEN_NEW_TICKET = 'https://enterprise.devtron.ai/portal/en/newticket'

export const VIEW_ALL_TICKETS = 'https://enterprise.devtron.ai/portal/en/myarea'

export const RAISE_ISSUE = 'https://github.com/devtron-labs/devtron/issues/new/choose'

// APP LIST STARTS
export const AppListConstants = {
    SAMPLE_NODE_REPO_URL: 'https://github.com/devtron-labs/getting-started-nodejs',
    CREATE_DEVTRON_APP_URL: 'create-d-app',
    AppTabs: {
        DEVTRON_APPS: 'Devtron Apps',
        HELM_APPS: 'Helm Apps',
    },
    AppType: {
        DEVTRON_APPS: 'd',
        HELM_APPS: 'h',
    },
    FilterType: {
        PROJECT: 'team',
        CLUTSER: 'cluster',
        NAMESPACE: 'namespace',
        ENVIRONMENT: 'environment',
        APP_STATUS: 'appStatus',
    },
}
// APP LIST ENDS

export enum SERVER_MODE {
    EA_ONLY = 'EA_ONLY',
    FULL = 'FULL',
}

export type SERVER_MODE_TYPE = keyof typeof SERVER_MODE

export enum ACCESS_TYPE_MAP {
    DEVTRON_APPS = 'devtron-app', // devtron app work flow
    HELM_APPS = 'helm-app', //helm app work flow
}

export enum MODES {
    YAML = 'yaml',
    JSON = 'json',
    SHELL = 'shell',
    DOCKERFILE = 'dockerfile',
}

export const HELM_APP_UNASSIGNED_PROJECT = 'unassigned'
export interface InputDetailType {
    label: string
    defaultValue: string
    placeholder: string
}
export interface RegistryTypeDetailType {
    value: string
    label: string
    desiredFormat: string
    placeholderText: string
    gettingStartedLink: string
    defaultRegistryURL: string
    registryURL: InputDetailType
    id: InputDetailType
    password: InputDetailType
}

export const REGISTRY_TYPE_MAP: Record<string, RegistryTypeDetailType> = {
    ecr: {
        value: 'ecr',
        label: 'ECR',
        desiredFormat: '(desired format: repo-name)',
        placeholderText: 'Eg. repo_name',
        gettingStartedLink: 'https://docs.aws.amazon.com/AmazonECR/latest/userguide/get-set-up-for-amazon-ecr.html',
        defaultRegistryURL: '',
        registryURL: {
            label: 'Registry URL*',
            defaultValue: '',
            placeholder: 'Eg. xxxxxxxxxxxx.dkr.ecr.region.amazonaws.com',
        },
        id: {
            label: 'Access key ID*',
            defaultValue: '',
            placeholder: '',
        },
        password: {
            label: 'Secret access key*',
            defaultValue: '',
            placeholder: '',
        },
    },
    'docker-hub': {
        value: 'docker-hub',
        label: 'Docker',
        desiredFormat: '(desired format: username/repo-name)',
        placeholderText: 'Eg. username/repo_name',
        gettingStartedLink: 'https://docs.docker.com/docker-hub/',
        defaultRegistryURL: 'docker.io',
        registryURL: {
            label: 'Registry URL*',
            defaultValue: 'docker.io',
            placeholder: '',
        },
        id: {
            label: 'Username*',
            defaultValue: '',
            placeholder: '',
        },
        password: {
            label: 'Password/Token (Recommended: Token)*',
            defaultValue: '',
            placeholder: '',
        },
    },
    acr: {
        value: 'acr',
        label: 'Azure',
        desiredFormat: '(desired format: repo-name)',
        placeholderText: 'Eg. repo_name',
        gettingStartedLink:
            'https://docs.microsoft.com/en-us/azure/container-registry/container-registry-get-started-portal',
        defaultRegistryURL: '',
        registryURL: {
            label: 'Registry URL/Login Server*',
            defaultValue: '',
            placeholder: 'Eg. xxx.azurecr.io',
        },
        id: {
            label: 'Username/Registry Name*',
            defaultValue: '',
            placeholder: '',
        },
        password: {
            label: 'Password*',
            defaultValue: '',
            placeholder: '',
        },
    },
    'artifact-registry': {
        value: 'artifact-registry',
        label: 'Artifact Registry (GCP)',
        desiredFormat: '(desired format: project-id/artifacts-repo/repo-name)',
        placeholderText: 'Eg. project-id/artifacts-repo/repo-name',
        gettingStartedLink: 'https://cloud.google.com/artifact-registry/docs/manage-repos?hl=en_US',
        defaultRegistryURL: '',
        registryURL: {
            label: 'Registry URL*',
            defaultValue: '',
            placeholder: 'Eg. region-docker.pkg.dev',
        },
        id: {
            label: 'Username*',
            defaultValue: '_json_key',
            placeholder: '',
        },
        password: {
            label: 'Service Account JSON File*',
            defaultValue: '',
            placeholder: 'Paste json file content here',
        },
    },
    gcr: {
        value: 'gcr',
        label: 'GCR',
        desiredFormat: '(desired format: project-id/repo-name)',
        placeholderText: 'Eg. project-id/repo_name',
        gettingStartedLink: 'https://cloud.google.com/container-registry/docs/quickstart',
        defaultRegistryURL: 'gcr.io',
        registryURL: {
            label: 'Registry URL*',
            defaultValue: 'gcr.io',
            placeholder: '',
        },
        id: {
            label: 'Username*',
            defaultValue: '_json_key',
            placeholder: '',
        },
        password: {
            label: 'Service Account JSON File*',
            defaultValue: '',
            placeholder: 'Paste json file content here',
        },
    },
    quay: {
        value: 'quay',
        label: 'Quay',
        desiredFormat: '(desired format: username/repo-name)',
        placeholderText: 'Eg. username/repo_name',
        gettingStartedLink: '',
        defaultRegistryURL: 'quay.io',
        registryURL: {
            label: 'Registry URL*',
            defaultValue: 'quay.io',
            placeholder: '',
        },
        id: {
            label: 'Username*',
            defaultValue: '',
            placeholder: '',
        },
        password: {
            label: 'Token*',
            defaultValue: '',
            placeholder: '',
        },
    },
    other: {
        value: 'other',
        label: 'Other',
        desiredFormat: '',
        placeholderText: '',
        gettingStartedLink: '',
        defaultRegistryURL: '',
        registryURL: {
            label: 'Registry URL*',
            defaultValue: '',
            placeholder: '',
        },
        id: {
            label: 'Username*',
            defaultValue: '',
            placeholder: '',
        },
        password: {
            label: 'Password/Token*',
            defaultValue: '',
            placeholder: '',
        },
    },
}

export const AppCreationType = {
    Blank: 'BLANK',
    Existing: 'EXISTING',
}

export const ConfigurationType = {
    GUI: 'GUI',
    YAML: 'YAML',
}

export const BuildStageVariable = {
    PreBuild: 'preBuildStage',
    Build: 'buildStage',
    PostBuild: 'postBuildStage',
}

export const BuildTabText = {
    preBuildStage: 'Pre-build stage',
    buildStage: 'Build stage',
    postBuildStage: 'Post-build stage',
}

export const JobPipelineTabText = {
    buildStage: 'Basic configuration',
    preBuildStage: 'Tasks to be executed',
}

export const APP_STATUS_CUSTOM_MESSAGES = {
    HIBERNATED: "This application's workloads are scaled down to 0 replicas",
    'PARTIALLY HIBERNATED': "Some of this application's workloads are scaled down to 0 replicas.",
    INTEGRATION_INSTALLING: 'The installation will complete when status for all the below resources become HEALTHY.',
}

export const DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP = {
    DEPLOYMENT_TEMPLATE: {
        DISPLAY_NAME: 'Deployment template',
        VALUE: 'deployment-template',
    },
    PIPELINE_STRATEGY: {
        DISPLAY_NAME: 'Pipeline configurations',
        VALUE: 'pipeline-strategy',
    },
    CONFIGMAP: {
        DISPLAY_NAME: 'ConfigMap',
        VALUE: 'configmap',
    },
    SECRET: {
        DISPLAY_NAME: 'Secret',
        VALUE: 'secret',
    },
}

export const EXTERNAL_TYPES = {
    '': 'Kubernetes Secret',
    KubernetesSecret: 'Kubernetes External Secret',
    AWSSecretsManager: 'AWS Secrets Manager',
    AWSSystemManager: 'AWS System Manager',
    HashiCorpVault: 'Hashi Corp Vault',
}

export const ROLLOUT_DEPLOYMENT = 'Rollout Deployment'
export const DEPLOYMENT = 'Deployment'

export const ModuleNameMap = {
    ARGO_CD: 'argo-cd',
    CICD: 'cicd',
    SECURITY: 'security.clair',
    BLOB_STORAGE: 'blob-storage',
    GRAFANA: 'monitoring.grafana',
    NOTIFICATION: 'notifier',
}

export const BUILD_STATUS = {
    NOT_TRIGGERED: 'not triggered',
    NOT_DEPLOYED: 'not deployed',
}

export const EVENT_STREAM_EVENTS_MAP = {
    MESSAGE: 'message',
    START_OF_STREAM: 'START_OF_STREAM',
    END_OF_STREAM: 'END_OF_STREAM',
    ERROR: 'error',
}

export const TERMINAL_STATUS_MAP = {
    SUCCEEDED: 'succeeded',
    HEALTHY: 'healthy',
    RUNNING: 'running',
    PROGRESSING: 'progressing',
    STARTING: 'starting',
    FAILED: 'failed',
    ERROR: 'error',
    CANCELLED: 'cancelled',
    UNABLE_TO_FETCH: 'unabletofetch',
    TIMED_OUT: 'timedout',
}

export const POD_STATUS = {
    PENDING: 'Pending',
}

export const CLUSTER_COMMAND = {
    k8Cluster: {
        heading: 'K8s cluster providers',
        clusterName: 'K8s',
        title: 'Supports EKS, AKS, GKE, Kops, Digital Ocean managed Kubernetes.',
        command:
            'curl -O https://raw.githubusercontent.com/devtron-labs/utilities/main/kubeconfig-exporter/kubernetes_export_sa.sh && bash kubernetes_export_sa.sh cd-user devtroncd',
    },
    microK8s: {
        heading: 'MicroK8s',
        clusterName: 'microK8s',
        title: 'MicroK8s is a light weight Kubernetes cluster',
        command:
            "curl -O https://raw.githubusercontent.com/devtron-labs/utilities/main/kubeconfig-exporter/kubernetes_export_sa.sh && sed -i 's/kubectl/microk8s kubectl/g' kubernetes_export_sa.sh && bash kubernetes_export_sa.sh cd-user devtroncd",
    },
}

export enum KIND {
    INGRESS = 'Ingress',
    SERVICE = 'Service',
}

export const MODULE_STATUS_RETRY_COUNT = 3
export const MODULE_STATUS_POLLING_INTERVAL = 15000
export const LOGS_RETRY_COUNT = 3
export const APP_STATUS_HEADERS = ['KIND', 'NAME', 'STATUS', 'MESSAGE']
export const MANIFEST_STATUS_HEADERS = ['KIND', 'NAME', 'SYNC STATUS', 'MESSAGE']

export const shellTypes = [
    { label: 'sh', value: 'sh' },
    { label: 'bash', value: 'bash' },
    { label: 'powershell', value: 'powershell' },
    { label: 'cmd', value: 'cmd' },
]

export enum AppDetailsErrorType {
    ERRIMAGEPULL = 'errimagepull',
    IMAGEPULLBACKOFF = 'imagepullbackoff',
}

export const DEPRECATED_EXTERNAL_CI_MESSAGE = {
    LINE_ONE: 'This workflow uses a deprecated method to receive container images from external build services.',
    LINE_TWO: 'Deprecated workflows will be deleted in the next Devtron update.',
    LINE_THREE: 'You can continue to deploy images from external build services',
    DOC_LINK_TEXT: 'Refer documentation to learn more.',
}

export const MESSAGING_UI = {
    NO_RESOURCE: 'This resource no longer exists',
    NO_EVENTS: 'Events not available',
    FETCHING_EVENTS: 'Fetching events',
    MANIFEST_NOT_AVAILABLE: 'Manifest not available',
    FETCHING_MANIFEST: 'Fetching manifest',
}

export const ZERO_TIME_STRING = '0001-01-01T00:00:00Z'
export const CHART_REPO_TYPE = {
    PUBLIC: 'PUBLIC',
    PRIVATE: 'PRIVATE',
}

export const CHART_REPO_AUTH_TYPE = {
    ANONYMOUS: 'ANONYMOUS',
    USERNAME_PASSWORD: 'USERNAME_PASSWORD',
    ACCESS_TOKEN: 'ACCESS_TOKEN',
}

export const CHART_REPO_LABEL = [
    { value: 'PUBLIC', label: 'Public repository' },
    { value: 'PRIVATE', label: 'Private repository' },
]

export enum TIMELINE_STATUS {
    DEPLOYMENT_INITIATED = 'DEPLOYMENT_INITIATED',
    GIT_COMMIT = 'GIT_COMMIT',
    GIT_COMMIT_FAILED = 'GIT_COMMIT_FAILED',
    KUBECTL_APPLY = 'KUBECTL_APPLY',
    KUBECTL_APPLY_STARTED = 'KUBECTL_APPLY_STARTED',
    KUBECTL_APPLY_SYNCED = 'KUBECTL_APPLY_SYNCED',
    HEALTHY = 'HEALTHY',
    APP_HEALTH = 'APP_HEALTH',
    DEPLOYMENT_FAILED = 'FAILED',
    FETCH_TIMED_OUT = 'TIMED_OUT',
    UNABLE_TO_FETCH_STATUS = 'UNABLE_TO_FETCH_STATUS',
    DEGRADED = 'DEGRADED',
    DEPLOYMENT_SUPERSEDED = 'DEPLOYMENT_SUPERSEDED',
    ABORTED = 'ABORTED',
    INPROGRESS= 'INPROGRESS'
}

export const DEPLOYMENT_STATUS = {
    SUCCEEDED: 'succeeded',
    HEALTHY: 'healthy',
    FAILED: 'failed',
    TIMED_OUT: 'timed_out',
    UNABLE_TO_FETCH: 'unable_to_fetch',
    INPROGRESS: 'inprogress',
    PROGRESSING: 'inprogress',
    SUPERSEDED: 'superseded',
}

export const HELM_DEPLOYMENT_STATUS_TEXT = {
    PROGRESSING: 'Progressing',
    INPROGRESS: 'In progress',
}

export const DEPLOYMENT_STATUS_QUERY_PARAM = 'deployment-status'
export const LAST_SEEN = 'last seen'
export const GIT_BRANCH_NOT_CONFIGURED = 'Not Configured'
export const SOURCE_NOT_CONFIGURED = 'Source not configured'
export const DOCKER_FILE_ERROR_TITLE = 'Unable to locate Dockerfile as source is not configured for this repository'
export const DOCKER_FILE_ERROR_MESSAGE = 'Unable to locate Dockerfile as source is not configured for this repository'
export const DEFAULT_GIT_BRANCH_VALUE = '--'
export const SOURCE_NOT_CONFIGURED_MESSAGE =
    'Source is not configured for one or more git repositories. Please configure and try again.'
export const NO_COMMIT_SELECTED = 'No commit is selected'
export enum MANIFEST_KEY_FIELDS {
    METADATA = 'metadata',
    MANAGED_FIELDS = 'managedFields',
}

export enum KEY_VALUE {
    KEY = 'key',
    VALUE = 'value',
}

export enum CONFIGURATION_TYPES {
    ENVIRONMENT = 'ENVIRONMENT',
    NAMESPACE = 'NAMESPACE',
    DESCRIPTION = 'DESCRIPTION',
}

export const RequiredKinds = ['Deployment', 'StatefulSet', 'DemonSet', 'Rollout']

export const POD_ROTATION_INITIATED = 'Pod rotation initiated'
