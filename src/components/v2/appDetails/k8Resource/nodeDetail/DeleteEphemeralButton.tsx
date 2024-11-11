import {
    ToastManager,
    ToastVariantType,
    showError,
    Button,
    ButtonVariantType,
    ComponentSizeType,
    ButtonStyleType,
    IndexStore,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '@Icons/ic-close.svg'
import { deleteEphemeralUrl } from './nodeDetail.api'
import { DeleteEphemeralButtonType, ResponsePayload } from './nodeDetail.type'

export const DeleteEphemeralButton = ({
    containerName,
    isResourceBrowserView,
    selectedNamespace,
    selectedClusterId,
    selectedPodName,
    switchSelectedContainer,
    setContainers,
    params,
    containers,
}: DeleteEphemeralButtonType) => {
    const appDetails = IndexStore.getAppDetails()
    const deleteEphemeralContainer = () => {
        const getPayload = () => {
            const payload: ResponsePayload = {
                namespace: selectedNamespace,
                clusterId: selectedClusterId,
                podName: selectedPodName,
                basicData: {
                    containerName,
                },
            }
            return payload
        }

        deleteEphemeralUrl({
            requestData: getPayload(),
            clusterId: appDetails.clusterId,
            environmentId: appDetails.environmentId,
            namespace: appDetails.namespace,
            appName: appDetails.appName,
            appId: appDetails.appId,
            appType: appDetails.appType,
            fluxTemplateType: appDetails.fluxTemplateType,
            isResourceBrowserView,
            params,
        })
            .then((response: any) => {
                const _containers = []
                const containerNameRes = response.result
                containers?.forEach((con) => {
                    if (containerNameRes !== con.name) {
                        _containers.push(con)
                    }
                })
                switchSelectedContainer(_containers?.[0]?.name || '')
                setContainers(_containers)
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Deleted successfully',
                })
            })
            .catch((error) => {
                showError(error)
            })
    }

    return (
        <Button
            dataTestId="regex-modal-header-close-button"
            onClick={deleteEphemeralContainer}
            ariaLabel="close-button"
            variant={ButtonVariantType.borderLess}
            size={ComponentSizeType.small}
            showAriaLabelInTippy={false}
            icon={<Close />}
            style={ButtonStyleType.negativeGrey}
        />
    )
}
