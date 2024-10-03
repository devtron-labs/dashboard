import { useEffect, useMemo, useRef, useState } from 'react'
import { generatePath, useHistory, useParams, useRouteMatch } from 'react-router-dom'

import {
    abortPreviousRequests,
    ERROR_STATUS_CODE,
    ErrorScreenManager,
    GenericEmptyState,
    getIsRequestAborted,
    noop,
    Progressing,
    showError,
    AppEnvDeploymentConfigDTO,
    AppEnvDeploymentConfigType,
    ConfigResourceType,
    DraftState,
    getAppEnvDeploymentConfig,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import EmptyStateImg from '@Images/cm-cs-empty-state.png'
import { ReactComponent as ICAdd } from '@Icons/ic-add.svg'
import { ReactComponent as Trash } from '@Icons/ic-delete-interactive.svg'
import { FloatingVariablesSuggestions, importComponentFromFELibrary } from '@Components/common'
import { ResourceConfigStage } from '@Pages/Applications/DevtronApps/service.types'
import {
    CMSecretComponentType,
    DraftDetailsForCommentDrawerType,
    CMSecretContainerProps,
    ConfigMapSecretData,
    CMSecretProtectedTab,
    CMSecretDeleteModalType,
} from '@Pages/Shared/ConfigMapSecretOld/ConfigMapSecret.types'
import { EnvConfigObjectKey } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig.types'

import { getCMSecret } from './ConfigMapSecret.service'
import { CM_SECRET_COMPONENT_NAME, CM_SECRET_EMPTY_STATE_TEXT, CM_SECRET_STATE } from './ConfigMapSecret.constants'
import { ProtectedConfigMapSecretDetails } from './ProtectedConfigMapSecretDetails'
import { ConfigMapSecretForm } from './ConfigMapSecretForm'
import { ConfigMapSecretDeleteModal } from '../ConfigMapSecret/ConfigMapSecretDeleteModal'

import './ConfigMapSecret.scss'

const getDraftByResourceName = importComponentFromFELibrary('getDraftByResourceName', null, 'function')
const DraftComments = importComponentFromFELibrary('DraftComments')
const ConfigToolbar = importComponentFromFELibrary('ConfigToolbar')
const DeleteModal = importComponentFromFELibrary('DeleteModal')

export const ConfigMapSecretContainer = (props: CMSecretContainerProps) => {
    // PROPS
    const {
        componentType = CMSecretComponentType.ConfigMap,
        isOverrideView,
        clusterId,
        isProtected,
        envConfig,
        fetchEnvConfig,
        onErrorRedirectURL,
        envName,
        appName,
        isJob,
    } = props

    // HOOKS
    const { path } = useRouteMatch()
    const history = useHistory()
    const { appId, envId, name } = useParams<{ appId: string; envId: string; name: string }>()

    // STATES
    const [isCMSecretLoading, setIsCMSecretLoading] = useState(false)
    const [cmSecretError, setCmSecretError] = useState<number>()
    const [cmSecretData, setCmSecretData] = useState<ConfigMapSecretData>(null)
    const [selectedDraft, setSelectedDraft] = useState<DraftDetailsForCommentDrawerType>(null)
    const [draftData, setDraftData] = useState(null)
    const [showComments, setShowComments] = useState(false)
    const [selectedTab, setSelectedTab] = useState<CMSecretProtectedTab>(null)
    const [openDeleteModal, setOpenDeleteModal] = useState<CMSecretDeleteModalType>(null)

    // CONSTANTS
    const { config, isLoading: isEnvConfigLoading } = envConfig
    const envConfigData =
        config?.[
            componentType === CMSecretComponentType.ConfigMap ? EnvConfigObjectKey.ConfigMap : EnvConfigObjectKey.Secret
        ] || []
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

    const componentName = CM_SECRET_COMPONENT_NAME[componentType]

    // REFS
    const abortControllerRef = useRef<AbortController>(new AbortController())

    // LOADING
    const loader = isCMSecretLoading || isEnvConfigLoading

    const getCMSecretData = () => {
        abortPreviousRequests(() => {
            setIsCMSecretLoading(true)

            return Promise.allSettled([
                isProtected && getDraftByResourceName
                    ? getDraftByResourceName(appId, envId ?? -1, componentType, name, abortControllerRef.current.signal)
                    : null,
                isJob
                    ? getCMSecret(
                          componentType,
                          selectedCMSecret.id,
                          appId,
                          name,
                          envId,
                          abortControllerRef.current.signal,
                      )
                    : getAppEnvDeploymentConfig(
                          {
                              appName,
                              envName,
                              configType: AppEnvDeploymentConfigType.PUBLISHED_ONLY,
                              resourceId:
                                  cmSecretStateLabel !== CM_SECRET_STATE.INHERITED &&
                                  cmSecretStateLabel !== CM_SECRET_STATE.UNPUBLISHED
                                      ? selectedCMSecret.id
                                      : null,
                              resourceName: name,
                              resourceType:
                                  componentType === CMSecretComponentType.ConfigMap
                                      ? ConfigResourceType.ConfigMap
                                      : ConfigResourceType.Secret,
                          },
                          abortControllerRef.current.signal,
                      ),
            ])
        }, abortControllerRef)
            .then(([draftDataRes, cmSecretDataRes]) => {
                let draftId: number
                let draftState: number
                let _configMapSecret: ConfigMapSecretData

                if (
                    draftDataRes.status === 'fulfilled' &&
                    draftDataRes.value?.result &&
                    (draftDataRes.value.result.draftState === DraftState.Init ||
                        draftDataRes.value.result.draftState === DraftState.AwaitApproval)
                ) {
                    setDraftData({
                        ...draftDataRes.value.result,
                        unAuthorized: draftDataRes.value.result.dataEncrypted,
                    })
                    draftId = draftDataRes.value.result.draftId
                    draftState = draftDataRes.value.result.draftState

                    setSelectedTab(
                        draftDataRes.value.result.draftState === DraftState.AwaitApproval
                            ? CMSecretProtectedTab.Compare
                            : CMSecretProtectedTab.Draft,
                    )
                } else {
                    setSelectedTab(null)
                    setDraftData(null)
                }

                if (cmSecretDataRes.status === 'fulfilled') {
                    const _cmSecretData = isJob
                        ? cmSecretDataRes.value?.result
                        : cmSecretDataRes.value?.result[
                              componentType === CMSecretComponentType.ConfigMap ? 'configMapData' : 'secretsData'
                          ].data

                    // Since, jobs can only be created by super-admin users, modify this once API support is available.
                    const unAuthorized = isJob
                        ? false
                        : !(cmSecretDataRes.value?.result as AppEnvDeploymentConfigDTO).isAppAdmin

                    if (_cmSecretData.configData?.length) {
                        _configMapSecret = {
                            ..._cmSecretData,
                            configData: {
                                ..._cmSecretData.configData[0],
                                secretMode: _cmSecretData.configData[0].externalType === '',
                                unAuthorized: true,
                                ...(draftId && draftState
                                    ? {
                                          draftId,
                                          draftState,
                                      }
                                    : {}),
                            },
                        }
                    }

                    if (cmSecretStateLabel !== CM_SECRET_STATE.UNPUBLISHED) {
                        if (_cmSecretData.configData?.length) {
                            const _result: ConfigMapSecretData = {
                                ..._cmSecretData,
                                configData: _cmSecretData.configData[0],
                            }

                            _result.configData.overridden =
                                selectedCMSecret.configStage === ResourceConfigStage.Overridden

                            if (
                                componentType === CMSecretComponentType.Secret &&
                                draftDataRes?.status === 'fulfilled' &&
                                draftDataRes.value?.result
                            ) {
                                if (
                                    cmSecretStateLabel === CM_SECRET_STATE.INHERITED &&
                                    draftDataRes.value.result.draftState === DraftState.Published &&
                                    draftDataRes.value.result.action === 2
                                ) {
                                    _result.configData.overridden = true
                                } else if (
                                    cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN &&
                                    draftDataRes.value.result.draftState === DraftState.Published &&
                                    draftDataRes.value.result.action === 3
                                ) {
                                    _result.configData.overridden = false
                                }
                            }
                            _configMapSecret = {
                                ..._result,
                                configData: {
                                    ..._result.configData,
                                    unAuthorized,
                                },
                            }
                            setCmSecretData(_configMapSecret)
                        } else {
                            ToastManager.showToast({
                                variant: ToastVariantType.error,
                                description: `The ${componentName} '${name}' has been deleted`,
                            })
                            setCmSecretError(ERROR_STATUS_CODE.NOT_FOUND)
                            setCmSecretData(null)
                        }
                    } else if (
                        cmSecretStateLabel === CM_SECRET_STATE.UNPUBLISHED &&
                        draftDataRes?.status === 'fulfilled' &&
                        draftDataRes.value.result
                    ) {
                        if (draftDataRes.value.result.draftState === DraftState.Published) {
                            const dataFromDraft = JSON.parse(draftDataRes.value.result.data)
                            setCmSecretData({
                                ...dataFromDraft,
                                configData: {
                                    ...dataFromDraft.configData[0],
                                    unAuthorized: dataFromDraft.dataEncrypted,
                                },
                            })
                        } else if (draftDataRes.value.result.draftState === DraftState.Discarded) {
                            ToastManager.showToast({
                                variant: ToastVariantType.error,
                                description: `The ${componentName} '${name}' has been deleted`,
                            })
                            setCmSecretError(ERROR_STATUS_CODE.NOT_FOUND)
                            setCmSecretData(null)
                        }
                    }
                }

                if (
                    (!isJob &&
                        cmSecretDataRes.status === 'fulfilled' &&
                        !(cmSecretDataRes.value.result as AppEnvDeploymentConfigDTO).isAppAdmin) ||
                    (cmSecretDataRes.status === 'rejected' &&
                        cmSecretDataRes.reason.code === ERROR_STATUS_CODE.PERMISSION_DENIED) ||
                    (draftDataRes?.status === 'rejected' &&
                        draftDataRes?.reason?.code === ERROR_STATUS_CODE.PERMISSION_DENIED)
                ) {
                    ToastManager.showToast({
                        variant: ToastVariantType.warn,
                        title: 'View-only access',
                        description: "You won't be able to make any changes",
                    })
                }

                if (cmSecretDataRes.status === 'rejected' || draftDataRes.status === 'rejected') {
                    if (cmSecretDataRes.status === 'rejected') {
                        setIsCMSecretLoading(getIsRequestAborted(cmSecretDataRes.reason))
                        showError(cmSecretDataRes.reason)
                        setCmSecretError(cmSecretDataRes.reason.code)
                    }
                    if (draftDataRes.status === 'rejected') {
                        setIsCMSecretLoading(getIsRequestAborted(draftDataRes.reason))
                        showError(draftDataRes.reason)
                        setCmSecretError(draftDataRes.reason.code)
                    }
                } else {
                    setIsCMSecretLoading(false)
                }
            })
            .catch((err) => {
                ToastManager.showToast({
                    variant: ToastVariantType.warn,
                    title: 'View-only access',
                    description: "You won't be able to make any changes",
                })
                setDraftData(null)
                showError(err)
                setIsCMSecretLoading(false)
            })
    }

    const redirectURLToValidPage = () => {
        history.replace(
            generatePath(path, {
                appId,
                envId,
                name: envConfigData.length ? envConfigData[envConfigData.length - 1].name : null,
            }),
        )
    }

    useEffect(() => {
        if (!isEnvConfigLoading && selectedCMSecret && !isCreateState) {
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
    }, [selectedCMSecret, isEnvConfigLoading])

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

    const showDeleteButton =
        cmSecretStateLabel !== CM_SECRET_STATE.INHERITED &&
        cmSecretStateLabel !== CM_SECRET_STATE.UNPUBLISHED &&
        cmSecretStateLabel !== CM_SECRET_STATE.OVERRIDDEN &&
        draftData?.action !== 3 &&
        !isCreateState &&
        !!name

    const onDeleteBtnClick = () => setOpenDeleteModal(isProtected ? 'protectedDeleteModal' : 'deleteModal')

    const closeDeleteModal = () => {
        setOpenDeleteModal(null)
    }

    // RENDERERS
    const renderDeleteModal = (): JSX.Element => (
        <ConfigMapSecretDeleteModal
            appId={+appId}
            envId={envId ? +envId : null}
            componentType={componentType}
            id={selectedCMSecret?.id}
            configMapSecretData={cmSecretData?.configData}
            updateCMSecret={updateCMSecret}
            closeDeleteModal={closeDeleteModal}
            handleError={noop}
            draftData={null}
            openDeleteModal={null}
        />
    )

    const renderProtectedDeleteModal = () => {
        if (DeleteModal) {
            return (
                <DeleteModal
                    id={selectedCMSecret?.id}
                    appId={+appId}
                    envId={envId ? +envId : -1}
                    resourceType={componentType}
                    resourceName={selectedCMSecret?.name}
                    latestDraft={
                        draftData?.draftId
                            ? {
                                  draftId: draftData?.draftId,
                                  draftState: draftData?.draftState,
                                  draftVersionId: draftData?.draftVersionId,
                                  action: draftData.action,
                              }
                            : null
                    }
                    toggleModal={closeDeleteModal}
                    reload={updateCMSecret}
                />
            )
        }

        return null
    }

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
            {showDeleteButton && (
                <button
                    type="button"
                    className="override-button cta delete m-0-imp h-32 lh-20-imp p-6-12-imp"
                    onClick={onDeleteBtnClick}
                >
                    <Trash className="icon-dim-16 mr-4" />
                    Delete{isProtected ? '...' : ''}
                </button>
            )}
            {selectedCMSecret?.name && openDeleteModal && renderDeleteModal()}
            {selectedCMSecret?.name && openDeleteModal === 'protectedDeleteModal' && renderProtectedDeleteModal()}
        </article>
    )

    const renderDetails = () => {
        if (name && isProtected && draftData?.draftId) {
            return (
                <>
                    {ConfigToolbar && (
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
                    )}
                    <ProtectedConfigMapSecretDetails
                        {...props}
                        componentType={componentType}
                        data={cmSecretData?.configData}
                        id={selectedCMSecret?.id}
                        cmSecretStateLabel={cmSecretStateLabel}
                        selectedTab={selectedTab}
                        draftData={draftData}
                        updateCMSecret={updateCMSecret}
                    />
                </>
            )
        }

        return (
            <ConfigMapSecretForm
                {...props}
                componentType={componentType}
                configMapSecretData={cmSecretData?.configData}
                id={selectedCMSecret?.id}
                updateCMSecret={updateCMSecret}
                cmSecretStateLabel={cmSecretStateLabel}
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
                onCancel={redirectURLToValidPage}
            />
        )
    }

    if (loader) {
        return <Progressing fullHeight size={48} styles={{ height: 'calc(100% - 80px)' }} />
    }

    if (cmSecretError) {
        return <ErrorScreenManager code={cmSecretError} redirectURL={onErrorRedirectURL} />
    }

    if (isEmptyState) {
        return (
            <div className="bcn-0 h-100">
                <GenericEmptyState
                    title={CM_SECRET_EMPTY_STATE_TEXT[componentType].title}
                    subTitle={CM_SECRET_EMPTY_STATE_TEXT[componentType].subtitle}
                    image={EmptyStateImg}
                    imageType="large"
                    isButtonAvailable
                    renderButton={() => (
                        <button
                            type="button"
                            className="cta flex dc__gap-6"
                            onClick={() => history.push(generatePath(path, { appId, envId, name: 'create' }))}
                        >
                            <ICAdd className="icon-dim-16" />
                            <span>{CM_SECRET_EMPTY_STATE_TEXT[componentType].buttonText}</span>
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
            <div className="main-content py-16 px-20 h-100 dc__hide-hscroll">
                <div className="flexbox-col dc__gap-16 dc__mxw-1200">
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
