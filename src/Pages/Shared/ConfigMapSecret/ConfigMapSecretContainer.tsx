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

import { useEffect, useMemo, useRef, useState } from 'react'
import { generatePath, Prompt, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import ReactGA from 'react-ga4'

import {
    abortPreviousRequests,
    API_STATUS_CODES,
    ConfigHeaderTabType,
    ConfigToolbarPopupNodeType,
    DraftAction,
    DraftState,
    DryRunEditorMode,
    ERROR_STATUS_CODE,
    ErrorScreenManager,
    hasESO,
    hasHashiOrAWS,
    OverrideMergeStrategyType,
    Progressing,
    ProtectConfigTabsType,
    ServerErrors,
    showError,
    ToastManager,
    ToastVariantType,
    useAsync,
    useForm,
    usePrompt,
    checkIfPathIsMatching,
    useUrlFilters,
    ConfigMapSecretUseFormProps,
    CMSecretComponentType,
    CM_SECRET_STATE,
    getConfigMapSecretFormInitialValues,
    getConfigMapSecretPayload,
    CMSecretPayloadType,
    getConfigMapSecretFormValidations,
    ConfigMapSecretReadyOnly,
    FloatingVariablesSuggestions,
    UseFormErrorHandler,
    UseFormSubmitHandler,
    isNullOrUndefined,
    useOneTimePrompt,
} from '@devtron-labs/devtron-fe-common-lib'

import { APP_COMPOSE_STAGE, getAppComposeURL } from '@Config/routes'
import { ConfigHeader, ConfigToolbar, ConfigToolbarProps, NoOverrideEmptyState } from '@Pages/Applications'
import { getConfigToolbarPopupConfig } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/utils'
import { importComponentFromFELibrary } from '@Components/common'
import { EnvConfigObjectKey } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig.types'

import { DEFAULT_MERGE_STRATEGY } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/constants'
import {
    getConfigMapSecretConfigData,
    getConfigMapSecretConfigDraftData,
    getConfigMapSecretResolvedValues,
    overRideConfigMap,
    overRideSecret,
    updateConfigMap,
    updateSecret,
} from './ConfigMapSecret.service'
import {
    getConfigMapSecretDraftAndPublishedData,
    getConfigMapSecretError,
    getConfigMapSecretInheritedData,
    getConfigMapSecretResolvedData,
    getConfigMapSecretResolvedDataPayload,
    getConfigMapSecretStateLabel,
    parseConfigMapSecretSearchParams,
} from './utils'
import { CM_SECRET_COMPONENT_NAME, CONFIG_MAP_SECRET_NO_DATA_ERROR } from './constants'
import {
    CMSecretDeleteModalType,
    CMSecretDraftPayloadType,
    ConfigMapSecretContainerProps,
    ConfigMapSecretFormProps,
    ConfigMapSecretQueryParamsType,
} from './types'

import { ConfigMapSecretDeleteModal } from './ConfigMapSecretDeleteModal'
import { ConfigMapSecretForm } from './ConfigMapSecretForm'
import { ConfigMapSecretProtected } from './ConfigMapSecretProtected'
import { ConfigMapSecretNullState } from './ConfigMapSecretNullState'
import { ConfigMapSecretDryRun } from './ConfigMapSecretDryRun'

import './styles.scss'

const ProtectionViewToolbarPopupNode = importComponentFromFELibrary('ProtectionViewToolbarPopupNode', null, 'function')
const DraftComments = importComponentFromFELibrary('DraftComments')
const SaveChangesModal = importComponentFromFELibrary('SaveChangesModal')
const DISABLE_DELETE_TOOLTIP_TEXT = importComponentFromFELibrary('DISABLE_DELETE_TOOLTIP_TEXT', null, 'function')
const ExpressEditHeader = importComponentFromFELibrary('ExpressEditHeader', null, 'function')
const ExpressEditConfirmationModal = importComponentFromFELibrary('ExpressEditConfirmationModal', null, 'function')

export const ConfigMapSecretContainer = ({
    componentType = CMSecretComponentType.ConfigMap,
    isJob = false,
    clusterId,
    envConfig,
    isApprovalPolicyConfigured,
    fetchEnvConfig,
    onErrorRedirectURL,
    envName,
    appName,
    parentName,
    appChartRef,
    reloadEnvironments,
    isExceptionUser,
    isTemplateView,
}: ConfigMapSecretContainerProps) => {
    // HOOKS
    const location = useLocation()
    const history = useHistory()
    const { path, params } = useRouteMatch<{ appId: string; envId: string; name: string }>()
    const { appId, envId, name } = params

    // SEARCH PARAMS
    const { headerTab: configHeaderTab, updateSearchParams } = useUrlFilters<never, ConfigMapSecretQueryParamsType>({
        parseSearchParams: parseConfigMapSecretSearchParams,
    })

    // REFS
    const abortControllerRef = useRef<AbortController>()
    const savedFormData = useRef<ConfigMapSecretUseFormProps>()
    const formValuesBeforeExpressEditView = useRef<ConfigMapSecretUseFormProps>()

    // STATES
    const [selectedProtectionViewTab, setSelectedProtectionViewTab] = useState<ProtectConfigTabsType>(null)
    const [popupNodeType, setPopupNodeType] = useState<ConfigToolbarPopupNodeType>(null)
    const [showComments, setShowComments] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hideNoOverrideEmptyState, setHideNoOverrideEmptyState] = useState(false)
    const [openDeleteModal, setOpenDeleteModal] = useState<CMSecretDeleteModalType>(null)
    const [showDraftSaveModal, setShowDraftSaveModal] = useState(false)
    const [draftPayload, setDraftPayload] = useState<CMSecretDraftPayloadType>(null)
    const [resolveScopedVariables, setResolveScopedVariables] = useState(false)
    const [areCommentsPresent, setAreCommentsPresent] = useState(false)
    const [dryRunEditorMode, setDryRunEditorMode] = useState<DryRunEditorMode>(DryRunEditorMode.VALUES_FROM_DRAFT)
    const [shouldMergeTemplateWithPatches, setShouldMergeTemplateWithPatches] = useState(false)
    const [isExpressEditView, setIsExpressEditView] = useState<boolean>(false)
    const [isExpressEditComparisonView, setIsExpressEditComparisonView] = useState<boolean>(false)
    const [showExpressEditConfirmationModal, setShowExpressEditConfirmationModal] = useState<boolean>(false)

    // FORM INITIALIZATION
    const useFormProps = useForm<ConfigMapSecretUseFormProps>({
        validations: getConfigMapSecretFormValidations,
        initialValues: getConfigMapSecretFormInitialValues({
            configMapSecretData: null,
            componentType,
            cmSecretStateLabel: envId ? CM_SECRET_STATE.ENV : CM_SECRET_STATE.BASE,
            isJob,
            fallbackMergeStrategy: DEFAULT_MERGE_STRATEGY,
        }),
    })

    const { data: formData, errors: formErrors, formState, setValue, handleSubmit, reset } = useFormProps

    const {
        showPrompt,
        handleClose: closePromptTooltip,
        handleDoNotShowAgainClose: permanentClosePromptTooltip,
    } = useOneTimePrompt({
        localStorageKey: 'express-edit-prompt-tooltip',
    })

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

    const yamlError =
        !isCreateState &&
        !(
            formData.mergeStrategy === OverrideMergeStrategyType.PATCH &&
            cmSecretStateLabel === CM_SECRET_STATE.INHERITED
        ) &&
        (formData.external ? formErrors.esoSecretYaml : formErrors.yaml)?.[0]
    const parsingError = yamlError && yamlError !== CONFIG_MAP_SECRET_NO_DATA_ERROR ? yamlError : ''

    // GA EVENT CATEGORY (BASED ON CM/SECRET)
    const gaEventCategory = `devtronapp-configuration-${isSecret ? 'secret' : 'cm'}`

    // COMPONENT PROP CONSTANTS
    const baseConfigurationURL = getAppComposeURL(
        appId,
        isSecret ? APP_COMPOSE_STAGE.SECRETS : APP_COMPOSE_STAGE.CONFIG_MAPS,
        isJob,
        isTemplateView,
    )
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
    const shouldPrompt = !isCreateState && formState.isDirty

    // PROMPT FOR UNSAVED CHANGES
    usePrompt({ shouldPrompt })

    useEffect(() => {
        abortControllerRef.current = new AbortController()
        return () => {
            abortControllerRef.current.abort()
        }
    }, [envId, resolveScopedVariables])

    // ASYNC CALL - CONFIGMAP/SECRET DATA
    const [configMapSecretResLoading, configMapSecretRes, , reloadConfigMapSecret] = useAsync(
        () =>
            abortPreviousRequests(
                () =>
                    Promise.allSettled([
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
                                  isTemplateView,
                              })
                            : null,
                        // Fetch Base Configuration (Inherited Tab Data)
                        // Skipped for jobs as API support is unavailable
                        !isJob &&
                        (cmSecretStateLabel === CM_SECRET_STATE.INHERITED ||
                            cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN)
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
                                  isTemplateView,
                              })
                            : null,
                        // Fetch Draft Configuration
                        isApprovalPolicyConfigured
                            ? getConfigMapSecretConfigDraftData({
                                  appId: +appId,
                                  envId: envId ? +envId : -1,
                                  componentType,
                                  name,
                                  abortControllerRef,
                              })
                            : null,
                    ]),
                abortControllerRef,
            ),
        [],
        !isEnvConfigLoading && !!selectedCMSecret && !isCreateState,
    )

    // CONFIGMAP/SECRET DATA
    const { configMapSecretData, inheritedConfigMapSecretData, draftData, isDeleteDisabled } = useMemo(() => {
        if (!configMapSecretResLoading && configMapSecretRes) {
            const data = getConfigMapSecretDraftAndPublishedData({
                cmSecretConfigDataRes: configMapSecretRes[0],
                draftConfigDataRes: configMapSecretRes[2],
                isSecret,
                isJob,
            })

            return {
                ...data,
                isDeleteDisabled: cmSecretStateLabel === CM_SECRET_STATE.BASE && data.isDeleteDisabled,
                // For jobs: using current configuration data since inherited data is unavailable
                // (logic is implemented to parse inherited data from the current data)
                inheritedConfigMapSecretData: isJob
                    ? data.configMapSecretData
                    : getConfigMapSecretInheritedData({
                          cmSecretConfigDataRes: configMapSecretRes[1],
                          isJob,
                          isSecret,
                      }),
            }
        }

        return {
            configMapSecretData: null,
            draftData: null,
            inheritedConfigMapSecretData: null,
            isDeleteDisabled: null,
        }
    }, [configMapSecretResLoading, configMapSecretRes])

    // CONFIGMAP/SECRET DELETED
    const configHasBeenDeleted = useMemo(
        () =>
            !configMapSecretResLoading && configMapSecretRes
                ? !configMapSecretData && !inheritedConfigMapSecretData && !draftData
                : null,
        [configMapSecretResLoading, configMapSecretRes],
    )

    // CONFIGMAP/SECRET ERROR
    const configMapSecretResErr = useMemo(
        () =>
            !configMapSecretResLoading && configMapSecretRes
                ? getConfigMapSecretError(configMapSecretRes[0]) ||
                  getConfigMapSecretError(configMapSecretRes[1]) ||
                  getConfigMapSecretError(configMapSecretRes[2])
                : null,
        [configMapSecretResLoading, configMapSecretRes],
    )

    // ASYNC CALL - CONFIGMAP/SECRET RESOLVED DATA
    const [resolvedScopeVariablesResLoading, resolvedScopeVariablesRes, reloadResolvedScopeVariablesResErr] = useAsync(
        () =>
            abortPreviousRequests(() => {
                const values = getConfigMapSecretResolvedDataPayload({
                    formData,
                    inheritedConfigMapSecretData,
                    configMapSecretData,
                    draftData,
                    isSecret,
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
        [resolveScopedVariables],
        resolveScopedVariables,
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

    // CONFIGMAP/SECRET FORM INITIAL VALUES
    const formInitialValues = useMemo(() => {
        let formInitialData = configMapSecretData
        if (draftData) {
            if (draftData.action === DraftAction.Delete) {
                formInitialData = null
            } else if (draftData.draftState === DraftState.Init || draftData.draftState === DraftState.AwaitApproval) {
                formInitialData = {
                    ...draftData.parsedData.configData[0],
                    unAuthorized: !draftData.isAppAdmin,
                }
            }
        }

        return getConfigMapSecretFormInitialValues({
            configMapSecretData: formInitialData,
            componentType,
            cmSecretStateLabel,
            skipValidation: !isCreateState && !formInitialData,
            isJob,
            fallbackMergeStrategy: DEFAULT_MERGE_STRATEGY,
        })
    }, [configMapSecretData, draftData])

    // SET INITIAL FORM STATE
    useEffect(() => {
        if (formInitialValues) {
            reset(formInitialValues)
        }
    }, [formInitialValues])

    // DATA CONSTANTS
    const isError = configHasBeenDeleted || configMapSecretResErr
    const isLoading =
        configMapSecretResLoading ||
        isEnvConfigLoading ||
        (!!id && !isError && !(configMapSecretData || inheritedConfigMapSecretData || draftData))
    const isHashiOrAWS = configMapSecretData && hasHashiOrAWS(configMapSecretData.externalType)
    const hideConfigToolbar =
        (cmSecretStateLabel === CM_SECRET_STATE.INHERITED &&
            configHeaderTab === ConfigHeaderTabType.VALUES &&
            !hideNoOverrideEmptyState &&
            !draftData) ||
        isExpressEditComparisonView

    const showNoOverride = cmSecretStateLabel === CM_SECRET_STATE.INHERITED && !hideNoOverrideEmptyState && !draftData
    const isDraftAvailable = isApprovalPolicyConfigured && !!draftData

    // SET DRAFT DATA BASED STATES
    useEffect(() => {
        if (draftData) {
            setAreCommentsPresent(draftData.commentsCount > 0)
            setSelectedProtectionViewTab(
                draftData.draftState === DraftState.AwaitApproval
                    ? ProtectConfigTabsType.COMPARE
                    : ProtectConfigTabsType.EDIT_DRAFT,
            )
        }
    }, [draftData])

    // GLOBAL HANDLERS
    const unResolveScopeVariables = () => {
        setResolveScopedVariables(false)
        if (savedFormData.current) {
            reset(
                { ...savedFormData.current, mergeStrategy: formData.mergeStrategy, yamlMode: formData.yamlMode },
                { keepInitialValues: true, keepDirty: true },
            )
            savedFormData.current = null
        }
    }

    // ERROR HANDLING
    useEffect(() => {
        if (
            (!isJob &&
                (configMapSecretData?.unAuthorized ||
                    inheritedConfigMapSecretData?.unAuthorized ||
                    draftData?.unAuthorized)) ||
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

        if (configHasBeenDeleted) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: `The ${componentName} '${name}' has been deleted`,
            })
        }

        if (reloadResolvedScopeVariablesResErr) {
            unResolveScopeVariables()
        }
    }, [
        configMapSecretData,
        inheritedConfigMapSecretData,
        draftData,
        configMapSecretResErr,
        configHasBeenDeleted,
        reloadResolvedScopeVariablesResErr,
    ])

    // NO SCOPE VARIABLES PRESENT HANDLING
    useEffect(() => {
        if (
            !reloadResolvedScopeVariablesResErr &&
            resolvedScopeVariablesRes &&
            !resolvedScopeVariablesRes.areVariablesPresent
        ) {
            unResolveScopeVariables()
            ToastManager.showToast({
                title: 'Error',
                description: 'No valid variable found on this page',
                variant: ToastVariantType.error,
            })
        }
    }, [resolvedScopeVariablesRes, reloadResolvedScopeVariablesResErr])

    // SET RESOLVE VALUES IN FORM STATE
    useEffect(() => {
        if (resolveScopedVariables && resolvedFormData) {
            savedFormData.current = formData
            reset({ ...resolvedFormData, isResolvedData: true }, { keepInitialValues: true, keepDirty: true })
        }
    }, [resolveScopedVariables, resolvedFormData])

    // TAB HANDLING
    useEffect(() => {
        if (!isLoading && !configHeaderTab) {
            const hasOnlyInheritedData = !isJob && cmSecretStateLabel === CM_SECRET_STATE.INHERITED && !draftData
            updateSearchParams({
                headerTab: hasOnlyInheritedData ? ConfigHeaderTabType.INHERITED : ConfigHeaderTabType.VALUES,
            })
        }
    }, [isLoading, cmSecretStateLabel, draftData])

    const redirectURLToValidPage = () => {
        history.replace(
            generatePath(path, {
                ...params,
                appId,
                envId,
                name: envConfigData.length ? envConfigData[envConfigData.length - 1].name : null,
            }),
        )
    }

    // HANDLING REDIRECTION IN CASE OF INVALID PAGE
    useEffect(() => {
        if (!isLoading && !selectedCMSecret && !isCreateState && !isEmptyState) {
            redirectURLToValidPage()
        }
    }, [selectedCMSecret, isLoading])

    // METHODS
    const resetToInitialState = () => {
        unResolveScopeVariables()
        setHideNoOverrideEmptyState(false)
        setOpenDeleteModal(null)
        setShowDraftSaveModal(false)
        setAreCommentsPresent(false)
        setShouldMergeTemplateWithPatches(false)
        setIsExpressEditView(false)
        setIsExpressEditComparisonView(false)
        setShowExpressEditConfirmationModal(false)

        formValuesBeforeExpressEditView.current = null
    }

    const updateCMSecret = (configName?: string) => {
        // RESET STATES
        resetToInitialState()

        fetchEnvConfig(+envId || -1)

        if (isCreateState) {
            history.push(generatePath(path, { ...params, appId, envId, name: configName }))
        }
    }

    const handleActionWithFormValidation =
        <Args extends unknown[]>(func: (...args: Args) => void) =>
        async (...args: Args) => {
            if (
                configHeaderTab === ConfigHeaderTabType.VALUES &&
                (!selectedProtectionViewTab || selectedProtectionViewTab === ProtectConfigTabsType.EDIT_DRAFT) &&
                !(formData.mergeStrategy === OverrideMergeStrategyType.PATCH && !formState.isDirty)
            ) {
                await handleSubmit(
                    () => func(...args),
                    () => {
                        ToastManager.showToast({
                            variant: ToastVariantType.error,
                            description: 'Please resolve errors before continuing',
                        })
                    },
                )()
            } else {
                func(...args)
            }
        }

    const handleTabChange = (tab: ConfigHeaderTabType) => {
        updateSearchParams({ headerTab: tab })
        if (tab === ConfigHeaderTabType.DRY_RUN) {
            ReactGA.event({
                category: gaEventCategory,
                action: 'clicked-dry-run',
            })
        }
    }

    const restoreLastSavedYAML = () => {
        /*
         * This triggers a reset of the YAML to its initial state (i.e., the latest valid state). \
         * Depending on the type of ConfigMap or Secret, we set the appropriate YAML form field accordingly.
         */
        const isESO = isSecret && hasESO(formData.externalType)
        const yamlFormKey = isESO ? 'esoSecretYaml' : 'yaml'
        setValue(yamlFormKey, formInitialValues[yamlFormKey], { shouldDirty: true })
    }

    const toggleDraftComments = () => setShowComments(!showComments)

    const handleDelete = () => setOpenDeleteModal(isApprovalPolicyConfigured ? 'protectedDeleteModal' : 'deleteModal')

    const handleDeleteOverride = () => {
        handleDelete()
        ReactGA.event({
            category: gaEventCategory,
            action: 'clicked-delete-override',
        })
    }

    const handleExpressDeleteDraft = () => setOpenDeleteModal('expressDeleteDraft')

    const closeDeleteModal = () => setOpenDeleteModal(null)

    const handleOpenDiscardDraftPopup = () => setPopupNodeType(ConfigToolbarPopupNodeType.DISCARD_DRAFT)

    const handleShowEditHistory = () => setPopupNodeType(ConfigToolbarPopupNodeType.EDIT_HISTORY)

    const handleClearPopupNode = () => setPopupNodeType(null)

    const handleViewInheritedConfig = () => {
        if (isJob) {
            // Redirecting to the base config URL, since inherited tab is hidden
            history.push(baseConfigurationURL)
        } else {
            handleTabChange(ConfigHeaderTabType.INHERITED)
        }
    }

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
        const updatedResolveScopedVariables = !resolveScopedVariables

        ReactGA.event({
            category: gaEventCategory,
            action: updatedResolveScopedVariables
                ? 'clicked-resolve-scoped-variable'
                : 'clicked-unresolve-scoped-variable',
        })

        if (updatedResolveScopedVariables) {
            setResolveScopedVariables(true)
        } else {
            unResolveScopeVariables()
        }
    }

    const handleCreateOverride = () => {
        unResolveScopeVariables()
        setHideNoOverrideEmptyState(true)
        ReactGA.event({
            category: gaEventCategory,
            action: 'clicked-create-override-button',
        })
    }

    const handleNoOverrideFormCancel = () => {
        reset(formInitialValues)
        setHideNoOverrideEmptyState(false)
    }

    const handleMergeStrategyChange = (strategy: OverrideMergeStrategyType) => {
        setValue('mergeStrategy', strategy, { shouldDirty: true })

        if (
            !formState.isDirty &&
            cmSecretStateLabel === CM_SECRET_STATE.INHERITED &&
            !draftData &&
            strategy === OverrideMergeStrategyType.REPLACE
        ) {
            const { yaml, currentData } = getConfigMapSecretFormInitialValues({
                isJob,
                cmSecretStateLabel,
                componentType,
                configMapSecretData: { ...configMapSecretData, mergeStrategy: OverrideMergeStrategyType.REPLACE },
                fallbackMergeStrategy: DEFAULT_MERGE_STRATEGY,
            })
            setValue('yaml', yaml)
            setValue('currentData', currentData)
        } else if (strategy !== formData.mergeStrategy) {
            reset(
                {
                    ...(strategy === OverrideMergeStrategyType.PATCH
                        ? getConfigMapSecretFormInitialValues({
                              isJob,
                              cmSecretStateLabel,
                              componentType,
                              configMapSecretData: inheritedConfigMapSecretData,
                              fallbackMergeStrategy: DEFAULT_MERGE_STRATEGY,
                          })
                        : formInitialValues),
                    mergeStrategy: strategy,
                    yamlMode: formData.yamlMode,
                    currentData: formData.currentData,
                    yaml: formData.yaml,
                },
                { triggerDirty: true, keepInitialValues: true },
            )
        }

        ReactGA.event({
            category: gaEventCategory,
            action: 'clicked-merge-strategy-dropdown',
        })
    }

    const handleSaveChangesModalClose = () => setShowDraftSaveModal(false)

    const handleToggleShowTemplateMergedWithPatch = () => setShouldMergeTemplateWithPatches((prev) => !prev)

    const reloadSaveChangesModal = () => {
        setShowDraftSaveModal(false)
        updateCMSecret(draftPayload.configData[0].name)
        setDraftPayload(null)
    }

    // EXPRESS EDIT HANDLERS
    const handleExpressEditClick = () => {
        formValuesBeforeExpressEditView.current = savedFormData.current || formData
        unResolveScopeVariables()
        setIsExpressEditView(true)

        const expressEditFormInitialValues = getConfigMapSecretFormInitialValues({
            configMapSecretData,
            componentType,
            cmSecretStateLabel,
            isJob,
            fallbackMergeStrategy: DEFAULT_MERGE_STRATEGY,
        })

        reset(expressEditFormInitialValues, { keepInitialValues: true })
    }

    const toggleExpressEditComparisonView = () => {
        unResolveScopeVariables()
        setIsExpressEditComparisonView(!isExpressEditComparisonView)
    }

    const handleExpressEditViewClose = () => {
        unResolveScopeVariables()
        setIsExpressEditView(false)
        setIsExpressEditComparisonView(false)

        reset(formValuesBeforeExpressEditView.current, { triggerDirty: true, keepInitialValues: true })
        formValuesBeforeExpressEditView.current = null
    }

    const closeExpressEditPublishConfirmationModal = () => {
        setShowExpressEditConfirmationModal(false)
    }

    const handleError = (actionType: DraftAction, err: any, payloadData?: CMSecretPayloadType) => {
        if (err instanceof ServerErrors && Array.isArray(err.errors)) {
            err.errors.forEach((error) => {
                if (error.code === API_STATUS_CODES.LOCKED) {
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

    const onSubmit =
        (isExpressEdit = false): UseFormSubmitHandler<ConfigMapSecretUseFormProps> =>
        async (data) => {
            const payloadData = getConfigMapSecretPayload(data)

            if (isExpressEdit && isDraftAvailable && !showExpressEditConfirmationModal) {
                setShowExpressEditConfirmationModal(true)
                return
            }

            if (isApprovalPolicyConfigured && !isExpressEdit) {
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
                        isTemplateView,
                        isExpressEdit,
                    }

                    await (isSecret ? updateSecret : updateConfigMap)(updateConfigMapSecretParams)
                    toastTitle = `${payloadData.name ? 'Updated' : 'Saved'}`
                } else {
                    const overrideConfigMapSecretParams = {
                        appId: +appId,
                        envId: +envId,
                        payload: payloadData,
                        signal: abortControllerRef.current.signal,
                        isTemplateView,
                        isExpressEdit,
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

    const onError: UseFormErrorHandler<ConfigMapSecretUseFormProps> = (errors) => {
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

    const onDryRunError: UseFormErrorHandler<ConfigMapSecretUseFormProps> = (errors) => {
        const hasErrors = Object.keys(errors).some((key) => !!errors[key])
        if (hasErrors) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please resolve form errors before saving.',
            })
        }
    }

    const formSubmitHandler = handleSubmit(onSubmit(), onError)
    const dryRunSubmitHandler = handleSubmit(onSubmit(), onDryRunError)
    const expressEditSubmitHandler = handleSubmit(onSubmit(true), onDryRunError)

    // CONFIG TOOLBAR POPUP MENU
    const toolbarPopupConfig: ConfigToolbarProps['popupConfig'] = {
        menuConfig: getConfigToolbarPopupConfig({
            configHeaderTab,
            isOverridden: cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN,
            isApprovalPolicyConfigured,
            isPublishedValuesView: selectedProtectionViewTab === ProtectConfigTabsType.PUBLISHED,
            isPublishedConfigPresent: !!configMapSecretData,
            unableToParseData: !!parsingError,
            isLoading: isLoading || isSubmitting,
            isDraftAvailable,
            handleDiscardDraft: handleOpenDiscardDraftPopup,
            handleShowEditHistory,
            handleDelete,
            handleDeleteOverride,
            isDeleteDisabled: !!DISABLE_DELETE_TOOLTIP_TEXT && isDeleteDisabled,
            deleteDisabledTooltip: DISABLE_DELETE_TOOLTIP_TEXT || '',
            isDeletable:
                cmSecretStateLabel !== CM_SECRET_STATE.INHERITED &&
                cmSecretStateLabel !== CM_SECRET_STATE.UNPUBLISHED &&
                cmSecretStateLabel !== CM_SECRET_STATE.OVERRIDDEN &&
                draftData?.action !== DraftAction.Delete &&
                !isCreateState,
            isDeleteOverrideDraftPresent: draftData?.action === DraftAction.Delete,
            isExceptionUser,
            handleExpressDeleteDraft,
            isExpressEditView,
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
        isApprovalPolicyConfigured && draftData ? (
            <ConfigMapSecretProtected
                cmSecretStateLabel={cmSecretStateLabel}
                componentName={componentName}
                publishedConfigMapSecretData={resolvedConfigMapSecretData ?? configMapSecretData}
                draftData={resolvedDraftData ?? draftData}
                inheritedConfigMapSecretData={resolvedInheritedConfigMapSecretData ?? inheritedConfigMapSecretData}
                id={id}
                onSubmit={isExpressEditView ? expressEditSubmitHandler : formSubmitHandler}
                onCancel={isExpressEditView ? handleExpressEditViewClose : onCancel}
                selectedProtectionViewTab={selectedProtectionViewTab}
                updateCMSecret={updateCMSecret}
                componentType={componentType}
                isJob={isJob}
                isExpressEditView={isExpressEditView}
                isExpressEditComparisonView={isExpressEditComparisonView}
                disableDataTypeChange={isDeleteDisabled}
                parentName={parentName}
                areScopeVariablesResolving={resolvedScopeVariablesResLoading}
                appChartRef={appChartRef}
                shouldMergeTemplateWithPatches={shouldMergeTemplateWithPatches}
                handleMergeStrategyChange={handleMergeStrategyChange}
                useFormProps={useFormProps}
            />
        ) : (
            <ConfigMapSecretForm
                isCreateView={isNullOrUndefined(id)}
                cmSecretStateLabel={cmSecretStateLabel}
                componentType={componentType}
                configMapSecretData={configMapSecretData}
                inheritedConfigMapSecretData={inheritedConfigMapSecretData}
                publishedConfigMapSecretData={configMapSecretData}
                draftData={null}
                isJob={isJob}
                isApprovalPolicyConfigured={false}
                isExpressEditView={isExpressEditView}
                isExpressEditComparisonView={isExpressEditComparisonView}
                isSubmitting={isSubmitting}
                disableDataTypeChange={isDeleteDisabled}
                onSubmit={isExpressEditView ? expressEditSubmitHandler : formSubmitHandler}
                onCancel={isExpressEditView ? handleExpressEditViewClose : onCancel}
                areScopeVariablesResolving={resolvedScopeVariablesResLoading}
                appChartRef={appChartRef}
                handleMergeStrategyChange={handleMergeStrategyChange}
                useFormProps={useFormProps}
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
                        cmSecretStateLabel={CM_SECRET_STATE.BASE}
                        isJob={isJob}
                        configMapSecretData={resolvedInheritedConfigMapSecretData ?? inheritedConfigMapSecretData}
                        areScopeVariablesResolving={resolvedScopeVariablesResLoading}
                        fallbackMergeStrategy={DEFAULT_MERGE_STRATEGY}
                    />
                )
            case ConfigHeaderTabType.DRY_RUN:
                return (
                    <ConfigMapSecretDryRun
                        id={id}
                        isJob={isJob}
                        componentType={componentType}
                        componentName={componentName}
                        cmSecretStateLabel={cmSecretStateLabel}
                        isApprovalPolicyConfigured={isApprovalPolicyConfigured}
                        publishedConfigMapSecretData={resolvedConfigMapSecretData ?? configMapSecretData}
                        draftData={resolvedDraftData ?? draftData}
                        inheritedConfigMapSecretData={
                            resolvedInheritedConfigMapSecretData ?? inheritedConfigMapSecretData
                        }
                        areScopeVariablesResolving={resolvedScopeVariablesResLoading}
                        resolveScopedVariables={resolveScopedVariables}
                        handleToggleScopedVariablesView={handleToggleScopedVariablesView}
                        dryRunEditorMode={dryRunEditorMode}
                        handleChangeDryRunEditorMode={setDryRunEditorMode}
                        showCrudButtons={!showNoOverride}
                        isSubmitting={isSubmitting}
                        onSubmit={dryRunSubmitHandler}
                        parentName={parentName}
                        updateCMSecret={updateCMSecret}
                        formData={resolvedFormData ?? formData}
                        isFormDirty={formState.isDirty}
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
            isTemplateView={isTemplateView}
            isExceptionUser={isExceptionUser}
        />
    )

    const renderContent = () => {
        if (isEmptyState) {
            return <ConfigMapSecretNullState nullStateType="NO_CM_CS" componentType={componentType} />
        }

        if (isLoading) {
            return <Progressing fullHeight pageLoader />
        }

        if (isError) {
            return (
                <ErrorScreenManager
                    code={configHasBeenDeleted ? ERROR_STATUS_CODE.NOT_FOUND : configMapSecretResErr?.code}
                    redirectURL={onErrorRedirectURL}
                    reload={reloadConfigMapSecret}
                />
            )
        }

        return (
            <div className="flexbox-col h-100">
                {!isExpressEditView ? (
                    <ConfigHeader
                        configHeaderTab={configHeaderTab}
                        handleTabChange={handleActionWithFormValidation(handleTabChange)}
                        isDisabled={isLoading}
                        areChangesPresent={formState.isDirty}
                        isOverridable={
                            cmSecretStateLabel === CM_SECRET_STATE.INHERITED ||
                            cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN
                        }
                        showNoOverride={showNoOverride}
                        parsingError={parsingError}
                        restoreLastSavedYAML={restoreLastSavedYAML}
                        hideTabs={{ inherited: isJob, dryRun: isJob || isTemplateView }}
                    />
                ) : (
                    ExpressEditHeader && (
                        <ExpressEditHeader
                            isComparisonView={isExpressEditComparisonView}
                            toggleComparison={toggleExpressEditComparisonView}
                            handleClose={handleExpressEditViewClose}
                        />
                    )
                )}
                {!hideConfigToolbar && (
                    <ConfigToolbar
                        configHeaderTab={configHeaderTab}
                        mergeStrategy={
                            selectedProtectionViewTab === ProtectConfigTabsType.PUBLISHED
                                ? configMapSecretData?.mergeStrategy
                                : formData.mergeStrategy
                        }
                        handleMergeStrategyChange={handleMergeStrategyChange}
                        userApprovalMetadata={draftData?.userApprovalMetadata}
                        isApprovalPolicyConfigured={isApprovalPolicyConfigured}
                        hidePatchOption={isJob || formData.external}
                        isMergeStrategySelectorDisabled={resolveScopedVariables}
                        areCommentsPresent={areCommentsPresent}
                        disableAllActions={isLoading || isSubmitting || !!parsingError}
                        isDraftPresent={isDraftAvailable}
                        isPublishedConfigPresent={cmSecretStateLabel !== CM_SECRET_STATE.UNPUBLISHED}
                        isApprovalPending={draftData?.draftState === DraftState.AwaitApproval}
                        showDeleteOverrideDraftEmptyState={
                            isCreateState ||
                            (draftData?.action === DraftAction.Delete &&
                                configHeaderTab === ConfigHeaderTabType.VALUES &&
                                selectedProtectionViewTab === ProtectConfigTabsType.EDIT_DRAFT)
                        }
                        showMergePatchesButton={
                            configMapSecretData?.mergeStrategy === OverrideMergeStrategyType.PATCH ||
                            draftData?.parsedData?.configData?.[0]?.mergeStrategy === OverrideMergeStrategyType.PATCH ||
                            formData.mergeStrategy === OverrideMergeStrategyType.PATCH
                        }
                        baseConfigurationURL={baseConfigurationURL}
                        headerMessage={headerMessage}
                        selectedProtectionViewTab={selectedProtectionViewTab}
                        handleProtectionViewTabChange={handleActionWithFormValidation(handleProtectionViewTabChange)}
                        handleToggleCommentsView={toggleDraftComments}
                        resolveScopedVariables={resolveScopedVariables}
                        handleToggleScopedVariablesView={handleToggleScopedVariablesView}
                        popupConfig={toolbarPopupConfig}
                        handleToggleShowTemplateMergedWithPatch={handleToggleShowTemplateMergedWithPatch}
                        shouldMergeTemplateWithPatches={shouldMergeTemplateWithPatches}
                        parsingError={parsingError}
                        restoreLastSavedYAML={restoreLastSavedYAML}
                        draftId={draftData?.draftId}
                        draftVersionId={draftData?.draftVersionId}
                        handleReload={updateCMSecret}
                        requestedUserId={draftData?.requestedUserId}
                        isExpressEditView={isExpressEditView}
                        isExceptionUser={isExceptionUser}
                        expressEditButtonConfig={{
                            showPromptTooltip: showPrompt && formState.isDirty,
                            onClick: handleExpressEditClick,
                            onClose: closePromptTooltip,
                            onDoNotShowAgainClose: permanentClosePromptTooltip,
                        }}
                    />
                )}
                {renderConfigHeaderTabContent()}
            </div>
        )
    }

    return (
        <>
            <Prompt when={shouldPrompt} message={checkIfPathIsMatching(location.pathname)} />
            <div className="configmap-secret-container flexbox w-100 dc__content-space h-100 dc__position-rel">
                <div className="p-8 flexbox flex-grow-1">
                    <div className="dc__border br-4 dc__overflow-hidden h-100 bg__primary flex-grow-1">
                        {renderContent()}
                    </div>
                </div>
                {renderDeleteModal()}
                {SaveChangesModal && showDraftSaveModal && (
                    <SaveChangesModal
                        appId={+appId}
                        envId={envId ? +envId : -1}
                        envName={envName}
                        resourceType={componentType}
                        resourceName={draftPayload.configData[0].name}
                        prepareDataToSave={() => draftPayload}
                        handleClose={handleSaveChangesModalClose}
                        latestDraft={draftData}
                        reload={reloadSaveChangesModal}
                        showAsModal
                        isCreate={isCreateState}
                        showExpressCreate={isExceptionUser && isCreateState}
                        expressCreateConfig={{
                            isLoading: isSubmitting,
                            onClick: expressEditSubmitHandler,
                        }}
                    />
                )}
                {ExpressEditConfirmationModal && showExpressEditConfirmationModal && (
                    <ExpressEditConfirmationModal
                        handleClose={closeExpressEditPublishConfirmationModal}
                        handleSave={expressEditSubmitHandler}
                        isLoading={isSubmitting}
                    />
                )}
                {DraftComments && showComments && draftData && (
                    <DraftComments
                        draftId={draftData.draftId}
                        draftVersionId={draftData.draftVersionId}
                        toggleDraftComments={toggleDraftComments}
                        handleUpdateAreCommentsPresent={setAreCommentsPresent}
                    />
                )}
                {window._env_.ENABLE_SCOPED_VARIABLES && (
                    <div className="app-config-variable-widget-position">
                        <FloatingVariablesSuggestions
                            zIndex={100}
                            appId={appId}
                            envId={envId}
                            clusterId={clusterId}
                            isTemplateView={isTemplateView}
                        />
                    </div>
                )}
            </div>
        </>
    )
}
