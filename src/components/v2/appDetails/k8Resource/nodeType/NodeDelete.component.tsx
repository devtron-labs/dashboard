import React, { useState } from 'react'
import { useRouteMatch, useParams, generatePath, useHistory, useLocation } from 'react-router'
import {
    showError,
    DeleteDialog,
    PopupMenu,
    Checkbox,
    CHECKBOX_VALUE,
    useSearchString,
    MODAL_TYPE,
} from '@devtron-labs/devtron-fe-common-lib'
import PodPopup from './PodPopup'
import AppDetailsStore from '../../appDetails.store'
import { toast } from 'react-toastify'
import dots from '../../../assets/icons/ic-menu-dot.svg'
import './nodeType.scss'
import { deleteResource } from '../../appDetails.api'
import { AppType, NodeDeleteComponentType, NodeType } from '../../appDetails.type'
import { appendRefetchDataToUrl } from '../../../../util/URLUtil'
import { URLS } from '../../../../../config'
import { importComponentFromFELibrary } from '../../../../common'
import { getAppDetailsForManifest } from '../nodeDetail/nodeDetail.api'

const SecurityModal = importComponentFromFELibrary('SecurityModal')
const DeploymentWindowConfirmationDialog = importComponentFromFELibrary('DeploymentWindowConfirmationDialog')

const NodeDeleteComponent = ({
    nodeDetails,
    appDetails,
    isDeploymentBlocked,
}: NodeDeleteComponentType) => {
    const { path } = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const params = useParams<{ actionName: string; podName: string; nodeType: string; appId: string; envId: string }>()
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [apiCallInProgress, setApiCallInProgress] = useState(false)
    const [forceDelete, setForceDelete] = useState(false)
    const [manifestPayload, setManifestPayload] = useState<ReturnType<typeof getAppDetailsForManifest> | null>(null)

    const handleShowVulnerabilityModal = () => {
        setManifestPayload(getAppDetailsForManifest(appDetails))
    }

    const handleCloseVulnerabilityModal = () => {
        setManifestPayload(null)
    }

    const { queryParams } = useSearchString()
    const isExternalArgoApp = appDetails?.appType === AppType.EXTERNAL_ARGO_APP

    function describeNodeWrapper(tab) {
        queryParams.set('kind', params.podName)
        const updatedPath = `${path.substring(0, path.indexOf('/k8s-resources/'))}/${
            URLS.APP_DETAILS_K8
        }/${NodeType.Pod.toLowerCase()}/${nodeDetails.name}/${tab.toLowerCase()}`
        history.push(generatePath(updatedPath, { ...params, tab }))
    }

    const renderDeleteResourcePopup = () => {
        if (!showDeleteConfirmation) {
            return null
        }
        if (isDeploymentBlocked && DeploymentWindowConfirmationDialog) {
            return (
                <DeploymentWindowConfirmationDialog
                    onClose={toggleShowDeleteConfirmation}
                    isLoading={apiCallInProgress}
                    type={MODAL_TYPE.RESOURCE}
                    onClickActionButton={deleteResourceAction}
                    appName={appDetails.appName}
                    envName={appDetails.environmentName}
                    appId={params.appId}
                    envId={params.envId}
                    forceDelete={forceDelete}
                    apiCallInProgress={apiCallInProgress}
                    forceDeleteHandler={forceDeleteHandler}
                    resourceName={nodeDetails?.name}
                />
            )
        }
        return (
            <DeleteDialog
                title={`Delete ${nodeDetails?.kind} "${nodeDetails?.name}"`}
                delete={deleteResourceAction}
                closeDelete={toggleShowDeleteConfirmation}
                apiCallInProgress={apiCallInProgress}
            >
                <DeleteDialog.Description>
                    <p className="mb-12">Are you sure, you want to delete this resource?</p>
                    <Checkbox
                        rootClassName="resource-force-delete"
                        isChecked={forceDelete}
                        value={CHECKBOX_VALUE.CHECKED}
                        disabled={apiCallInProgress}
                        onChange={forceDeleteHandler}
                    >
                        Force delete resource
                    </Checkbox>
                </DeleteDialog.Description>
            </DeleteDialog>
        )
    }

    async function asyncDeletePod(nodeDetails) {
        try {
            setApiCallInProgress(true)
            await deleteResource(nodeDetails, appDetails, params.envId, forceDelete)
            setShowDeleteConfirmation(false)
            setForceDelete(false)
            toast.success('Deletion initiated successfully.')
            const _tabs = AppDetailsStore.getAppDetailsTabs()
            const appDetailsTabs = _tabs.filter((_tab) => _tab.name === nodeDetails.name)

            appDetailsTabs.forEach((_tab) => AppDetailsStore.removeAppDetailsTabByIdentifier(_tab.title))
            appendRefetchDataToUrl(history, location)
        } catch (err) {
            showError(err)
        } finally {
            setApiCallInProgress(false)
            setShowDeleteConfirmation(false)
        }
    }

    const deleteResourceAction = () => {
        asyncDeletePod(nodeDetails)
    }

    const toggleShowDeleteConfirmation = () => {
        setShowDeleteConfirmation(!showDeleteConfirmation)
    }

    const forceDeleteHandler = (e) => {
        setForceDelete(!forceDelete)
    }

    return (
        <div style={{ width: '40px' }}>
            <PopupMenu autoClose>
                <PopupMenu.Button dataTestId="node-resource-dot-button" isKebab>
                    <img src={dots} className="pod-info__dots" />
                </PopupMenu.Button>
                <PopupMenu.Body>
                    <PodPopup
                        kind={nodeDetails?.kind}
                        describeNode={describeNodeWrapper}
                        toggleShowDeleteConfirmation={toggleShowDeleteConfirmation}
                        isExternalArgoApp={isExternalArgoApp}
                        handleShowVulnerabilityModal={handleShowVulnerabilityModal}
                    />
                </PopupMenu.Body>
            </PopupMenu>

            {!!manifestPayload && SecurityModal && (
                <SecurityModal
                    resourceScanPayload={{
                        name: nodeDetails?.name,
                        namespace: nodeDetails?.namespace,
                        group: nodeDetails?.group,
                        kind: nodeDetails?.kind,
                        version: nodeDetails?.version,
                        clusterId: manifestPayload.clusterId,
                        appType: manifestPayload.appType,
                        deploymentType: manifestPayload.deploymentType,
                    }}
                    handleModalClose={handleCloseVulnerabilityModal}
                />
            )}

            {renderDeleteResourcePopup()}
        </div>
    )
}

export default NodeDeleteComponent
