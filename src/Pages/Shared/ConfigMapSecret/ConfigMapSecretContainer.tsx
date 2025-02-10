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
    URLS as CommonURLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'
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
    const baseConfigurationURL = `${isJob ? URLS.JOB : URLS.APP}/${appId}/${CommonURLS.APP_CONFIG}/${isSecret ? URLS.APP_CS_CONFIG : URLS.APP_CM_CONFIG}/${name}`
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
        cmSecretStateLabel === CM_SECRET_STATE.INHERITED &&
        configHeaderTab === ConfigHeaderTabType.VALUES &&
        !hideNoOverrideEmptyState &&
        !draftData
    const showNoOverride = cmSecretStateLabel === CM_SECRET_STATE.INHERITED && !hideNoOverrideEmptyState && !draftData

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
            setResolveScopedVariables(false)
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
            setResolveScopedVariables(false)
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
        } else if (savedFormData.current) {
            reset(
                { ...savedFormData.current, mergeStrategy: formData.mergeStrategy, yamlMode: formData.yamlMode },
                { keepInitialValues: true, keepDirty: true },
            )
            savedFormData.current = null
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
    const updateCMSecret = (configName?: string) => {
        setResolveScopedVariables(false)
        setHideNoOverrideEmptyState(false)
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
        ReactGA.event({
            category: gaEventCategory,
            action: resolveScopedVariables ? 'clicked-unresolve-scoped-variable' : 'clicked-resolve-scoped-variable',
        })
        setResolveScopedVariables(!resolveScopedVariables)
    }

    const handleCreateOverride = () => {
        setResolveScopedVariables(false)
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
        setValue('mergeStrategy', strategy)

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

    const toggleSaveChangesModal = () => setShowDraftSaveModal(false)

    const handleToggleShowTemplateMergedWithPatch = () => setShouldMergeTemplateWithPatches((prev) => !prev)

    const reloadSaveChangesModal = () => {
        setShowDraftSaveModal(false)
        updateCMSecret(draftPayload.configData[0].name)
        setDraftPayload(null)
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

    const onSubmit: UseFormSubmitHandler<ConfigMapSecretUseFormProps> = async (data) => {
        const payloadData = getConfigMapSecretPayload(data)

        if (isApprovalPolicyConfigured) {
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

    const formSubmitHandler = handleSubmit(onSubmit, onError)
    const dryRunSubmitHandler = handleSubmit(onSubmit, onDryRunError)

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
            isDraftAvailable: !!draftData,
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
                onSubmit={formSubmitHandler}
                selectedProtectionViewTab={selectedProtectionViewTab}
                updateCMSecret={updateCMSecret}
                componentType={componentType}
                isJob={isJob}
                disableDataTypeChange={isDeleteDisabled}
                parentName={parentName}
                areScopeVariablesResolving={resolvedScopeVariablesResLoading}
                appChartRef={appChartRef}
                shouldMergeTemplateWithPatches={shouldMergeTemplateWithPatches}
                useFormProps={useFormProps}
            />
        ) : (
            <ConfigMapSecretForm
                isCreateView={isNullOrUndefined(id)}
                cmSecretStateLabel={cmSecretStateLabel}
                componentType={componentType}
                configMapSecretData={configMapSecretData}
                inheritedConfigMapSecretData={inheritedConfigMapSecretData}
                isJob={isJob}
                isApprovalPolicyConfigured={isApprovalPolicyConfigured}
                isSubmitting={isSubmitting}
                disableDataTypeChange={isDeleteDisabled}
                onSubmit={formSubmitHandler}
                onCancel={onCancel}
                areScopeVariablesResolving={resolvedScopeVariablesResLoading}
                appChartRef={appChartRef}
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
                    hideTabs={{ inherited: isJob, dryRun: isJob }}
                />
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
                        isDraftPresent={!!draftData}
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
                    />
                )}
                {renderConfigHeaderTabContent()}
            </div>
        )
    }

    return (
        <>
            <Prompt when={shouldPrompt} message={checkIfPathIsMatching(location.pathname)} />
            <div
                className={`configmap-secret-container p-8 h-100 dc__position-rel ${showComments ? 'with-comment-drawer' : ''}`}
            >
                <div className="dc__border br-4 dc__overflow-hidden h-100 bg__primary">{renderContent()}</div>
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
                        handleUpdateAreCommentsPresent={setAreCommentsPresent}
                    />
                )}
                {window._env_.ENABLE_SCOPED_VARIABLES && (
                    <div className="app-config-variable-widget-position">
                        <FloatingVariablesSuggestions zIndex={100} appId={appId} envId={envId} clusterId={clusterId} />
                    </div>
                )}
            </div>
        </>
    )
}
