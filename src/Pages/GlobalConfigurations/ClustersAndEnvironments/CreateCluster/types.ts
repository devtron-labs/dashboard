import { IconName } from '@devtron-labs/devtron-fe-common-lib'

export enum CreateClusterTypeEnum {
    CONNECT_CLUSTER = 'connect-cluster',
    CREATE_EKS_CLUSTER = 'create-eks-cluster',
    ADD_ISOLATED_CLUSTER = 'add-isolated-cluster',
}

export type SidebarConfigType = Record<
    CreateClusterTypeEnum,
    {
        title: string
        iconName: IconName
        body: React.ReactElement
        dataTestId: string
        documentationHeader?: string
        isEnterprise?: true
    }
>

export interface CreateClusterParams {
    type: CreateClusterTypeEnum
}

export interface CreateClusterProps {
    handleReloadClusterList: () => void
    handleRedirectOnModalClose?: () => void
}

export enum FooterComponentChildKey {
    START = 'Start',
    CTA = 'CTA',
}

export interface EnterpriseTrialDialogProps {
    featureTitle: string
    featureDescription: string
}
