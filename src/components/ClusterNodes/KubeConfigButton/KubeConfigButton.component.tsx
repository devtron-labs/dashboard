/*
 * Copyright (c) 2024. Devtron Inc.
 */

import { useState } from 'react'
import ReactGA from 'react-ga4'
import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
} from '@devtron-labs/devtron-fe-common-lib'
import { KubeConfigButtonProps } from './types'
import KubeConfigModal from './KubeConfigModal'

const KubeConfigButton = ({ clusterName, isPrimaryButton = false }: KubeConfigButtonProps) => {
    const [openModal, setOpenModal] = useState(false)

    const handleOpenKubeConfigModal = () => {
        setOpenModal(true)
        ReactGA.event({
            category: 'Resource Browser',
            action: 'Get kubeconfig button clicked',
        })
    }

    const handleModalClose = () => {
        setOpenModal(false)
    }

    return (
        <>
            {isPrimaryButton ? (
                <Button
                    text="Get kubeconfig"
                    dataTestId="rb-cluster-bulk-selection-kube-config"
                    onClick={handleOpenKubeConfigModal}
                    size={ComponentSizeType.medium}
                />
            ) : (
                <Button
                    icon={<Icon name="ic-info-filled" color={null} />}
                    onClick={handleOpenKubeConfigModal}
                    dataTestId="rb-cluster-bulk-selection-kube-config"
                    variant={ButtonVariantType.borderLess}
                    ariaLabel="Get kubeconfig"
                    size={ComponentSizeType.small}
                    style={ButtonStyleType.neutral}
                />
            )}
            {openModal ? <KubeConfigModal clusterName={clusterName} handleModalClose={handleModalClose} /> : null}
        </>
    )
}

export default KubeConfigButton
