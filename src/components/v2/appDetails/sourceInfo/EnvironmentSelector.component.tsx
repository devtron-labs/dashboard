import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import { showError, PopupMenu, multiSelectStyles, ForceDeleteDialog, ServerErrors } from '@devtron-labs/devtron-fe-common-lib'
import './sourceInfo.css'
import IndexStore from '../index.store'
import { AppEnvironment } from './environment.type'
import { useParams, useHistory, useRouteMatch } from 'react-router'
import { useSharedState } from '../../utils/useSharedState'
import { AppType, DeploymentAppType } from '../appDetails.type'
import { ReactComponent as ScaleObjects } from '../../../../assets/icons/ic-scale-objects.svg'
import ScaleWorkloadsModal from './scaleWorkloads/ScaleWorkloadsModal.component'
import Tippy from '@tippyjs/react'
import { TriggerUrlModal } from '../../../app/list/TriggerUrl'
import { ReactComponent as LinkIcon } from '../../../../assets/icons/ic-link.svg'
import { ReactComponent as Trash } from '../../../../assets/icons/ic-delete-interactive.svg'
import { deleteApplicationRelease } from '../../../external-apps/ExternalAppService'
import { deleteInstalledChart } from '../../../charts/charts.service'
import { toast } from 'react-toastify'
import { ReactComponent as Dots } from '../../assets/icons/ic-menu-dot.svg'
import { DeleteChartDialog } from '../../values/chartValuesDiff/ChartValuesView.component'
import { DELETE_ACTION, checkIfDevtronOperatorHelmRelease } from '../../../../config'
import { ReactComponent as BinWithDots } from '../../../../assets/icons/ic-delete-dots.svg'
import { DELETE_DEPLOYMENT_PIPELINE, DeploymentAppTypeNameMapping } from '../../../../config/constantMessaging'
import { getAppOtherEnvironmentMin } from '../../../../services/service'
import DeploymentTypeIcon from '../../../common/DeploymentTypeIcon/DeploymentTypeIcon'
import ClusterNotReachableDailog from '../../../common/ClusterNotReachableDailog/ClusterNotReachableDialog'

function EnvironmentSelectorComponent({
    isExternalApp,
    _init,
    loadingResourceTree,
    isVirtualEnvironment,
}: {
    isExternalApp: boolean
    _init?: () => void
    loadingResourceTree: boolean
    isVirtualEnvironment?: boolean
}) {
    const params = useParams<{ appId: string; envId?: string }>()
    const { url } = useRouteMatch()
    const history = useHistory()
    const [showWorkloadsModal, setWorkloadsModal] = useState(false)
    const [environments, setEnvironments] = useState<Array<AppEnvironment>>()
    const [appDetails] = useSharedState(IndexStore.getAppDetails(), IndexStore.getAppDetailsObservable())
    const [urlInfo, showUrlInfo] = useState<boolean>(false)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [forceDeleteDialog, showForceDeleteDialog] = useState(false)
    const [forceDeleteDialogTitle, setForceDeleteDialogTitle] = useState<string>('')
    const [forceDeleteDialogMessage, setForceDeleteDialogMessage] = useState<string>('')
    const [nonCascadeDeleteDialog, showNonCascadeDeleteDialog] = useState<boolean>(false)
    const [clusterName, setClusterName] = useState<string>('')
    const isGitops = appDetails?.deploymentAppType === DeploymentAppType.argo_cd

    useEffect(() => {
        if (appDetails.appType === AppType.DEVTRON_APP) {
            getAppOtherEnvironmentMin(params.appId)
                .then((response) => {
                    setEnvironments(response.result || [])
                })
                .catch((error) => {
                    console.error('error in fetching environments')
                    setEnvironments([])
                })
        }
    }, [params.appId])

    useEffect(() => {
        if (!params.envId && appDetails.environmentId) {
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
                setForceDeleteDialogMessage( internalMessage)
            })
        }
    }

    const getDeleteApplicationApi = (deleteAction: DELETE_ACTION): Promise<any> => {
        if (isExternalApp) {
            return deleteApplicationRelease(params.appId)
        } else {
            return deleteInstalledChart(params.appId, isGitops, deleteAction)
        }
    }

    const onClickHideNonCascadeDeletePopup = () => {
        showNonCascadeDeleteDialog(false)
    }
    
    const onClickNonCascadeDelete = async() => {
        await deleteResourceAction(DELETE_ACTION.NONCASCADE_DELETE)
    }

    async function deleteResourceAction(deleteAction: DELETE_ACTION) {
        try {
            const response = await getDeleteApplicationApi(deleteAction)
            if (response.result.deleteResponse?.deleteInitiated) {
                setShowDeleteConfirmation(false)
                showNonCascadeDeleteDialog(false)
                showForceDeleteDialog(false)
                toast.success('Deletion initiated successfully.')
                _init()
            } else if (deleteAction !== DELETE_ACTION.NONCASCADE_DELETE && !response.result.deleteResponse?.clusterReachable) {
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

    const handleForceDelete = async () => {
        await deleteResourceAction(DELETE_ACTION.FORCE_DELETE)
    }
    const handleDelete = async () => {
        setShowDeleteConfirmation(true)
        await deleteResourceAction(DELETE_ACTION.DELETE)
    }

    const deployedAppDetail = isExternalApp && params.appId && params.appId.split('|')

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
                            <path d="M0 20 L200 20 Z" strokeWidth="1" stroke="#0066cc" />
                            <path d="M0 10 L0, 30" strokeWidth="2" stroke="#0066cc" />
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
                                        singleValue: (base, state) => ({ ...base, fontWeight: 600, color: '#06c' }),
                                        indicatorsContainer: (provided, state) => ({
                                            ...provided,
                                            height: '24px',
                                        }),
                                    }}
                                    className="bw-1 eb-2 br-4 bcn-0"
                                    components={{
                                        IndicatorSeparator: null,
                                    }}
                                />
                            )}

                            {(!environments || environments.length === 0) && appDetails && (
                                <div
                                    className="bw-1 eb-2 br-4 bcn-0 pl-12 pr-12 pt-4 pb-4"
                                    style={{ minWidth: '200px' }}
                                    data-testid="env-name-app-details"
                                >
                                    {appDetails.environmentName || <span>&nbsp;</span>}
                                </div>
                            )}
                        </div>
                    </div>
                    {appDetails?.deploymentAppType && (
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            disabled={isVirtualEnvironment}
                            placement="top"
                            content={`Deployed using ${
                                isGitops ? DeploymentAppTypeNameMapping.GitOps : DeploymentAppTypeNameMapping.Helm
                            }`}
                        >
                            <DeploymentTypeIcon deploymentAppType={appDetails?.deploymentAppType} />
                        </Tippy>
                    )}
                    {appDetails?.deploymentAppDeleteRequest && (
                        <>
                            <BinWithDots className="icon-dim-16 mr-8 ml-12" />
                            <span className="cr-5 fw-6">{DELETE_DEPLOYMENT_PIPELINE}</span>
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
                    {!showWorkloadsModal && !isVirtualEnvironment && (
                        <button
                            className="scale-workload__btn flex left cta cancel pb-6 pt-6 pl-12 pr-12 en-2 ml-6"
                            onClick={() => setWorkloadsModal(true)}
                            data-testid="scale-workload-button-app-details"
                        >
                            <ScaleObjects className="mr-4" /> Scale workloads
                        </button>
                    )}

                    {!(
                        deployedAppDetail &&
                        checkIfDevtronOperatorHelmRelease(
                            deployedAppDetail[2],
                            deployedAppDetail[1],
                            deployedAppDetail[0],
                        )
                    ) && (
                        <div data-testid="dot-button-app-details" className="flex br-4 en-2 bw-1 bcn-0 p-4 ml-8">
                            <PopupMenu autoClose>
                                <PopupMenu.Button rootClassName="flex" isKebab={true}>
                                    <Dots className="pod-info__dots icon-dim-20 icon-color-n6" />
                                </PopupMenu.Button>
                                <PopupMenu.Body>
                                    <Popup />
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
                        <ForceDeleteDialog
                            forceDeleteDialogTitle={forceDeleteDialogTitle}
                            onClickDelete={handleForceDelete}
                            closeDeleteModal={() => {
                                showForceDeleteDialog(false)
                            }}
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
            )}

            {urlInfo && (
                <TriggerUrlModal
                    installedAppId={params.appId}
                    isEAMode={appDetails.appType === AppType.EXTERNAL_HELM_CHART}
                    appId={appDetails.appType === AppType.EXTERNAL_HELM_CHART ? params.appId : ''}
                    envId={params.envId}
                    close={closeUrlInfo}
                />
            )}
            {showWorkloadsModal && (
                <ScaleWorkloadsModal appId={params.appId} onClose={() => setWorkloadsModal(false)} history={history} />
            )}
        </div>
    )
}

export default EnvironmentSelectorComponent
