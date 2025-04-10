export const RB_KUBE_CONFIG_GA_EVENTS = {
    BulkSelectionWidgetClicked: {
        category: 'Resource Browser',
        action: 'RESOURCE_BROWSER_GET_KUBECONFIG_BULK_CLICKED',
    },
    IndividualKubeConfig: {
        category: 'Resource Browser',
        action: 'RESOURCE_BROWSER_GET_KUBECONFIG_INDIVIDUAL_CLICKED',
    },
    CopyButton: {
        category: 'Resource Browser',
        action: 'RESOURCE_BROWSER_GET_KUBECONFIG_COPYCOMMAND_CLICKED',
    },
    ReachableClusterToggleEnabled: {
        category: 'Resource Browser',
        action: 'RESOURCE_BROWSER_GET_KUBECONFIG_BULK_REACHABLE_CLUSTERS_ENABLED',
    },
    ReachableClusterToggleDisabled: {
        category: 'Resource Browser',
        action: 'RESOURCE_BROWSER_GET_KUBECONFIG_BULK_REACHABLE_CLUSTERS_DISABLED',
    },
    DoNotSetContextSelect: {
        category: 'Resource Browser',
        action: 'RESOURCE_BROWSER_GET_KUBECONFIG_BULK_SETCONTEXT_OPTION_DONOTSET_CHANGED',
    },
    SetContextSelect: {
        category: 'Resource Browser',
        action: 'RESOURCE_BROWSER_GET_KUBECONFIG_BULK_SETCONTEXT_OPTION_SELECTED_CLUSTER_CHANGED',
    },
}

export const DefaultSelectPickerOptionType = {
    label: 'Do not set context',
    value: '',
}
