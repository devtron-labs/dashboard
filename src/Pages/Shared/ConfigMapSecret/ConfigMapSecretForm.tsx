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

import React, { useEffect, useReducer, useRef } from 'react'

import { Prompt, useParams } from 'react-router-dom'
import ReactSelect from 'react-select'

import {
    showError,
    ConfirmationDialog,
    Checkbox,
    CHECKBOX_VALUE,
    stopPropagation,
    InfoColourBar,
    RadioGroup,
    RadioGroupItem,
    ServerErrors,
    CustomInput,
    usePrompt,
    ButtonWithLoader,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import warningIcon from '@Images/warning-medium.svg'
import { ReactComponent as InfoIcon } from '@Icons/info-filled.svg'
import { DOCUMENTATION, PATTERNS, ROLLOUT_DEPLOYMENT, UNSAVED_CHANGES_PROMPT_MESSAGE } from '@Config/index'
import {
    isVersionLessThanOrEqualToTarget,
    isChartRef3090OrBelow,
    importComponentFromFELibrary,
} from '@Components/common'
import { INVALID_YAML_MSG } from '@Config/constantMessaging'
import { ValidationRules } from '@Components/cdPipeline/validationRules'
import { groupStyle, Option } from '@Components/v2/common/ReactSelect.utils'

import {
    overRideConfigMap,
    overRideSecret,
    updateConfig,
    deleteEnvSecret,
    deleteEnvConfigMap,
    updateSecret,
    deleteSecret,
    deleteConfig,
} from './ConfigMapSecret.service'
import { Override, validateKeyValuePair } from './ConfigMapSecret.components'
import {
    ConfigMapActionTypes,
    ConfigMapSecretFormProps,
    KeyValueValidated,
    CMSecretComponentType,
    CMSecretYamlData,
} from './ConfigMapSecret.types'
import { ConfigMapSecretReducer, initState } from './ConfigMapSecret.reducer'
import {
    SecretOptions,
    getTypeGroups,
    GroupHeading,
    ConfigMapOptions,
    hasHashiOrAWS,
    hasESO,
    prepareSecretOverrideData,
    secretValidationInfoToast,
    CODE_EDITOR_RADIO_STATE,
    ExternalSecretHelpNote,
} from './Secret.utils'
import {
    CM_SECRET_COMPONENT_NAME,
    CM_SECRET_STATE,
    ConfigMapSecretUsageMap,
    EXTERNAL_INFO_TEXT,
} from './ConfigMapSecret.constants'
import { ConfigMapSecretDataEditorContainer } from './ConfigMapSecretDataEditor.container'

import '@Pages/Shared/EnvironmentOverride/environmentOverride.scss'
import './ConfigMapSecret.scss'

const SaveChangesModal = importComponentFromFELibrary('SaveChangesModal')
const DeleteOverrideDraftModal = importComponentFromFELibrary('DeleteOverrideDraftModal')

export const ConfigMapSecretForm = React.memo(
    ({
        appChartRef,
        configMapSecretData,
        id,
        componentType,
        cmSecretStateLabel,
        isJob,
        readonlyView,
        isProtectedView,
        draftMode,
        latestDraftData,
        reloadEnvironments,
        isAppAdmin,
        updateCMSecret,
        onCancel,
    }: ConfigMapSecretFormProps): JSX.Element => {
        const memoizedReducer = React.useCallback(ConfigMapSecretReducer, [])
        const tempArr = useRef<CMSecretYamlData[]>([])
        const [state, dispatch] = useReducer(
            memoizedReducer,
            initState(configMapSecretData, componentType, cmSecretStateLabel),
        )
        const { appId, envId } = useParams<{ appId; envId }>()

        const isChartVersion309OrBelow =
            appChartRef &&
            appChartRef.name === ROLLOUT_DEPLOYMENT &&
            isVersionLessThanOrEqualToTarget(appChartRef.version, [3, 9]) &&
            isChartRef3090OrBelow(appChartRef.id)

        const isHashiOrAWS = componentType === CMSecretComponentType.Secret && hasHashiOrAWS(state.externalType)
        const isESO = componentType === CMSecretComponentType.Secret && hasESO(state.externalType)
        const configMapSecretAbortRef = useRef(null)
        useEffect(() => {
            if (isESO && !state.yamlMode) {
                dispatch({
                    type: ConfigMapActionTypes.toggleYamlMode,
                })
            }
        }, [isESO, state.yamlMode])

        useEffect(() => {
            dispatch({
                type: ConfigMapActionTypes.reInit,
                payload: initState(configMapSecretData, componentType, cmSecretStateLabel),
            })

            return () => {
                tempArr.current = []
            }
        }, [configMapSecretData])

        const setTempArr = (arr: CMSecretYamlData[]) => {
            tempArr.current = arr
        }

        useEffect(() => {
            configMapSecretAbortRef.current = new AbortController()

            return () => {
                configMapSecretAbortRef.current.abort()
            }
        }, [envId])

        usePrompt({
            shouldPrompt: state.isFormDirty,
        })

        const handleOverride = async (e) => {
            e.preventDefault()
            if (state.cmSecretState === CM_SECRET_STATE.OVERRIDDEN) {
                if (configMapSecretData.overridden) {
                    if (isProtectedView) {
                        dispatch({ type: ConfigMapActionTypes.toggleProtectedDeleteOverrideModal })
                    } else {
                        dispatch({ type: ConfigMapActionTypes.toggleDialog })
                    }
                } else {
                    dispatch({
                        type: ConfigMapActionTypes.reInit,
                        payload: initState(configMapSecretData, componentType, cmSecretStateLabel),
                    })
                    updateCMSecret()
                }
            } else if (componentType === CMSecretComponentType.Secret) {
                await prepareSecretOverrideData(configMapSecretData, dispatch)
            } else {
                dispatch({
                    type: ConfigMapActionTypes.multipleOptions,
                    payload: {
                        cmSecretState: CM_SECRET_STATE.OVERRIDDEN,
                    },
                })
            }
        }

        const validateFilePermission = (): boolean => {
            let isFilePermissionValid = true
            if (!state.filePermission.value) {
                dispatch({
                    type: ConfigMapActionTypes.setFilePermission,
                    payload: { value: state.filePermission.value, error: 'This is a required field' },
                })
                isFilePermissionValid = false
            } else if (state.filePermission.value.length > 4) {
                dispatch({
                    type: ConfigMapActionTypes.setFilePermission,
                    payload: {
                        value: state.filePermission.value,
                        error: 'More than 4 characters are not allowed',
                    },
                })
                isFilePermissionValid = false
            } else if (state.filePermission.value.length === 4) {
                if (!state.filePermission.value.startsWith('0')) {
                    dispatch({
                        type: ConfigMapActionTypes.setFilePermission,
                        payload: {
                            value: state.filePermission.value,
                            error: '4 characters are allowed in octal format only, first character should be 0',
                        },
                    })
                    isFilePermissionValid = false
                }
            } else if (state.filePermission.value.length < 3) {
                dispatch({
                    type: ConfigMapActionTypes.setFilePermission,
                    payload: { value: state.filePermission.value, error: 'Atleast 3 character are required' },
                })
                isFilePermissionValid = false
            }
            if (!new RegExp(PATTERNS.ALL_DIGITS_BETWEEN_0_AND_7).test(state.filePermission.value)) {
                dispatch({
                    type: ConfigMapActionTypes.setFilePermission,
                    payload: {
                        value: state.filePermission.value,
                        error: 'This is octal number, use numbers between 0 to 7',
                    },
                })
                isFilePermissionValid = false
            }
            return isFilePermissionValid
        }

        const validateForm = (): KeyValueValidated => {
            const rules = new ValidationRules()
            const configMapSecretNameRegex = new RegExp(PATTERNS.CONFIGMAP_AND_SECRET_NAME)
            let isFormValid = true
            if (componentType === CMSecretComponentType.Secret && state.unAuthorized) {
                ToastManager.showToast({
                    variant: ToastVariantType.warn,
                    title: 'View-only access',
                    description: "You won't be able to make any changes",
                })
                return { isValid: false, arr: [] }
            }
            if (!state.configName.value) {
                dispatch({
                    type: ConfigMapActionTypes.setConfigName,
                    payload: { value: state.configName.value, error: 'This is a required field' },
                })
                isFormValid = false
            } else if (state.configName.value.length > 253) {
                dispatch({
                    type: ConfigMapActionTypes.setConfigName,
                    payload: { value: state.configName.value, error: 'More than 253 characters are not allowed' },
                })
                isFormValid = false
            } else if (!configMapSecretNameRegex.test(state.configName.value)) {
                dispatch({
                    type: ConfigMapActionTypes.setConfigName,
                    payload: {
                        value: state.configName.value,
                        error: `Name must start and end with an alphanumeric character. It can contain only lowercase alphanumeric characters, '-' or '.'`,
                    },
                })
                isFormValid = false
            }
            if (state.selectedType === 'volume') {
                if (!state.volumeMountPath.value) {
                    dispatch({
                        type: ConfigMapActionTypes.setVolumeMountPath,
                        payload: { value: state.volumeMountPath.value, error: 'This is a required field' },
                    })
                    isFormValid = false
                } else if (!rules.cmVolumeMountPath(state.volumeMountPath.value).isValid) {
                    dispatch({
                        type: ConfigMapActionTypes.setVolumeMountPath,
                        payload: {
                            value: state.volumeMountPath.value,
                            error: rules.cmVolumeMountPath(state.volumeMountPath.value).message,
                        },
                    })
                    isFormValid = false
                }

                if (state.isFilePermissionChecked && !isChartVersion309OrBelow) {
                    const isFilePermissionValid = validateFilePermission()
                    if (!isFilePermissionValid) {
                        isFormValid = isFilePermissionValid
                    }
                }
                if (
                    state.isSubPathChecked &&
                    ((componentType === CMSecretComponentType.Secret && state.externalType === 'KubernetesSecret') ||
                        (componentType !== CMSecretComponentType.Secret && state.external))
                ) {
                    if (!state.externalSubpathValues.value) {
                        dispatch({
                            type: ConfigMapActionTypes.setExternalSubpathValues,
                            payload: { value: state.externalSubpathValues.value, error: 'This is a required field' },
                        })
                        isFormValid = false
                    } else if (
                        !new RegExp(PATTERNS.CONFIG_MAP_AND_SECRET_MULTPLS_KEYS).test(state.externalSubpathValues.value)
                    ) {
                        dispatch({
                            type: ConfigMapActionTypes.setExternalSubpathValues,
                            payload: {
                                value: state.externalSubpathValues.value,
                                error: 'Use (a-z), (0-9), (-), (_),(.); Use (,) to separate multiple keys',
                            },
                        })
                        isFormValid = false
                    }
                }
            }
            const hasSecretCode =
                componentType === CMSecretComponentType.Secret && tempArr.current.some((data) => data.v === '********')
            const dataArray = state.yamlMode && !hasSecretCode ? tempArr.current : state.currentData
            const { isValid, arr } = validateKeyValuePair(dataArray)
            if (!isValid) {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: INVALID_YAML_MSG,
                })
                dispatch({
                    type: ConfigMapActionTypes.updateCurrentData,
                    payload: arr,
                })
                isFormValid = false
            }

            if (dataArray.length === 0 && (!state.external || state.externalType === '')) {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: `Please add ${CM_SECRET_COMPONENT_NAME[componentType]} data before saving.`,
                })
                isFormValid = false
            } else if (componentType === CMSecretComponentType.Secret && (isHashiOrAWS || isESO)) {
                let isValidSecretData = false
                if (isESO) {
                    isValidSecretData = state.esoData?.reduce(
                        (_isValidSecretData, s) => {
                            isValidSecretData = _isValidSecretData && !!s?.secretKey && !!s.key
                            return isValidSecretData
                        },
                        !state.secretStore !== !state.secretStoreRef && !!state.esoData?.length,
                    )
                } else {
                    isValidSecretData = state.secretData.reduce((_isValidSecretData, s) => {
                        isValidSecretData = _isValidSecretData && !!s.fileName && !!s.name
                        return isValidSecretData
                    }, !!state.secretData.length)
                }

                if (!isValidSecretData) {
                    secretValidationInfoToast(isESO, state.secretStore, state.secretStoreRef)
                    isFormValid = false
                }
            }
            return { isValid: isFormValid, arr }
        }

        const createPayload = (arr) => {
            const data = arr.reduce((acc, curr) => {
                if (!curr.k) {
                    return acc
                }
                const value = curr.v ?? ''

                return {
                    ...acc,
                    [curr.k]:
                        componentType === CMSecretComponentType.Secret && state.externalType === ''
                            ? btoa(value)
                            : value,
                }
            }, {})
            const payload = {
                name: state.configName.value,
                type: state.selectedType,
                external: state.external,
                data, // dataArray.reduce((agg, { k, v }) => ({ ...agg, [k]: v ?? '' }), {}),
                roleARN: null,
                externalType: null,
                secretData: null,
                esoSecretData: null,
                mountPath: null,
                subPath: null,
                filePermission: null,
            }
            if (
                (componentType === CMSecretComponentType.Secret && state.externalType === 'KubernetesSecret') ||
                (componentType !== CMSecretComponentType.Secret && state.external) ||
                (componentType === CMSecretComponentType.Secret && isESO)
            ) {
                delete payload[CODE_EDITOR_RADIO_STATE.DATA]
            }
            if (componentType === CMSecretComponentType.Secret) {
                payload.roleARN = ''
                payload.externalType = state.externalType
                if (isHashiOrAWS) {
                    payload.secretData = state.secretData.map((s) => ({
                        key: s.fileName,
                        name: s.name,
                        isBinary: s.isBinary,
                        property: s.property,
                    }))
                    payload.secretData = payload.secretData.filter((s) => s.key || s.name || s.property)
                    payload.roleARN = state.roleARN.value
                } else if (isESO) {
                    payload.esoSecretData = {
                        secretStore: state.secretStore,
                        esoData: state.esoData,
                        secretStoreRef: state.secretStoreRef,
                        refreshInterval: state.refreshInterval,
                    }
                    payload.roleARN = state.roleARN.value
                }
            }
            if (state.selectedType === 'volume') {
                payload.mountPath = state.volumeMountPath.value
                if (!isChartVersion309OrBelow) {
                    payload.subPath = state.isSubPathChecked
                }
                if (state.isFilePermissionChecked && !isChartVersion309OrBelow) {
                    payload.filePermission =
                        state.filePermission.value.length === 3
                            ? `0${state.filePermission.value}`
                            : `${state.filePermission.value}`
                }

                if (
                    state.isSubPathChecked &&
                    ((componentType === CMSecretComponentType.Secret && state.externalType === 'KubernetesSecret') ||
                        (componentType !== CMSecretComponentType.Secret && state.external))
                ) {
                    const externalSubpathKey = state.externalSubpathValues.value.replace(/\s+/g, '').split(',')
                    const secretKeys = {}
                    externalSubpathKey.forEach((key) => {
                        secretKeys[key] = ''
                    })
                    payload.data = secretKeys
                }
            }
            return payload
        }

        const preparePayload = () => state.draftPayload

        const handleError = (actionType, err, payloadData?) => {
            if (err instanceof ServerErrors && Array.isArray(err.errors)) {
                err.errors.forEach((error) => {
                    if (error.code === 423) {
                        if (actionType === 3 && state.dialog) {
                            dispatch({ type: ConfigMapActionTypes.toggleProtectedDeleteOverrideModal })
                        } else {
                            const _draftPayload = {
                                id: id ?? 0,
                                appId: +appId,
                                configData: [payloadData],
                                environmentId: null,
                            }
                            if (envId) {
                                _draftPayload.environmentId = +envId
                            }
                            dispatch({
                                type: ConfigMapActionTypes.multipleOptions,
                                payload: {
                                    showDraftSaveModal: true,
                                    draftPayload: _draftPayload,
                                },
                            })
                        }
                        reloadEnvironments()
                    }
                })
            }
            showError(err)
            dispatch({ type: ConfigMapActionTypes.error })
        }

        const handleSubmit = async (e) => {
            e.preventDefault()
            const { isValid, arr } = validateForm()
            if (!isValid) {
                return
            }
            const payloadData = createPayload(arr)
            try {
                if (isProtectedView) {
                    const _draftPayload = {
                        id: id ?? 0,
                        appId: +appId,
                        configData: [payloadData],
                        environmentId: null,
                    }
                    if (envId) {
                        _draftPayload.environmentId = +envId
                    }
                    dispatch({
                        type: ConfigMapActionTypes.multipleOptions,
                        payload: {
                            showDraftSaveModal: true,
                            draftPayload: _draftPayload,
                        },
                    })
                } else {
                    dispatch({ type: ConfigMapActionTypes.submitLoading })
                    let toastTitle = ''
                    if (!envId) {
                        if (componentType === CMSecretComponentType.Secret) {
                            await updateSecret(id, +appId, payloadData, configMapSecretAbortRef.current.signal)
                        } else {
                            await updateConfig(id, +appId, payloadData, configMapSecretAbortRef.current.signal)
                        }
                        toastTitle = `${payloadData.name ? 'Updated' : 'Saved'}`
                    } else {
                        if (componentType === CMSecretComponentType.Secret) {
                            await overRideSecret(+appId, +envId, [payloadData], configMapSecretAbortRef.current.signal)
                        } else {
                            await overRideConfigMap(
                                +appId,
                                +envId,
                                [payloadData],
                                configMapSecretAbortRef.current.signal,
                            )
                        }
                        toastTitle = 'Overridden'
                    }
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        title: toastTitle,
                        description: 'Changes will be reflected after next deployment.',
                    })
                    dispatch({ type: ConfigMapActionTypes.success })

                    if (!configMapSecretAbortRef.current.signal.aborted) {
                        updateCMSecret(payloadData.name)
                    }
                }
            } catch (err) {
                if (!configMapSecretAbortRef.current.signal.aborted) {
                    handleError(2, err, payloadData)
                }
            }
        }

        // Handle Delete for DeleteOverrideModal
        const handleDelete = async () => {
            try {
                if (draftMode) {
                    // :TODO Add the draft node delete after verification
                } else if (!envId) {
                    if (componentType === CMSecretComponentType.Secret) {
                        await deleteSecret(id, appId, configMapSecretData?.name)
                    } else {
                        await deleteConfig(id, appId, configMapSecretData?.name)
                    }
                } else if (componentType === CMSecretComponentType.Secret) {
                    await deleteEnvSecret(id, appId, +envId, configMapSecretData?.name)
                } else {
                    await deleteEnvConfigMap(id, appId, envId, configMapSecretData?.name)
                }

                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Restored to global.',
                })
                dispatch({
                    type: ConfigMapActionTypes.multipleOptions,
                    payload: {
                        dialog: false,
                        submitLoading: false,
                        overrideLoading: false,
                    },
                })

                updateCMSecret()
            } catch (err) {
                handleError(3, err)
            }
        }

        const toggleExternalValues = (selectedExternalType): void => {
            dispatch({ type: ConfigMapActionTypes.setExternal, payload: selectedExternalType.value !== '' })
        }

        const toggleExternalType = (selectedExternalType): void => {
            dispatch({
                type: ConfigMapActionTypes.multipleOptions,
                payload: {
                    external: selectedExternalType.value !== '',
                    externalType: selectedExternalType.value,
                    isFormDirty: !!state.configName.value,
                },
            })
        }

        const toggleSelectedType = (e): void => {
            dispatch({ type: ConfigMapActionTypes.setSelectedType, payload: e.target.value })
        }

        const onMountPathChange = (e): void => {
            dispatch({ type: ConfigMapActionTypes.setVolumeMountPath, payload: { value: e.target.value, error: '' } })
        }

        const toggleSubpath = (): void => {
            dispatch({ type: ConfigMapActionTypes.setIsSubPathChecked })
        }

        const onExternalSubpathValuesChange = (e): void => {
            dispatch({
                type: ConfigMapActionTypes.setExternalSubpathValues,
                payload: { value: e.target.value, error: '' },
            })
        }

        const toggleFilePermission = (): void => {
            dispatch({ type: ConfigMapActionTypes.setIsFilePermissionChecked })
        }

        const onFilePermissionChange = (e): void => {
            dispatch({ type: ConfigMapActionTypes.setFilePermission, payload: { value: e.target.value, error: '' } })
        }

        const onConfigNameChange = (e): void => {
            dispatch({ type: ConfigMapActionTypes.setConfigName, payload: { value: e.target.value, error: '' } })
        }

        const handleRoleARNChange = (e): void => {
            dispatch({ type: ConfigMapActionTypes.setRoleARN, payload: { value: e.target.value, error: '' } })
        }

        const submitButtonText = (): string =>
            `Save${configMapSecretData?.name ? ' changes' : ''}${isProtectedView ? '...' : ''}`

        const closeProtectedDeleteOverrideModal = (): void => {
            dispatch({ type: ConfigMapActionTypes.toggleProtectedDeleteOverrideModal })
        }

        const toggleDraftSaveModal = (): void => {
            if (state.showDraftSaveModal) {
                dispatch({
                    type: ConfigMapActionTypes.multipleOptions,
                    payload: { showDraftSaveModal: false, submitLoading: false },
                })
            } else {
                dispatch({ type: ConfigMapActionTypes.toggleDraftSaveModal })
            }
        }

        const renderDeleteOverRideModal = (): JSX.Element => (
            <ConfirmationDialog className="confirmation-dialog__body--w-400">
                <ConfirmationDialog.Icon src={warningIcon} />
                <ConfirmationDialog.Body
                    title="Delete override ?"
                    subtitle="Are you sure you want to delete the modified configuration. This action can’t be undone."
                />
                <ConfirmationDialog.ButtonGroup>
                    <button
                        type="button"
                        className="cta cancel h-32 lh-20-imp p-6-12-imp"
                        onClick={() => dispatch({ type: ConfigMapActionTypes.toggleDialog })}
                    >
                        Cancel
                    </button>
                    <button type="button" className="cta delete h-32 lh-20-imp p-6-12-imp" onClick={handleDelete}>
                        Confirm
                    </button>
                </ConfirmationDialog.ButtonGroup>
            </ConfirmationDialog>
        )

        const prepareDataToDeleteOverrideDraft = () => ({ id })

        const renderProtectedDeleteOverRideModal = (): JSX.Element => {
            if (DeleteOverrideDraftModal) {
                return (
                    <DeleteOverrideDraftModal
                        appId={+appId}
                        envId={envId ? +envId : -1}
                        resourceType={componentType}
                        resourceName={state.configName.value}
                        prepareDataToSave={prepareDataToDeleteOverrideDraft}
                        toggleModal={closeProtectedDeleteOverrideModal}
                        latestDraft={latestDraftData}
                        reload={updateCMSecret}
                    />
                )
            }
            return null
        }

        const trimConfigMapName = (): void => {
            dispatch({
                type: ConfigMapActionTypes.setConfigName,
                payload: { ...state.configName, value: state.configName.value.trim() },
            })
        }
        const renderRollARN = (): JSX.Element => {
            if (isHashiOrAWS || isESO) {
                return (
                    <div className="form__row form__row--flex">
                        <div className="w-50">
                            <CustomInput
                                name="roleARN"
                                dataTestid="enter-role-ARN"
                                value={state.roleARN.value}
                                autoComplete="off"
                                label="Role ARN"
                                placeholder="Enter Role ARN"
                                error={state.roleARN.error}
                                onChange={handleRoleARNChange}
                                disabled={
                                    !draftMode && (state.cmSecretState === CM_SECRET_STATE.INHERITED || readonlyView)
                                }
                            />
                        </div>
                    </div>
                )
            }
            return null
        }

        const renderFilePermission = (): JSX.Element => (
            <>
                <div className="mb-16">
                    <Checkbox
                        isChecked={state.isFilePermissionChecked}
                        onClick={stopPropagation}
                        rootClassName=""
                        disabled={
                            (!draftMode && (state.cmSecretState === CM_SECRET_STATE.INHERITED || readonlyView)) ||
                            isChartVersion309OrBelow
                        }
                        value={CHECKBOX_VALUE.CHECKED}
                        onChange={toggleFilePermission}
                    >
                        <span data-testid="configmap-file-permission-checkbox" className="mr-5">
                            Set File Permission (same as
                            <a
                                href="https://kubernetes.io/docs/concepts/configuration/secret/#secret-files-permissions"
                                className="ml-5 mr-5 anchor"
                                target="_blank"
                                rel="noreferrer"
                            >
                                defaultMode
                            </a>
                            for secrets in kubernetes)
                            <br />
                            {isChartVersion309OrBelow ? (
                                <span className="fs-12 fw-5">
                                    <span className="cr-5">Supported for Chart Versions 3.10 and above.</span>
                                    <span className="cn-7 ml-5">Learn more about </span>
                                    <a
                                        href={DOCUMENTATION.APP_ROLLOUT_DEPLOYMENT_TEMPLATE}
                                        rel="noreferrer noopener"
                                        target="_blank"
                                    >
                                        Deployment Template &gt; Chart Version
                                    </a>
                                </span>
                            ) : null}
                        </span>
                    </Checkbox>
                </div>
                {state.isFilePermissionChecked && (
                    <div className="mb-16">
                        <CustomInput
                            name="filePermission"
                            value={state.filePermission.value}
                            autoComplete="off"
                            tabIndex={0}
                            label=""
                            dataTestid="configmap-file-permission-textbox"
                            placeholder="eg. 0400 or 400"
                            error={state.filePermission.error}
                            onChange={onFilePermissionChange}
                            disabled={
                                (!draftMode && (state.cmSecretState === CM_SECRET_STATE.INHERITED || readonlyView)) ||
                                isChartVersion309OrBelow
                            }
                        />
                    </div>
                )}
            </>
        )

        const renderSubPathCheckBoxContent = (): JSX.Element => (
            <span data-testid={`${CM_SECRET_COMPONENT_NAME[componentType]}-sub-path-checkbox`} className="mb-0">
                Set SubPath (same as
                <a
                    href="https://kubernetes.io/docs/concepts/storage/volumes/#using-subpath"
                    className="ml-5 mr-5 anchor"
                    target="_blank"
                    rel="noreferrer"
                >
                    subPath
                </a>
                for volume mount)
                <br />
                {state.isSubPathChecked && (
                    <span className="mb-0 cn-5 fs-11">
                        {state.external
                            ? 'Please provide keys of config map to be mounted'
                            : 'Keys will be used as filename for subpath'}
                    </span>
                )}
                {isChartVersion309OrBelow && (
                    <span className="fs-12 fw-5">
                        <span className="cr-5">Supported for Chart Versions 3.10 and above.</span>
                        <span className="cn-7 ml-5">Learn more about </span>
                        <a
                            href={DOCUMENTATION.APP_ROLLOUT_DEPLOYMENT_TEMPLATE}
                            rel="noreferrer noopener"
                            target="_blank"
                        >
                            Deployment Template &gt; Chart Version
                        </a>
                    </span>
                )}
            </span>
        )

        const renderSubPath = (): JSX.Element => (
            <div className="mb-16">
                <Checkbox
                    isChecked={state.isSubPathChecked}
                    onClick={stopPropagation}
                    rootClassName="top"
                    disabled={!draftMode && (state.cmSecretState === CM_SECRET_STATE.INHERITED || readonlyView)}
                    value={CHECKBOX_VALUE.CHECKED}
                    onChange={toggleSubpath}
                >
                    {renderSubPathCheckBoxContent()}
                </Checkbox>
                {(state.externalType === 'KubernetesSecret' ||
                    (componentType !== CMSecretComponentType.Secret && state.external)) &&
                    state.isSubPathChecked && (
                        <div className="mb-16">
                            <CustomInput
                                name="externalSubpathValues"
                                value={state.externalSubpathValues.value}
                                tabIndex={0}
                                label=""
                                placeholder="Enter keys (Eg. username,configs.json)"
                                error={state.externalSubpathValues.error}
                                onChange={onExternalSubpathValuesChange}
                                disabled={
                                    !draftMode && (state.cmSecretState === CM_SECRET_STATE.INHERITED || readonlyView)
                                }
                            />
                        </div>
                    )}
            </div>
        )

        const renderUsageTypeVolumeDetails = (): JSX.Element => {
            if (state.selectedType !== 'volume') {
                return null
            }
            return (
                <>
                    <div className="form__row">
                        <CustomInput
                            name="mountPath"
                            dataTestid={`${CM_SECRET_COMPONENT_NAME[componentType]}-volume-path-textbox`}
                            value={state.volumeMountPath.value}
                            label="Volume mount path"
                            placeholder="/directory-path"
                            helperText="Keys are mounted as files to volume"
                            error={state.volumeMountPath.error}
                            onChange={onMountPathChange}
                            disabled={!draftMode && (state.cmSecretState === CM_SECRET_STATE.INHERITED || readonlyView)}
                            isRequiredField
                        />
                    </div>
                    {renderSubPath()}
                    {renderFilePermission()}
                </>
            )
        }

        const configMapSecretUsageTypeSelector = (): JSX.Element => (
            <>
                <div className="form__label form__label--lower">
                    {`How do you want to use this ${componentType === CMSecretComponentType.Secret ? 'Secret' : 'ConfigMap'}`}
                    ?
                </div>
                <div className="form__row configmap-secret-usage-radio">
                    <RadioGroup
                        value={state.selectedType}
                        name="DeploymentAppTypeGroup"
                        onChange={toggleSelectedType}
                        disabled={!draftMode && (state.cmSecretState === CM_SECRET_STATE.INHERITED || readonlyView)}
                        className="radio-group-no-border"
                    >
                        <RadioGroupItem
                            dataTestId={`${CM_SECRET_COMPONENT_NAME[componentType]}-${ConfigMapSecretUsageMap.environment.title
                                .toLowerCase()
                                .split(' ')
                                .join('-')}-radio-button`}
                            value={ConfigMapSecretUsageMap.environment.value}
                        >
                            {ConfigMapSecretUsageMap.environment.title}
                        </RadioGroupItem>
                        <RadioGroupItem
                            dataTestId={`${CM_SECRET_COMPONENT_NAME[componentType]}-${ConfigMapSecretUsageMap.volume.title
                                .toLowerCase()
                                .split(' ')
                                .join('-')}-radio-button`}
                            value={ConfigMapSecretUsageMap.volume.value}
                        >
                            {ConfigMapSecretUsageMap.volume.title}
                        </RadioGroupItem>
                    </RadioGroup>
                </div>
            </>
        )

        const renderName = (): JSX.Element => (
            <div className="form__row mb-0-imp">
                <CustomInput
                    name="name"
                    label="Name"
                    data-testid={`${CM_SECRET_COMPONENT_NAME[componentType]}-name-textbox`}
                    value={state.configName.value}
                    autoFocus
                    onChange={onConfigNameChange}
                    handleOnBlur={trimConfigMapName}
                    placeholder={componentType === CMSecretComponentType.Secret ? 'secret-name' : 'configmap-name'}
                    isRequiredField
                    disabled={!!configMapSecretData?.name}
                    error={state.configName.error}
                />
            </div>
        )

        const renderExternalInfo = (): JSX.Element => {
            if (
                state.externalType === 'KubernetesSecret' ||
                (componentType !== CMSecretComponentType.Secret && state.external)
            ) {
                return (
                    <InfoColourBar
                        classname="info_bar cn-9 mt-16 mb-16 lh-20"
                        message={
                            <div className="flex column left">
                                <div className="dc__info-title">{EXTERNAL_INFO_TEXT[componentType].title}</div>
                                <div className="dc__info-subtitle">{EXTERNAL_INFO_TEXT[componentType].infoText}</div>
                            </div>
                        }
                        Icon={InfoIcon}
                        iconSize={20}
                    />
                )
            }
            return null
        }

        const secretDataTypeSelectWithInfo = (): JSX.Element => (
            <ReactSelect
                placeholder="Select Secret Type"
                options={getTypeGroups(isJob)}
                defaultValue={
                    state.externalType && state.externalType !== ''
                        ? getTypeGroups(isJob, state.externalType)
                        : getTypeGroups()[0].options[0]
                }
                onChange={toggleExternalType}
                styles={{
                    ...groupStyle(),
                    control: (base) => ({ ...groupStyle().control(base), width: '100%' }),
                }}
                components={{
                    IndicatorSeparator: null,
                    Option: SecretOptions,
                    GroupHeading,
                }}
                classNamePrefix="secret-data-type"
                isDisabled={!draftMode && (state.cmSecretState === CM_SECRET_STATE.INHERITED || readonlyView)}
            />
        )

        const dataTypeSelector = (): JSX.Element => (
            <div className="form__row mb-0-imp">
                {/* TODO: will be resolved when replaced with Select Picker */}
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className="form__label">Data type</label>
                <div className="form-row__select-external-type">
                    {componentType === CMSecretComponentType.Secret ? (
                        secretDataTypeSelectWithInfo()
                    ) : (
                        <ReactSelect
                            placeholder="Select ConfigMap Type"
                            options={ConfigMapOptions}
                            value={state.external ? ConfigMapOptions[1] : ConfigMapOptions[0]}
                            onChange={toggleExternalValues}
                            styles={{
                                ...groupStyle(),
                                control: (base) => ({ ...groupStyle().control(base), width: '100%' }),
                            }}
                            components={{
                                IndicatorSeparator: null,
                                Option,
                            }}
                            classNamePrefix="configmap-data-type"
                            isDisabled={
                                !draftMode && (state.cmSecretState === CM_SECRET_STATE.INHERITED || readonlyView)
                            }
                        />
                    )}
                </div>
            </div>
        )

        return (
            <>
                <div>
                    {!draftMode &&
                        (state.cmSecretState === CM_SECRET_STATE.INHERITED ||
                            state.cmSecretState === CM_SECRET_STATE.OVERRIDDEN) && (
                            <Override
                                overridden={draftMode || state.cmSecretState === CM_SECRET_STATE.OVERRIDDEN}
                                onClick={handleOverride}
                                loading={state.overrideLoading}
                                type={componentType}
                                readonlyView={readonlyView || configMapSecretData?.unAuthorized}
                                isProtectedView={isProtectedView}
                            />
                        )}
                    <div>
                        <div className="form__row--two-third dc__gap-12">
                            {dataTypeSelector()}
                            {renderName()}
                        </div>
                        <div className="mt-16 mb-16">
                            {isESO && (
                                <InfoColourBar
                                    classname="info_bar cn-9 lh-20"
                                    message={<ExternalSecretHelpNote />}
                                    Icon={InfoIcon}
                                    iconSize={20}
                                />
                            )}
                        </div>
                        {renderExternalInfo()}
                        {configMapSecretUsageTypeSelector()}
                        {renderUsageTypeVolumeDetails()}
                        {renderRollARN()}
                        {state.externalType !== 'KubernetesSecret' && (
                            <ConfigMapSecretDataEditorContainer
                                componentType={componentType}
                                state={state}
                                dispatch={dispatch}
                                tempArr={tempArr}
                                setTempArr={setTempArr}
                                readonlyView={readonlyView}
                                draftMode={draftMode}
                            />
                        )}
                    </div>

                    {!readonlyView && (
                        <div className="crud-btn p-16 flexbox dc__align-items-center dc__gap-12 left dc__position-abs dc__border-top dc__bottom-0 dc__left-0 dc__right-0">
                            <ButtonWithLoader
                                disabled={
                                    (!draftMode && state.cmSecretState === CM_SECRET_STATE.INHERITED) ||
                                    (draftMode && !isAppAdmin) ||
                                    state.isValidateFormError
                                }
                                data-testid={`${CM_SECRET_COMPONENT_NAME[componentType]}-save-button`}
                                type="submit"
                                rootClassName="cta h-32 flex"
                                onClick={handleSubmit}
                                isLoading={state.submitLoading}
                            >
                                {submitButtonText()}
                            </ButtonWithLoader>
                            {!configMapSecretData?.name && (
                                <button
                                    disabled={
                                        (!draftMode && state.cmSecretState === CM_SECRET_STATE.INHERITED) ||
                                        (draftMode && !isAppAdmin) ||
                                        state.isValidateFormError
                                    }
                                    data-testid={`${CM_SECRET_COMPONENT_NAME[componentType]}-cancel-button`}
                                    type="button"
                                    className="cta cancel h-32 flex"
                                    onClick={onCancel}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    )}
                </div>
                {state.dialog && renderDeleteOverRideModal()}
                {state.showProtectedDeleteOverrideModal && renderProtectedDeleteOverRideModal()}
                {state.showDraftSaveModal && (
                    <SaveChangesModal
                        appId={+appId}
                        envId={envId ? +envId : -1}
                        resourceType={componentType}
                        resourceName={state.configName.value}
                        prepareDataToSave={preparePayload}
                        toggleModal={toggleDraftSaveModal}
                        latestDraft={latestDraftData}
                        reload={() => updateCMSecret(state.configName.value)}
                        showAsModal
                    />
                )}
                <Prompt when={state.isFormDirty} message={UNSAVED_CHANGES_PROMPT_MESSAGE} />
            </>
        )
    },
)
