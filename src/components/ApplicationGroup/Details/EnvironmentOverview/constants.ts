import { ResourceIdentifierDTO, WorkloadListResultDTO, AppGroupRotatePodsDTO } from '../../AppGroup.types'

export const BIO_MAX_LENGTH = 40
export const BIO_MAX_LENGTH_ERROR = `Max ${BIO_MAX_LENGTH} characters allowed`

export enum APP_DETAILS_TEXT {
    RESTART_WORKLOAD = 'Restart workloads',
    APP_GROUP_RESTART_WORKLOAD_SUBTITLE = 'It might take some time depending upon the number of applications',
    APP_GROUP_INFO_TEXT = 'Pods for selected workloads will be restarted. Configured deployment strategies will be used to restart workloads.',
    APPLICATIONS = 'Applications',
    EXPAND_ALL = 'Expand all',
    APP_NAME = 'app-name',
    KIND_NAME = 'kind-name',
    ALL = 'All',
}

export const DATA_TEST_IDS = {
    WORKLOAD_RESTART_MODAL: 'workload-restart-modal',
    APP_GROUP_WORKLOAD_RESTART: 'app-group-workload-restart',
    APP_GROUP_WORKLOAD_RESTART_SUBTITLE: 'app-group-workload-restart-subtitle',
    APP_GROUP_WORKLOAD_RESTART_APP_NAME_CHECKBOX: 'app-group-workload-restart-app-name-checkbox',
    APP_GROUP_WORKLOAD_RESTART_KIND_NAME_CHECKBOX: 'app-group-workload-restart-kind-name-checkbox',
    APP_GROUP_WORKLOAD_RESTART_COLLAPSED_DROPDOWN: 'app-group-workload-restart-collapsed-dropdown',
    APP_GROUP_WORKLOAD_RESTART_EXPANDED_DROPDOWN: 'app-group-workload-restart-expanded-dropdown',
    APP_GROUP_WORKLOAD_RESTART_EXPAND_ALL_CHECKBOX: 'app-group-workload-restart-expand-all-checkbox',
    APP_GROUP_WORKLOAD_RESTART_RESTART_DROPDOWN: 'app-group-workload-restart-restart-dropdown',
}

// TODO - Remove mock data
// ------------------------MOCK DATA------------------------

const mockResourceIdentifiers: ResourceIdentifierDTO[] = [
    {
        name: 'exampleName',
        groupVersionKind: {
            Group: 'exampleGroup',
            Version: 'exampleVersion',
            Kind: 'Deployment',
        },
        errorMessage: 'Error message1',
        containsError: true,
    },
    {
        name: 'aspdotnetapp-qa-devtroncd',
        groupVersionKind: {
            Group: 'exampleGroup2',
            Version: 'exampleVersion2',
            Kind: 'StatefulSet',
        },
        containsError: false,
        errorMessage: '',
    },
    {
        name: 'aspdotnetapp-qa-devtroncd-7d8fbd4586',
        groupVersionKind: {
            Group: 'exampleGroup2',
            Version: 'exampleVersion2',
            Kind: 'ReplicaSet',
        },
        containsError: true,
        errorMessage: 'Error message2',
    },
    {
        name: 'exampleName',
        groupVersionKind: {
            Group: 'exampleGroup2',
            Version: 'exampleVersion2',
            Kind: 'ReplicaSet',
        },
        containsError: true,
        errorMessage: 'Error message3',
    },
]
const mockResourceIdentifiers2: ResourceIdentifierDTO[] = [
    {
        name: 'exampleName',
        groupVersionKind: {
            Group: 'exampleGroup',
            Version: 'exampleVersion',
            Kind: 'Deployment',
        },
        errorMessage: 'Error message1',
        containsError: true,
    },
]

const mockResourceIdentifiers3: ResourceIdentifierDTO[] = []

const mockResult: WorkloadListResultDTO = {
    environmentId: 1,
    namespace: 'devtron-demo',
    restartPodMap: {
        1: {
            resourceIdentifiers: mockResourceIdentifiers,
            appName: 'argoexec-build',
        },
        2: {
            resourceIdentifiers: mockResourceIdentifiers2,
            appName: 'argo-rollout',
        },
        3: {
            resourceIdentifiers: mockResourceIdentifiers3,
            appName: 'devtron-demo',
        },
    },
}

export const mockDTO: AppGroupRotatePodsDTO = {
    result: mockResult,
    code: 200,
    status: 'OK',
}
