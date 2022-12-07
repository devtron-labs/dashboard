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
export const DELETE_PRESET_VALUE_DESCRIPTION_LINES = {
    First: 'This will delete the preset value and it will no longer be available to be used for deployment.',
    Second: 'Are you sure?',
}
export const DELETE_CHART_APP_DESCRIPTION_LINES = {
    First: 'This will delete all resources associated with this application.',
    Second: 'Deleted applications cannot be restored.',
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
}

export const CHART_DEPCRECATED_TEXTS = {
    Label: 'Chart deprecated',
    InfoText: 'This chart has been deprecated. Please select another chart to continue receiving updates.',
}

export const CONNECT_CHART_REPO_TEXTS = {
    InfoText: 'Unable to find the desired chart? To connect or re-sync a repo.',
    LinkText: 'Go to chart repository',
}

export const CompareValuesSelectStyles = {
    control: (base) => ({
        ...base,
        backgroundColor: 'var(--N100)',
        border: 'none',
        boxShadow: 'none',
        minHeight: '32px',
    }),
    option: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
    }),
    menu: (base) => ({
        ...base,
        marginTop: '2px',
        minWidth: '240px',
    }),
    menuList: (base) => ({
        ...base,
        position: 'relative',
        paddingBottom: 0,
        paddingTop: 0,
        maxHeight: '250px',
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        padding: 0,
        color: 'var(--N400)',
        transition: 'all .2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    }),
    noOptionsMessage: (base) => ({
        ...base,
        color: 'var(--N600)',
    }),
}
