import { CreateClusterTypeEnum, SidebarConfigType } from './types'

export const SIDEBAR_CONFIG: SidebarConfigType = {
    [CreateClusterTypeEnum.CONNECT_CLUSTER]: {
        title: 'Connect Cluster',
        iconName: 'ic-ci-linked',
        dataTestId: 'cluster-button-switch',
        body: (
            <p className="m-0">
                Connect an existing Kubernetes cluster to manage Kubernetes resources and deploy containerized
                applications using Devtron.
            </p>
        ),
    },
    [CreateClusterTypeEnum.CREATE_CLUSTER]: {
        title: 'Create Kubernetes Cluster',
        iconName: 'ic-new',
        dataTestId: 'create-cluster-tab',
        body: (
            <p className="m-0">
                Use Devtron to easily create Kubernetes clusters on popular cloud providers. Simplify cluster
                provisioning and management with a guided, user-friendly interface.{' '}
            </p>
        ),
        isEnterprise: true,
    },
    [CreateClusterTypeEnum.ADD_ISOLATED_CLUSTER]: {
        title: 'Add Isolated Cluster',
        iconName: 'ic-add',
        documentationHeader: 'Isolated Cluster',
        dataTestId: 'virtual-cluster-button-switch',
        body: (
            <>
                <p className="m-0">
                    An isolated cluster in Devtron is an air-gapped Kubernetes cluster with restricted network access.
                </p>
                <p className="m-0">
                    Since Devtron does not have connectivity to these clusters, deployments are managed by packaging
                    manifests and images for manual installation or retrieval from an OCI registry (if enabled).
                </p>
            </>
        ),
        isEnterprise: true,
        hideInEAMode: true,
    },
} as const
