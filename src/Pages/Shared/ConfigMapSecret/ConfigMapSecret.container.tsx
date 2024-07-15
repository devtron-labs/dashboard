import { useEffect, useRef, useState } from 'react'
import { generatePath, useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { toast } from 'react-toastify'

import {
    ErrorScreenManager,
    GenericEmptyState,
    noop,
    Progressing,
    showError,
    ToastBody,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICAdd } from '@Icons/ic-add.svg'
import { ReactComponent as Trash } from '@Icons/ic-delete-interactive.svg'
import { getAppChartRefForAppAndEnv } from '@Services/service'
import { FloatingVariablesSuggestions, importComponentFromFELibrary } from '@Components/common'
import { ComponentStates } from '@Components/EnvironmentOverride/EnvironmentOverrides.type'
import { useAppConfigurationContext } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfiguration.provider'
import { ResourceConfigState } from '@Pages/Applications/DevtronApps/service.types'
import {
    CMSecretComponentType,
    DraftDetailsForCommentDrawerType,
    CMSecretContainerProps,
    ConfigMapSecretData,
    CMSecretProtectedTab,
    DraftState,
    CMSecretDeleteModalType,
} from '@Pages/Shared/ConfigMapSecret/ConfigMapSecret.types'

import { getCMSecret } from './ConfigMapSecret.service'
import { CM_SECRET_STATE } from './ConfigMapSecret.constants'
import { ProtectedConfigMapSecretDetails } from './ProtectedContainer'
import { ConfigMapSecretForm } from './ConfigMapSecretForm'

import './ConfigMapSecret.scss'

const getDraftByResourceName = importComponentFromFELibrary('getDraftByResourceName', null, 'function')
const getAllDrafts = importComponentFromFELibrary('getAllDrafts', null, 'function')
const DraftComments = importComponentFromFELibrary('DraftComments')
const ConfigToolbar = importComponentFromFELibrary('ConfigToolbar')

export const ConfigMapSecretContainer = ({
    componentType = CMSecretComponentType.ConfigMap,
    parentState,
    setParentState,
    isOverrideView,
    clusterId,
    parentName,
    isProtected,
}: CMSecretContainerProps) => {
    // HOOKS
    const { path } = useRouteMatch()
    const history = useHistory()
    const { appId, envId, name } = useParams<{ appId: string; envId: string; name: string }>()
    const { envConfig, reloadEnvironments, lastUnlockedStage, fetchEnvConfig, isJobView } = useAppConfigurationContext()

    // STATES
    const [isLoading, setIsLoading] = useState(false)
    const [draftDataMap, setDraftDataMap] = useState<Record<string, Record<string, number>>>()
    const [showComments, setShowComments] = useState(false)
    const [selectedDraft, setSelectedDraft] = useState<DraftDetailsForCommentDrawerType>(null)
    const [draftData, setDraftData] = useState(null)
    const [appChartRef, setAppChartRef] = useState<{ id: number; version: string; name: string }>()
    const [cmSecretData, SetCmSecretData] = useState<ConfigMapSecretData>(null)
    const [selectedTab, setSelectedTab] = useState<CMSecretProtectedTab>(
        cmSecretData?.configData?.draftState === DraftState.AwaitApproval
            ? CMSecretProtectedTab.Compare
            : CMSecretProtectedTab.Draft,
    )
    const [openDeleteModal, setOpenDeleteModal] = useState<CMSecretDeleteModalType>(null)

    // CONSTANTS
    const envConfigData =
        envConfig.config?.[componentType === CMSecretComponentType.ConfigMap ? 'configmaps' : 'secrets'] || []
    const selectedCMSecret = envConfigData.find((data) => data.name === name)
    const isCreateState = name === 'create'
    const isEmptyState = !name && !envConfigData.length
    const isUnpublished =
        !selectedCMSecret?.global &&
        (selectedCMSecret?.configState === ResourceConfigState.Draft ||
            selectedCMSecret?.configState === ResourceConfigState.ApprovalPending)

    let cmSecretStateLabel = isUnpublished ? CM_SECRET_STATE.UNPUBLISHED : CM_SECRET_STATE.BASE
    if (isOverrideView) {
        if (selectedCMSecret?.global) {
            cmSecretStateLabel = selectedCMSecret.overridden ? CM_SECRET_STATE.OVERRIDDEN : CM_SECRET_STATE.INHERITED
        } else {
            cmSecretStateLabel = isUnpublished ? CM_SECRET_STATE.UNPUBLISHED : CM_SECRET_STATE.ENV
        }
    }

    // REFS
    const abortController = useRef<AbortController>(null)

    // ASYNC CALLS
    const [initLoading, initResult, initError] = useAsync(() => {
        abortController.current = new AbortController()

        return Promise.all([
            getAppChartRefForAppAndEnv(+appId, +envId),
            isProtected && getAllDrafts ? getAllDrafts(appId, envId ?? -1, 1, abortController.current.signal) : null,
        ])
    }, [])

    // LOADING
    const loader = isLoading || initLoading || envConfig.isLoading

    useEffect(() => {
        if (initResult) {
            const [appChartRes, draftDataRes] = initResult
            if (draftDataRes?.result?.length) {
                const _draftDataMap = draftDataRes.result.reduce(
                    (acc, curr) => ({ ...acc, [curr.resourceName]: curr }),
                    {},
                )

                setDraftDataMap(_draftDataMap)
            }

            if (appChartRes) {
                setAppChartRef(appChartRes.result)
            }

            setParentState?.(ComponentStates.loaded)
        }
        if (initError) {
            if (!abortController.current.signal.aborted) {
                setParentState?.(ComponentStates.failed)
                showError(initError)
            }
        }
    }, [initResult, initError])

    const getCMSecretData = () => {
        abortController.current = new AbortController()
        setIsLoading(true)

        Promise.allSettled([
            isProtected && getDraftByResourceName
                ? getDraftByResourceName(appId, envId ?? -1, componentType, name, abortController.current.signal)
                : null,
            getCMSecret(componentType, selectedCMSecret.id, appId, name, envId, abortController.current.signal),
        ])
            .then(([_draftData, _cmSecretData]) => {
                let draftId: number
                let draftState: number
                let _configMap: ConfigMapSecretData

                if (
                    _draftData?.status === 'fulfilled' &&
                    _draftData.value?.result &&
                    (_draftData.value.result.draftState === DraftState.Init ||
                        _draftData.value.result.draftState === DraftState.AwaitApproval)
                ) {
                    setDraftData({
                        ..._draftData.value.result,
                        unAuthorized: _draftData.value.result.dataEncrypted,
                    })
                    draftId = _draftData.value.result.draftId
                    draftState = _draftData.value.result.draftState

                    setSelectedTab(
                        _draftData.value.result.draftState === DraftState.AwaitApproval
                            ? CMSecretProtectedTab.Compare
                            : CMSecretProtectedTab.Draft,
                    )
                } else {
                    setDraftData(null)
                }

                if (_cmSecretData.status === 'fulfilled') {
                    if (_cmSecretData.value?.result?.configData?.length) {
                        _configMap = {
                            ..._cmSecretData.value.result,
                            configData: {
                                ..._cmSecretData.value.result.configData[0],
                                secretMode: _cmSecretData.value.result.configData[0].externalType === '',
                                unAuthorized: true,
                                ...(draftDataMap?.[_cmSecretData.value.result.configData[0].name]
                                    ? {
                                          draftId: draftDataMap[_cmSecretData.value.result.configData[0].name].draftId,
                                          draftState:
                                              draftDataMap[_cmSecretData.value.result.configData[0].name].draftState,
                                      }
                                    : {}),
                            },
                        }
                    }

                    if (cmSecretStateLabel !== CM_SECRET_STATE.UNPUBLISHED) {
                        if (_cmSecretData.value?.result?.configData?.length) {
                            const _result: any = {
                                ..._cmSecretData.value.result,
                                configData: _cmSecretData.value.result.configData[0],
                            }

                            _result.configData.overridden = selectedCMSecret.overridden

                            if (draftId || draftState) {
                                _result.configData.draftId = draftId
                                _result.configData.draftState = draftState
                            }

                            if (
                                componentType === CMSecretComponentType.Secret &&
                                _draftData?.status === 'fulfilled' &&
                                _draftData.value?.result
                            ) {
                                if (
                                    cmSecretStateLabel === CM_SECRET_STATE.INHERITED &&
                                    _draftData.value.result.draftState === DraftState.Published &&
                                    _draftData.value.result.action === 2
                                ) {
                                    _result.configData.overridden = true
                                } else if (
                                    cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN &&
                                    _draftData.value.result.draftState === DraftState.Published &&
                                    _draftData.value.result.action === 3
                                ) {
                                    _result.configData.overridden = false
                                }
                            }
                            _configMap = {
                                ..._result,
                                configData: {
                                    ..._result.configData,
                                    secretMode: false,
                                    unAuthorized: false,
                                    isNew: false,
                                },
                            }
                        } else {
                            toast.error(`The ${componentType} '${name}' has been deleted`)
                            _configMap = null
                        }
                    }

                    SetCmSecretData(_configMap)
                } else if (
                    cmSecretStateLabel === CM_SECRET_STATE.UNPUBLISHED &&
                    _draftData?.status === 'fulfilled' &&
                    _draftData.value.result
                ) {
                    if (_draftData.value.result.draftState === DraftState.Published) {
                        const dataFromDraft = JSON.parse(_draftData.value.result.data)
                        SetCmSecretData({
                            ...dataFromDraft,
                            configData: { ...dataFromDraft.configData[0], unAuthorized: dataFromDraft.dataEncrypted },
                        })
                    } else if (_draftData.value.result.draftState === DraftState.Discarded) {
                        toast.error(`The ${componentType} '${name}' has been deleted`)
                        SetCmSecretData(null)
                    }
                }
                if (
                    (_cmSecretData?.status === 'fulfilled' && _cmSecretData?.value !== null) ||
                    (_draftData?.status === 'fulfilled' && _draftData?.value !== null)
                ) {
                    setIsLoading(true)
                }
                if (
                    (_cmSecretData?.status === 'rejected' && _cmSecretData?.reason?.code === 403) ||
                    (_draftData?.status === 'rejected' && _draftData?.reason?.code === 403)
                ) {
                    toast.warn(<ToastBody title="View-only access" subtitle="You won't be able to make any changes" />)
                }
            })
            .catch((error) => {
                toast.warn(<ToastBody title="View-only access" subtitle="You won't be able to make any changes" />)
                setDraftData(null)
                showError(error)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        if (selectedCMSecret?.id > -1 && !isCreateState) {
            getCMSecretData()
        } else {
            setIsLoading(false)
        }

        return () => {
            SetCmSecretData(null)
            setDraftData(null)
        }
    }, [name, selectedCMSecret])

    useEffect(() => {
        if (!name && !envConfig.isLoading && envConfigData.length) {
            history.replace(generatePath(path, { appId, envId, name: envConfigData[0].name }))
        }
    }, [])

    // HELPERS
    const redirectURLToValidPage = () => {
        const index =
            envConfigData.length > 1 && envConfigData[envConfigData.length - 1].name === name
                ? envConfigData.length - 2
                : envConfigData.length - 1

        history.push(
            generatePath(path, {
                appId,
                envId,
                name: index ? envConfigData[index].name : undefined,
            }),
        )
    }

    const updateCMSecret = (_name?: string, isDelete?: boolean) => {
        setIsLoading(true)

        if (isCreateState) {
            history.push(generatePath(path, { appId, envId, name: _name }))
        } else if (isDelete) {
            redirectURLToValidPage()
        }

        fetchEnvConfig(+envId || -1)
    }

    // METHODS
    const handleTabSelection = (index: number): void => {
        setSelectedTab(index)
    }

    const toggleDraftComments = (_selectedDraft: DraftDetailsForCommentDrawerType) => {
        if (showComments) {
            setSelectedDraft(null)
            setShowComments(false)
        } else if (_selectedDraft) {
            setSelectedDraft(_selectedDraft)
            setShowComments(true)
        }
    }

    const toggleDraftCommentModal = () => {
        toggleDraftComments({ draftId: draftData?.draftId, draftVersionId: draftData?.draftVersionId, index: 0 })
    }

    const showDeleteButton = () => {
        return (
            ((cmSecretStateLabel !== CM_SECRET_STATE.INHERITED && cmSecretStateLabel !== CM_SECRET_STATE.UNPUBLISHED) ||
                (cmSecretStateLabel === CM_SECRET_STATE.INHERITED &&
                    selectedTab === CMSecretProtectedTab.Draft &&
                    draftData.action !== 3)) &&
            !!name
        )
    }

    const handleDelete = () => setOpenDeleteModal(isProtected ? 'protectedDeleteModal' : 'deleteModal')

    // RENDERERS
    const renderDetails = (): JSX.Element => {
        if (name && isProtected && draftData?.draftId) {
            return (
                <>
                    <ConfigToolbar
                        loading={loader}
                        draftId={draftData.draftId}
                        draftVersionId={draftData.draftVersionId}
                        selectedTabIndex={selectedTab}
                        handleTabSelection={handleTabSelection}
                        isDraftMode={
                            draftData.draftState === DraftState.Init ||
                            draftData.draftState === DraftState.AwaitApproval
                        }
                        noReadme
                        showReadme={false}
                        isReadmeAvailable={false}
                        handleReadMeClick={noop}
                        handleCommentClick={toggleDraftCommentModal}
                        commentsPresent={draftData.commentsCount > 0}
                        isApprovalPending={draftData.draftState === DraftState.AwaitApproval}
                        approvalUsers={draftData.approvers}
                        reload={() => updateCMSecret(undefined, true)}
                        componentType={componentType}
                        className="p-0-imp"
                    />
                    <ProtectedConfigMapSecretDetails
                        appChartRef={appChartRef}
                        data={cmSecretData?.configData}
                        id={selectedCMSecret?.id}
                        componentType={componentType}
                        cmSecretStateLabel={cmSecretStateLabel}
                        isJobView={isJobView}
                        selectedTab={selectedTab}
                        draftData={draftData}
                        parentName={parentName}
                        reloadEnvironments={reloadEnvironments}
                        updateCMSecret={updateCMSecret}
                        openDeleteModal={openDeleteModal}
                        setOpenDeleteModal={setOpenDeleteModal}
                    />
                </>
            )
        }

        return (
            <ConfigMapSecretForm
                name={!isCreateState ? name : ''}
                appChartRef={appChartRef}
                configMapSecretData={cmSecretData?.configData}
                id={selectedCMSecret?.id}
                componentType={componentType}
                updateCMSecret={updateCMSecret}
                cmSecretStateLabel={cmSecretStateLabel}
                isJobView={isJobView}
                readonlyView={false}
                isProtectedView={isProtected}
                draftMode={false}
                latestDraftData={
                    draftData?.draftId
                        ? {
                              draftId: draftData?.draftId,
                              draftState: draftData?.draftState,
                              draftVersionId: draftData?.draftVersionId,
                          }
                        : null
                }
                reloadEnvironments={reloadEnvironments}
                onCancel={redirectURLToValidPage}
                openDeleteModal={openDeleteModal}
                setOpenDeleteModal={setOpenDeleteModal}
            />
        )
    }

    if (parentState === ComponentStates.loading || loader) {
        return <Progressing fullHeight size={48} styles={{ height: 'calc(100% - 80px)' }} />
    }

    if (!cmSecretData && !draftData && !isCreateState && !isEmptyState) {
        return <ErrorScreenManager code={404} redirectURL={lastUnlockedStage} />
    }

    if (isEmptyState) {
        return (
            <div className="bcn-0 h-100">
                <GenericEmptyState
                    title={`Create ${componentType === CMSecretComponentType.ConfigMap ? 'ConfigMaps' : 'Secrets'}`}
                    isButtonAvailable
                    renderButton={() => (
                        <button
                            type="button"
                            className="cta flex dc__gap-6"
                            onClick={() => history.push(generatePath(path, { appId, envId, name: 'create' }))}
                        >
                            <ICAdd />
                            <span>Create</span>
                        </button>
                    )}
                />
            </div>
        )
    }

    return (
        <div
            className={`cm-secret-container h-100 dc__position-rel bcn-0 ${showComments ? 'with-comment-drawer' : ''}`}
        >
            <div className="main-content py-16 px-20">
                <div className="flexbox-col dc__gap-16 dc__mxw-1200">
                    <article className="flexbox dc__align-items-center dc__content-space">
                        <div
                            data-testid={`add-${componentType}-button`}
                            className="flex left lh-32 fs-14 cb-5 fw-6 cn-9 dc__gap-8"
                        >
                            <span>
                                {!isCreateState
                                    ? name
                                    : `Create ${componentType === CMSecretComponentType.Secret ? 'Secret' : 'ConfigMap'}`}
                            </span>
                            {cmSecretStateLabel && (
                                <div className="dc__border h-20 lh-20 fs-12 fw-6 cn-9 px-6 br-4 dc__uppercase">
                                    {cmSecretStateLabel}
                                </div>
                            )}
                        </div>
                        {showDeleteButton() && (
                            <button
                                type="button"
                                className="override-button cta delete m-0-imp h-32 lh-20-imp p-6-12-imp"
                                onClick={handleDelete}
                            >
                                <Trash className="icon-dim-16 mr-4" />
                                Delete{isProtected ? '...' : ''}
                            </button>
                        )}
                    </article>
                    {renderDetails()}
                </div>
            </div>
            {DraftComments && showComments && selectedDraft && (
                <DraftComments
                    draftId={selectedDraft.draftId}
                    draftVersionId={selectedDraft.draftVersionId}
                    toggleDraftComments={toggleDraftComments}
                />
            )}
            {window._env_.ENABLE_SCOPED_VARIABLES && (
                <div className="variables-widget-position-cmcs">
                    <FloatingVariablesSuggestions zIndex={100} appId={appId} envId={envId} clusterId={clusterId} />
                </div>
            )}
        </div>
    )
}
