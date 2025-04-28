import { IconName } from '@devtron-labs/devtron-fe-common-lib'

import { CreateClusterTypeEnum, SidebarConfigType } from './types'

export const SIDEBAR_CONFIG: SidebarConfigType = {
    [CreateClusterTypeEnum.CONNECT_CLUSTER]: {
        title: 'Connect Cluster',
        iconName: 'ic-ci-linked' as IconName,
        dataTestId: 'cluster-button-switch',
        body: (
            <p className="m-0">
                Connect an existing Kubernetes cluster to manage Kubernetes resources and deploy containerized
                applications using Devtron.
            </p>
        ),
    },
    [CreateClusterTypeEnum.CREATE_EKS_CLUSTER]: {
        title: 'Create EKS Cluster',
        iconName: 'ic-cluster' as IconName,
        dataTestId: 'create-eks-cluster-tab',
        body: (
            <>
                <p className="m-0">With Devtron, you can effortlessly create an Amazon EKS cluster.</p>
                <p className="m-0">
                    Amazon Elastic Kubernetes Service (Amazon EKS) is a fully managed Kubernetes service that enables
                    you to run Kubernetes seamlessly in both AWS Cloud and on-premises data centers.
                </p>
            </>
        ),
        isEnterprise: true,
    },
    [CreateClusterTypeEnum.ADD_ISOLATED_CLUSTER]: {
        title: 'Add Isolated Cluster',
        iconName: 'ic-add' as IconName,
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
    },
} as const
