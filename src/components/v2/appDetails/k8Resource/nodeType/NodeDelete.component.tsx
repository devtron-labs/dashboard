/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState } from 'react'
import { useRouteMatch, useParams, generatePath, useHistory, useLocation } from 'react-router-dom'
import {
    showError,
    PopupMenu,
    Checkbox,
    CHECKBOX_VALUE,
    useSearchString,
    MODAL_TYPE,
    SecurityModal,
    ToastVariantType,
    ToastManager,
    GetResourceScanDetailsPayloadType,
    ResponseType,
    useAsync,
    ScanResultDTO,
    noop,
    ConfirmationModal,
    ConfirmationModalVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICMoreOption } from '@Icons/ic-more-option.svg'
import PodPopup from './PodPopup'
import './nodeType.scss'
import { deleteResource } from '../../appDetails.api'
import { NodeDeleteComponentType, NodeType } from '../../appDetails.type'
import { appendRefetchDataToUrl } from '../../../../util/URLUtil'
import { URLS } from '../../../../../config'
import { importComponentFromFELibrary } from '../../../../common'
import { getAppDetailsForManifest } from '../nodeDetail/nodeDetail.api'

const DeploymentWindowConfirmationDialog = importComponentFromFELibrary('DeploymentWindowConfirmationDialog')
const getResourceScanDetails: ({
    name,
    namespace,
    clusterId,
    group,
    version,
    kind,
    appId,
    appType,
    deploymentType,
    isAppDetailView,
}: GetResourceScanDetailsPayloadType) => Promise<ResponseType<ScanResultDTO>> = importComponentFromFELibrary(
    'getResourceScanDetails',
    null,
    'function',
)

const NodeDeleteComponent = ({
    nodeDetails,
    appDetails,
    isDeploymentBlocked,
    tabs,
    removeTabByIdentifier,
}: NodeDeleteComponentType) => {
    const { path } = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const params = useParams<{ actionName: string; podName: string; nodeType: string; appId: string; envId: string }>()
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [apiCallInProgress, setApiCallInProgress] = useState(false)
    const [forceDelete, setForceDelete] = useState(false)
    const [manifestPayload, setManifestPayload] = useState<ReturnType<typeof getAppDetailsForManifest> | null>(null)

    const [resourceScanLoading, resourceScanResponse, resourceScanError] = useAsync(
        () =>
            getResourceScanDetails({
                ...nodeDetails,
                ...manifestPayload,
                isAppDetailView: true,
            }),
        [manifestPayload],
        manifestPayload && !!getResourceScanDetails,
    )

    const handleShowVulnerabilityModal = () => {
        /* TODO: need to set to prevent outsideClick propagation */
        setTimeout(() => {
            setManifestPayload(getAppDetailsForManifest(appDetails))
        }, 100)
    }

    const handleCloseVulnerabilityModal = () => {
        setManifestPayload(null)
    }

    const { queryParams } = useSearchString()

    function describeNodeWrapper(tab) {
        queryParams.set('kind', params.podName)
        const updatedPath = `${path.substring(0, path.indexOf('/k8s-resources/'))}/${
            URLS.APP_DETAILS_K8
        }/${NodeType.Pod.toLowerCase()}/${nodeDetails.name}/${tab.toLowerCase()}`
        history.push(generatePath(updatedPath, { ...params, tab }))
    }

    const deleteResourceAction = async () => {
        try {
            setApiCallInProgress(true)
            await deleteResource(nodeDetails, appDetails, params.envId, forceDelete)
            setShowDeleteConfirmation(false)
            setForceDelete(false)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Deletion initiated successfully.',
            })
            tabs.forEach((tab) => {
                if (tab.name === nodeDetails.name) {
                    removeTabByIdentifier(tab.id).then(noop).catch(noop)
                }
            })
            appendRefetchDataToUrl(history, location)
        } catch (err) {
            showError(err)
        } finally {
            setApiCallInProgress(false)
            setShowDeleteConfirmation(false)
        }
    }

    const toggleShowDeleteConfirmation = () => {
        setShowDeleteConfirmation(!showDeleteConfirmation)
    }

    const forceDeleteHandler = () => {
        setForceDelete(!forceDelete)
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
            <ConfirmationModal
                title={`Delete ${nodeDetails?.kind} "${nodeDetails?.name}"`}
                subtitle={`Are you sure you want to delete this ${nodeDetails?.kind}?`}
                variant={ConfirmationModalVariantType.delete}
                buttonConfig={{
                    secondaryButtonConfig: {
                        text: 'Cancel',
                        onClick: toggleShowDeleteConfirmation,
                    },
                    primaryButtonConfig: {
                        text: 'Delete',
                        onClick: deleteResourceAction,
                        isLoading: apiCallInProgress,
                        disabled: apiCallInProgress,
                    },
                }}
                handleClose={toggleShowDeleteConfirmation}
            >
                <Checkbox
                    rootClassName="resource-force-delete"
                    isChecked={forceDelete}
                    value={CHECKBOX_VALUE.CHECKED}
                    disabled={apiCallInProgress}
                    onChange={forceDeleteHandler}
                >
                    Force delete resource
                </Checkbox>
            </ConfirmationModal>
        )
    }

    return (
        <>
            <PopupMenu autoClose>
                <PopupMenu.Button
                    dataTestId="node-resource-dot-button"
                    isKebab
                    rootClassName="dc__h-fit-content flex dc__align-self-center dc__no-border"
                >
                    <ICMoreOption
                        className="icon-dim-20 fcn-6 rotate dc__no-shrink"
                        style={{ ['--rotateBy' as string]: '90deg' }}
                    />
                </PopupMenu.Button>
                <PopupMenu.Body>
                    <PodPopup
                        kind={nodeDetails?.kind}
                        // eslint-disable-next-line react/jsx-no-bind
                        describeNode={describeNodeWrapper}
                        toggleShowDeleteConfirmation={toggleShowDeleteConfirmation}
                        handleShowVulnerabilityModal={handleShowVulnerabilityModal}
                    />
                </PopupMenu.Body>
            </PopupMenu>

            {!!manifestPayload && !!getResourceScanDetails && (
                <SecurityModal
                    handleModalClose={handleCloseVulnerabilityModal}
                    isLoading={resourceScanLoading}
                    error={resourceScanError}
                    responseData={resourceScanResponse?.result}
                    hidePolicy
                />
            )}
            {renderDeleteResourcePopup()}
        </>
    )
}

export default NodeDeleteComponent
