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

export const EA_MANIFEST_SECRET_INFO_TEXT = 'The values for all keys in the data field are base64-encoded strings.'
export const EA_MANIFEST_SECRET_EDIT_MODE_INFO_TEXT =
    'The values for all keys in the data field have to be base64-encoded strings.'

// DELETE COMPONENET STARTS
export const DC_MATERIAL_VIEW_CONFIRMATION_MESSAGE =
    'Checkout path for this repository is being used in docker build config. Please change checkout path in use and try again.'
export const DC_CHART_REPO_CONFIRMATION_MESSAGE = 'Some deployed helm apps are using this repository.'
export const DC_CONTAINER_REGISTRY_CONFIRMATION_MESSAGE =
    'Some applications are currently using this container registry. Please change the container registry in use and try again.'
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
export const GITOPS_FQDN_MESSAGE = 'This is not a Fully Qualified Domain Name (FQDN).'
export const GITOPS_HTTP_MESSAGE = 'Http protocol is not supported.'
export const USER_PERMISSION_DELETE_CONFIRMATION_MESSAGE =
    'Deleting this user will remove the user and revoke all their permissions.'
export const USER_PERMISSION_GROUP_DELETE_CONFIRMATION_MESSAGE =
    'Deleting this group will revoke permissions from users added to this group..'

export const CONTEXT_NOT_AVAILABLE_ERROR = 'cannot be rendered outside the component'
export const GIT_MATERIAL_IN_USE_MESSAGE =
    'This repository is being used as source for Dockerfile or as Build Context. Please select another repository and try again'

export const enum DeleteComponentsName {
    API_TOKEN = 'API token',
    Application = 'application',
    BuildPipeline = 'build pipeline',
    ChartGroup = 'chart group',
    ContainerRegistry = 'container registry',
    ChartRepository = 'chart repository',
    Cluster = 'cluster',
    Environment = 'environment',
    Filter = 'filter',
    GitProvider = 'git account',
    GitRepo = 'repo',
    GROUP = 'group',
    Job = 'job',
    Link = 'link',
    MaterialView = 'git repository',
    Node = 'node',
    SlackConfigurationTab = 'slack',
    SesConfigurationTab = 'ses',
    SMTPConfigurationTab = 'smtp',
    WebhookConfigurationTab = 'webhook',
    Preset = 'preset value',
    Project = 'project',
    Override = 'override',
    USER = 'user',
}

// DELETE COMPONENT ENDS

export const LEARN_MORE = 'Learn more'
export const REQUIRED_FIELD_MSG = 'This is a required field'
export const MAX_LENGTH_30 = 'Max 30 characters allowed'
export const MAX_LENGTH_350 = 'Max 350 characters allowed'
export const REPO_NAME_VALIDATION = 'Repository name is not valid; Invalid character(s) "_"'
export const MULTI_REQUIRED_FIELDS_MSG = 'Some required fields are missing'
export const SOME_ERROR_MSG = 'Some error occurred'
export const DEPLOY_IMAGE_EXTERNALSOURCE = 'Deploy image from external source'
export const CHANGE_TO_EXTERNAL_SOURCE = 'Change to external source'
export const EDIT_DEPLOYMENT_PIPELINE = 'Edit deployment pipeline'
export const CREATE_DEPLOYMENT_PIPELINE = 'Create deployment pipeline'
export const ERROR_MESSAGE_FOR_VALIDATION =
    "Min 2 chars; Start with alphabet; End with alphanumeric; Use only lowercase; Allowed:(-), (.); Do not use 'spaces'"
export const CHARACTER_ERROR_MIN = 'At least 2 characters required'
export const CHARACTER_ERROR_MAX = 'Max 50 characters allowed'
export const PROJECT_EXIST_MSG = 'This Project already exists.'

export const CustomErrorMessage = {
    CUSTOM_TAG_ERROR_MSG:
        'Allowed: Alphanumeric characters, including (_) (.) (-) but cannot begin or end with (.) or (-).',
    CUSTOM_TAG_MANDATORY_X: 'Using variable {x} is mandatory',
    CUSTOM_TAG_LIMIT: 'Max 128 characters.',
    INVALID_IMAGE_PATTERN: 'Invalid image tag pattern',
    REQUIRED_IMAGE_PATTERN: 'Image tag pattern is required to generate container images',
    VARIABLE_X_ONLY_ONCE: 'Variable {x} can be used only once',
    USE_ONLY_NON_NEGATIVE_INTERGER: 'Use only non-negative integer',
}

export const CI_CONFIGURED_GIT_MATERIAL_ERROR =
    "Unable to trigger build as you're using Dockerfile from $GIT_MATERIAL_ID repo but code source is not configured for the repo."

export const TOAST_BUTTON_TEXT_VIEW_DETAILS = 'VIEW DETAILS'
export const SSO_NOT_CONFIGURED_STATE_TEXTS = {
    title: 'No users added',
    subTitle: 'Add users and assign group or direct permissions',
    notConfigured: 'SSO Login not configured:',
    infoText:
        ' Devtron uses Single Sign-On (SSO) to enable one-click login. Please set up an SSO login service before adding users.Go to SSO login services',
    linkText: 'Go to SSO login services',
    redirectLink: '/global-config/auth/login-service',
}

export const ERR_MESSAGE_ARGOCD = 'Deployment pipeline cannot be attached to a pipeline being deleted.'

export const DELETE_DEPLOYMENT_PIPELINE = 'Deleting deployment pipeline'
export const DELETE_DEPLOYMENT = 'Deleting deployment'
export const VIEW_DELETION_STATUS = 'View deletion status'

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
    UNAUTHORIZED: 'unauthorized',
    FORBIDDEN: 'forbidden',
}

// Confirmation Dialog messgaes
export const CONFIRMATION_DIALOG_MESSAGING = {
    DELETION_IN_PROGRESS: 'Deployment pipeline configurations cannot be edited when deletion is in progress.',
}

export const NONCASCADE_DELETE_DIALOG_INTERNAL_MESSAGE = [
    'The underlying resources cannot be deleted as the cluster is not reachable at the moment.',
    'Do you still want to delete the deployment without deleting the resources? ',
]

// Toast messages

export const TOAST_INFO = {
    PIPELINE_DELETION_INIT: 'Pipeline Deletion Initiated',
    DELETION_INITIATED: 'Deletion initiated',
    RE_SYNC: 'Re-sync initiated. It may take upto 5 minutes for it to complete.',
}

export const APP_DETAILS = {
    APP_FULLY_NOT_CONFIGURED:
        'This application is not fully configured. Complete the configuration, trigger a deployment and come back here.',
    JOB_FULLY_NOT_CONFIGURED: {
        title: 'Finish configuring this job',
        subTitle: 'This job is not fully configured. Complete the configuration and come back here to run the job.',
        buttonTitle: 'Go to configurations',
    },
    NEED_HELP: 'Need help?',
}

// All CTA

export const BUTTON_TEXT = {
    SAVE: 'Save',
    DELETE: 'Delete',
    FORCE_DELETE: 'Force Delete',
    CANCEL: 'Cancel',
}

// Deployment App Types
export enum DeploymentAppTypeNameMapping {
    Helm = 'Helm',
    GitOps = 'GitOps',
    ArgoCD = 'ArgoCD',
    FluxCD = 'FluxCD',
}

export const APP_GROUP_CD_DETAILS = {
    noSelectedApp: {
        title: 'No application selected',
        subTitle: 'Please select an application to see deployment history.',
    },
    noDeployment: {
        title: 'No deployments',
        getSubtitle: (appName) => `No deployment history available for the ${appName || ''} application.`,
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
    SOURCE: 'Source',
    VALUES_YAML: 'values.yaml',
    HELM_GENERATED_MANIFEST: 'Helm generated manifest',
    ARTIFACTS: 'Artifacts',
    SECURITY: 'Security',
}

export const API_COMPONENTS = {
    TITLE: 'API tokens ',
    QUESTION_ICON_INFO:
        'API tokens are like ordinary OAuth access tokens. They can be used instead of username and password for programmatic access to API.',
    NEW_API_TITLE: '/ New API token',
    EDIT_API_TITLE: '/ Edit API token',
}

/**
 * @deprecated - Use from fe-common
 */
export const EMPTY_STATE_STATUS = {
    DATA_NOT_AVAILABLE: 'Data not available',
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
        FailedToFetchArtifacts: 'Fail to find artifacts',
        FailedToFetchArtifactsError: 'Errr..!! The pipeline execution failed',
        NoArtifactsFound: 'No new artifacts found',
        NoArtifactsFoundError: 'No new artifacts were found',
    },
    CI_BUILD_HISTORY_PIPELINE_TRIGGER: {
        TITLE: 'pipeline not triggered',
        SUBTITLE: 'Pipeline trigger history, details and logs will be available here.',
    },
    CI_BUILD_HISTORY_LINKED_PIPELINE: {
        TITLE: 'This is a Linked CI Pipeline',
        SUBTITLE: 'This is a Linked CI Pipeline',
    },
    CI_BUILD_HISTORY_NO_PIPELINE: {
        TITLE: 'No pipeline selected',
        SUBTITLE: 'Please select a pipeline',
    },
    CI_DETAILS_IMAGE_SCANNED_DISABLED: 'Go to build pipeline configurations and enable ’Scan for vulnerabilities’',
    CI_DETAILS_IMAGE_NOT_SCANNED: {
        TITLE: 'Image not scanned',
        SUBTITLE: 'This build was executed before scanning was enabled for this pipeline.',
    },
    CD_DETAILS_NO_ENVIRONMENT: {
        TITLE: 'No environment selected',
        SUBTITLE: 'Please select an environment to start seeing CD deployments.',
    },
    CD_DETAILS_NO_DEPLOYMENT: {
        TITLE: 'No deployments',
        SUBTITLE: 'No deployment history available for the',
    },
    CHART: {
        NO_SOURCE_TITLE: 'No chart source configured',
        NO_CHART_FOUND: 'Could not find any matching chart source',
    },
    CHART_DEPLOYMENT_HISTORY: {
        SUBTITLE:
            'Data for previous deployments is not available. History for any new deployment will be available here.',
    },
    CHART_GROUP_DEPLOYMENT: {
        TITLE: 'No Deployments',
        SUBTITLE: "You haven't made any deployments",
    },
    DEPLOYMENT_DETAILS_SETPS_FAILED: {
        TITLE: 'Deployment failed',
        SUBTITLE: 'A new deployment was initiated before this deployment completed.',
    },
    DEPLOYMENT_DETAILS_SETPS_PROGRESSING: {
        TITLE: 'Deployment in progress',
        SUBTITLE: 'This deployment is in progress. Click on Check status to know the live status.',
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
    TRIGGER_URL: {
        TITLE: 'No URLs available',
        SUBTITLE: 'No URLs found in ingress and service resources',
    },

    CD_EMPTY_STATE: {
        TITLE: 'Data not available',
        SUBTITLE: 'Deployed configurations is not available for older deployments',
    },

    CI_PROGRESS_VIEW: {
        TITLE: 'Building artifacts',
        SUBTITLE: 'Generated artifact(s) will be available here after the pipeline is executed.',
    },

    RENDER_EMPTY_STATE: {
        TITILE: 'No deployments found',
        SUBTITLE: 'There are no deployments in this period on',
    },

    RENDER_NO_ENVIORNMENT_STATE: {
        TITLE: 'Deployment Metrics',
        SUBTITLE:
            'This app is not deployed on any production environment. Deploy on prod to get an overview of your deployment practices.',
    },

    RENDER_SELECT_ENVIRONMENT_VIEW: {
        TITLE: 'Select an Environment',
        SUBTITLE: 'Please select an Enviroment to view deployment metrics.',
    },

    SAVED_VALUES_EMPTY_STATE: {
        TITLE: 'No values saved for this chart',
        SUBTITLE: 'Customize, Dry Run and Save values so they’re ready to be used later.',
    },

    LOADING_CLUSTER: {
        TITLE: 'Trying to connect to Cluster',
        SUBTITLE: 'Please wait while the kubeconfig is verified and cluster details are fetched.',
    },

    CHART_EMPTY_STATE: {
        TITLE: 'No matching charts',
        SUBTITLE: "We couldn't find any matching results",
    },

    CHART_VALUES_GUIT_VIEW: {
        SUBTITLE:
            'GUI view is not available as values.schema.json file does not exist for the selected version and values.',
    },

    DEVTRON_STACK_MANAGER: {
        TITLE: 'No integrations installed',
        SUBTITLE: 'Installed integrations will be available here.',
    },

    NO_GROUPS: {
        TITLE: 'No groups',
        SUBTITLE: 'Groups allow you to combine permissions and easily assign them to users.',
    },

    NO_USER: {
        TITLE: 'No users',
        SUBTITLE: 'Add users and assign group or direct permissions',
    },

    RENDER_LIST: {
        SUBTITLE: 'No results found for the applied filters.',
    },

    CUSTOM_CHART_LIST: {
        TITLE: 'Use custom charts in applications',
    },

    BULK_ACTION_EDITS: {
        TITLE: 'No Linked pipelines created',
        SUBTITLE: 'Deployment groups can only be created for applications and environments using Linked CI Pipelines.',
    },

    SECURITY_SCANS: {
        TITLE: 'No Scans Performed',
        SUBTITLE: 'No results found for the applied filters.',
    },

    NOTIFICATION_TAB: {
        TITLE: 'Notification',
        SUBTITL: 'Receive alerts when a pipeline triggers, completes successfully or fails.',
    },

    CONFIGURATION_TAB: {
        TITLE: 'No Configurations',
    },

    EXTERNAL_LINK_COMPONENT: {
        TITLE: 'Add external links',
    },
    CD_MATERIAL: {
        TITLE: 'No Image Available',
    },
    CI_DETAILS_NOT_FOUND: {
        TITLE: 'Not found',
        SUBTITLE: 'you are looking for does not exist',
    },
    TRIGGER_NOT_FOUND: {
        TITLE: 'Trigger not found',
        SUBTITLE: 'The trigger you are looking for does not exist',
    },
    OVERVIEW: {
        DEPLOYMENT_TITLE: "Explore your application's deployment landscape",
        DEPLOYMENT_SUB_TITLE:
            "Although there are no deployments to display just yet, it's the perfect time to start configuring and deploying your app to various environments. Let's go!",
        APP_DESCRIPTION: 'Write a short description for this application',
        JOB_DESCRIPTION: 'Write a short description for this job',
    },
}

export const INVALID_YAML_MSG = 'Please provide data in valid YAML format'

export const EPHEMERAL_CONTAINER = {
    TITLE: 'Ephemeral Container',
    SUBTITLE:
        'An Ephemeral Container is a temporary container that you may add to an existing Pod for user-initiated activities such as debugging.',
    CONTAINER_NAME: 'This prefix will be used to generate a unique name for the ephemeral container',
    IMAGE: 'Container image name',
    TARGET_CONTAINER_NAME:
        'Name of the container from PodSpec that this ephemeral container targets. The ephemeral container will be run in the namespaces (IPC, PID, etc) of this container.',
}
export const NO_TASKS_CONFIGURED_ERROR = 'No tasks are configured in this job pipeline'

export const FEATURE_DISABLED = 'This feature is disabled'

export const DUPLICATE_PIPELINE_NAME_VALIDATION = 'You cannot use same name for pipeline within an app.'
export const GENERATE_TOKEN_NAME_VALIDATION = 'Token name is required to generate token'
