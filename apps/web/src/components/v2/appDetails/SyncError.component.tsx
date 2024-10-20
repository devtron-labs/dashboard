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
import {
    DeploymentAppTypes,
    ForceDeleteDialog,
    ResponseType,
    ServerErrors,
    not,
    showError,
    renderErrorHeaderMessage,
    ToastVariantType,
    ToastManager,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as DropDownIcon } from '../../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as AlertTriangle } from '../../../assets/icons/ic-alert-triangle.svg'
import IndexStore from './index.store'
import { AppType, SyncErrorType } from './appDetails.type'
import { AppDetailsErrorType } from '../../../config'
import {
    deleteArgoCDAppWithNonCascade,
    getClusterConnectionStatus,
} from '../../app/details/appDetails/appDetails.service'
import { ClusterConnectionResponse } from '../../app/details/appDetails/appDetails.type'
import { TOAST_INFO } from '../../../config/constantMessaging'
import ClusterNotReachableDailog from '../../common/ClusterNotReachableDailog/ClusterNotReachableDialog'

const SyncErrorComponent: React.FC<SyncErrorType> = ({ showApplicationDetailedModal }) => {
    const [collapsed, toggleCollapsed] = useState<boolean>(true)
    const [isImagePullBackOff, setIsImagePullBackOff] = useState(false)
    const [clusterConnectionError, setClusterConnectionError] = useState<boolean>(false)
    const [clusterName, setClusterName] = useState<string>('')
    const [forceDeleteDialogTitle, setForceDeleteDialogTitle] = useState<string>('')
    const [forceDeleteDialogMessage, setForceDeleteDialogMessage] = useState<string>('')
    const [nonCascadeDeleteDialog, showNonCascadeDeleteDialog] = useState<boolean>(false)
    const [forceDeleteDialog, showForceDeleteDialog] = useState(false)
    const appDetails = IndexStore.getAppDetails()
    const conditions = appDetails?.resourceTree?.conditions || []

    const verifyDeployedClusterConnectionStatus = async (): Promise<void> => {
        await getClusterConnectionStatus(appDetails.environmentId).then((response: ClusterConnectionResponse) => {
            if (response.result) {
                response.result?.clusterReachable ? setClusterConnectionError(false) : setClusterConnectionError(true)
                setClusterName(response.result.clusterName)
            }
        })
    }

    useEffect(() => {
        if (appDetails.appType === AppType.DEVTRON_APP && appDetails.resourceTree?.nodes?.length) {
            for (let index = 0; index < appDetails.resourceTree.nodes.length; index++) {
                const node = appDetails.resourceTree.nodes[index]
                let _isImagePullBackOff = false
                if (node.info?.length) {
                    for (let index = 0; index < node.info.length; index++) {
                        const info = node.info[index]
                        if (
                            info.value &&
                            (info.value.toLowerCase() === AppDetailsErrorType.ERRIMAGEPULL ||
                                info.value.toLowerCase() === AppDetailsErrorType.IMAGEPULLBACKOFF)
                        ) {
                            _isImagePullBackOff = true
                            break
                        }
                    }

                    if (_isImagePullBackOff) {
                        setIsImagePullBackOff(true)
                        break
                    }
                }
            }
        }
    }, [appDetails])

    useEffect(() => {
        if (appDetails.deploymentAppType === DeploymentAppTypes.GITOPS && appDetails.deploymentAppDeleteRequest) {
            verifyDeployedClusterConnectionStatus()
        }
    }, [appDetails.appId, appDetails.environmentId])

    if (!appDetails || (conditions.length === 0 && !isImagePullBackOff && !clusterConnectionError)) {
        return null
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

    const toggleErrorHeader = () => {
        toggleCollapsed(not)
    }

    const errorCounter =
        conditions.length + (isImagePullBackOff && !appDetails.externalCi ? 1 : 0) + (clusterConnectionError && 1)

    const handleForceDelete = () => {
        nonCascadeDeleteArgoCDApp(true)
    }

    const setNonCascadeDelete = () => {
        showNonCascadeDeleteDialog(true)
    }

    return (
        <div className="top flex left column w-100 bcr-1 pl-20 pr-20 fs-13">
            <div className="flex left w-100 cursor h-56" onClick={toggleErrorHeader}>
                <AlertTriangle className="icon-dim-20 mr-8" />
                <span className="cr-5 fs-14 fw-6">{errorCounter === 1 ? '1 Error' : `${errorCounter} Errors`}</span>
                {collapsed && (
                    <span className="cn-9 ml-24 w-80 dc__ellipsis-right">
                        {clusterConnectionError &&
                            `Cluster is not reachable${
                                conditions.length > 0 || (isImagePullBackOff && !appDetails.externalCi) ? ', ' : ''
                            }`}
                        {isImagePullBackOff &&
                            !appDetails.externalCi &&
                            `IMAGEPULLBACKOFF${conditions.length > 0 ? ', ' : ''}`}
                        {conditions.map((condition) => condition.type).join(', ')}
                    </span>
                )}
                <DropDownIcon
                    style={{ marginLeft: 'auto', ['--rotateBy' as any]: `${180 * Number(!collapsed)}deg` }}
                    className="icon-dim-20 rotate"
                />
            </div>
            {!collapsed && (
                <table className="mb-8">
                    <tbody>
                        {clusterConnectionError && (
                            <tr>
                                <td className="pb-8 min-width">Cluster is not reachable</td>
                                <td className="pl-24 pb-8">
                                    {`The underlying resources cannot be deleted as the cluster${
                                        clusterName ? ` '${clusterName}'` : ''
                                    } is not
                                    reachable at the moment.`}
                                    <span className="pointer ml-8 cb-5" onClick={setNonCascadeDelete}>
                                        Force Delete
                                    </span>
                                </td>
                            </tr>
                        )}
                        {conditions.map((condition) => (
                            <tr>
                                <td className="pb-8 min-width">{condition.type}</td>
                                <td className="pl-24 pb-8">{condition.message}</td>
                            </tr>
                        ))}
                        {isImagePullBackOff && !appDetails.externalCi && (
                            <tr>
                                <td className="pb-8 min-width">ImagePullBackOff</td>
                                <td className="pl-24 pb-8">
                                    {renderErrorHeaderMessage(appDetails, 'sync-error', showApplicationDetailedModal)}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
            {forceDeleteDialog && (
                <ForceDeleteDialog
                    forceDeleteDialogTitle={forceDeleteDialogTitle}
                    onClickDelete={handleForceDelete}
                    closeDeleteModal={() => showForceDeleteDialog(false)}
                    forceDeleteDialogMessage={forceDeleteDialogMessage}
                />
            )}
            {nonCascadeDeleteDialog && (
                <ClusterNotReachableDailog
                    clusterName={clusterName}
                    onClickCancel={onClickHideNonCascadeDeletePopup}
                    onClickDelete={onClickNonCascadeDelete}
                />
            )}
        </div>
    )
}
export default SyncErrorComponent
