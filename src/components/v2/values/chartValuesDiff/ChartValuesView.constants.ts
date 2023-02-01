export const GROUPED_OPTION_LABELS = {
    PreviousDeployments: 'Previous deployments',
    OtherApps: 'Other apps using this chart',
    PresetValues: 'Preset values',
    DefaultValues: 'Default values',
    NoOptions: 'No options',
}

export const ListToTraverseKeys = {
    deployedChartValues: 'deployedChartValues',
    defaultChartValues: 'defaultChartValues',
}

export const MANIFEST_OUTPUT_INFO_TEXT = 'Manifest is generated locally from the YAML.'
export const MANIFEST_OUTPUT_TIPPY_CONTENT =
    'This manifest is generated locally from the YAML. Server-side testing of chart validity (e.g. whether an API is supported) is NOT done. K8s version based templating may be different depending on cluster version.'
export const MANIFEST_TAB_VALIDATION_ERROR = 'Please provide the required inputs to view generated manifest'
export const DATA_VALIDATION_ERROR_MSG = 'Encountered data validation error while updating.'

export const DELETE_PRESET_VALUE_DESCRIPTION_LINES = {
    First: 'This will delete the preset value and it will no longer be available to be used for deployment.',
    Second: 'Are you sure?',
}

export const DELETE_CHART_APP_DESCRIPTION_LINES = {
    First: 'This will delete all resources associated with this application.',
    Second: 'Deleted applications cannot be restored.',
}

export const CHART_VALUE_TOAST_MSGS = {
    Updated: 'Chart Value Updated',
    Created: 'Chart Value Created',
    DeploymentInitiated: 'Deployment initiated',
    UpdateInitiated: 'Update and deployment initiated',
}

export const COMPARISON_OPTION_LABELS = {
    CompareDeployed: 'Compare with deployed',
    HideComparison: 'Hide comparison',
    CompareValues: 'Compare values',
}

export const COMPARISON_OPTION_TIPPY_CONTENT = {
    Heading: 'Nothing to compare with',
    InfoText: 'No applications found using this chart',
    OtherValues: 'Compare values with other values of this chart',
    OtherDeployments: 'Compare values with other deployments of this chart',
    PreviousDeployments: 'Compare values with previous deployments of this app or other deployments of this chart',
    Fetching: 'Fetching...',
    ReadmeNotAvailable: 'Readme is not available for this chart',
}

export const UPDATE_APP_BUTTON_TEXTS = {
    Deploy: 'Deploy chart',
    Update: 'Update and deploy',
    Deploying: 'Deploying chart',
    Updating: 'Updating and deploying',
    Save: 'Save',
    Saving: 'Saving',
    Changes: 'changes',
    Value: 'value',
}

export const CONNECT_TO_HELM_CHART_TEXTS = {
    InfoTextHeading: 'Connect app to helm chart and deploy',
    InfoText: 'Manifest output is available only for applications deployed using a connected helm chart.',
    Message:
        'This app is not connected to a helm chart. Connect to a helm chart to keep up with latest chart versions.',
}

export const MANIFEST_INFO = {
    InfoText: 'Manifest is generated only for apps linked to a helm chart. Link this app to a helm chart to view generated manifest.'
}

export const CHART_DEPCRECATED_TEXTS = {
    Label: 'Chart deprecated',
    InfoText: 'This chart has been deprecated. Please select another chart to continue receiving updates.',
}

export const CONNECT_CHART_REPO_TEXTS = {
    InfoText: 'Unable to find the desired chart? To connect or re-sync a repo.',
    LinkText: 'Go to chart repository',
}