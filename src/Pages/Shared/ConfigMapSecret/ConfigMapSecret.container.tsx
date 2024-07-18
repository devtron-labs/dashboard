import { useEffect, useMemo, useRef, useState } from 'react'
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
import { ComponentStates } from '@Pages/Shared/EnvironmentOverride/EnvironmentOverrides.types'
import { ResourceConfigStage } from '@Pages/Applications/DevtronApps/service.types'
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
import { ProtectedConfigMapSecretDetails } from './ProtectedConfigMapSecretDetails'
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
    isJob,
    envConfig,
    fetchEnvConfig,
    reloadEnvironments,
    onErrorRedirectURL,
}: CMSecretContainerProps) => {
    // HOOKS
    const { path } = useRouteMatch()
    const history = useHistory()
    const { appId, envId, name } = useParams<{ appId: string; envId: string; name: string }>()

    // STATES
    const [isCMSecretLoading, setIsCMSecretLoading] = useState(false)
    const [cmSecretError, setCmSecretError] = useState(false)
    const [cmSecretData, setCmSecretData] = useState<ConfigMapSecretData>(null)
    const [draftDataMap, setDraftDataMap] = useState<Record<string, Record<string, number>>>(null)
    const [selectedDraft, setSelectedDraft] = useState<DraftDetailsForCommentDrawerType>(null)
    const [draftData, setDraftData] = useState(null)
    const [showComments, setShowComments] = useState(false)
    const [appChartRef, setAppChartRef] = useState<{ id: number; version: string; name: string }>()
    const [selectedTab, setSelectedTab] = useState<CMSecretProtectedTab>(null)
    const [openDeleteModal, setOpenDeleteModal] = useState<CMSecretDeleteModalType>(null)

    // CONSTANTS
    const envConfigData =
        envConfig.config?.[componentType === CMSecretComponentType.ConfigMap ? 'configmaps' : 'secrets'] || []
    const selectedCMSecret = useMemo(() => envConfigData.find((data) => data.name === name), [envConfig, name])
    const isCreateState = name === 'create'
    const isEmptyState = !name && !envConfigData.length

    // TODO: REFACTOR THE ENUMS (CONFIG DIFF - PHASE 2)
    const isUnpublished = selectedCMSecret?.configStage === ResourceConfigStage.Unpublished
    let cmSecretStateLabel = isUnpublished ? CM_SECRET_STATE.UNPUBLISHED : CM_SECRET_STATE.BASE
    if (isOverrideView) {
        if (selectedCMSecret?.configStage === ResourceConfigStage.Overridden) {
            cmSecretStateLabel = CM_SECRET_STATE.OVERRIDDEN
        } else if (selectedCMSecret?.configStage === ResourceConfigStage.Inheriting) {
            cmSecretStateLabel = CM_SECRET_STATE.INHERITED
        } else {
            cmSecretStateLabel = isUnpublished ? CM_SECRET_STATE.UNPUBLISHED : CM_SECRET_STATE.ENV
        }
    }

    const componentName = componentType === CMSecretComponentType.ConfigMap ? 'configmap' : 'secret'

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
    const loader = isCMSecretLoading || initLoading || envConfig.isLoading
    const cmSecretLoader = initLoading || envConfig.isLoading

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
        setIsCMSecretLoading(true)

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
                    _draftData.status === 'fulfilled' &&
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

                            _result.configData.overridden =
                                selectedCMSecret.configStage === ResourceConfigStage.Overridden

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
                            toast.error(`The ${componentName} '${name}' has been deleted`)
                            setCmSecretError(true)
                            _configMap = null
                        }
                    }

                    setCmSecretData(_configMap)
                } else if (
                    cmSecretStateLabel === CM_SECRET_STATE.UNPUBLISHED &&
                    _draftData?.status === 'fulfilled' &&
                    _draftData.value.result
                ) {
                    if (_draftData.value.result.draftState === DraftState.Published) {
                        const dataFromDraft = JSON.parse(_draftData.value.result.data)
                        setCmSecretData({
                            ...dataFromDraft,
                            configData: { ...dataFromDraft.configData[0], unAuthorized: dataFromDraft.dataEncrypted },
                        })
                    } else if (_draftData.value.result.draftState === DraftState.Discarded) {
                        toast.error(`The ${componentName} '${name}' has been deleted`)
                        setCmSecretError(true)
                        setCmSecretData(null)
                    }
                }
                if (
                    (_cmSecretData?.status === 'fulfilled' && _cmSecretData?.value !== null) ||
                    (_draftData?.status === 'fulfilled' && _draftData?.value !== null)
                ) {
                    setIsCMSecretLoading(true)
                }
                if (
                    (_cmSecretData?.status === 'rejected' && _cmSecretData?.reason?.code === 403) ||
                    (_draftData?.status === 'rejected' && _draftData?.reason?.code === 403)
                ) {
                    toast.warn(<ToastBody title="View-only access" subtitle="You won't be able to make any changes" />)
                }
            })
            .catch((err) => {
                toast.warn(<ToastBody title="View-only access" subtitle="You won't be able to make any changes" />)
                setDraftData(null)
                showError(err)
            })
            .finally(() => {
                setIsCMSecretLoading(false)
            })
    }

    const redirectURLToValidPage = () => {
        history.replace(
            generatePath(path, {
                appId,
                envId,
                name: envConfigData.length ? envConfigData[envConfigData.length - 1].name : undefined,
            }),
        )
    }

    useEffect(() => {
        if (!cmSecretLoader && selectedCMSecret && !isCreateState) {
            getCMSecretData()
        }

        if (!loader && !selectedCMSecret && !isCreateState && !isEmptyState) {
            redirectURLToValidPage()
        }

        return () => {
            setCmSecretData(null)
            setDraftData(null)
            setCmSecretError(null)
        }
    }, [selectedCMSecret, cmSecretLoader])

    // METHODS
    const updateCMSecret = (_name?: string) => {
        fetchEnvConfig(+envId || -1)

        if (isCreateState) {
            history.push(generatePath(path, { appId, envId, name: _name }))
        }
    }

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
            cmSecretStateLabel !== CM_SECRET_STATE.INHERITED &&
            cmSecretStateLabel !== CM_SECRET_STATE.UNPUBLISHED &&
            draftData?.action !== 3 &&
            !isCreateState &&
            !!name
        )
    }

    const handleDelete = () => setOpenDeleteModal(isProtected ? 'protectedDeleteModal' : 'deleteModal')

    // RENDERERS
    const renderHeader = () => (
        <article className="flexbox dc__align-items-center dc__content-space">
            <div data-testid={`add-${componentType}-button`} className="flex left lh-32 fs-14 cb-5 fw-6 cn-9 dc__gap-8">
                <span>
                    {!isCreateState
                        ? name
                        : `Create ${componentType === CMSecretComponentType.Secret ? 'Secret' : 'ConfigMap'}`}
                </span>
                {cmSecretStateLabel && (
                    <div className="flex dc__border h-20 lh-20 fs-12 fw-6 cn-9 px-6 br-4 dc__uppercase">
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
    )

    const renderDetails = () => {
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
                        reload={() => updateCMSecret()}
                        componentType={componentType}
                        className="p-0-imp"
                    />
                    <ProtectedConfigMapSecretDetails
                        appChartRef={appChartRef}
                        data={cmSecretData?.configData}
                        id={selectedCMSecret?.id}
                        componentType={componentType}
                        cmSecretStateLabel={cmSecretStateLabel}
                        isJobView={isJob}
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
                isJobView={isJob}
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

    if (cmSecretError) {
        return <ErrorScreenManager code={404} redirectURL={onErrorRedirectURL} />
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
            className={`cm-secret-container h-100 dc__position-rel bcn-0 ${showComments ? 'with-comment-drawer' : ''} ${selectedTab === null || selectedTab === CMSecretProtectedTab.Draft || (draftData?.draftState === DraftState.AwaitApproval && selectedTab === CMSecretProtectedTab.Compare) ? 'with-crud-btn' : ''}`}
        >
            <div className="main-content py-16 px-20">
                <div key={name} className="flexbox-col dc__gap-16 dc__mxw-1200">
                    {renderHeader()}
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
