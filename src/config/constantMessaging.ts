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

export const CONTEXT_NOT_AVAILABLE_ERROR = 'cannot be rendered outside the component'
export const GIT_MATERIAL_IN_USE_MESSAGE = 'This repository is being used as source for Dockerfile or as Build Context. Please select another repository and try again'
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
export const DEPLOY_IMAGE_EXTERNALSOURCE='Deploy image from external source'
export const EDIT_DEPLOYMENT_PIPELINE='Edit deployment pipeline'
export const CREATE_DEPLOYMENT_PIPELINE='Create deployment pipeline'
export const ERROR_MESSAGE_FOR_VALIDATION="Min 2 chars; Start with alphabet; End with alphanumeric; Use only lowercase; Allowed:(-), (.); Do not use 'spaces'"
export const CHARACTER_ERROR_MIN='At least 2 characters required'
export const CHARACTER_ERROR_MAX = 'Max 50 characters allowed'
export const COPIED_MESSAGE='Copied!'
export const PROJECT_EXIST_MSG = 'This Project already exists.'

export const CI_CONFIGURED_GIT_MATERIAL_ERROR =
    "Unable to trigger build as you're using Dockerfile from $GIT_MATERIAL_ID repo but code source is not configured for the repo."

export const SSO_NOT_CONFIGURED_STATE_TEXTS = {
    title: 'No users Added',
    subTitle: 'Add users and assign group or direct permissions',
    notConfigured: 'SSO Login not configured:',
    infoText:
        ' Devtron uses Single Sign-On (SSO) to enable one-click login. Please set up an SSO login service before adding users.Go to SSO login services',
    linkText: 'Go to SSO login services',
    redirectLink: '/global-config/login-service',
}

export const ERR_MESSAGE_ARGOCD = 'Deployment pipeline cannot be attached to a pipeline being deleted.'
export const TOAST_ACCESS_DENIED = {
    TITLE: 'Access denied',
    SUBTITLE: 'You do not have required access to perform this action',
}

export const DELETE_DEPLOYMENT_PIPELINE = 'Deleting deployment pipeline'
export const DELETE_DEPLOYMENT = 'Deleting deployment'
export const VIEW_DELETION_STATUS = 'View deletion status'
export const USER_NOT_EDITABLE = 'user cannot be edited'

// Empty state messgaes
export const ERROR_EMPTY_SCREEN = {
    PAGE_NOT_FOUND: 'We could not find this page',
    PAGE_NOT_EXIST: 'This page doesn’t exist or was removed. We suggest you go back to home',
    TAKE_BACK_HOME: 'Take me home',
    APP_NOT_AVAILABLE: 'This application is not available on this environment',
    DEPLOYMENT_NOT_EXIST: 'Deployment on this environment doesn’t exist or was removed.',
    SELECT_ANOTHER_ENVIRONMENT: 'Please select another environment',
    ALL_SET_GO_CONFIGURE: 'Looks like you’re all set. Go ahead and select an image to deploy',
    DEPLOYEMENT_WILL_BE_HERE: 'Once deployed, details for the deployment will be available here',
    GO_TO_DEPLOY: 'Go to deploy',
    TAB_NOT_AVAILABLE_POSTFIX: 'is not available for this deployment',
    ONLY_FOR_SUPERADMIN: 'Information on this page is available only to superadmin users.',
    NOT_AUTHORIZED: 'Not authorized',
    UNAUTHORIZED:'unauthorized',
    FORBIDDEN:'forbidden',
    REQUIRED_MANAGER_ACCESS:
        'Looks like you don’t have access to information on this page. Please contact your manager to request access.',
}

//Confirmation Dialog messgaes
export const CONFIRMATION_DIALOG_MESSAGING = {
    DELETION_IN_PROGRESS: 'Deployment pipeline configurations cannot be edited when deletion is in progress.',
}

// Toast messages

export const TOAST_INFO = {
  PIPELINE_DELETION_INIT: 'Pipeline Deletion Initiated',
  DELETION_INITIATED: 'Deletion initiated',
  RE_SYNC: 'Re-sync initiated. It may take upto 5 minutes for it to complete.'
}

export const APP_DETAILS = {
  APP_FULLY_NOT_CONFIGURED: 'This application is not fully configured. Complete the configuration, trigger a deployment and come back here.',
  JOB_FULLY_NOT_CONFIGURED: {
    title: 'Finish configuring this job',
    subTitle: 'This job is not fully configured. Complete the configuration and come back here to run the job.',
    buttonTitle: 'Go to configurations'
  },
  NEED_HELP: 'Need help?'
}

// All CTA

export const BUTTON_TEXT = {
    SAVE: 'Save',
    DELETE: 'Delete',
    CANCEL: 'Cancel',
}

//Deployment App Types
export enum DeploymentAppTypeNameMapping {
    Helm = 'Helm',
    GitOps = 'GitOps',
}

export const APP_GROUP_CD_DETAILS = {
    noSelectedApp: {
        title: 'No application selected',
        subTitle: 'Please select an application to see deployment history.',
    },
    noDeployment: {
        title: 'No deployments',
        getSubtitle: (appName) => {
            return `No deployment history available for the ${appName || ''} application.`
        },
    },
}

export const APP_GROUP_CI_DETAILS = {
    linkedCI: {
        title: 'This is a Linked CI Pipeline',
        linkText: 'View Source Pipeline',
    },
    noBuild: {
        title: 'Build pipeline not triggered',
        subTitle: 'Pipeline trigger history, details and logs will be available here.',
    },
}

export const DEPLOYMENT_HISTORY_TAB = {
  STEPS: 'Steps',
  SOURCE : 'Source',
  VALUES_YAML: 'values.yaml',
  HELM_GENERATED_MANIFEST: 'Helm generated manifest'
}

export const CONFIGMAPS_SECRETS = {
    configmaps: "configmaps",
    secrets: "secrets"
}

export const API_COMPONENTS = {
    TITLE: "API tokens ",
    QUESTION_ICON_INFO: "API tokens are like ordinary OAuth access tokens. They can be used instead of username and password for programmatic access to API.",
    NEW_API_TITLE: "/ New API token",
    EDIT_API_TITLE: "/ Edit API token"
}

export const EMPTY_STATE_STATUS = {
    DATA_NOT_AVAILABLE: "Data not available",
    API_TOKEN: {
        TITLE: 'No matching results',
        SUBTITLE: "We couldn't find any matching token",
    },
    ARTIFACTS_EMPTY_STATE_TEXTS: {
      NoFilesFound: 'No files found',
      BlobStorageNotConfigured: 'Blob storage must be configured to store any files generated by the pipeline',
      StoreFiles: 'Want to store files?',
      ConfigureBlobStorage: 'Configure blob storage',
      NoFilesGenerated: 'No files were generated by the job pipeline.',
      NoArtifactsGenerated: 'No artifacts generated',
      NoArtifactsError: 'Errr..!! We couldn’t build your code.',
    },
    CI_BUILD_HISTORY_PIPELINE_TRIGGER:{
      TITLE: 'pipeline not triggered',
      SUBTITLE: 'Pipeline trigger history, details and logs will be available here.',
    },
    CI_BUILD_HISTORY_LINKED_PIPELINE:{
      TITLE: 'This is a Linked CI Pipelined',
      SUBTITLE: 'This is a Linked CI Pipelined',
    },
    CI_BUILD_HISTORY_NO_PIPELINE:{
      TITLE: 'No pipeline selected',
      SUBTITLE: 'Please select a pipeline',
    },
    CI_DEATILS_NO_VULNERABILITY_FOUND: 'No Vulnerability Found',
    CI_DETAILS_IMAGE_SCANNED_DISABLED: 'Go to build pipeline configurations and enable ’Scan for vulnerabilities’',
    CI_DETAILS_IMAGE_NOT_SCANNED:{
      TITLE: 'Image not scanned',
      SUBTITLE: 'This build was executed before scanning was enabled for this pipeline.'
    },
    CD_DETAILS_NO_ENVIRONMENT: {
        TITLE: 'No environment selected',
        SUBTITLE: 'Please select an environment to start seeing CD deployments.',
    },
    CD_DETAILS_NO_DEPLOYMENT: {
        TITLE: 'No deployments',
        SUBTITLE: 'No deployment history available for the'
    },
    CHART_DEPLOYMENT_HISTORY: {
        SUBTITLE: 'Data for previous deployments is not available. History for any new deployment will be available here.',
    },
    CHART_GROUP_DEPLOYMENT:{
        TITLE: 'No Deployments',
        SUBTITLE: "You haven't made any deployments"
    },
    DEPLOYMENT_DETAILS_SETPS_FAILED:{
      TITLE: 'Deployment failed',
      SUBTITLE: 'A new deployment was initiated before this deployment completed.'
    },
    DEPLOYMENT_DETAILS_SETPS_PROGRESSING:{
      TITLE: 'Deployment in progress',
      SUBTITLE: 'This deployment is in progress. Click on Check status to know the live status.'
    },
    DEVTRON_APP_DEPLOYMENT_HISTORY_SOURCE_CODE: {
        SUBTITLE: 'Source code detail is not available',
    },
    DEPLOYMENT_HISTORY_CONFIG_LIST: {
        SUBTITLE: 'Deployed configurations is not available for older deployments',
    },
    GENERATE_API_TOKEN: {
        TITLE: 'Generate a token to access the Devtron API',
        SUBTITLE:
            'API tokens are like ordinary OAuth access tokens. They can be used instead of username and password for programmatic access to API.',
    },
    TRIGGER_URL:{
      TITLE: 'No URLs available',
      SUBTITLE: 'No URLs found in ingress and service resources'
    }

}