import { useEffect, useMemo, useRef, useState } from 'react'
import { generatePath, Prompt, useHistory, useRouteMatch } from 'react-router-dom'
import ReactGA from 'react-ga4'

import {
    abortPreviousRequests,
    AppEnvDeploymentConfigDTO,
    ConfigHeaderTabType,
    ConfigToolbarPopupNodeType,
    DraftAction,
    DraftState,
    ERROR_STATUS_CODE,
    ErrorScreenManager,
    noop,
    OverrideMergeStrategyType,
    Progressing,
    ProtectConfigTabsType,
    ServerErrors,
    showError,
    ToastManager,
    ToastVariantType,
    useAsync,
    usePrompt,
} from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'
import { UNSAVED_CHANGES_PROMPT_MESSAGE } from '@Config/constants'
import NoOverrideEmptyState from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/NoOverrideEmptyState'
import ConfigHeader from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/ConfigHeader'
import ConfigToolbar from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/ConfigToolbar'
import { ConfigToolbarProps } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/types'
import { getConfigToolbarPopupConfig } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/utils'
import { FloatingVariablesSuggestions, importComponentFromFELibrary } from '@Components/common'
import { EnvConfigObjectKey } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig.types'

import {
    getConfigMapSecretConfigData,
    getConfigMapSecretResolvedValues,
    overRideConfigMap,
    overRideSecret,
    updateConfigMap,
    updateSecret,
} from './ConfigMapSecret.service'
import {
    getConfigMapSecretDraftAndPublishedData,
    getConfigMapSecretInheritedData,
    getConfigMapSecretPayload,
    getConfigMapSecretResolvedData,
    getConfigMapSecretResolvedDataPayload,
    getConfigMapSecretStateLabel,
    hasHashiOrAWS,
} from './utils'
import { CM_SECRET_COMPONENT_NAME, CONFIG_MAP_SECRET_NO_DATA_ERROR } from './constants'
import {
    CM_SECRET_STATE,
    CMSecretComponentType,
    CMSecretDeleteModalType,
    CMSecretDraftPayloadType,
    ConfigMapSecretContainerProps,
    ConfigMapSecretFormProps,
} from './types'

import { ConfigMapSecretDeleteModal } from './ConfigMapSecretDeleteModal'
import { ConfigMapSecretForm } from './ConfigMapSecretForm'
import { ConfigMapSecretReadyOnly } from './ConfigMapSecretReadyOnly'
import { ConfigMapSecretProtected } from './ConfigMapSecretProtected'
import { ConfigMapSecretNullState } from './ConfigMapSecretNullState'
import { useConfigMapSecretFormContext } from './ConfigMapSecretFormContext'

import './styles.scss'

const getDraftByResourceName = importComponentFromFELibrary('getDraftByResourceName', null, 'function')
const ProtectionViewToolbarPopupNode = importComponentFromFELibrary('ProtectionViewToolbarPopupNode', null, 'function')
const DraftComments = importComponentFromFELibrary('DraftComments')
const SaveChangesModal = importComponentFromFELibrary('SaveChangesModal')

export const ConfigMapSecretContainer = ({
    componentType = CMSecretComponentType.ConfigMap,
    isJob = false,
    clusterId,
    envConfig,
    isProtected,
    fetchEnvConfig,
    onErrorRedirectURL,
    envName,
    appName,
    parentName,
    reloadEnvironments,
}: ConfigMapSecretContainerProps) => {
    // HOOKS
    const { setFormState, isFormDirty, parsingError, formDataRef } = useConfigMapSecretFormContext()
    const history = useHistory()
    const { path, params } = useRouteMatch<{ appId: string; envId: string; name: string }>()
    const { appId, envId, name } = params

    // REFS
    const abortControllerRef = useRef<AbortController>()

    // STATES
    const [configHeaderTab, setConfigHeaderTab] = useState<ConfigHeaderTabType>(null)
    const [mergeStrategy, setMergeStrategy] = useState<OverrideMergeStrategyType>(OverrideMergeStrategyType.REPLACE)
    const [selectedProtectionViewTab, setSelectedProtectionViewTab] = useState<ProtectConfigTabsType>(null)
    const [popupNodeType, setPopupNodeType] = useState<ConfigToolbarPopupNodeType>(null)
    const [showComments, setShowComments] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hideNoOverrideEmptyState, setHideNoOverrideEmptyState] = useState(false)
    const [openDeleteModal, setOpenDeleteModal] = useState<CMSecretDeleteModalType>(null)
    const [showDraftSaveModal, setShowDraftSaveModal] = useState(false)
    const [draftPayload, setDraftPayload] = useState<CMSecretDraftPayloadType>(null)
    const [resolvedScopeVariables, setResolvedScopeVariables] = useState(false)
    const [restoreYAML, setRestoreYAML] = useState(false)

    // CONSTANTS
    const componentName = CM_SECRET_COMPONENT_NAME[componentType]
    const isSecret = componentType === CMSecretComponentType.Secret

    const { config, isLoading: isEnvConfigLoading } = envConfig
    const envConfigData = config?.[isSecret ? EnvConfigObjectKey.Secret : EnvConfigObjectKey.ConfigMap] || []

    const selectedCMSecret = useMemo(() => envConfigData.find((data) => data.name === name), [envConfig, name])
    const cmSecretStateLabel = getConfigMapSecretStateLabel(selectedCMSecret?.configStage, !!envId)

    const id = selectedCMSecret?.id
    const isCreateState = name === 'create' && !id
    const isEmptyState = !name && !envConfigData.length

    // GA EVENT CATEGORY (BASED ON CM/SECRET)
    const gaEventCategory = `devtronapp-configuration-${isSecret ? 'secret' : 'cm'}`

    // COMPONENT PROP CONSTANTS
    const baseConfigurationURL = `${isJob ? URLS.JOB : URLS.APP}/${appId}/${URLS.APP_CONFIG}/${isSecret ? URLS.APP_CS_CONFIG : URLS.APP_CM_CONFIG}/${name}`
    const headerMessage =
        cmSecretStateLabel === CM_SECRET_STATE.ENV ||
        cmSecretStateLabel === CM_SECRET_STATE.UNPUBLISHED ||
        cmSecretStateLabel === CM_SECRET_STATE.BASE
            ? `${envId ? `This is an environment specific ${componentName}` : `Base ${componentName} is inherited by environments`}`
            : null
    /**
     * * Show the prompt only when not in create mode, as unsaved changes are already handled in ConfigMapSecretForm.
     * * During creation, route changes (/create -> /{configName}) would trigger an unnecessary prompt, so we skip it in that case.
     */
    const shouldPrompt = !isCreateState && isFormDirty

    // PROMPT FOR UNSAVED CHANGES
    usePrompt({ shouldPrompt })

    // USE EFFECTS
    useEffect(
        // Reset the form state after unmounting
        () => () => {
            setFormState({ type: 'RESET' })
        },
        [],
    )

    useEffect(() => {
        abortControllerRef.current = new AbortController()
        return () => {
            abortControllerRef.current.abort()
        }
    }, [envId, resolvedScopeVariables])

    // ASYNC CALL - CONFIGMAP/SECRET DATA
    const [configMapSecretResLoading, configMapSecretRes, configMapSecretResErr, reloadConfigMapSecret] = useAsync(
        () =>
            abortPreviousRequests(
                () =>
                    Promise.all([
                        // Fetch Published Configuration
                        cmSecretStateLabel !== CM_SECRET_STATE.UNPUBLISHED
                            ? getConfigMapSecretConfigData({
                                  appId: +appId,
                                  appName,
                                  envId: envId ? +envId : null,
                                  envName,
                                  componentType,
                                  name,
                                  resourceId: id,
                                  isJob,
                                  abortControllerRef,
                              })
                            : null,
                        // Fetch Base Configuration (Inherited Tab Data)
                        cmSecretStateLabel === CM_SECRET_STATE.INHERITED ||
                        cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN
                            ? getConfigMapSecretConfigData({
                                  appId: +appId,
                                  appName,
                                  envId: null,
                                  envName: '',
                                  componentType,
                                  name,
                                  resourceId: isJob ? id : null,
                                  isJob,
                                  abortControllerRef,
                              })
                            : null,
                        // Fetch Draft Configuration
                        isProtected && getDraftByResourceName
                            ? getDraftByResourceName(
                                  appId,
                                  envId ?? -1,
                                  componentType,
                                  name,
                                  abortControllerRef.current.signal,
                              )
                            : null,
                    ]),
                abortControllerRef,
            ),
        [],
        !isEnvConfigLoading && !!selectedCMSecret && !isCreateState,
    )

    // CONFIGMAP/SECRET DATA
    const { configMapSecretData, inheritedConfigMapSecretData, draftData, notFoundErr } = useMemo(() => {
        if (!configMapSecretResLoading && configMapSecretRes) {
            // RESET FORM STATE FROM AFTER DATA LOAD
            setFormState({ type: 'RESET' })

            const { data, hasNotFoundErr } = getConfigMapSecretDraftAndPublishedData({
                cmSecretConfigData: configMapSecretRes[0],
                draftConfigData: configMapSecretRes[2]?.result,
                configStage: selectedCMSecret.configStage,
                cmSecretStateLabel,
                isSecret,
                isJob,
            })

            if (data.draftData) {
                setSelectedProtectionViewTab(
                    data.draftData.draftState === DraftState.AwaitApproval
                        ? ProtectConfigTabsType.COMPARE
                        : ProtectConfigTabsType.EDIT_DRAFT,
                )
            }

            return {
                ...data,
                inheritedConfigMapSecretData: getConfigMapSecretInheritedData({
                    cmSecretConfigData: configMapSecretRes[1],
                    isJob,
                    isSecret,
                }),
                notFoundErr: hasNotFoundErr,
            }
        }

        return { configMapSecretData: null, draftData: null, inheritedConfigMapSecretData: null, notFoundErr: null }
    }, [configMapSecretResLoading, configMapSecretRes])

    // ASYNC CALL - CONFIGMAP/SECRET RESOLVED DATA
    const [resolvedScopeVariablesResLoading, resolvedScopeVariablesRes, reloadResolvedScopeVariablesResErr] = useAsync(
        () =>
            abortPreviousRequests(() => {
                const values = getConfigMapSecretResolvedDataPayload({
                    formData: formDataRef.current,
                    inheritedConfigMapSecretData,
                    configMapSecretData,
                    draftData,
                })

                return getConfigMapSecretResolvedValues(
                    {
                        appId: +appId,
                        envId: envId ? +envId : null,
                        values,
                    },
                    abortControllerRef.current.signal,
                )
            }, abortControllerRef),
        [resolvedScopeVariables],
        resolvedScopeVariables,
    )

    // RESOLVED CONFIGMAP/SECRET DATA
    const { resolvedFormData, resolvedInheritedConfigMapSecretData, resolvedConfigMapSecretData, resolvedDraftData } =
        useMemo(() => {
            if (resolvedScopeVariablesRes?.areVariablesPresent) {
                return getConfigMapSecretResolvedData(resolvedScopeVariablesRes.resolvedData)
            }

            return {
                resolvedFormData: null,
                resolvedInheritedConfigMapSecretData: null,
                resolvedConfigMapSecretData: null,
                resolvedDraftData: null,
            }
        }, [resolvedScopeVariablesRes])

    // DATA CONSTANTS
    const isError = notFoundErr || configMapSecretResErr
    const isLoading =
        configMapSecretResLoading ||
        isEnvConfigLoading ||
        (id && !isError && !(configMapSecretData || inheritedConfigMapSecretData || draftData))
    const isHashiOrAWS = configMapSecretData && hasHashiOrAWS(configMapSecretData.externalType)
    const showConfigToolbar =
        cmSecretStateLabel !== CM_SECRET_STATE.INHERITED || !!draftData || hideNoOverrideEmptyState

    // ERROR HANDLING
    useEffect(() => {
        if (
            (!isJob && configMapSecretRes?.[0] && !(configMapSecretRes[0] as AppEnvDeploymentConfigDTO).isAppAdmin) ||
            (!isJob && configMapSecretRes?.[1] && !(configMapSecretRes[1] as AppEnvDeploymentConfigDTO).isAppAdmin) ||
            configMapSecretResErr?.code === ERROR_STATUS_CODE.PERMISSION_DENIED
        ) {
            ToastManager.showToast({
                variant: ToastVariantType.warn,
                title: 'View-only access',
                description: "You won't be able to make any changes",
            })
        } else if (configMapSecretResErr) {
            showError(configMapSecretResErr)
        }

        if (notFoundErr) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: `The ${componentName} '${name}' has been deleted`,
            })
        }

        if (reloadResolvedScopeVariablesResErr) {
            setResolvedScopeVariables(false)
        }
    }, [configMapSecretRes, configMapSecretResErr, notFoundErr, reloadResolvedScopeVariablesResErr])

    // NO SCOPE VARIABLES PRESENT HANDLING
    useEffect(() => {
        if (resolvedScopeVariablesRes && !resolvedScopeVariablesRes.areVariablesPresent) {
            setResolvedScopeVariables(false)
            ToastManager.showToast({
                title: 'Error',
                description: 'No valid variable found on this page',
                variant: ToastVariantType.error,
            })
        }
    }, [resolvedScopeVariablesRes])

    // TAB HANDLING
    useEffect(() => {
        if (cmSecretStateLabel === CM_SECRET_STATE.INHERITED && !draftData) {
            setConfigHeaderTab(ConfigHeaderTabType.INHERITED)
        } else {
            setConfigHeaderTab(ConfigHeaderTabType.VALUES)
        }
    }, [cmSecretStateLabel, draftData])

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
        setResolvedScopeVariables(false)
        fetchEnvConfig(+envId || -1)

        if (isCreateState) {
            history.push(generatePath(path, { appId, envId, name: configName }))
        }
    }

    const restoreLastSavedYAML = () => setRestoreYAML(true)

    const toggleDraftComments = () => setShowComments(!showComments)

    const handleDelete = () => setOpenDeleteModal(isProtected ? 'protectedDeleteModal' : 'deleteModal')

    const handleDeleteOverride = () => {
        handleDelete()
        ReactGA.event({
            category: gaEventCategory,
            action: 'clicked-delete-override',
        })
    }

    const closeDeleteModal = () => setOpenDeleteModal(null)

    const handleOpenDiscardDraftPopup = () => setPopupNodeType(ConfigToolbarPopupNodeType.DISCARD_DRAFT)

    const handleShowEditHistory = () => setPopupNodeType(ConfigToolbarPopupNodeType.EDIT_HISTORY)

    const handleClearPopupNode = () => setPopupNodeType(null)

    const handleViewInheritedConfig = () => setConfigHeaderTab(ConfigHeaderTabType.INHERITED)

    const handleProtectionViewTabChange = (tab: ProtectConfigTabsType) => {
        setSelectedProtectionViewTab(tab)
        if (tab === ProtectConfigTabsType.COMPARE) {
            ReactGA.event({
                category: gaEventCategory,
                action: 'clicked-compare',
            })
        }
    }

    const handleToggleScopedVariablesView = () => {
        ReactGA.event({
            category: gaEventCategory,
            action: resolvedScopeVariables ? 'clicked-unresolve-scoped-variable' : 'clicked-resolve-scoped-variable',
        })
        setResolvedScopeVariables(!resolvedScopeVariables)
    }

    const handleCreateOverride = () => {
        setHideNoOverrideEmptyState(true)
        ReactGA.event({
            category: gaEventCategory,
            action: 'clicked-create-override-button',
        })
    }

    const handleNoOverrideFormCancel = () => setHideNoOverrideEmptyState(false)

    const handleMergeStrategyChange = (strategy: OverrideMergeStrategyType) => {
        setMergeStrategy(strategy)
        ReactGA.event({
            category: gaEventCategory,
            action: 'clicked-merge-strategy-dropdown',
        })
    }

    const toggleSaveChangesModal = () => setShowDraftSaveModal(false)

    const reloadSaveChangesModal = () => {
        setShowDraftSaveModal(false)
        updateCMSecret(draftPayload.configData[0].name)
        setDraftPayload(null)
    }

    const handleError = (
        actionType: DraftAction,
        err: any,
        payloadData?: ReturnType<typeof getConfigMapSecretPayload>,
    ) => {
        if (err instanceof ServerErrors && Array.isArray(err.errors)) {
            err.errors.forEach((error) => {
                if (error.code === 423) {
                    if (actionType === DraftAction.Delete) {
                        setOpenDeleteModal('protectedDeleteModal')
                    } else {
                        const _draftPayload: CMSecretDraftPayloadType = {
                            id: id ?? 0,
                            appId: +appId,
                            configData: [payloadData],
                            environmentId: envId ? +envId : null,
                        }
                        setDraftPayload(_draftPayload)
                        setShowDraftSaveModal(true)
                    }
                    reloadEnvironments()
                }
            })
        }
        if (err.code === ERROR_STATUS_CODE.PERMISSION_DENIED) {
            ToastManager.showToast({
                variant: ToastVariantType.notAuthorized,
                description: 'You cannot make any changes',
            })
        } else {
            showError(err)
        }
    }

    const onSubmit: ConfigMapSecretFormProps['onSubmit'] = async (formData) => {
        const payloadData = getConfigMapSecretPayload(resolvedScopeVariables ? formDataRef.current : formData)

        if (isProtected) {
            setDraftPayload({
                id: id ?? 0,
                appId: +appId,
                configData: [payloadData],
                environmentId: envId ? +envId : null,
            })
            setShowDraftSaveModal(true)
            return
        }

        try {
            setIsSubmitting(true)
            let toastTitle = ''

            if (!envId) {
                const updateConfigMapSecretParams = {
                    id,
                    appId: +appId,
                    payload: payloadData,
                    signal: abortControllerRef.current.signal,
                }

                await (isSecret ? updateSecret : updateConfigMap)(updateConfigMapSecretParams)
                toastTitle = `${payloadData.name ? 'Updated' : 'Saved'}`
            } else {
                const overrideConfigMapSecretParams = {
                    appId: +appId,
                    envId: +envId,
                    payload: payloadData,
                    signal: abortControllerRef.current.signal,
                }

                await (isSecret ? overRideSecret : overRideConfigMap)(overrideConfigMapSecretParams)
                toastTitle = 'Overridden'
            }
            ToastManager.showToast({
                variant: ToastVariantType.success,
                title: toastTitle,
                description: 'Changes will be reflected after next deployment.',
            })
            setIsSubmitting(false)

            if (!abortControllerRef.current.signal.aborted) {
                updateCMSecret(payloadData.name)
            }
        } catch (err) {
            setIsSubmitting(false)
            if (!abortControllerRef.current.signal.aborted) {
                handleError(DraftAction.Update, err, payloadData)
            }
        }
    }

    const onError: ConfigMapSecretFormProps['onError'] = (errors) => {
        if (errors.currentData?.[0] === CONFIG_MAP_SECRET_NO_DATA_ERROR) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: `Please add ${CM_SECRET_COMPONENT_NAME[componentType]} data before saving.`,
            })
        }

        if (errors.hasCurrentDataErr?.[0]) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: errors.hasCurrentDataErr[0],
            })
        }
    }

    // CONFIG TOOLBAR POPUP MENU
    const toolbarPopupConfig: ConfigToolbarProps['popupConfig'] = {
        menuConfig: getConfigToolbarPopupConfig({
            configHeaderTab,
            isOverridden: cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN,
            isProtected,
            isPublishedValuesView: selectedProtectionViewTab === ProtectConfigTabsType.PUBLISHED,
            isPublishedConfigPresent: !!configMapSecretData,
            unableToParseData: !!parsingError,
            isLoading: isLoading || isSubmitting,
            isDraftAvailable: !!draftData,
            handleDiscardDraft: handleOpenDiscardDraftPopup,
            handleShowEditHistory,
            handleDelete,
            handleDeleteOverride,
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
                handleReload={updateCMSecret}
            />
        ) : null,
    }

    // RENDERERS
    const renderForm = ({ onCancel }: Pick<ConfigMapSecretFormProps, 'onCancel'>) =>
        isProtected && draftData ? (
            <ConfigMapSecretProtected
                cmSecretStateLabel={cmSecretStateLabel}
                componentName={componentName}
                publishedConfigMapSecretData={resolvedConfigMapSecretData ?? configMapSecretData}
                draftData={resolvedDraftData ?? draftData}
                inheritedConfigMapSecretData={resolvedInheritedConfigMapSecretData ?? inheritedConfigMapSecretData}
                id={id}
                onError={onError}
                onSubmit={onSubmit}
                selectedProtectionViewTab={selectedProtectionViewTab}
                updateCMSecret={updateCMSecret}
                componentType={componentType}
                isJob={isJob}
                parentName={parentName}
                restoreYAML={restoreYAML}
                setRestoreYAML={setRestoreYAML}
                resolvedFormData={resolvedFormData}
                areScopeVariablesResolving={resolvedScopeVariablesResLoading}
            />
        ) : (
            <ConfigMapSecretForm
                id={id}
                cmSecretStateLabel={cmSecretStateLabel}
                componentType={componentType}
                configMapSecretData={configMapSecretData}
                isJob={isJob}
                isProtected={isProtected}
                isSubmitting={isSubmitting}
                onSubmit={onSubmit}
                onError={onError}
                onCancel={onCancel}
                resolvedFormData={resolvedFormData}
                areScopeVariablesResolving={resolvedScopeVariablesResLoading}
                restoreYAML={restoreYAML}
                setRestoreYAML={setRestoreYAML}
            />
        )

    const renderNoOverrideForm = () =>
        hideNoOverrideEmptyState ? (
            renderForm({ onCancel: handleNoOverrideFormCancel })
        ) : (
            <NoOverrideEmptyState
                componentType={componentType}
                configName={name}
                environmentName={envName}
                handleCreateOverride={handleCreateOverride}
                handleViewInheritedConfig={handleViewInheritedConfig}
                hideOverrideButton={isHashiOrAWS}
            />
        )

    const renderConfigHeaderTabContent = () => {
        switch (configHeaderTab) {
            case ConfigHeaderTabType.VALUES:
                return cmSecretStateLabel !== CM_SECRET_STATE.INHERITED || draftData
                    ? renderForm({ onCancel: redirectURLToValidPage })
                    : renderNoOverrideForm()
            case ConfigHeaderTabType.INHERITED:
                return (
                    <ConfigMapSecretReadyOnly
                        componentType={componentType}
                        isJob={isJob}
                        configMapSecretData={resolvedInheritedConfigMapSecretData ?? inheritedConfigMapSecretData}
                        areScopeVariablesResolving={resolvedScopeVariablesResLoading}
                    />
                )
            default:
                return null
        }
    }

    const renderDeleteModal = (): JSX.Element => (
        <ConfigMapSecretDeleteModal
            id={id}
            appId={+appId}
            envId={envId ? +envId : null}
            cmSecretStateLabel={cmSecretStateLabel}
            componentType={componentType}
            openDeleteModal={openDeleteModal}
            draftData={draftData}
            configName={name}
            updateCMSecret={updateCMSecret}
            closeDeleteModal={closeDeleteModal}
            handleError={handleError}
        />
    )

    const renderContent = () => {
        if (isEmptyState) {
            return <ConfigMapSecretNullState nullStateType="NO_CM_CS" componentType={componentType} />
        }

        if (isLoading) {
            return <Progressing fullHeight pageLoader />
        }

        if (isError && !isLoading) {
            return (
                <ErrorScreenManager
                    code={notFoundErr ? ERROR_STATUS_CODE.NOT_FOUND : configMapSecretResErr?.code}
                    redirectURL={onErrorRedirectURL}
                    reload={reloadConfigMapSecret}
                />
            )
        }

        return (
            <div className="flexbox-col h-100">
                <ConfigHeader
                    configHeaderTab={configHeaderTab}
                    handleTabChange={setConfigHeaderTab}
                    isDisabled={isLoading}
                    areChangesPresent={isFormDirty}
                    isOverridable={
                        cmSecretStateLabel === CM_SECRET_STATE.INHERITED ||
                        cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN
                    }
                    showNoOverride={cmSecretStateLabel === CM_SECRET_STATE.INHERITED && !draftData}
                    parsingError={parsingError}
                    restoreLastSavedYAML={restoreLastSavedYAML}
                    hideDryRunTab
                />
                {showConfigToolbar && (
                    <ConfigToolbar
                        configHeaderTab={configHeaderTab}
                        mergeStrategy={mergeStrategy}
                        handleMergeStrategyChange={handleMergeStrategyChange}
                        approvalUsers={draftData?.approvers}
                        areCommentsPresent={draftData?.commentsCount > 0}
                        disableAllActions={isLoading || isSubmitting || !!parsingError || isHashiOrAWS}
                        isProtected={isProtected}
                        isDraftPresent={!!draftData}
                        isPublishedConfigPresent={cmSecretStateLabel !== CM_SECRET_STATE.UNPUBLISHED}
                        isApprovalPending={draftData?.draftState === DraftState.AwaitApproval}
                        showDeleteOverrideDraftEmptyState={
                            isCreateState ||
                            (draftData?.action === DraftAction.Delete &&
                                configHeaderTab === ConfigHeaderTabType.VALUES &&
                                selectedProtectionViewTab === ProtectConfigTabsType.EDIT_DRAFT)
                        }
                        showMergePatchesButton={false}
                        baseConfigurationURL={baseConfigurationURL}
                        headerMessage={headerMessage}
                        selectedProtectionViewTab={selectedProtectionViewTab}
                        handleProtectionViewTabChange={handleProtectionViewTabChange}
                        handleToggleCommentsView={toggleDraftComments}
                        resolveScopedVariables={resolvedScopeVariables}
                        handleToggleScopedVariablesView={handleToggleScopedVariablesView}
                        popupConfig={toolbarPopupConfig}
                        handleToggleShowTemplateMergedWithPatch={noop}
                        shouldMergeTemplateWithPatches={null}
                        parsingError={parsingError}
                        restoreLastSavedYAML={restoreLastSavedYAML}
                    />
                )}
                {renderConfigHeaderTabContent()}
            </div>
        )
    }

    return (
        <>
            <Prompt when={shouldPrompt} message={UNSAVED_CHANGES_PROMPT_MESSAGE} />
            <div
                className={`configmap-secret-container p-8 h-100 dc__position-rel ${showComments ? 'with-comment-drawer' : ''}`}
            >
                <div className="dc__border br-4 dc__overflow-hidden h-100 bcn-0">{renderContent()}</div>
                {openDeleteModal && renderDeleteModal()}
                {SaveChangesModal && showDraftSaveModal && (
                    <SaveChangesModal
                        appId={+appId}
                        envId={envId ? +envId : -1}
                        resourceType={componentType}
                        resourceName={draftPayload.configData[0].name}
                        prepareDataToSave={() => draftPayload}
                        toggleModal={toggleSaveChangesModal}
                        latestDraft={draftData}
                        reload={reloadSaveChangesModal}
                        showAsModal
                    />
                )}
                {DraftComments && showComments && draftData && (
                    <DraftComments
                        draftId={draftData.draftId}
                        draftVersionId={draftData.draftVersionId}
                        toggleDraftComments={toggleDraftComments}
                    />
                )}
                {window._env_.ENABLE_SCOPED_VARIABLES && (
                    <div className="variables-widget-position-cm-cs">
                        <FloatingVariablesSuggestions zIndex={100} appId={appId} envId={envId} clusterId={clusterId} />
                    </div>
                )}
            </div>
        </>
    )
}
