export const EA_MANIFEST_SECRET_INFO_TEXT = 'The values for all keys in the data field are base64-encoded strings.'
export const EA_MANIFEST_SECRET_EDIT_MODE_INFO_TEXT =
    'The values for all keys in the data field have to be base64-encoded strings.'

//DELETE COMPONENET STARTS
export const DC_MATERIAL_VIEW_CONFIRMATION_MESSAGE =
    'Checkout path for this repository is being used in docker build config. Please change checkout path in use and try again.'
export const DC_CHART_REPO_CONFIRMATION_MESSAGE = 'Some deployed helm apps are using this repository.'
export const DC_CLUSTER_CONFIRMATION_MESSAGE = 'Please delete environments on this cluster and try again.'
export const DC_CONTAINER_REGISTRY_CONFIRMATION_MESSAGE =
    'Some applications are currently using this container registry. Please change the container registry in use and try again.'
export const DC_ENVIRONMENT_CONFIRMATION_MESSAGE =
    'Please delete applications deployed on this environment and try again.'
export const DOCKER =
    'Some applications are currently using this container registry. Please change the container registry in use and try again.'
export const DC_GIT_PROVIDER_CONFIRMATION_MESSAGE =
    'Some applications are currently using this git account. Please change the git account in use and try again.'
export const DC_MATERIAL_VIEW_ISSINGLE_CONFIRMATION_MESSAGE =
    'Some build pipelines are currently using this git repositry. Please delete the build pipelines and try again.'
export const DC_MATERIAL_VIEW__ISMULTI_CONFIRMATION_MESSAGE =
    'Please select another repository containing Dockerfile and try again.'
export const DC_CONFIGURATION_CONFIRMATION_MESSAGE =
    'This configuration is being used in some notifications. Please delete notifications using this configuration and try again.'
export const DC_PROJECT_CONFIRMATION_MESSAGE = 'Please delete applications assigned to this project and try again.'
export const GITOPS_FQDN_MESSAGE = 'This is not a Fully Qualified Domain Name (FQDN).'
export const GITOPS_HTTP_MESSAGE = 'Http protocol is not supported.'

export const enum DeleteComponentsName {
    ChartGroup = 'chart group',
    ContainerRegistry = 'container registry',
    ChartRepository = 'chart repository',
    Cluster = 'cluster',
    Environment = 'environment',
    GitProvider = 'git account',
    MaterialView = 'git repository',
    SlackConfigurationTab = 'slack',
    SesConfigurationTab = 'ses',
    SMTPConfigurationTab = 'smtp',
    Project = 'project',
    GitRepo = 'Repo',
}

//DELETE COMPONENT ENDS

export const LEARN_MORE = 'Learn more'
export const REQUIRED_FIELD_MSG = 'This is a required field'
export const MULTI_REQUIRED_FIELDS_MSG = 'Some required fields are missing'
export const SOME_ERROR_MSG = 'Some error occurred'

export const CI_CONFIGURED_GIT_MATERIAL_ERROR = "Unable to trigger build as you're using Dockerfile from $GIT_MATERIAL_ID repo but code source is not configured for the repo."

export const SSO_NOT_CONFIGURED_STATE_TEXTS = {
    title: 'No users Added',
    subTitle: 'Add users and assign group or direct permissions',
    notConfigured: 'SSO Login not configured:',
    infoText:
        ' Devtron uses Single Sign-On (SSO) to enable one-click login. Please set up an SSO login service before adding users.Go to SSO login services',
    linkText: 'Go to SSO login services',
    redirectLink: '/global-config/login-service',
}

export const ERROR_EMPTY_SCREEN = (selectedDeploymentTab: string):string => `${selectedDeploymentTab} is not available for this deployment`