/*
 * Copyright (c) 2024. Devtron Inc.
 */

export interface KubeConfigButtonProps {
    isPrimaryButton?: boolean
    clusterName?: string
}

export interface KubeConfigTippyContentProps extends Pick<KubeConfigButtonProps, 'clusterName'> {
    handleModalClose: () => void
}
