import { useEffect, useMemo, useRef, useState } from 'react'
import { generatePath, useHistory, useRouteMatch } from 'react-router-dom'

import {
    abortPreviousRequests,
    AppEnvDeploymentConfigDTO,
    ConfigHeaderTabType,
    ConfigToolbarPopupNodeType,
    DraftAction,
    DraftState,
    ERROR_STATUS_CODE,
    ErrorScreenManager,
    getIsRequestAborted,
    noop,
    OverrideMergeStrategyType,
    Progressing,
    ProtectConfigTabsType,
    ServerErrors,
    showError,
    ToastManager,
    ToastVariantType,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'
import ConfigHeader from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/ConfigHeader'
import ConfigToolbar from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/ConfigToolbar'
import { ConfigToolbarProps } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/types'
import { getConfigToolbarPopupConfig } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/utils'
import { FloatingVariablesSuggestions, importComponentFromFELibrary } from '@Components/common'
import { EnvConfigObjectKey } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig.types'
import { ResourceConfigState } from '@Pages/Applications/DevtronApps/service.types'

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
import { useConfigMapSecretContext } from './ConfigMapSecretContext'

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
    isOverrideView,
    isProtected,
    fetchEnvConfig,
    onErrorRedirectURL,
    envName,
    appName,
    parentName,
    reloadEnvironments,
}: ConfigMapSecretContainerProps) => {
    // HOOKS
    const { isFormDirty } = useConfigMapSecretContext()
    const history = useHistory()
    const { path, params } = useRouteMatch<{ appId: string; envId: string; name: string }>()
    const { appId, envId, name } = params

    // REFS
    const abortRef = useRef<AbortController>()

    // STATES
    const [configHeaderTab, setConfigHeaderTab] = useState<ConfigHeaderTabType>(null)
    const [mergeStrategy, setMergeStrategy] = useState<OverrideMergeStrategyType>(OverrideMergeStrategyType.REPLACE)
    const [selectedProtectionViewTab, setSelectedProtectionViewTab] = useState<ProtectConfigTabsType>(null)
    const [popupNodeType, setPopupNodeType] = useState<ConfigToolbarPopupNodeType>(null)
    const [showComments, setShowComments] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [openDeleteModal, setOpenDeleteModal] = useState<CMSecretDeleteModalType>(null)
    const [showDraftSaveModal, setShowDraftSaveModal] = useState(false)
    const [draftPayload, setDraftPayload] = useState<CMSecretDraftPayloadType>(null)
    const [resolvedScopeVariables, setResolvedScopeVariables] = useState(false)

    // CONSTANTS
    const componentName = CM_SECRET_COMPONENT_NAME[componentType]
    const isSecret = componentType === CMSecretComponentType.Secret

    const { config, isLoading: isEnvConfigLoading } = envConfig
    const envConfigData = config?.[isSecret ? EnvConfigObjectKey.Secret : EnvConfigObjectKey.ConfigMap] || []

    const selectedCMSecret = useMemo(() => envConfigData.find((data) => data.name === name), [envConfig, name])
    const cmSecretStateLabel = getConfigMapSecretStateLabel(selectedCMSecret?.configStage, isOverrideView)

    const id = selectedCMSecret?.id
    const isCreateState = name === 'create' && !id
    const isEmptyState = !name && !envConfigData.length

    // COMPONENT PROP CONSTANTS
    const baseConfigurationURL = `${URLS.APP}/${appId}/${URLS.APP_CONFIG}/${isSecret ? URLS.APP_CS_CONFIG : URLS.APP_CM_CONFIG}/${name}`
    const headerMessage =
        cmSecretStateLabel === CM_SECRET_STATE.ENV ||
        cmSecretStateLabel === CM_SECRET_STATE.UNPUBLISHED ||
        cmSecretStateLabel === CM_SECRET_STATE.BASE
            ? `${envId ? 'This is an environment specific' : 'base-placeholder-get-text'} ${componentName}`
            : null

    // USE EFFECTS
    useEffect(() => {
        abortRef.current = new AbortController()

        return () => {
            abortRef.current.abort()
        }
    }, [envId])

    // ASYNC CALLS
    const [configMapSecretResLoading, configMapSecretRes, configMapSecretResErr] = useAsync(
        () =>
            abortPreviousRequests(
                () =>
                    Promise.all([
                        // Fetch Published Configuration
                        cmSecretStateLabel !== CM_SECRET_STATE.INHERITED &&
                        cmSecretStateLabel !== CM_SECRET_STATE.UNPUBLISHED
                            ? getConfigMapSecretConfigData({
                                  appId,
                                  appName,
                                  envId,
                                  envName,
                                  componentType,
                                  name,
                                  resourceId: id,
                                  isJob,
                                  abortRef,
                              })
                            : null,
                        // Fetch Base Configuration (Inherited Tab Data)
                        cmSecretStateLabel === CM_SECRET_STATE.INHERITED ||
                        cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN
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
                        // Fetch Draft Configuration
                        selectedCMSecret.configState === ResourceConfigState.ApprovalPending ||
                        (selectedCMSecret.configState === ResourceConfigState.Draft &&
                            isProtected &&
                            getDraftByResourceName)
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
                    cmSecretConfigData: configMapSecretRes[0]?.result,
                    draftConfigData: configMapSecretRes[2]?.result,
                    configStage: selectedCMSecret.configStage,
                    cmSecretStateLabel,
                    componentName,
                    isSecret,
                    isJob,
                    name,
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

    // DATA CONSTANTS
    const isLoading = configMapSecretResLoading || isEnvConfigLoading
    const isError = notFoundErr || (configMapSecretResErr && !getIsRequestAborted(configMapSecretResErr))

    // ERROR HANDLING
    useEffect(() => {
        if (
            (!isJob &&
                configMapSecretRes?.[0]?.result &&
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
    }, [configMapSecretRes, configMapSecretResErr])

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
        fetchEnvConfig(+envId || -1)

        if (isCreateState) {
            history.push(generatePath(path, { appId, envId, name: configName }))
        }
    }

    const toggleDraftComments = () => setShowComments(!showComments)

    const handleDelete = () => setOpenDeleteModal(isProtected ? 'protectedDeleteModal' : 'deleteModal')

    const closeDeleteModal = () => setOpenDeleteModal(null)

    const handleOpenDiscardDraftPopup = () => setPopupNodeType(ConfigToolbarPopupNodeType.DISCARD_DRAFT)

    const handleShowEditHistory = () => setPopupNodeType(ConfigToolbarPopupNodeType.EDIT_HISTORY)

    const handleClearPopupNode = () => setPopupNodeType(null)

    const handleViewInheritedConfig = () => setConfigHeaderTab(ConfigHeaderTabType.INHERITED)

    const handleProtectionViewTabChange = (tab: ProtectConfigTabsType) => setSelectedProtectionViewTab(tab)

    const handleToggleScopedVariablesView = () => setResolvedScopeVariables(!resolvedScopeVariables)

    const toggleSaveChangesModal = () => {
        setIsSubmitting(false)
        setShowDraftSaveModal(false)
    }

    const reloadSaveChangesModal = () => {
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
        showError(err)
    }

    const onSubmit: ConfigMapSecretFormProps['onSubmit'] = async (formData) => {
        if (configMapSecretData?.unAuthorized) {
            ToastManager.showToast({
                variant: ToastVariantType.warn,
                title: 'View-only access',
                description: "You won't be able to make any changes",
            })
            return
        }

        const payloadData = getConfigMapSecretPayload(formData)

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
                handleError(DraftAction.Update, err, payloadData)
            }
        }
    }

    const onError: ConfigMapSecretFormProps['onError'] = (errors) => {
        if ((errors.currentData || errors.yaml) === CONFIG_MAP_SECRET_NO_DATA_ERROR) {
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
                    secretYamlErrMsg === CONFIG_MAP_SECRET_NO_DATA_ERROR
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
            isPublishedValuesView: selectedProtectionViewTab === ProtectConfigTabsType.PUBLISHED,
            isPublishedConfigPresent: !!configMapSecretData,
            unableToParseData: false,
            isLoading: isLoading || isSubmitting,
            isDraftAvailable: !!draftData,
            handleDiscardDraft: handleOpenDiscardDraftPopup,
            handleShowEditHistory,
            handleDelete,
            handleDeleteOverride: handleDelete,
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
                appName={appName}
                cmSecretStateLabel={cmSecretStateLabel}
                componentName={componentName}
                publishedConfigMapSecretData={configMapSecretData}
                draftData={draftData}
                inheritedConfigMapSecretData={inheritedConfigMapSecretData}
                envName={envName}
                id={id}
                onError={onError}
                onSubmit={onSubmit}
                selectedProtectionViewTab={selectedProtectionViewTab}
                updateCMSecret={updateCMSecret}
                componentType={componentType}
                isJob={isJob}
                parentName={parentName}
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
            />
        )

    const renderConfigHeaderTabContent = () => {
        switch (configHeaderTab) {
            case ConfigHeaderTabType.VALUES:
                return cmSecretStateLabel !== CM_SECRET_STATE.INHERITED || draftData ? (
                    renderForm({ onCancel: redirectURLToValidPage })
                ) : (
                    <ConfigMapSecretNullState
                        configName={name}
                        envName={envName}
                        nullStateType="NO_OVERRIDE"
                        componentType={componentType}
                        handleViewInheritedConfig={handleViewInheritedConfig}
                        renderFormComponent={renderForm}
                        hideOverrideButton={configMapSecretData?.unAuthorized}
                    />
                )
            case ConfigHeaderTabType.INHERITED:
                return (
                    <ConfigMapSecretReadyOnly
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
            id={id}
            appId={+appId}
            envId={envId ? +envId : null}
            componentType={componentType}
            openDeleteModal={openDeleteModal}
            draftData={draftData}
            configMapSecretData={configMapSecretData}
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
            return <Progressing fullHeight size={48} />
        }

        if (isError && !isLoading) {
            return (
                <ErrorScreenManager
                    code={notFoundErr ? ERROR_STATUS_CODE.NOT_FOUND : configMapSecretResErr?.code}
                    redirectURL={onErrorRedirectURL}
                />
            )
        }

        return (
            <div className="dc__border br-4 dc__overflow-hidden flexbox-col h-100 bcn-0">
                <ConfigHeader
                    configHeaderTab={configHeaderTab}
                    handleTabChange={setConfigHeaderTab}
                    isDisabled={isLoading}
                    areChangesPresent={isFormDirty}
                    isOverridable={
                        cmSecretStateLabel === CM_SECRET_STATE.INHERITED ||
                        cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN
                    }
                    isPublishedTemplateOverridden={cmSecretStateLabel !== CM_SECRET_STATE.INHERITED}
                    hideDryRunTab
                />
                <ConfigToolbar
                    configHeaderTab={configHeaderTab}
                    mergeStrategy={mergeStrategy}
                    handleMergeStrategyChange={setMergeStrategy}
                    approvalUsers={draftData?.approvers}
                    areCommentsPresent={draftData?.commentsCount > 0}
                    isProtected={isProtected}
                    isDraftPresent={!!draftData}
                    isPublishedConfigPresent={cmSecretStateLabel !== CM_SECRET_STATE.UNPUBLISHED}
                    isApprovalPending={draftData?.draftState === DraftState.AwaitApproval}
                    showMergePatchesButton={false}
                    baseConfigurationURL={baseConfigurationURL}
                    headerMessage={headerMessage}
                    selectedProtectionViewTab={selectedProtectionViewTab}
                    handleProtectionViewTabChange={handleProtectionViewTabChange}
                    handleToggleCommentsView={toggleDraftComments}
                    isLoadingInitialData={isLoading}
                    resolveScopedVariables={resolvedScopeVariables}
                    handleToggleScopedVariablesView={handleToggleScopedVariablesView}
                    popupConfig={toolbarPopupConfig}
                    handleClearPopupNode={handleClearPopupNode}
                    handleToggleShowTemplateMergedWithPatch={noop}
                    shouldMergeTemplateWithPatches={null}
                />
                {renderConfigHeaderTabContent()}
            </div>
        )
    }

    return (
        <div
            className={`configmap-secret-container p-8 h-100 dc__position-rel ${showComments ? 'with-comment-drawer' : ''}`}
        >
            <div className="h-100 bcn-0">{renderContent()}</div>
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
    )
}
