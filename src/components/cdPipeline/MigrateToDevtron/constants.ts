import { GenericSectionErrorStateProps } from '@devtron-labs/devtron-fe-common-lib'

export const GENERIC_SECTION_ERROR_STATE_COMMON_PROPS: Readonly<
    Pick<GenericSectionErrorStateProps, 'rootClassName' | 'description'>
> = {
    rootClassName: 'dc__mxw-400',
    description: '',
}

export const TARGET_CLUSTER_TOOLTIP_INFO = {
    heading: 'Target cluster',
    infoList: ['Cluster in which the Argo CD application is deploying your microservice'],
}
export const TARGET_NAMESPACE_TOOLTIP_INFO = {
    heading: 'Target Namespace',
    infoList: ['Namespace in which the Argo CD application is deploying your microservice'],
}
export const TARGET_ENVIRONMENT_INFO_LIST = {
    heading: 'Target environment',
    infoList: [
        'A deployment pipeline will be created for the target environment.',
        'Environment is a unique combination of cluster and namespace in Devtron.',
    ],
}
