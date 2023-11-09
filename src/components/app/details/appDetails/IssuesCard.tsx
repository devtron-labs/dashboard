import React, { useState, useEffect, useRef } from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as ErrorIcon } from '../../../../assets/icons/ic-warning.svg'
import {
    DeploymentAppTypes,
    noop,
    showError,
    ResponseType,
    ServerErrors,
    ForceDeleteDialog,
} from '@devtron-labs/devtron-fe-common-lib'
import { deleteArgoCDAppWithNonCascade, getClusterConnectionStatus } from './appDetails.service'
import { ClusterConnectionResponse } from './appDetails.type'
import { toast } from 'react-toastify'
import { TOAST_INFO } from '../../../../config/constantMessaging'
import ClusterNotReachableDialog from '../../../common/ClusterNotReachableDailog/ClusterNotReachableDialog'

import { IssuesCardType } from './appDetails.type'
import { AppType } from '../../../v2/appDetails/appDetails.type'
import { AppDetailsErrorType } from '../../../../config'
import IndexStore from '../../../v2/appDetails/index.store'

const IssuesCard1 = ({ appStreamData, loadingResourceTree, showIssuesListingModal, setErrorsList }: IssuesCardType) => {
    const [forceDeleteDialog, showForceDeleteDialog] = useState(false)
    const [nonCascadeDeleteDialog, showNonCascadeDeleteDialog] = useState(false)
    const [clusterConnectionError, setClusterConnectionError] = useState(false)
    const [clusterName, setClusterName] = useState('')
    const [forceDeleteDialogTitle, setForceDeleteDialogTitle] = useState('')
    const [forceDeleteDialogMessage, setForceDeleteDialogMessage] = useState('')
    const [collapsed, toggleCollapsed] = useState(true)
    const [isImagePullBackOff, setIsImagePullBackOff] = useState(false)

    const conditions = useRef(appStreamData?.result?.application?.status?.conditions || [])
    const appDetails = IndexStore.getAppDetails()

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
                    toast.success(TOAST_INFO.DELETION_INITIATED)
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
        toggleCollapsed(!collapsed)
    }

    const errorCounter = conditions.current?.length + (isImagePullBackOff ? 1 : 0) + (clusterConnectionError ? 1 : 0)

    const handleForceDelete = () => {
        nonCascadeDeleteArgoCDApp(true)
    }

    const setNonCascadeDelete = () => {
        showNonCascadeDeleteDialog(true)
    }

    const getErrorsList = () => {
        const errorsList = []

        if (clusterConnectionError) {
            errorsList.push({
                error: 'Cluster is not reachable',
                message: `The underlying resources cannot be deleted as the cluster${
                    clusterName ? ` '${clusterName}'` : ''
                } is not reachable at the moment.`,
            })
        }

        conditions.current?.forEach((condition) => {
            errorsList.push({
                error: condition.type,
                message: condition.message,
            })
        })

        if (isImagePullBackOff && !appDetails.externalCi) {
            errorsList.push({
                error: 'ImagePullBackOff',
                message: `'${appDetails.clusterName}' cluster ${
                    appDetails.ipsAccessProvided ? 'could not' : 'does not have permission to'
                } pull container image from ‘${appDetails.dockerRegistryId}’ registry.`,
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
        conditions.current,
        isImagePullBackOff,
        appDetails.externalCi,
        appDetails.ipsAccessProvided,
        appDetails.dockerRegistryId,
        appDetails.clusterName,
    ])

    return (
        <div
            data-testid="issues-card"
            onClick={loadingResourceTree ? noop : showIssuesListingModal}
            className="app-details-info-card pointer flex left bcn-0 br-8 mr-12 lh-20 w-200"
        >
            <div className="app-details-info-card__top-container flex">
                <div className="app-details-info-card__top-container__content">
                    <div className="app-details-info-card__top-container__content__title-wrapper">
                        <div className="fs-12 fw-4 cn-7 mr-5">Issues</div>
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="top"
                            content="Status of last triggered deployment" // @TODO: update this copy
                        >
                            <Question className="icon-dim-16 mt-2" />
                        </Tippy>
                    </div>
                    <div className="app-details-info-card__top-container__content__commit-text-wrapper flex fs-12 fw-4">
                        <div className="fs-13 fw-6  lh-20 f-degraded">{errorCounter} Errors found</div>
                    </div>
                </div>
                <ErrorIcon className="form__icon--error icon-dim-24" />
            </div>
            <div className="app-details-info-card__bottom-container dc__content-space">
                <span className="app-details-info-card__bottom-container__message fs-12 fw-4">
                    {/* @TODO: Put this message logic in a separate function */}
                    {clusterConnectionError &&
                        `Cluster is not reachable${
                            conditions.current?.length > 0 || (isImagePullBackOff && !appDetails.externalCi) ? ', ' : ''
                        }`}
                    {isImagePullBackOff &&
                        !appDetails.externalCi &&
                        `imagePullBackOff${conditions.current?.length > 0 ? ', ' : ''}`}
                    {conditions.current?.map((condition) => condition.type).join(', ')}
                </span>
                <div
                    className="app-details-info-card__bottom-container__details fs-12 fw-6"
                    onClick={setNonCascadeDelete}
                >
                    Details
                </div>
            </div>
            {forceDeleteDialog && (
                <ForceDeleteDialog
                    forceDeleteDialogTitle={forceDeleteDialogTitle}
                    onClickDelete={handleForceDelete}
                    closeDeleteModal={() => showForceDeleteDialog(false)}
                    forceDeleteDialogMessage={forceDeleteDialogMessage}
                />
            )}
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

export default React.memo(IssuesCard1)
