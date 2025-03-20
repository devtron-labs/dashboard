/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    DOCUMENTATION_HOME_PAGE,
    DOCUMENTATION_VERSION,
    SelectPickerOptionType,
    ToastManager,
    ROUTES as COMMON_ROUTES,
    EnvResourceType,
} from '@devtron-labs/devtron-fe-common-lib'
export const DEFAULT_STATUS = 'checking'
export const DEFAULT_STATUS_TEXT = 'Checking Status'
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
    IMAGE_TAGGING: 'app/image-tagging',
    CI_PIPELINE_PATCH: 'app/ci-pipeline/patch',
    CI_CONFIG_OVERRIDE_GET: 'app/wf/all/component-names',
    CI_PIPELINE_SOURCE_BULK_PATCH: 'app/ci-pipeline/bulk/branch-update',

    CI_PIPELINE_TRIGGER: 'app/ci-pipeline/trigger',
    CLUSTER: 'cluster',
    VALIDATE: 'cluster/validate',
    SAVECLUSTER: 'cluster/saveClusters',
    CLUSTER_DESCRIPTION: 'cluster/description',
    CLUSTER_NOTE: 'cluster/note',
    APPLICATION_NOTE: 'app/note',

    CD_CONFIG: 'app/cd-pipeline',
    V2_CD_CONFIG: 'app/v2/cd-pipeline',
    EXTERNAL_CI_CONFIG: 'app/external-ci',
    CD_CONFIG_PATCH: 'app/cd-pipeline/patch',
    WORKFLOW_EDITOR: 'edit/workflow',

    CD_TRIGGER_STATUS: 'app/vsm',

    DEPLOYMENT_TEMPLATE: 'app/template',
    DEPLOYMENT_TEMPLATE_UPDATE: 'app/template/update',
    LOCKED_CONFIG_PROTECTED: 'draft/config/lock/validate',
    LOCKED_CONFIG_NON_PROTECTED: 'app/template/validate',

    DEPLOYMENT_OPTIONS: 'app/template/list',

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
    APP_CD_PIPELINE_VALIDATE_LINK_REQUEST: 'app/cd-pipeline/validate-link-request',
    ARGO_APPLICATION: 'argo-application/detail',
    EPHEMERAL_CONTAINERS: 'k8s/resources/ephemeralContainers',
    APP_EDIT: 'app/edit',
    APPLICATION_EXTERNAL_HELM_RELEASE: 'application/external-helm-release',

    JOB_CI_DETAIL: 'job/ci-pipeline/list',

    BULK_UPDATE_APIVERSION: 'batch/v1beta1',
    BULK_UPDATE_KIND: 'application',

    LINKED_CI_DOWNSTREAM: 'linked-ci/downstream',

    HOST_URL: 'attributes',
    GIT_MATERIAL: 'app/material',
    NOTIFIER: 'notification',
    PROJECT: 'team',
    PROJECT_LIST: 'team',
    PROJECT_LIST_MIN: 'team/autocomplete',
    TEAM_USER: 'team/app/user', // TODO: PROJECT_USER
    DOCKER_REGISTRY_CONFIG: 'docker/registry',
    DOCKER_REGISTRY_MIN: 'docker/registry/autocomplete',
    GITOPS: 'gitops/config',
    GITOPS_DEVTRON_APP: `app/template/gitops/config`,
    GITOPS_VALIDATE: 'gitops/validate',
    GITOPOS_HELM_VALIDATE: 'app-store/gitops/validate',
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
    USER_PERMISSIONS: 'users',
    PERMISSION_GROUPS: 'groups',
    SSO_LOGIN_SERVICES: 'login-service',
    API_TOKEN: 'api-token',
    API_TOKEN_WEBHOOK: 'api-token/webhook',

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
    ARGO_APPS: 'argo-application',
    FLUX_APPS: 'flux-application',
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
    MANIFEST: COMMON_ROUTES.K8S_RESOURCE,
    DESIRED_MANIFEST: 'application/desired-manifest',
    EVENTS: 'k8s/events',
    LOGS: 'k8s/pods/logs',
    NONCASCADE_DELETE_HELM_APP: 'app-store/installed-app/delete',
    NONCASCADE_DELETE_DEVTRON_APP: 'app/delete',
    CREATE_RESOURCE: COMMON_ROUTES.CREATE_RESOURCE,
    HELM_RELEASE_APP_DELETE_API: 'application/delete',
    HELM_RELEASE_APP_UPDATE_WITHOUT_LINKING_API: 'application/update',
    UPDATE_APP_API: 'app-store/deployment/application/update',
    HELM_APP_OVERVIEW: 'app-store/overview',
    HELM_LINK_TO_CHART_STORE_API: 'app-store/deployment/application/helm/link-to-chart-store',
    HELM_DEPLOYMENT_ROLLBACK_API: 'application/rollback',
    NAMESPACE: 'env/namespace',
    APP_STORE_INSTALLED_APP: 'app-store/installed-app',
    APP_RELEASE_DEPLOYMENT_HISTORY_API: 'app-store/installed-app/deployment-history',
    APP_RELEASE_DEPLOYMENT_DETAIL_API: 'app-store/installed-app/deployment-history/info',
    PLUGIN_GLOBAL_CREATE: 'plugin/global/create',
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
    VALIDATE_CUSTOM_CHART: 'deployment/template/validate',
    UPLOAD_CUSTOM_CHART: 'deployment/template/upload',
    DOWNLOAD_CUSTOM_CHART: 'deployment/template/download',
    CLUSTER_LIST: 'k8s/capacity/cluster/list',
    CLUSTER_LIST_MIN: 'k8s/capacity/cluster/list/raw',
    CLUSTER_CAPACITY: 'k8s/capacity/cluster',
    NODE_LIST: 'k8s/capacity/node/list',
    TAINTS_EDIT: 'k8s/capacity/node/taints/edit',
    HELM_APP_TEMPLATE_CHART: 'application/template-chart',
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
    BULK_ROTATE_POD: 'app/template/workloads',
    DEFAULT_STRATEGY: 'app/cd-pipeline/defaultStrategy/',
    EDIT: 'edit',
    JOB_CONFIG_ENVIRONMENTS: 'config/environment',
    PERMISSION: 'permission/check',
    SCOPED_GLOBAL_VARIABLES_DETAIL: 'global/variables/detail',
    GVK: 'gvk',
    USER: 'user',
    ENV_CONFIG: 'config/autocomplete',
    SECURITY_SCAN_CVE_EXPOSURE: 'security/scan/cve/exposure',
    CONFIG_MANIFEST: 'config/manifest',
    USER_RESOURCE_OPTIONS: 'user/resource/options'
}

export enum ViewType {
    EMPTY = 'EMPTY',
    LOADING = 'LOADING',
    FORM = 'FORM',
    ERROR = 'ERROR',
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
    APP_NAME: '^[a-z][a-z0-9-]*[a-z0-9]$/*',
    CD_PIPELINE_NAME: `^[a-z]+[a-z0-9\-\?]*[a-z0-9]+$`,
    APP_LABEL_CHIP: /^.+:.+$/,
    VARIABLE: /^[A-z0-9-_]+$/,
    API_TOKEN: '^[a-z0-9][a-z0-9_-]*[a-z0-9]$/*',
    NAMESPACE: '^[a-z0-9]+([a-z0-9-?]*[a-z0-9])?$',
    URL: /^(http:\/\/|https:\/\/)?[A-Za-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}(:[0-9]{1,5})?(\/.*)?$/,
    KUBERNETES_KEY:
        /^((http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}\/?)*[A-Za-z0-9][A-Za-z0-9-._]{0,253}$/,
    KUBERNETES_VALUE: /^([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]$/,
    KUBERNETES_KEY_PREFIX: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/,
    KUBERNETES_KEY_NAME: /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])$/,
    START_END_ALPHANUMERIC: /^([A-Za-z0-9]).*[A-Za-z0-9]$|^[A-Za-z0-9]{1}$/,
    ALPHANUMERIC_WITH_SPECIAL_CHAR: /^[A-Za-z0-9._-]+$/, // allow alphanumeric,(.) ,(-),(_)
    CUSTOM_TAG: /^(?![.-])([a-zA-Z0-9_.-]*\{[Xx]\}[a-zA-Z0-9_.-]*)(?<![.-])$/, // Allowed: Alphanumeric characters, including (_) (.) (-) {x} {X} but cannot begin or end with (.) or (-)
    ESCAPED_CHARACTERS: /[.*+?^${}()|[\]\\]/g,
}

export const repoType = {
    DEFAULT: 'DEFAULT',
    CONFIGURE: 'CONFIGURE',
}

/**
 * @deprecated use from fe-common
 */
export const SourceTypeMap = {
    BranchFixed: 'SOURCE_TYPE_BRANCH_FIXED',
    WEBHOOK: 'WEBHOOK',
    BranchRegex: 'SOURCE_TYPE_BRANCH_REGEX',
}

export const Moment12HourFormat = 'ddd, DD MMM YYYY, hh:mm A'
export const MomentDateFormat = 'ddd, DD MMM YYYY'
export const Moment12HourExportFormat = 'DD-MMM-YYYY hh.mm A'
export const MomentInvalidDate = 'Invalid date'

export const DOCUMENTATION = {
    ADMIN_PASSWORD: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/install/install-devtron#devtron-admin-credentials`,
    APP_CI_CONFIG_BUILD_WITHOUT_DOCKER: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/creating-application/docker-build-configuration#build-docker-image-without-dockerfile`,
    APP_CREATE: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/create-application`,
    APP_CREATE_CI_CONFIG: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/creating-application/docker-build-configuration`,
    APP_CREATE_CONFIG_MAP: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/creating-application/config-maps`,
    APP_CREATE_ENVIRONMENT_OVERRIDE: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/creating-application/environment-overrides`,
    APP_CREATE_MATERIAL: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/creating-application/git-material`,
    APP_CREATE_SECRET: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/creating-application/secrets`,
    APP_CREATE_WORKFLOW: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/creating-application/workflow`,
    APP_DEPLOYMENT_TEMPLATE: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/creating-application/deployment-template`,
    APP_EPHEMERAL_CONTAINER: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/app-details/ephemeral-containers`,
    APP_TAGS: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/create-application#tags`,
    APP_OVERVIEW_TAGS: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/overview#manage-tags`,
    APP_ROLLOUT_DEPLOYMENT_TEMPLATE: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/creating-application/deployment-template/rollout-deployment`,
    BLOB_STORAGE: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/getting-started/install/installation-configuration#configuration-of-blob-storage`,
    BUILD_STAGE: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/creating-application/ci-pipeline#build-stage`,
    BULK_UPDATE: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/bulk-update`,
    CHART_DEPLOY: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/deploy-chart`,
    CHART_GROUP: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/deploy-chart/chart-group`,
    CHART_LIST: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/deploy-chart/overview-of-charts`,
    CUSTOM_CHART: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/getting-started/global-configurations/custom-charts`,
    CUSTOM_CHART_PRE_REQUISITES: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/getting-started/global-configurations/custom-charts#prerequisites`,
    CUSTOM_VALUES: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/deploy-chart/overview-of-charts#custom-values`,
    DEPLOYMENT: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/creating-application/deployment-template/deployment`,
    DEPLOYMENT_TEMPLATE: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/creating-application/deployment-template`,
    DEVTRON_UPGRADE: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/getting-started/upgrade`,
    EXECUTE_CUSTOM_SCRIPT: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/creating-application/workflow/ci-pipeline/ci-build-pre-post-plugins#execute-custom-script`,
    EXTERNAL_LINKS: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/getting-started/global-configurations/external-links`,
    EXTERNAL_SECRET: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/creating-application/secrets#external-secrets`,
    // Global Configurations
    GLOBAL_CONFIG_API_TOKEN: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/getting-started/global-configurations/authorization/api-tokens`,
    GLOBAL_CONFIG_AUTH: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/global-configurations/authorization/user-access`,
    GLOBAL_CONFIG_CHART: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/getting-started/global-configurations/chart-repo`,
    GLOBAL_CONFIG_CLUSTER: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/getting-started/global-configurations/cluster-and-environments`,
    GLOBAL_CONFIG_DOCKER: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/getting-started/global-configurations/container-registries`,
    GLOBAL_CONFIG_GIT: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/getting-started/global-configurations/git-accounts`,
    GLOBAL_CONFIG_GITOPS: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/getting-started/global-configurations/gitops`,
    GLOBAL_CONFIG_GITOPS_GITHUB: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/global-configurations/gitops#github`,
    GLOBAL_CONFIG_GITOPS_GITLAB: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/global-configurations/gitops#gitlab`,
    GLOBAL_CONFIG_GITOPS_AZURE: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/global-configurations/gitops#azure`,
    GLOBAL_CONFIG_GITOPS_BITBUCKET: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/global-configurations/gitops#bitbucket`,
    GLOBAL_CONFIG_GROUPS: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/getting-started/global-configurations/authorization/permission-groups`,
    GLOBAL_CONFIG_HOST_URL: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/getting-started/global-configurations/host-url`,
    GLOBAL_CONFIG_NOTIFICATION: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/getting-started/global-configurations/manage-notification`,
    GLOBAL_CONFIG_PERMISSION: `${DOCUMENTATION_HOME_PAGE}/global-configurations/authorization/user-access#devtron-apps-permissions`,
    GLOBAL_CONFIG_PROJECT: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/getting-started/global-configurations/projects`,
    GLOBAL_CONFIG_SSO: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/getting-started/global-configurations/sso-login`,
    GLOBAL_CONFIG_SCOPED_VARIABLES: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/getting-started/global-configurations/scoped-variables`,
    GLOBAL_CONFIG_USER: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/getting-started/global-configurations/authorization/user-access`,
    HOME_PAGE: DOCUMENTATION_HOME_PAGE,
    HYPERION: `${DOCUMENTATION_HOME_PAGE}/#hyperion`,
    JOB_CRONJOB: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/creating-application/deployment-template/job-and-cronjob`,
    JOB_SOURCE_CODE: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/jobs/configuration-job`,
    JOB_WORKFLOW_EDITOR: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/jobs/workflow-editor-job`,
    K8S_RESOURCES_PERMISSIONS: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/global-configurations/authorization/user-access#kubernetes-resources-permissions`,
    MANDATORY_TAGS: `${DOCUMENTATION_HOME_PAGE}/global-configurations/tags-policy#create-application-with-mandatory-tags`,
    PRE_POST_BUILD_STAGE: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/creating-application/ci-pipeline/ci-build-pre-post-plugins`,
    ROLLOUT: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/creating-application/deployment-template/rollout-deployment`,
    SECURITY: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/security-features`,
    SPECIFY_IMAGE_PULL_SECRET: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/getting-started/global-configurations/container-registries#specify-image-pull-secret`,
    WEBHOOK_CI: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/creating-application/ci-pipeline#3.-deploy-image-from-external-service`,
}

export const HEADER_TEXT = {
    API_TOKEN: {
        title: 'API Token',
        description: 'Tokens you have generated that can be used to access the Devtron API.',
        docLink: DOCUMENTATION.GLOBAL_CONFIG_API_TOKEN,
    },
    CHART_REPOSITORY: {
        title: 'Chart Repository',
        description: 'Manage your organization’s chart repositories.',
        docLink: DOCUMENTATION.GLOBAL_CONFIG_CHART,
    },
    HOST_URL: {
        title: 'Host URL',
        description: 'Host URL is the domain address at which your devtron dashboard can be reached.',
        docLink: DOCUMENTATION.GLOBAL_CONFIG_HOST_URL,
    },
    GITOPS: {
        title: 'GitOps',
        description: 'Devtron uses GitOps configuration to store kubernetes configuration files of applications.',
        docLink: DOCUMENTATION.GLOBAL_CONFIG_GITOPS,
    },
    GIT_ACCOUNTS: {
        title: 'Git Accounts',
        description: 'Manage your organization’s git accounts.',
        docLink: DOCUMENTATION.GLOBAL_CONFIG_GIT,
    },
    NOTIFICATIONS: {
        title: 'Notifications',
        description: 'Manage notifications for build and deployment pipelines.',
        docLink: DOCUMENTATION.GLOBAL_CONFIG_NOTIFICATION,
    },
    PROJECTS: {
        title: 'Projects',
        description: "Manage your organization's projects.",
        docLink: DOCUMENTATION.GLOBAL_CONFIG_PROJECT,
    },
    SSO_LOGIN: {
        title: 'SSO Login Service',
        description: 'Configure and manage login service for your organization.',
        docLink: DOCUMENTATION.GLOBAL_CONFIG_SSO,
    },
    SCOPED_VARIABLES: {
        title: 'Scoped Variables',
        description: 'Scoped variables are used to define environment-specific variables.',
        docLink: DOCUMENTATION.GLOBAL_CONFIG_SCOPED_VARIABLES,
    },
}

export const DEVTRON_NODE_DEPLOY_VIDEO = 'https://www.youtube.com/watch?v=9u-pKiWV-tM&t=1s'

export const NETSHOOT_LINK = 'https://github.com/nicolaka/netshoot'

export const BUSYBOX_LINK = 'https://busybox.net/'

export enum SERVER_MODE {
    EA_ONLY = 'EA_ONLY',
    FULL = 'FULL',
}

export type SERVER_MODE_TYPE = keyof typeof SERVER_MODE

export enum APP_TYPE {
    HELM_CHART = 'helm-chart',
    DEVTRON_APPS = 'app',
    JOB = 'job',
}

export enum MODES {
    YAML = 'yaml',
    JSON = 'json',
    SHELL = 'shell',
    DOCKERFILE = 'dockerfile',
}

export const HELM_APP_UNASSIGNED_PROJECT = 'unassigned'
export type OCIRegistryStorageActionType = 'PULL' | 'PUSH' | 'PULL/PUSH'
export type OCIRegistryStorageConfigType = {
    CONTAINER?: OCIRegistryStorageActionType
    CHART?: OCIRegistryStorageActionType
}
export const OCIRegistryConfigConstants: Record<string, OCIRegistryStorageActionType> = {
    PULL: 'PULL',
    PUSH: 'PUSH',
    PULL_PUSH: 'PULL/PUSH',
}

export const RegistryStorageType = {
    OCI_PRIVATE: 'OCI_PRIVATE',
    OCI_PUBLIC: 'OCI_PUBLIC',
}

export const REGISTRY_TITLE_DESCRIPTION_CONTENT = {
    heading: 'Container / OCI Registry',
    infoText:
        'A registry is used to store container images built by a build pipeline. The connected deployment pipeline then pulls the required image from the registry for deployment.',
    additionalParagraphText: 'You can also control which clusters have access to pull images from a registry.',
    documentationLinkText: 'View documentation',
}

export const EA_MODE_REGISTRY_TITLE_DESCRIPTION_CONTENT = {
    heading: 'OCI Registry',
    infoText:
        'Devtron can pull helm charts stored in OCI Registry. Charts pulled from added OCI Registries are shown in Chart Store which can be used for deployment.',
    documentationLinkText: 'View documentation',
}

export const CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT = {
    heading: 'Deployment Charts',
    infoText: 'Deployment charts in the Deployment Template are used to deploy Devtron applications.',
    additionalParagraphText:
        'Devtron offers charts for most use cases. If needed, you can download a chart, modify it, and re-upload it to add specific capabilities.',
    documentationLinkText: 'View documentation',
}

export interface RegistryPayloadType {
    id: string
    pluginId: string
    registryType: string
    isDefault: boolean
    isOCICompliantRegistry: boolean
    registryUrl: string
    awsAccessKeyId?: string
    awsSecretAccessKey?: string
    awsRegion?: string
    username?: string
    password?: string
    connection?: string
    cert?: string
    ipsConfig: {
        id: string
        credentialType: string
        credentialValue: string
        appliedClusterIdsCsv: string
        ignoredClusterIdsCsv: string
    }
    ociRegistryConfig?: OCIRegistryStorageConfigType
    repositoryList: string[]
    isPublic: boolean
    remoteConnectionConfig: {
        connectionMethod: string
        proxyConfig: {
            proxyUrl: string
        }
        sshConfig: {
            sshServerAddress: string
            sshUsername: string
            sshPassword: string
            sshAuthKey: string
        }
    }
}

export interface RegistryPayloadWithSelectType extends RegistryPayloadType, SelectPickerOptionType {}

export const RegistryType = {
    DOCKER_HUB: 'docker-hub',
    ACR: 'acr',
    QUAY: 'quay',
    OTHER: 'other',
    ECR: 'ecr',
    ARTIFACT_REGISTRY: 'artifact-registry',
    GCR: 'gcr',
}

export const RegistryTypeName = {
    OCI_PRIVATE: 'Private Registry',
    OCI_PUBLIC: 'Public Registry',
}

export const AppCreationType = {
    Blank: 'BLANK',
    Existing: 'EXISTING',
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

export const CDDeploymentTabText = {
    preBuildStage: 'Pre-Deployment stage',
    buildStage: 'Deployment stage',
    postBuildStage: 'Post-Deployment stage',
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

export const ROLLOUT_DEPLOYMENT = 'Rollout Deployment'
export const DEPLOYMENT = 'Deployment'
export const MODULE_TYPE_SECURITY = 'security'
export const TRIVY_TOOL_VERSION = 'V1'
export const CLAIR_TOOL_VERSION_V4 = 'V4'
export const CLAIR_TOOL_VERSION_V2 = 'V2'

/**
 * @deprecated Use from fe-common-lib
 */
export const ModuleNameMap = {
    ARGO_CD: 'argo-cd',
    CICD: 'cicd',
    SECURITY: 'security',
    BLOB_STORAGE: 'blob-storage',
    GRAFANA: 'monitoring.grafana',
    NOTIFICATION: 'notifier',
    SECURITY_TRIVY: 'security.trivy',
    SECURITY_CLAIR: 'security.clair',
}

export const BUILD_STATUS = {
    NOT_TRIGGERED: 'not triggered',
    NOT_DEPLOYED: 'not deployed',
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
export const APP_STATUS_HEADERS = ['KIND', 'NAME', 'STATUS', 'MESSAGE']
export const MODULE_STATUS = {
    Installed: 'Installed',
    Failed: 'Failed',
    NotEnabled: 'Not enabled',
}

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

/**
 * @deprecated - use from fe-common
 */
export enum TIMELINE_STATUS {
    DEPLOYMENT_INITIATED = 'DEPLOYMENT_INITIATED',
    GIT_COMMIT = 'GIT_COMMIT',
    GIT_COMMIT_FAILED = 'GIT_COMMIT_FAILED',
    ARGOCD_SYNC = 'ARGOCD_SYNC',
    ARGOCD_SYNC_FAILED = 'ARGOCD_SYNC_FAILED',
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
    INPROGRESS = 'INPROGRESS',
    HELM_PACKAGE_GENERATED = 'HELM_PACKAGE_GENERATED',
    HELM_MANIFEST_PUSHED_TO_HELM_REPO = 'HELM_MANIFEST_PUSHED_TO_HELM_REPO',
    HELM_MANIFEST_PUSHED_TO_HELM_REPO_FAILED = 'HELM_MANIFEST_PUSHED_TO_HELM_REPO_FAILED',
}

/**
 * @deprecated - use from fe-common
 */
export const DEPLOYMENT_STATUS = {
    SUCCEEDED: 'succeeded',
    HEALTHY: 'healthy',
    FAILED: 'failed',
    TIMED_OUT: 'timed_out',
    UNABLE_TO_FETCH: 'unable_to_fetch',
    INPROGRESS: 'inprogress',
    PROGRESSING: 'progressing',
    STARTING: 'starting',
    INITIATING: 'initiating',
    SUPERSEDED: 'superseded',
    QUEUED: 'queued',
    UNKNOWN: 'unknown',
    CHECKING: 'checking',
} as const

export const HELM_DEPLOYMENT_STATUS_TEXT = {
    PROGRESSING: 'Progressing',
    INPROGRESS: 'In progress',
}

export const DEPLOYMENT_STATUS_QUERY_PARAM = 'deployment-status'
export const RESOURCES_NOT_FOUND = 'Resources are not available'
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
    DATA = 'data',
}

export enum CONFIGURATION_TYPES {
    ENVIRONMENT = 'ENVIRONMENT',
    NAMESPACE = 'NAMESPACE',
    DESCRIPTION = 'DESCRIPTION',
}

export const RequiredKinds = ['Deployment', 'StatefulSet', 'DemonSet', 'Rollout']

export const POD_ROTATION_INITIATED = 'Pod rotation initiated'

export enum DELETE_ACTION {
    DELETE = 'delete',
    FORCE_DELETE = 'force_delete',
    NONCASCADE_DELETE = 'noncascade_delete',
}
export const ManifestMessaging = {
    POD_NAME_EXIST_IN_NAMESPACE: 'Pod with provided name already exists in namespace',
    POD_NAME: 'A pod named',
    ALREADY_EXIST: 'already exists in',
    NAMESPACE: 'namespace',
    CONTINUE_TERMINATE_EXISTING_POD:
        'Continuing will terminate the existing pod and create a new one with the provided manifest.',
    SURE_WANT_TO_CONTINUE: 'Are you sure you want to continue?',
    CANCEL: 'Cancel',
    TERMINATE_EXISTING_POD: 'Terminate existing pod',
}

export const SERVER_ERROR_CODES = {
    RELEASE_NOT_FOUND: '7001',
    CHART_ALREADY_EXISTS: '5001',
    CHART_NAME_RESERVED: '5002',
}

export const ENV_ALREADY_EXIST_ERROR = 'Pipeline already exists for this environment'
export const CVE_ID_NOT_FOUND = 'CVE ID not found'
export const CONFIGURE_LINK_NO_NAME = 'Please provide name for the tool you want to link'
export const NO_HOST_URL = 'Please enter host url'
export const WEBHOOK_NO_API_TOKEN_ERROR = 'API Token is required to execute webhook'

export enum CUSTOM_LOGS_FILTER {
    SINCE = 'since',
    LINES = 'lines',
    DURATION = 'duration',
    ALL = 'all',
    CUSTOM = 'custom',
}

export const CUSTOM_LOGS_OPTIONS = [
    {
        label: 'Set duration',
        value: CUSTOM_LOGS_FILTER.DURATION,
    },
    {
        label: 'Set lines',
        value: CUSTOM_LOGS_FILTER.LINES,
    },
    {
        label: 'Since date & time',
        value: CUSTOM_LOGS_FILTER.SINCE,
    },
    {
        label: 'All available',
        value: CUSTOM_LOGS_FILTER.ALL,
    },
]

export const ALLOW_UNTIL_TIME = {
    '12:00 AM': '00:00:00',
    '12:30 AM': '00:30:00',
    '01:00 AM': '01:00:00',
    '01:30 AM': '01:30:00',
    '02:00 AM': '02:00:00',
    '02:30 AM': '02:30:00',
    '03:00 AM': '03:00:00',
    '03:30 AM': '03:30:00',
    '04:00 AM': '04:00:00',
    '04:30 AM': '04:30:00',
    '05:00 AM': '05:00:00',
    '05:30 AM': '05:30:00',
    '06:00 AM': '06:00:00',
    '06:30 AM': '06:30:00',
    '07:00 AM': '07:00:00',
    '07:30 AM': '07:30:00',
    '08:00 AM': '08:00:00',
    '08:30 AM': '08:30:00',
    '09:00 AM': '09:00:00',
    '09:30 AM': '09:30:00',
    '10:00 AM': '10:00:00',
    '10:30 AM': '10:30:00',
    '11:00 AM': '11:00:00',
    '11:30 AM': '11:30:00',
    '12:00 PM': '12:00:00',
    '12:30 PM': '12:30:00',
    '01:00 PM': '13:00:00',
    '01:30 PM': '13:30:00',
    '02:00 PM': '14:00:00',
    '02:30 PM': '14:30:00',
    '03:00 PM': '15:00:00',
    '03:30 PM': '15:30:00',
    '04:00 PM': '16:00:00',
    '04:30 PM': '16:30:00',
    '05:00 PM': '17:00:00',
    '05:30 PM': '17:30:00',
    '06:00 PM': '18:00:00',
    '06:30 PM': '18:30:00',
    '07:00 PM': '19:00:00',
    '07:30 PM': '19:30:00',
    '08:00 PM': '20:00:00',
    '08:30 PM': '20:30:00',
    '09:00 PM': '21:00:00',
    '09:30 PM': '21:30:00',
    '10:00 PM': '22:00:00',
    '10:30 PM': '22:30:00',
    '11:00 PM': '23:00:00',
    '11:30 PM': '23:30:00',
}

export const ALLOW_UNTIL_TIME_OPTIONS: any[] = Object.entries(ALLOW_UNTIL_TIME).map(([key, value]) => ({
    label: key,
    value,
}))

export const DIGEST_DISABLE_TOGGLE_MESSAGE_GLOBAL_ONLY =
    'Enforced from Global Configurations. Go to Global Configurations to change.'
export const DIGEST_DISABLE_TOGGLE_MESSAGE_FOR_PIPELINE =
    'Enforced from Global Configurations. To change, first disable it in Global Configurations, then come back here.'

/**
 * @deprecated - use from fe-common
 */
export const API_STATUS_CODES = {
    UNAUTHORIZED: 401,
    PERMISSION_DENIED: 403,
    NOT_FOUND: 404,
    EXPECTATION_FAILED: 417,
}

export const DEFAULT_SHIMMER_LOADING_TABLE_ROWS = 3

export const REQUIRED_FIELDS_MISSING = 'Some required fields are missing'

/**
 * Value for select all identifier
 */
export const SELECT_ALL_VALUE = '*'

export const SwitchItemValues = {
    Sample: 'sample',
    Configuration: 'configuration',
}

export enum DEFAULT_CONTAINER_NAME {
    DEBUGGER = 'debugger',
    DEVTRON_DEBUG_TERMINAL = 'devtron-debug-terminal',
}

export const UPDATE_AVAILABLE_TOAST_PROGRESS_BG: Parameters<typeof ToastManager.showToast>[0]['progressBarBg'] =
    'linear-gradient(90deg, #3A1C71 0%, #D76D77 49.95%, #FFAF7B 100%)'

export const EDITOR_VIEW = {
    UNDEFINED: 'UNDEFINED',
    BASIC: 'BASIC',
    ADVANCED: 'ADVANCED',
}

export const DEVTRON_IFRAME_PRIMARY: string = 'devtronIframePrimary'

export const DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE = `:resourceType(${Object.values(EnvResourceType).join('|')})`
