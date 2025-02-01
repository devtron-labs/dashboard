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

import React, { useState, useEffect } from 'react'
import Tippy from '@tippyjs/react'
import {
    DeploymentAppTypes,
    noop,
    showError,
    ResponseType,
    ServerErrors,
    renderErrorHeaderMessage,
    ToastVariantType,
    ToastManager,
    ForceDeleteConfirmationModal,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICHelpOutline } from '../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as ErrorIcon } from '../../../../assets/icons/ic-warning.svg'
import { deleteArgoCDAppWithNonCascade, getClusterConnectionStatus } from './appDetails.service'
import { ClusterConnectionResponse, ErrorItem, IssuesCardType } from './appDetails.type'
import { TOAST_INFO } from '../../../../config/constantMessaging'
import ClusterNotReachableDialog from '../../../common/ClusterNotReachableDailog/ClusterNotReachableDialog'
import { AppType } from '../../../v2/appDetails/appDetails.type'
import { AppDetailsErrorType } from '../../../../config'
import IndexStore from '../../../v2/appDetails/index.store'
import LoadingCard from './LoadingCard'

const IssuesCard = ({ cardLoading, setErrorsList, toggleIssuesModal, setDetailed }: IssuesCardType) => {
    const [forceDeleteDialog, showForceDeleteDialog] = useState(false)
    const [nonCascadeDeleteDialog, showNonCascadeDeleteDialog] = useState(false)
    const [clusterConnectionError, setClusterConnectionError] = useState(false)
    const [clusterName, setClusterName] = useState('')
    const [forceDeleteDialogTitle, setForceDeleteDialogTitle] = useState('')
    const [forceDeleteDialogMessage, setForceDeleteDialogMessage] = useState('')
    const [isImagePullBackOff, setIsImagePullBackOff] = useState(false)

    const appDetails = IndexStore.getAppDetails()
    const conditions = appDetails?.resourceTree?.conditions || []

    const showIssuesListingModal = () => {
        toggleIssuesModal(true)
    }

    const showApplicationDetailedModal = () => {
        // Close the opened issues list modal first
        // then open the application details modal with some time gap,
        // to avoid batch state updates
        toggleIssuesModal(false)
        setTimeout(() => {
            setDetailed(true)
        }, 100)
    }

    useEffect(() => {
        if (appDetails.appType === AppType.DEVTRON_APP && appDetails.resourceTree?.nodes?.length) {
            const hasImagePullBackOff = appDetails.resourceTree.nodes.some((node) => {
                return node.info?.some(
                    (info) =>
                        info.value &&
                        (info.value.toLowerCase() === AppDetailsErrorType.ERRIMAGEPULL ||
                            info.value.toLowerCase() === AppDetailsErrorType.IMAGEPULLBACKOFF),
                )
            })

            if (hasImagePullBackOff) {
                setIsImagePullBackOff(true)
            }
        }
    }, [appDetails])

    useEffect(() => {
        if (appDetails.deploymentAppType === DeploymentAppTypes.GITOPS && appDetails.deploymentAppDeleteRequest) {
            verifyDeployedClusterConnectionStatus()
        }
    }, [appDetails.appId, appDetails.environmentId])

    const verifyDeployedClusterConnectionStatus = async (): Promise<void> => {
        await getClusterConnectionStatus(appDetails.environmentId).then((response: ClusterConnectionResponse) => {
            if (response.result) {
                response.result?.clusterReachable ? setClusterConnectionError(false) : setClusterConnectionError(true)
                setClusterName(response.result.clusterName)
            }
        })
    }

    const setForceDeleteDialogData = (serverError) => {
        if (serverError instanceof ServerErrors && Array.isArray(serverError.errors)) {
            serverError.errors.map(({ userMessage, internalMessage }) => {
                setForceDeleteDialogTitle(userMessage)
                setForceDeleteDialogMessage(internalMessage)
            })
        }
    }

    const nonCascadeDeleteArgoCDApp = async (force: boolean): Promise<void> => {
        showForceDeleteDialog(false)
        deleteArgoCDAppWithNonCascade(appDetails.appType, appDetails.appId, appDetails.environmentId, force)
            .then((response: ResponseType) => {
                if (response.code === 200) {
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: TOAST_INFO.DELETION_INITIATED,
                    })
                }
            })
            .catch((error: ServerErrors) => {
                if (!forceDeleteDialog && error.code != 403) {
                    showForceDeleteDialog(true)
                    setForceDeleteDialogData(error)
                } else {
                    showError(error)
                }
            })
    }

    const onClickHideNonCascadeDeletePopup = () => {
        showNonCascadeDeleteDialog(false)
    }

    const onClickNonCascadeDelete = async () => {
        showNonCascadeDeleteDialog(false)
        await nonCascadeDeleteArgoCDApp(false)
    }

    const errorCounter = conditions?.length + (isImagePullBackOff ? 1 : 0) + (clusterConnectionError ? 1 : 0)

    const handleForceDelete = () => {
        nonCascadeDeleteArgoCDApp(true)
    }

    const setNonCascadeDelete = () => {
        showNonCascadeDeleteDialog(true)
    }

    const getErrorsList = (): ErrorItem[] => {
        const errorsList = []

        if (clusterConnectionError) {
            errorsList.push({
                error: 'Cluster is not reachable',
                message: `The underlying resources cannot be deleted as the cluster${
                    clusterName ? ` '${clusterName}'` : ''
                } is not reachable at the moment.`,
            })
        }

        conditions?.forEach((condition) => {
            errorsList.push({
                error: condition.type,
                message: condition.message,
            })
        })

        if (isImagePullBackOff && !appDetails.externalCi) {
            errorsList.push({
                error: 'ImagePullBackOff',
                message: renderErrorHeaderMessage(appDetails, 'sync-error', showApplicationDetailedModal),
            })
        }

        return errorsList
    }

    useEffect(() => {
        const errors = getErrorsList()
        setErrorsList(errors)
    }, [
        clusterConnectionError,
        clusterName,
        conditions,
        isImagePullBackOff,
        appDetails.externalCi,
        appDetails.ipsAccessProvided,
        appDetails.dockerRegistryId,
        appDetails.clusterName,
    ])

    const getErrorCountText = () => {
        return errorCounter > 1 ? `${errorCounter} Errors` : `${errorCounter} Error`
    }

    if (!appDetails || (conditions?.length === 0 && !isImagePullBackOff && !clusterConnectionError)) {
        return null
    }

    if (cardLoading) {
        return <LoadingCard />
    }

    const onCloseForceDeleteModal = () => showForceDeleteDialog(false)

    return (
        <div
            data-testid="issues-card"
            onClick={cardLoading ? noop : showIssuesListingModal}
            className="app-details-info-card pointer flex left bg__primary br-8 mr-12 lh-20 w-200"
        >
            <div className="app-details-info-card__top-container flex">
                <div className="app-details-info-card__top-container__content">
                    <div className="app-details-info-card__top-container__content__title-wrapper">
                        <div className="fs-12 fw-4 cn-7 mr-5">Issues</div>
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="top"
                            content="Issues or errors detected in the current deployment"
                        >
                            <div className="flex">
                                <ICHelpOutline className="icon-dim-16 mt-2" />
                            </div>
                        </Tippy>
                    </div>
                    <div className="flex fs-12 fw-4">
                        <div className="fs-13 fw-6  lh-20 f-degraded">{getErrorCountText()}</div>
                    </div>
                </div>
                <ErrorIcon className="form__icon--error icon-dim-24" />
            </div>
            <div className="app-details-info-card__bottom-container dc__content-space">
                <span className="app-details-info-card__bottom-container__message fs-12 fw-4">
                    {clusterConnectionError &&
                        `Cluster is not reachable${
                            conditions?.length > 0 || (isImagePullBackOff && !appDetails.externalCi) ? ', ' : ''
                        }`}
                    {isImagePullBackOff &&
                        !appDetails.externalCi &&
                        `imagePullBackOff${conditions?.length > 0 ? ', ' : ''}`}
                    {conditions?.map((condition) => condition.type).join(', ')}
                </span>
                <div
                    className="app-details-info-card__bottom-container__details fs-12 fw-6"
                    onClick={setNonCascadeDelete}
                >
                    Details
                </div>
            </div>
            <ForceDeleteConfirmationModal
                title={forceDeleteDialogTitle}
                onDelete={handleForceDelete}
                closeConfirmationModal={onCloseForceDeleteModal}
                subtitle={forceDeleteDialogMessage}
            />

            {nonCascadeDeleteDialog && (
                <ClusterNotReachableDialog
                    clusterName={clusterName}
                    onClickCancel={onClickHideNonCascadeDeletePopup}
                    onClickDelete={onClickNonCascadeDelete}
                />
            )}
        </div>
    )
}

export default React.memo(IssuesCard)
