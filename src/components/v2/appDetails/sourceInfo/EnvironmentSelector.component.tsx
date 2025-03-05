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

import { useEffect, useState } from 'react'
import Select from 'react-select'
import {
    showError,
    PopupMenu,
    multiSelectStyles,
    ServerErrors,
    DeploymentAppTypes,
    ToastManager,
    ToastVariantType,
    ForceDeleteConfirmationModal,
} from '@devtron-labs/devtron-fe-common-lib'
import './sourceInfo.css'
import { useParams, useHistory, useRouteMatch } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import IndexStore from '../index.store'
import { AppEnvironment } from './environment.type'
import { useSharedState } from '../../utils/useSharedState'
import { AppType } from '../appDetails.type'
import { ReactComponent as ScaleObjects } from '../../../../assets/icons/ic-scale-objects.svg'
import ScaleWorkloadsModal from './scaleWorkloads/ScaleWorkloadsModal.component'
import { TriggerUrlModal } from '../../../app/list/TriggerUrl'
import { ReactComponent as LinkIcon } from '../../../../assets/icons/ic-link.svg'
import { ReactComponent as Trash } from '../../../../assets/icons/ic-delete-interactive.svg'
import { deleteApplicationRelease } from '../../../external-apps/ExternalAppService'
import { deleteInstalledChart } from '../../../charts/charts.service'
import { ReactComponent as Dots } from '../../assets/icons/ic-menu-dot.svg'
import { DELETE_ACTION, URLS, checkIfDevtronOperatorHelmRelease } from '../../../../config'
import { ReactComponent as BinWithDots } from '../../../../assets/icons/ic-delete-dots.svg'
import { DELETE_DEPLOYMENT_PIPELINE, DeploymentAppTypeNameMapping } from '../../../../config/constantMessaging'
import { getAppOtherEnvironmentMin } from '../../../../services/service'
import DeploymentTypeIcon from '../../../common/DeploymentTypeIcon/DeploymentTypeIcon'
import ClusterNotReachableDialog from '../../../common/ClusterNotReachableDialog/ClusterNotReachableDialog'
import { getEnvironmentName } from './utils'
import { getAppId } from '../k8Resource/nodeDetail/nodeDetail.api'
import { DeleteChartDialog } from '@Components/v2/values/chartValuesDiff/DeleteChartDialog'

const EnvironmentSelectorComponent = ({
    isExternalApp,
    _init,
    loadingDetails,
    loadingResourceTree,
    isVirtualEnvironment,
}: {
    isExternalApp: boolean
    _init?: () => void
    loadingDetails: boolean
    loadingResourceTree: boolean
    isVirtualEnvironment?: boolean
}) => {
    const params = useParams<{ appId: string; envId?: string }>()
    const { url } = useRouteMatch()
    const history = useHistory()
    const [showWorkloadsModal, setShowWorkloadsModal] = useState(false)
    const [environments, setEnvironments] = useState<Array<AppEnvironment>>()
    const [appDetails] = useSharedState(IndexStore.getAppDetails(), IndexStore.getAppDetailsObservable())
    const [urlInfo, showUrlInfo] = useState<boolean>(false)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [forceDeleteDialog, showForceDeleteDialog] = useState(false)
    const [forceDeleteDialogTitle, setForceDeleteDialogTitle] = useState<string>('')
    const [forceDeleteDialogMessage, setForceDeleteDialogMessage] = useState<string>('')
    const [nonCascadeDeleteDialog, showNonCascadeDeleteDialog] = useState<boolean>(false)
    const [clusterName, setClusterName] = useState<string>('')
    const isGitops = appDetails?.deploymentAppType === DeploymentAppTypes.GITOPS
    const isExternalArgo = appDetails.appType === AppType.EXTERNAL_ARGO_APP
    const isExternalFlux = appDetails.appType === AppType.EXTERNAL_FLUX_APP

    useEffect(() => {
        if (appDetails.appType === AppType.DEVTRON_APP) {
            getAppOtherEnvironmentMin(params.appId, false)
                .then((response) => {
                    setEnvironments(response.result || [])
                })
                .catch(() => {
                    showError('Error in fetching environments')
                    setEnvironments([])
                })
        }
    }, [params.appId])

    const getDeployedUsing = () => {
        if (isGitops) {
            return DeploymentAppTypeNameMapping.GitOps
        }
        if (appDetails.appType === AppType.EXTERNAL_ARGO_APP) {
            return DeploymentAppTypeNameMapping.ArgoCD
        }
        if (appDetails.appType === AppType.EXTERNAL_FLUX_APP) {
            return DeploymentAppTypeNameMapping.FluxCD
        }
        return DeploymentAppTypeNameMapping.Helm
    }

    useEffect(() => {
        if (!params.envId && appDetails.environmentId && !isExternalApp) {
            handleEnvironmentChange(appDetails.environmentId)
        }
    }, [appDetails.environmentId])

    const handleEnvironmentChange = (envId: number) => {
        history.push(`${url}/${envId}`)
    }

    const closeUrlInfo = (): void => {
        showUrlInfo(false)
    }

    const showInfoUrl = (): void => {
        showUrlInfo(true)
    }

    const showDeleteConfitmationPopup = () => {
        setShowDeleteConfirmation(true)
    }

    const Popup = () => {
        return (
            <div className="pod-info__popup-container">
                <span
                    className="flex pod-info__popup-row pod-info__popup-row--red cr-5"
                    onClick={showDeleteConfitmationPopup}
                >
                    <span data-testid="delete-helm-app-button">Delete application</span>
                    <Trash className="icon-dim-20 scr-5" />
                </span>
            </div>
        )
    }
    const setForceDeleteDialogData = (serverError) => {
        if (serverError instanceof ServerErrors && Array.isArray(serverError.errors)) {
            serverError.errors.map(({ userMessage, internalMessage }) => {
                setForceDeleteDialogTitle(userMessage)
                setForceDeleteDialogMessage(internalMessage)
            })
        }
    }

    const getDeleteApplicationApi = (deleteAction: DELETE_ACTION): Promise<any> => {
        if (isExternalApp) {
            return deleteApplicationRelease(params.appId)
        }
        return deleteInstalledChart(params.appId, isGitops, deleteAction)
    }

    const onClickHideNonCascadeDeletePopup = () => {
        showNonCascadeDeleteDialog(false)
    }

    async function deleteResourceAction(deleteAction: DELETE_ACTION) {
        try {
            const response = await getDeleteApplicationApi(deleteAction)
            if (response.result.deleteResponse?.deleteInitiated || (isExternalApp && response.result?.success)) {
                setShowDeleteConfirmation(false)
                showNonCascadeDeleteDialog(false)
                showForceDeleteDialog(false)
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Deletion initiated successfully.',
                })
                if (typeof _init === 'function') {
                    _init()
                }
            } else if (
                deleteAction !== DELETE_ACTION.NONCASCADE_DELETE &&
                !response.result.deleteResponse?.clusterReachable &&
                appDetails?.deploymentAppType === DeploymentAppTypes.GITOPS
            ) {
                setClusterName(response.result.deleteResponse?.clusterName)
                setShowDeleteConfirmation(false)
                showNonCascadeDeleteDialog(true)
            }
        } catch (error: any) {
            if (deleteAction !== DELETE_ACTION.NONCASCADE_DELETE && error.code !== 403) {
                setShowDeleteConfirmation(false)
                showNonCascadeDeleteDialog(false)
                setForceDeleteDialogData(error)
                showForceDeleteDialog(true)
            }
            showError(error)
        }
    }

    const redirectToHelmList = () => {
        history.push(`${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_HELM}`)
    }

    const handleForceDelete = async () => {
        await deleteResourceAction(DELETE_ACTION.FORCE_DELETE)
        redirectToHelmList()
    }

    const onClickNonCascadeDelete = async () => {
        await deleteResourceAction(DELETE_ACTION.NONCASCADE_DELETE)
        redirectToHelmList()
    }

    const handleDelete = async () => {
        setShowDeleteConfirmation(true)
        await deleteResourceAction(DELETE_ACTION.DELETE)
    }

    const deployedAppDetail = isExternalApp && params.appId && params.appId.split('|')

    const handleScaleWorkloads = () => {
        setShowWorkloadsModal(true)
    }

    const appIdentifier = getAppId({
        clusterId: appDetails.clusterId,
        namespace: appDetails.namespace,
        appName: appDetails.appName,
        templateType: appDetails.fluxTemplateType,
    })

    const closeForceConfirmationModal = () => showForceDeleteDialog(false)

    return (
        <div className="flexbox flex-justify pl-20 pr-20 pt-16 pb-16">
            <div>
                <div className="flex left">
                    <div style={{ width: 'clamp( 100px, 30%, 200px )', height: '100%', position: 'relative' }}>
                        <svg
                            viewBox="0 0 200 40"
                            preserveAspectRatio="none"
                            style={{ width: '100%', height: '100%', display: 'flex' }}
                        >
                            <path d="M0 20 L200 20 Z" strokeWidth="1" stroke="var(--B500)" />
                            <path d="M0 10 L0, 30" strokeWidth="2" stroke="var(--B500)" />
                        </svg>
                        <div
                            className="bcb-5 br-10 cn-0 pl-8 pr-8"
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                            }}
                            data-testid="env-heading-app-details"
                        >
                            ENV
                        </div>
                    </div>

                    <div className="fw-6 fs-14 cb-5">
                        <div style={{ minWidth: '200px' }}>
                            {environments && environments.length > 0 && (
                                <Select
                                    placeholder="Select Environment"
                                    options={
                                        Array.isArray(environments)
                                            ? environments.map((environment) => ({
                                                  label: environment.environmentName,
                                                  value: environment.environmentId,
                                              }))
                                            : []
                                    }
                                    value={
                                        appDetails.environmentId
                                            ? { value: +appDetails.environmentId, label: appDetails.environmentName }
                                            : null
                                    }
                                    onChange={(selected) => {
                                        handleEnvironmentChange(selected.value)
                                    }}
                                    styles={{
                                        ...multiSelectStyles,
                                        menu: (base) => ({ ...base, zIndex: 9999, textAlign: 'left' }),
                                        control: (base, state) => ({
                                            ...base,
                                            border: '0px',
                                            backgroundColor: 'transparent',
                                            minHeight: '24px !important',
                                        }),
                                        singleValue: (base) => ({ ...base, fontWeight: 600, color: 'var(--B500)' }),
                                        indicatorsContainer: (provided, state) => ({
                                            ...provided,
                                            height: '24px',
                                        }),
                                    }}
                                    className="bw-1 eb-2 br-4 bg__primary"
                                    components={{
                                        IndicatorSeparator: null,
                                    }}
                                />
                            )}
                            {(!environments || environments.length === 0) && appDetails && (
                                <div
                                    className="bw-1 eb-2 br-4 bg__primary pl-12 pr-12 pt-4 pb-4"
                                    style={{ minWidth: '200px' }}
                                    data-testid="env-name-app-details"
                                >
                                    {loadingDetails ? (
                                        <span>&nbsp;</span>
                                    ) : (
                                        getEnvironmentName(
                                            appDetails.clusterName,
                                            appDetails.namespace,
                                            appDetails.environmentName,
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {(appDetails?.deploymentAppType || appDetails?.appType) && (
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            disabled={isVirtualEnvironment}
                            placement="top"
                            content={`Deployed using ${getDeployedUsing()}`}
                        >
                            <div className={`flex ${!isVirtualEnvironment ? 'ml-16' : ''}`}>
                                <DeploymentTypeIcon
                                    deploymentAppType={appDetails.deploymentAppType}
                                    appType={appDetails.appType}
                                />
                            </div>
                        </Tippy>
                    )}
                    {appDetails?.deploymentAppDeleteRequest && (
                        <>
                            <BinWithDots className="icon-dim-16 mr-8 ml-12" />
                            <span className="cr-5 fw-6" data-testid="delete-progress">
                                {DELETE_DEPLOYMENT_PIPELINE}
                            </span>
                            <span className="dc__loading-dots cr-5" />
                        </>
                    )}
                </div>
            </div>

            {!loadingResourceTree && (
                <div className="flex">
                    {!appDetails.deploymentAppDeleteRequest && !isVirtualEnvironment && (
                        <button
                            className="flex left small cta cancel pb-6 pt-6 pl-12 pr-12 en-2"
                            onClick={showInfoUrl}
                            data-testid="url-button-app-details"
                        >
                            <LinkIcon className="icon-dim-16 mr-6 icon-color-n7" />
                            Urls
                        </button>
                    )}
                    {!isVirtualEnvironment && (
                        <button
                            className="scale-workload__btn flex left cta cancel pb-6 pt-6 pl-12 pr-12 en-2 ml-6"
                            onClick={handleScaleWorkloads}
                            data-testid="scale-workload-button-app-details"
                        >
                            <ScaleObjects className="mr-4" /> Scale workloads
                        </button>
                    )}
                    {!(
                        (deployedAppDetail &&
                            checkIfDevtronOperatorHelmRelease(
                                deployedAppDetail[2],
                                deployedAppDetail[1],
                                deployedAppDetail[0],
                            )) ||
                        // To hide delete application button in argo and flux app details
                        isExternalFlux ||
                        isExternalArgo
                    ) && (
                        <div
                            data-testid="dot-button-app-details"
                            className="helm-delete-wrapper flex ml-8 mw-none cta cancel small"
                        >
                            <PopupMenu autoClose>
                                <PopupMenu.Button rootClassName="flex" isKebab>
                                    <Dots className="pod-info__dots icon-dim-20 icon-color-n6" />
                                </PopupMenu.Button>
                                <PopupMenu.Body>
                                    <div className="helm-delete-pop-up bg__primary br-4">
                                        <Popup />
                                    </div>
                                </PopupMenu.Body>
                            </PopupMenu>

                            {showDeleteConfirmation && (
                                <DeleteChartDialog
                                    appName={appDetails.appName}
                                    handleDelete={handleDelete}
                                    toggleConfirmation={setShowDeleteConfirmation}
                                    isCreateValueView={false}
                                />
                            )}
                        </div>
                    )}

                    {forceDeleteDialog && (
                        <ForceDeleteConfirmationModal
                            title={forceDeleteDialogTitle}
                            subtitle={forceDeleteDialogMessage}
                            onDelete={handleForceDelete}
                            closeConfirmationModal={closeForceConfirmationModal}
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
            )}
            {urlInfo && (
                <TriggerUrlModal
                    installedAppId={params.appId}
                    isExternalApp={isExternalApp}
                    appId={appDetails.appType !== AppType.DEVTRON_HELM_CHART ? appIdentifier : ''}
                    envId={params.envId}
                    close={closeUrlInfo}
                    appType={appDetails.appType}
                />
            )}
            {showWorkloadsModal && (
                <ScaleWorkloadsModal
                    appId={appIdentifier}
                    onClose={() => setShowWorkloadsModal(false)}
                    history={history}
                />
            )}
        </div>
    )
}

export default EnvironmentSelectorComponent
