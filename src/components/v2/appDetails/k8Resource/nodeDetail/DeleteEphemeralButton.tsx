import { ToastManager, ToastVariantType, showError, IndexStore } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '@Icons/ic-cross.svg'
import { useParams } from 'react-router-dom'
import { deleteEphemeralUrl } from './nodeDetail.api'
import { DeleteEphemeralButtonType, ParamsType, ResponsePayload } from './nodeDetail.type'
import '../k8resources.scss'

export const DeleteEphemeralButton = ({
    containerName,
    isResourceBrowserView,
    selectedNamespace,
    selectedClusterId,
    selectedPodName,
    switchSelectedContainer,
    setContainers,
    containers,
    isExternal,
}: DeleteEphemeralButtonType) => {
    const params = useParams<ParamsType>()
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

    const deleteEphemeralContainer = async () => {
        try {
            const { result } = await deleteEphemeralUrl({
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

            const updatedContainers = containers.filter((con) => con.name !== result) || []
            switchSelectedContainer(updatedContainers[0].name || '')
            setContainers(updatedContainers)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Deleted successfully',
            })
        } catch (error) {
            showError(error)
        }
    }

    return (
        // Not using button component from devtron-fe-common-lib due to icon size visibility issue
        <button
            onClick={deleteEphemeralContainer}
            type="button"
            aria-label="delete-button"
            className="ephemeral-delete-button dc__unset-button-styles"
            disabled={!!isExternal}
            data-testid="ephemeral-delete-button"
        >
            <Close className="icon-dim-16 dc__hover-color-r500--fill" />
        </button>
    )
}
