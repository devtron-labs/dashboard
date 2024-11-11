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
    const { clusterId, environmentId, namespace, appName, appId, appType, fluxTemplateType } =
        IndexStore.getAppDetails()

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

    const deleteEphemeralContainer = () => {
        deleteEphemeralUrl({
            requestData: getPayload(),
            clusterId,
            environmentId,
            namespace,
            appName,
            appId,
            appType,
            fluxTemplateType,
            isResourceBrowserView,
            params,
        })
            .then((response: any) => {
                const containerNameRes = response.result
                const updatedContainers = containers?.filter((con) => con.name !== containerNameRes) || []
                switchSelectedContainer(updatedContainers?.[0]?.name || '')
                setContainers(updatedContainers)
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
