import { useEffect, useMemo, useRef, useState } from 'react'
import { generatePath, useHistory, useRouteMatch } from 'react-router-dom'

import {
    abortPreviousRequests,
    AppEnvDeploymentConfigDTO,
    Button,
    ButtonComponentType,
    ConfigHeaderTabType,
    ConfigToolbarPopupNodeType,
    DraftAction,
    DraftState,
    ERROR_STATUS_CODE,
    ErrorScreenManager,
    GenericEmptyState,
    getIsRequestAborted,
    noop,
    OverrideMergeStrategyType,
    Progressing,
    showError,
    ToastManager,
    ToastVariantType,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import EmptyStateImg from '@Images/cm-cs-empty-state.png'
import { ReactComponent as ICAdd } from '@Icons/ic-add.svg'
import ConfigHeader from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/ConfigHeader'
import ConfigToolbar from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/ConfigToolbar'
import { ConfigToolbarProps } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/types'
import { getConfigToolbarPopupConfig } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/utils'
import { FloatingVariablesSuggestions, importComponentFromFELibrary } from '@Components/common'
import { EnvConfigObjectKey } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig.types'

import {
    overRideConfigMap,
    overRideSecret,
    updateConfig,
    updateSecret,
} from '../ConfigMapSecretOld/ConfigMapSecret.service'

import {
    getConfigMapSecretDraftAndPublishedData,
    getConfigMapSecretInheritedData,
    getConfigMapSecretPayload,
    getConfigMapSecretStateLabel,
} from './utils'
import { getConfigMapSecretConfigData } from './service.utils'
import { CM_SECRET_COMPONENT_NAME, CM_SECRET_EMPTY_STATE_TEXT } from './constants'
import {
    CM_SECRET_STATE,
    CMSecretComponentType,
    CMSecretDeleteModalType,
    ConfigMapSecretContainerProps,
    ConfigMapSecretFormProps,
} from './types'

import { ConfigMapSecretDeleteModal } from './ConfigMapSecretDeleteModal'
import { ConfigMapSecretForm } from './ConfigMapSecretForm'
import { ConfigMapSecretInherited } from './ConfigMapSecretInherited'
import { ConfigMapSecretOverrideEmptyState } from './ConfigMapSecretOverrideEmptyState'

import './styles.scss'

const getDraftByResourceName = importComponentFromFELibrary('getDraftByResourceName', null, 'function')
const ProtectionViewToolbarPopupNode = importComponentFromFELibrary('ProtectionViewToolbarPopupNode', null, 'function')
const DraftComments = importComponentFromFELibrary('DraftComments')
const DeleteModal = importComponentFromFELibrary('DeleteModal')

export const ConfigMapSecretContainer = ({
    componentType = CMSecretComponentType.ConfigMap,
    isJob = false,
    clusterId,
    envConfig,
    isOverrideView,
    isProtected,
    fetchEnvConfig,
    onErrorRedirectURL,
    envName,
    appName,
}: ConfigMapSecretContainerProps) => {
    // HOOKS
    const history = useHistory()
    const { path, params } = useRouteMatch<{ appId: string; envId: string; name: string }>()
    const { appId, envId, name } = params

    // REFS
    const abortRef = useRef<AbortController>()

    // STATES
    const [configHeaderTab, setConfigHeaderTab] = useState<ConfigHeaderTabType>(null)
    const [popupNodeType, setPopupNodeType] = useState<ConfigToolbarPopupNodeType>(null)
    const [showComments, setShowComments] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [openDeleteModal, setOpenDeleteModal] = useState<CMSecretDeleteModalType>(null)

    // CONSTANTS
    const componentName = CM_SECRET_COMPONENT_NAME[componentType]
    const isSecret = componentType === CMSecretComponentType.Secret

    const { config, isLoading: isEnvConfigLoading } = envConfig
    const envConfigData = config?.[isSecret ? EnvConfigObjectKey.Secret : EnvConfigObjectKey.ConfigMap] || []

    const selectedCMSecret = useMemo(() => envConfigData.find((data) => data.name === name), [envConfig, name])
    const cmSecretStateLabel = getConfigMapSecretStateLabel(selectedCMSecret?.configStage, isOverrideView)

    const id = selectedCMSecret?.id
    const isCreateState = name === 'create'
    const isEmptyState = !name && !envConfigData.length

    // USE EFFECTS
    useEffect(() => {
        abortRef.current = new AbortController()

        return () => {
            abortRef.current.abort()
        }
    }, [envId])

    useEffect(() => {
        switch (cmSecretStateLabel) {
            case CM_SECRET_STATE.INHERITED:
                setConfigHeaderTab(ConfigHeaderTabType.INHERITED)
                break
            default:
                setConfigHeaderTab(ConfigHeaderTabType.VALUES)
                break
        }
    }, [cmSecretStateLabel])

    // ASYNC CALLS
    const [configMapSecretResLoading, configMapSecretRes, configMapSecretResErr] = useAsync(
        () =>
            abortPreviousRequests(
                () =>
                    Promise.all([
                        getConfigMapSecretConfigData({
                            appId,
                            appName,
                            envId,
                            envName,
                            componentType,
                            name,
                            resourceId:
                                cmSecretStateLabel !== CM_SECRET_STATE.INHERITED &&
                                cmSecretStateLabel !== CM_SECRET_STATE.UNPUBLISHED
                                    ? id
                                    : null,
                            isJob,
                            abortRef,
                        }),
                        cmSecretStateLabel !== CM_SECRET_STATE.ENV && cmSecretStateLabel !== CM_SECRET_STATE.BASE
                            ? getConfigMapSecretConfigData({
                                  appId,
                                  appName,
                                  envId: null,
                                  envName: '',
                                  componentType,
                                  name,
                                  resourceId: null,
                                  isJob,
                                  abortRef,
                              })
                            : null,
                        isProtected && getDraftByResourceName
                            ? getDraftByResourceName(appId, envId ?? -1, componentType, name, abortRef.current.signal)
                            : null,
                    ]),
                abortRef,
            ),
        [],
        !isEnvConfigLoading && !!selectedCMSecret && !isCreateState,
    )

    // API DATA
    const { configMapSecretData, inheritedConfigMapSecretData, draftData, notFoundErr } = useMemo(() => {
        try {
            if (!configMapSecretResLoading && configMapSecretRes) {
                const { data, hasNotFoundErr } = getConfigMapSecretDraftAndPublishedData({
                    cmSecretConfigData: configMapSecretRes[0].result,
                    draftConfigData: configMapSecretRes[2]?.result,
                    configStage: selectedCMSecret.configStage,
                    cmSecretStateLabel,
                    componentName,
                    isSecret,
                    isJob,
                    name,
                })

                return {
                    ...data,
                    notFoundErr: hasNotFoundErr,
                    inheritedConfigMapSecretData: getConfigMapSecretInheritedData({
                        cmSecretConfigData: configMapSecretRes[1]?.result,
                        isJob,
                        isSecret,
                    }),
                }
            }
        } catch (err) {
            showError(err)
        }

        return { configMapSecretData: null, draftData: null, inheritedConfigMapSecretData: null, notFoundErr: null }
    }, [configMapSecretResLoading, configMapSecretRes])

    // LOADING
    const isLoading = configMapSecretResLoading || isEnvConfigLoading
    const isError = notFoundErr || (configMapSecretResErr && !getIsRequestAborted(configMapSecretResErr))

    // ERROR HANDLING
    useEffect(() => {
        if (isError) {
            if (
                (!isJob &&
                    configMapSecretRes &&
                    !(configMapSecretRes[0].result as AppEnvDeploymentConfigDTO).isAppAdmin) ||
                configMapSecretResErr?.code === ERROR_STATUS_CODE.PERMISSION_DENIED
            ) {
                ToastManager.showToast({
                    variant: ToastVariantType.warn,
                    title: 'View-only access',
                    description: "You won't be able to make any changes",
                })
            }

            if (configMapSecretResErr) {
                showError(configMapSecretResErr)
            }
        }
    }, [configMapSecretRes, configMapSecretResErr])

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
        if (!isLoading && !selectedCMSecret && !isCreateState && !isEmptyState) {
            redirectURLToValidPage()
        }
    }, [selectedCMSecret, isLoading])

    // METHODS
    const updateCMSecret = (configName?: string) => {
        fetchEnvConfig(+envId || -1)

        if (isCreateState) {
            history.push(generatePath(path, { appId, envId, name: configName }))
        }
    }

    const toggleDraftComments = () => setShowComments(!showComments)

    const handleDelete = () => setOpenDeleteModal(isProtected ? 'protectedDeleteModal' : 'deleteModal')

    const closeDeleteModal = () => setOpenDeleteModal(null)

    const getBaseConfigurationURL = () => generatePath(path.replace('/env-override/:envId(\\d+)?', ''), params)

    const handleOpenDiscardDraftPopup = () => setPopupNodeType(ConfigToolbarPopupNodeType.DISCARD_DRAFT)

    const handleShowEditHistory = () => setPopupNodeType(ConfigToolbarPopupNodeType.EDIT_HISTORY)

    const handleClearPopupNode = () => setPopupNodeType(null)

    const handleViewInheritedConfig = () => setConfigHeaderTab(ConfigHeaderTabType.INHERITED)

    // const handleError = (actionType: number, err: any, payloadData: ReturnType<typeof getConfigMapSecretPayload>) => {
    const handleError = (actionType: number, err: any) => {
        // if (err instanceof ServerErrors && Array.isArray(err.errors)) {
        //     err.errors.forEach((error) => {
        //         if (error.code === 423) {
        //             if (actionType === 3 && state.dialog) {
        //                 dispatch({ type: ConfigMapActionTypes.toggleProtectedDeleteOverrideModal })
        //             } else {
        //                 const _draftPayload = {
        //                     id: id ?? 0,
        //                     appId: +appId,
        //                     configData: [payloadData],
        //                     environmentId: null,
        //                 }
        //                 if (envId) {
        //                     _draftPayload.environmentId = +envId
        //                 }
        //                 dispatch({
        //                     type: ConfigMapActionTypes.multipleOptions,
        //                     payload: {
        //                         showDraftSaveModal: true,
        //                         draftPayload: _draftPayload,
        //                     },
        //                 })
        //             }
        //             reloadEnvironments()
        //         }
        //     })
        // }
        showError(err)
    }

    const onSubmit: ConfigMapSecretFormProps['onSubmit'] = async (formData) => {
        if (isSecret && configMapSecretData?.unAuthorized) {
            ToastManager.showToast({
                variant: ToastVariantType.warn,
                title: 'View-only access',
                description: "You won't be able to make any changes",
            })
            return
        }

        const payloadData = getConfigMapSecretPayload(formData)
        try {
            setIsSubmitting(true)
            let toastTitle = ''
            if (!envId) {
                if (isSecret) {
                    await updateSecret(id, +appId, payloadData, abortRef.current.signal)
                } else {
                    await updateConfig(id, +appId, payloadData, abortRef.current.signal)
                }
                toastTitle = `${payloadData.name ? 'Updated' : 'Saved'}`
            } else {
                if (isSecret) {
                    await overRideSecret(+appId, +envId, [payloadData], abortRef.current.signal)
                } else {
                    await overRideConfigMap(+appId, +envId, [payloadData], abortRef.current.signal)
                }
                toastTitle = 'Overridden'
            }
            ToastManager.showToast({
                variant: ToastVariantType.success,
                title: toastTitle,
                description: 'Changes will be reflected after next deployment.',
            })
            setIsSubmitting(false)

            if (!abortRef.current.signal.aborted) {
                updateCMSecret(payloadData.name)
            }
        } catch (err) {
            setIsSubmitting(false)
            if (!abortRef.current.signal.aborted) {
                // handleError(2, err, payloadData)
                handleError(2, err)
            }
        }
    }

    const onError: ConfigMapSecretFormProps['onError'] = (errors) => {
        if ((errors.currentData || errors.yaml) === '__NO_DATA__') {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: `Please add ${CM_SECRET_COMPONENT_NAME[componentType]} data before saving.`,
            })
        }

        if (errors.esoSecretYaml || errors.secretDataYaml) {
            const secretYamlErrMsg = (errors.esoSecretYaml || errors.secretDataYaml) as string
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description:
                    secretYamlErrMsg === '__NO_DATA__'
                        ? `Please add ${CM_SECRET_COMPONENT_NAME[componentType]} data before saving.`
                        : secretYamlErrMsg,
            })
        }

        if (typeof errors.hasCurrentDataErr === 'string') {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: errors.hasCurrentDataErr,
            })
        }
    }

    // CONFIG TOOLBAR POPUP MENU
    const toolbarPopupConfig: ConfigToolbarProps['popupConfig'] = {
        menuConfig: getConfigToolbarPopupConfig({
            configHeaderTab,
            isOverridden: cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN,
            isProtected,
            isPublishedValuesView: false,
            isPublishedConfigPresent: false,
            handleDeleteOverride: handleDelete,
            unableToParseData: false,
            isLoading: isLoading || isSubmitting,
            isDraftAvailable: false,
            handleDiscardDraft: handleOpenDiscardDraftPopup,
            handleShowEditHistory,
            handleDelete,
            isDeletable:
                cmSecretStateLabel !== CM_SECRET_STATE.INHERITED &&
                cmSecretStateLabel !== CM_SECRET_STATE.UNPUBLISHED &&
                cmSecretStateLabel !== CM_SECRET_STATE.OVERRIDDEN &&
                draftData?.action !== DraftAction.Delete &&
                !isCreateState,
        }),
        popupNodeType,
        popupMenuNode: ProtectionViewToolbarPopupNode ? (
            <ProtectionViewToolbarPopupNode
                popupNodeType={popupNodeType}
                handleClearPopupNode={handleClearPopupNode}
                draftId={draftData?.draftId}
                draftVersionId={draftData?.draftVersionId}
                handleReload={() => {}}
            />
        ) : null,
    }

    // RENDERERS
    const renderForm = ({ onCancel }: Pick<ConfigMapSecretFormProps, 'onCancel'>) => (
        <ConfigMapSecretForm
            id={id}
            cmSecretStateLabel={cmSecretStateLabel}
            componentType={componentType}
            configMapSecretData={configMapSecretData}
            isJob={isJob}
            isAppAdmin={false}
            draftMode={false}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            onError={onError}
            onCancel={onCancel}
        />
    )

    const renderContent = () => {
        switch (configHeaderTab) {
            case ConfigHeaderTabType.VALUES:
                return cmSecretStateLabel !== CM_SECRET_STATE.INHERITED ? (
                    renderForm({ onCancel: redirectURLToValidPage })
                ) : (
                    <ConfigMapSecretOverrideEmptyState
                        configName={name}
                        envName={envName}
                        componentType={componentType}
                        handleViewInheritedConfig={handleViewInheritedConfig}
                        renderFormComponent={renderForm}
                    />
                )
            case ConfigHeaderTabType.INHERITED:
                return (
                    <ConfigMapSecretInherited
                        componentType={componentType}
                        configMapSecretData={inheritedConfigMapSecretData}
                    />
                )
            default:
                return null
        }
    }

    const renderDeleteModal = (): JSX.Element => (
        <ConfigMapSecretDeleteModal
            appId={+appId}
            envId={envId ? +envId : null}
            componentType={componentType}
            id={id}
            configMapSecretData={configMapSecretData}
            updateCMSecret={updateCMSecret}
            closeDeleteModal={closeDeleteModal}
        />
    )

    const renderProtectedDeleteModal = () => {
        if (DeleteModal) {
            return (
                <DeleteModal
                    id={id}
                    appId={+appId}
                    envId={envId ? +envId : -1}
                    resourceType={componentType}
                    resourceName={selectedCMSecret?.name}
                    latestDraft={
                        draftData?.draftId
                            ? {
                                  draftId: draftData.draftId,
                                  draftState: draftData.draftState,
                                  draftVersionId: draftData.draftVersionId,
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

    if (isError && !isLoading) {
        return (
            <ErrorScreenManager
                code={notFoundErr ? ERROR_STATUS_CODE.NOT_FOUND : configMapSecretResErr?.code}
                redirectURL={onErrorRedirectURL}
            />
        )
    }

    if (isEmptyState) {
        return (
            <div className="h-100 bcn-0 cm-cs-empty-state-container">
                <GenericEmptyState
                    title={CM_SECRET_EMPTY_STATE_TEXT[componentType].title}
                    subTitle={CM_SECRET_EMPTY_STATE_TEXT[componentType].subtitle}
                    image={EmptyStateImg}
                    imageType="large"
                    isButtonAvailable
                    renderButton={() => (
                        <Button
                            dataTestId="cm-cs-empty-state-btn"
                            component={ButtonComponentType.link}
                            startIcon={<ICAdd className="icon-dim-16" />}
                            text={CM_SECRET_EMPTY_STATE_TEXT[componentType].buttonText}
                            linkProps={{
                                to: generatePath(path, { appId, envId, name: 'create' }),
                            }}
                        />
                    )}
                />
            </div>
        )
    }

    return (
        <div
            className={`configmap-secret-container p-8 h-100 dc__position-rel ${showComments ? 'with-comment-drawer' : ''}`}
        >
            {isLoading ? (
                <div className="h-100 bcn-0">
                    <Progressing fullHeight size={48} />
                </div>
            ) : (
                <>
                    <div className="dc__border br-4 dc__overflow-hidden flexbox-col h-100 bcn-0">
                        <ConfigHeader
                            configHeaderTab={configHeaderTab}
                            handleTabChange={setConfigHeaderTab}
                            isDisabled={isLoading}
                            areChangesPresent={false}
                            isOverridable={
                                cmSecretStateLabel === CM_SECRET_STATE.INHERITED ||
                                cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN
                            }
                            isPublishedTemplateOverridden={cmSecretStateLabel !== CM_SECRET_STATE.INHERITED}
                            hideDryRunTab
                        />
                        <ConfigToolbar
                            configHeaderTab={configHeaderTab}
                            mergeStrategy={OverrideMergeStrategyType.REPLACE}
                            approvalUsers={draftData?.approvers}
                            areCommentsPresent={draftData?.commentsCount > 0}
                            isProtected={isProtected}
                            isDraftPresent={!!draftData}
                            isPublishedConfigPresent={cmSecretStateLabel !== CM_SECRET_STATE.UNPUBLISHED}
                            isApprovalPending={draftData?.draftState === DraftState.AwaitApproval}
                            showMergePatchesButton={false}
                            baseConfigurationURL={getBaseConfigurationURL()}
                            headerMessage={
                                cmSecretStateLabel === CM_SECRET_STATE.ENV ||
                                cmSecretStateLabel === CM_SECRET_STATE.UNPUBLISHED ||
                                cmSecretStateLabel === CM_SECRET_STATE.BASE
                                    ? `${envId ? 'This is an environment specific' : 'base-placeholder-get-text'} ${componentName}`
                                    : null
                            }
                            selectedProtectionViewTab={null}
                            handleProtectionViewTabChange={() => {}}
                            handleToggleCommentsView={toggleDraftComments}
                            isLoadingInitialData={isLoading}
                            resolveScopedVariables={false}
                            handleToggleScopedVariablesView={() => {}}
                            popupConfig={toolbarPopupConfig}
                            handleClearPopupNode={handleClearPopupNode}
                            handleMergeStrategyChange={noop}
                            handleToggleShowTemplateMergedWithPatch={noop}
                            shouldMergeTemplateWithPatches={null}
                        />
                        {renderContent()}
                    </div>
                    {openDeleteModal === 'deleteModal' && renderDeleteModal()}
                    {openDeleteModal === 'protectedDeleteModal' && renderProtectedDeleteModal()}
                    {DraftComments && showComments && draftData && (
                        <DraftComments
                            draftId={draftData.draftId}
                            draftVersionId={draftData.draftVersionId}
                            toggleDraftComments={toggleDraftComments}
                        />
                    )}
                    {window._env_.ENABLE_SCOPED_VARIABLES && (
                        <div className="variables-widget-position-cmcs">
                            <FloatingVariablesSuggestions
                                zIndex={100}
                                appId={appId}
                                envId={envId}
                                clusterId={clusterId}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
