export const RequestTimeout = 60000;
export const DEFAULT_STATUS = 'Checking Status...';
export const Host = process.env.REACT_APP_ORCHESTRATOR_ROOT;
export const DEFAULTK8SVERSION = 'v1.16.0';

export const Routes = {
    LOGIN: 'api/v1/session',
    SOURCE_CONFIG_GET: 'app/get',

    CHART_REFERENCES_MIN: 'chartref/autocomplete',
    CI_CONFIG_GET: 'app/ci-pipeline',
    CI_CONFIG_UPDATE: 'app/ci-pipeline/template/patch',
    CI_PIPELINE: 'app/ci-pipeline/patch',

    CI_PIPELINE_TRIGGER: 'app/ci-pipeline/trigger',
    CLUSTER: 'cluster',

    CD_CONFIG: 'app/cd-pipeline',
    CD_CONFIG_PATCH: 'app/cd-pipeline/patch',

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
    APP_LIST_MIN: 'app/autocomplete',
    APP_DETAIL: 'app/detail',
    APP_CONFIG_STATUS: 'app/stage/status',
    APP_OTHER_ENVIRONMENT: 'app/other-env',
    APP_CI_PIPELINE: 'ci-pipeline/min',

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
    GITOPS_CONFIGURED: 'gitops/configured',
    GIT_PROVIDER: 'git/provider',
    CHART_LIST: 'app-store/repo/list',
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

    REFRESH_MATERIAL: 'app/ci-pipeline/refresh-material',
    APPLICATIONS: 'api/v1/applications',
    USER_CREATE: 'user/create',
    USER_UPDATE: 'user/update',
    USER_LIST: 'user/all',

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
    CHART_VALUES: 'app-store/template/values',
    CHART_VALUES_LIST_CATEGORIZED: 'app-store/application/values/list',
    CHART_VALUES_LIST_TEMPLATE: 'app-store/template/values/list',
    CHART_GROUP: 'chart-group',
    CHART_GROUP_LIST: 'chart-group/list',
    APP_CREATE_CONFIG_MAP: 'config/global/cm',
    APP_CREATE_SECRET: 'config/global/cs',
    WORKFLOW: 'app/app-wf',

    APP_WORKFLOW_STATUS: 'app/workflow/status',
    APP_CREATE_ENV_SECRET: 'config/environment/cs',
    APP_CREATE_ENV_CONFIG_MAP: 'config/environment/cm',
};

export const ViewType = {
    EMPTY: 'EMPTY',
    LOADING: 'LOADING',
    FORM: 'FORM',
    ERROR: 'ERROR',
};

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
};

export const FullRoutes = {
    LOGIN: `${Routes.LOGIN}`,
};

export const PATTERNS = {
    STRING: /[A-Za-z0-9]+$/,
    APP_NAME: '(?:[a-z0-9]+(?:[.-][a-z0-9]+)*/)*[a-z0-9]+(?:[._-][a-z0-9]+)*',
    CD_PIPELINE_NAME: `^[a-z]+[a-z0-9\-\?]*[a-z0-9]+$`,
    CONFIG_MAP_KEY: /^[-._a-zA-Z0-9]+$/,
    SECRET_KEY: /^[-._a-zA-Z0-9]+$/,
};

export const TriggerType = {
    Auto: 'AUTOMATIC',
    Manual: 'MANUAL',
};

export const TriggerTypeMap = {
    automatic: 'Auto',
    manual: 'Manual',
};

export const SourceTypeMap = {
    BranchFixed: 'SOURCE_TYPE_BRANCH_FIXED',
    BranchReges: 'SOURCE_TYPE_BRANCH_REGEX',
    TagAny: 'SOURCE_TYPE_TAG_ANY',
    TagRegex: 'SOURCE_TYPE_TAG_REGEX',
};

export const SourceTypeReverseMap = {
    SOURCE_TYPE_BRANCH_FIXED: 'Branch Fixed',
    SOURCE_TYPE_BRANCH_REGEX: 'Branch Regex',
    SOURCE_TYPE_TAG_ANY: 'Tag Any',
    SOURCE_TYPE_TAG_REGEX: 'Tag Regex',
};

export const TagOptions = [
    { label: 'Branch Fixed', value: 'SOURCE_TYPE_BRANCH_FIXED' },
    // { label: "Branch Regex", value: "SOURCE_TYPE_BRANCH_REGEX" },
    // { label: "Tag Any", value: "SOURCE_TYPE_TAG_ANY" },
    { label: 'Tag Regex', value: 'SOURCE_TYPE_TAG_REGEX' },
];


export const Moment12HourFormat = "ddd, DD MMM YYYY, hh:mm A";

export const DOCUMENTATION = {
    APP_CREATE: 'https://docs.devtron.ai/user-guide/creating-application',
    APP_CREATE_ENV: 'https://docs.devtron.ai/user-guide/creating-application/environment-overrides',
    APP_CREATE_CI_CONFIG: 'https://docs.devtron.ai/user-guide/creating-application/docker-build-configuration',
    APP_CREATE_DEPLOYMENT_TEMPLATE: 'https://docs.devtron.ai/user-guide/creating-application/deployment-template',
    APP_CREATE_CONFIG_MAP: 'https://docs.devtron.ai/user-guide/creating-application/config-maps',
    APP_CREATE_SECRET: 'https://docs.devtron.ai/user-guide/creating-application/secrets',
    APP_CREATE_WORKFLOW: 'https://docs.devtron.ai/creating-application/workflow',

    CHART_LIST: 'https://docs.devtron.ai/user-guide/deploy-chart/overview-of-charts',

    GLOBAL_CONFIG_GITOPS: 'https://docs.devtron.ai/user-guide/global-configurations/gitops',
    GLOBAL_CONFIG_GIT: 'https://docs.devtron.ai/user-guide/global-configurations/git-accounts',
    GLOBAL_CONFIG_DOCKER: 'https://docs.devtron.ai/user-guide/global-configurations/docker-registries',
    GLOBAL_CONFIG_CLUSTER: 'https://docs.devtron.ai/user-guide/global-configurations/cluster-and-environments',
    GLOBAL_CONFIG_CHART: 'https://docs.devtron.ai/user-guide/global-configurations/chart-repo',
    GLOBAL_CONFIG_NOTIFICATION: 'https://docs.devtron.ai/global-configurations/manage-notification',
    GLOBAL_CONFIG_PROJECT: 'https://docs.devtron.ai/global-configurations/projects',
    GLOBAL_CONFIG_USER: 'https://docs.devtron.ai/user-guide/global-configurations/user-access',
}