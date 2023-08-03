import React, { useEffect, useReducer, useRef } from 'react'
import {
    overRideConfigMap,
    unlockEnvSecret,
    overRideSecret,
    updateConfig,
    deleteEnvSecret,
    deleteEnvConfigMap,
    getSecretKeys,
    updateSecret,
    deleteSecret,
    deleteConfig,
} from './service'
import { useParams } from 'react-router'
import {
    CustomInput,
    isVersionLessThanOrEqualToTarget,
    isChartRef3090OrBelow,
    importComponentFromFELibrary,
} from '../common'
import {
    showError,
    Progressing,
    ConfirmationDialog,
    Checkbox,
    CHECKBOX_VALUE,
    not,
    stopPropagation,
    InfoColourBar,
    ToastBody,
    RadioGroup,
    RadioGroupItem,
    DeleteDialog,
} from '@devtron-labs/devtron-fe-common-lib'
import { toast } from 'react-toastify'
import warningIcon from '../../assets/img/warning-medium.svg'
import { DOCUMENTATION, PATTERNS, ROLLOUT_DEPLOYMENT } from '../../config'
import { Override, validateKeyValuePair } from './ConfigMapSecret.components'
import { ConfigMapActionTypes, ConfigMapSecretFormProps, KeyValueValidated } from './Types'
import { ConfigMapReducer, initState, processCurrentData } from './ConfigMapSecret.reducer'
import ReactSelect from 'react-select'
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
} from './Secret/secret.utils'
import { Option, groupStyle } from '../v2/common/ReactSelect.utils'
import { ReactComponent as InfoIcon } from '../../assets/icons/info-filled.svg'
import { ReactComponent as Trash } from '../../assets/icons/ic-delete-interactive.svg'
import { CM_SECRET_STATE, ConfigMapSecretUsageMap, EXTERNAL_INFO_TEXT } from './Constants'
import { ConfigMapSecretDataEditorContainer } from './ConfigMapSecretDataEditorContainer'
import { INVALID_YAML_MSG } from '../../config/constantMessaging'
import '../EnvironmentOverride/environmentOverride.scss'
import './ConfigMapSecret.scss'

const SaveChangesModal = importComponentFromFELibrary('SaveChangesModal')
const DeleteModal = importComponentFromFELibrary('DeleteModal')

export const ConfigMapSecretForm = React.memo(
    ({
        appChartRef,
        updateCollapsed,
        configMapSecretData,
        id,
        componentType,
        update,
        index,
        cmSecretStateLabel,
        isJobView,
        readonlyView,
        isProtectedView,
        draftMode,
        latestDraftData,
    }: ConfigMapSecretFormProps): JSX.Element => {
        const memoizedReducer = React.useCallback(ConfigMapReducer, [])
        const tempArr = useRef([])
        const [state, dispatch] = useReducer(
            memoizedReducer,
            initState(configMapSecretData, componentType, cmSecretStateLabel, draftMode),
        )

        const { appId, envId } = useParams<{ appId; envId }>()

        const isChartVersion309OrBelow =
            appChartRef &&
            appChartRef.name === ROLLOUT_DEPLOYMENT &&
            isVersionLessThanOrEqualToTarget(appChartRef.version, [3, 9]) &&
            isChartRef3090OrBelow(appChartRef.id)

        const isHashiOrAWS = componentType === 'secret' && hasHashiOrAWS(state.externalType)
        const isESO = componentType === 'secret' && hasESO(state.externalType)

        useEffect(() => {
            if (
                componentType === 'secret' &&
                configMapSecretData?.name &&
                configMapSecretData?.unAuthorized &&
                cmSecretStateLabel !== CM_SECRET_STATE.UNPUBLISHED
            ) {
                handleSecretFetch()
            }
        }, [draftMode])

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
                payload: initState(configMapSecretData, componentType, cmSecretStateLabel, draftMode),
            })
        }, [configMapSecretData])

        async function handleSecretFetch() {
            try {
                const { result } =
                    state.cmSecretState === CM_SECRET_STATE.BASE
                        ? await getSecretKeys(id, appId, configMapSecretData?.name)
                        : await unlockEnvSecret(id, appId, +envId, configMapSecretData?.name)
                update(index, result)
                dispatch({
                    type: ConfigMapActionTypes.multipleOptions,
                    payload: {
                        unAuthorized: false,
                        secretMode: false,
                        currentData: processCurrentData(result.configData[0], cmSecretStateLabel, componentType),
                    },
                })
            } catch (err) {
                toast.warn(<ToastBody title="View-only access" subtitle="You won't be able to make any changes" />)
                dispatch({
                    type: ConfigMapActionTypes.toggleUnAuthorized,
                    payload: {
                        unAuthorized: true,
                    },
                })
            }
        }

        async function handleOverride(e) {
            e.preventDefault()
            if (state.cmSecretState === CM_SECRET_STATE.OVERRIDDEN) {
                if (configMapSecretData.data) {
                    dispatch({ type: ConfigMapActionTypes.toggleDialog })
                } else {
                    dispatch({
                        type: ConfigMapActionTypes.reInit,
                        payload: initState(configMapSecretData, componentType, cmSecretStateLabel, draftMode),
                    })
                    update()
                    updateCollapsed()
                }
            } else {
                if (componentType === 'secret') {
                    prepareSecretOverrideData(configMapSecretData, dispatch)
                } else {
                    dispatch({
                        type: ConfigMapActionTypes.multipleOptions,
                        payload: {
                            cmSecretState: CM_SECRET_STATE.OVERRIDDEN,
                        },
                    })
                }
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
            const configMapSecretNameRegex = new RegExp(PATTERNS.CONFIGMAP_AND_SECRET_NAME)
            let isFormValid = true
            if (componentType === 'secret' && state.unAuthorized) {
                toast.warn(<ToastBody title="View-only access" subtitle="You won't be able to make any changes" />)
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
                }
                if (state.isFilePermissionChecked && !isChartVersion309OrBelow) {
                    isFormValid = validateFilePermission()
                }
                if (
                    state.isSubPathChecked &&
                    ((componentType === 'secret' && state.externalType === 'KubernetesSecret') ||
                        (componentType !== 'secret' && state.external))
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
            const hasSecretCode = componentType === 'secret' && tempArr.current.some((data) => data['v'] === '********')
            let dataArray = state.yamlMode && !hasSecretCode ? tempArr.current : state.currentData
            const { isValid, arr } = validateKeyValuePair(dataArray)
            if (!isValid) {
                toast.error(INVALID_YAML_MSG)
                dispatch({
                    type: ConfigMapActionTypes.updateCurrentData,
                    payload: arr,
                })
                isFormValid = false
            }

            if (dataArray.length === 0 && (!state.external || state.externalType === '')) {
                toast.error(`Please add ${componentType} data before saving.`)
                isFormValid = false
            } else if (componentType === 'secret' && (isHashiOrAWS || isESO)) {
                let isValidSecretData = false
                if (isESO) {
                    isValidSecretData = state.esoData?.reduce((isValidSecretData, s) => {
                        isValidSecretData = isValidSecretData && !!s?.secretKey && !!s.key
                        return isValidSecretData
                    }, !state.secretStore != !state.secretStoreRef && !!state.esoData?.length)
                } else {
                    isValidSecretData = state.secretData.reduce((isValidSecretData, s) => {
                        isValidSecretData = isValidSecretData && !!s.fileName && !!s.name
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
            const data = arr.reduce((agg, curr) => {
                if (!curr.k) return agg
                let value = curr.v ?? ''
                agg[curr.k] = componentType === 'secret' && state.externalType === '' ? btoa(value) : value
                return agg
            }, {})
            let payload = {
                name: state.configName.value,
                type: state.selectedType,
                external: state.external,
                data: data, //dataArray.reduce((agg, { k, v }) => ({ ...agg, [k]: v ?? '' }), {}),
            }
            if (
                (componentType === 'secret' && state.externalType === 'KubernetesSecret') ||
                (componentType !== 'secret' && state.external)
            ) {
                delete payload[CODE_EDITOR_RADIO_STATE.DATA]
            }
            if (componentType === 'secret') {
                payload['roleARN'] = ''
                payload['externalType'] = state.externalType
                if (isHashiOrAWS) {
                    payload['secretData'] = state.secretData.map((s) => {
                        return {
                            key: s.fileName,
                            name: s.name,
                            isBinary: s.isBinary,
                            property: s.property,
                        }
                    })
                    payload['secretData'] = payload['secretData'].filter((s) => s.key || s.name || s.property)
                    payload['roleARN'] = state.roleARN.value
                } else if (isESO) {
                    payload['esoSecretData'] = {
                        secretStore: state.secretStore,
                        esoData: state.esoData,
                        secretStoreRef: state.secretStoreRef,
                        refreshInterval: state.refreshInterval,
                    }
                    payload['roleARN'] = state.roleARN.value
                }
            }
            if (state.selectedType === 'volume') {
                payload['mountPath'] = state.volumeMountPath.value
                if (!isChartVersion309OrBelow) {
                    payload['subPath'] = state.isSubPathChecked
                }
                if (state.isFilePermissionChecked && !isChartVersion309OrBelow) {
                    payload['filePermission'] =
                        state.filePermission.value.length == 3
                            ? `0${state.filePermission.value}`
                            : `${state.filePermission.value}`
                }

                if (
                    state.isSubPathChecked &&
                    ((componentType === 'secret' && state.externalType === 'KubernetesSecret') ||
                        (componentType !== 'secret' && state.external))
                ) {
                    const externalSubpathKey = state.externalSubpathValues.value.replace(/\s+/g, '').split(',')
                    const secretKeys = {}
                    externalSubpathKey.forEach((key) => (secretKeys[key] = ''))
                    payload['data'] = secretKeys
                }
            }
            return payload
        }

        const preparePayload = () => {
            return state.draftPayload
        }

        async function handleSubmit(e) {
            e.preventDefault()
            const { isValid, arr } = validateForm()
            if (!isValid) {
                return
            }
            try {
                const payloadData = createPayload(arr)
                if (isProtectedView) {
                    const _draftPayload = { id: id ?? 0, appId: +appId, configData: [payloadData] }
                    if (envId) {
                        _draftPayload['environmentId'] = +envId
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
                        componentType === 'secret'
                            ? await updateSecret(id, +appId, payloadData)
                            : await updateConfig(id, +appId, payloadData)
                        toastTitle = `${payloadData.name ? 'Updated' : 'Saved'}`
                    } else {
                        componentType === 'secret'
                            ? await overRideSecret(id, +appId, +envId, [payloadData])
                            : await overRideConfigMap(id, +appId, +envId, [payloadData])
                        toastTitle = 'Overridden'
                    }
                    toast.success(
                        <div className="toast">
                            <div className="toast__title">{toastTitle}</div>
                            <div className="toast__subtitle">Changes will be reflected after next deployment.</div>
                        </div>,
                    )
                    update()
                    updateCollapsed()
                    dispatch({ type: ConfigMapActionTypes.success })
                }
            } catch (err) {
                showError(err)
                dispatch({ type: ConfigMapActionTypes.error })
            }
        }

        async function handleDelete() {
            try {
                if (draftMode) {
                    //:TODO Add the draft node delete after verification
                } else {
                    if (!envId) {
                        componentType === 'secret'
                            ? await deleteSecret(id, appId, configMapSecretData?.name)
                            : await deleteConfig(id, appId, configMapSecretData?.name)
                    } else {
                        componentType === 'secret'
                            ? await deleteEnvSecret(id, appId, +envId, configMapSecretData?.name)
                            : await deleteEnvConfigMap(id, appId, envId, configMapSecretData?.name)
                    }
                }

                toast.success(configMapSecretData.overridden ? 'Restored to global.' : 'Successfully deleted')
                update()
                updateCollapsed(false)
                dispatch({ type: ConfigMapActionTypes.success })
            } catch (err) {
                showError(err)
                dispatch({ type: ConfigMapActionTypes.error })
            } finally {
                dispatch({
                    type: ConfigMapActionTypes.multipleOptions,
                    payload: { dialog: false, showDeleteModal: false },
                })
            }
        }

        const toggleExternalValues = (selectedExternalType): void => {
            dispatch({ type: ConfigMapActionTypes.setExternal, payload: selectedExternalType.value !== '' })
        }

        const toggleExternalType = (selectedExternalType): void => {
            dispatch({
                type: ConfigMapActionTypes.multipleOptions,
                payload: { external: selectedExternalType.value !== '', externalType: selectedExternalType.value },
            })
        }

        const toggleSelectedType = (e): void => {
            dispatch({ type: ConfigMapActionTypes.setSelectedType, payload: e.target.value })
        }

        const onMountPathChange = (e): void => {
            dispatch({ type: ConfigMapActionTypes.setVolumeMountPath, payload: { value: e.target.value, error: '' } })
        }

        const toggleSubpath = (title: string): void => {
            dispatch({ type: ConfigMapActionTypes.setIsSubPathChecked })
        }

        const onExternalSubpathValuesChange = (e): void => {
            dispatch({
                type: ConfigMapActionTypes.setExternalSubpathValues,
                payload: { value: e.target.value, error: '' },
            })
        }

        const toggleFilePermission = (title: string): void => {
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

        const submitButtonText = (): string => {
            return `Save ${configMapSecretData?.name ? ' changes' : ''}${isProtectedView ? '...' : ''}`
        }

        const closeDeleteModal = (): void => {
            dispatch({ type: ConfigMapActionTypes.setShowDeleteModal, payload: false })
        }

        const openDeleteModal = (e): void => {
            dispatch({ type: ConfigMapActionTypes.setShowDeleteModal, payload: true })
        }

        const toggleDraftSaveModal = (reload?: boolean): void => {
            dispatch({ type: ConfigMapActionTypes.toggleDraftSaveModal })
        }

        const reloadData = (): void => {
            update()
            updateCollapsed()
        }

        const renderDeleteOverRideModal = (): JSX.Element => {
            if (isProtectedView && DeleteModal) {
                return (
                    <DeleteModal
                        id={+id}
                        appId={+appId}
                        envId={envId ? +envId : -1}
                        resourceType={componentType === 'secret' ? 2 : 1}
                        resourceName={state.configName.value}
                        latestDraft={latestDraftData}
                        toggleModal={closeDeleteModal}
                        reload={reloadData}
                    />
                )
            }
            return (
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
                            onClick={(e) => dispatch({ type: ConfigMapActionTypes.toggleDialog })}
                        >
                            Cancel
                        </button>
                        <button type="button" className="cta delete h-32 lh-20-imp p-6-12-imp" onClick={handleDelete}>
                            Confirm
                        </button>
                    </ConfirmationDialog.ButtonGroup>
                </ConfirmationDialog>
            )
        }

        const renderDeleteCMModal = (): JSX.Element => {
            if (isProtectedView && DeleteModal) {
                return (
                    <DeleteModal
                        id={+id}
                        appId={+appId}
                        envId={envId ? +envId : -1}
                        resourceType={componentType === 'secret' ? 2 : 1}
                        resourceName={state.configName.value}
                        latestDraft={latestDraftData}
                        toggleModal={closeDeleteModal}
                        reload={reloadData}
                    />
                )
            }
            return (
                <DeleteDialog
                    title={`Delete ${componentType === 'secret' ? 'Secret' : 'ConfigMap'} '${
                        configMapSecretData?.name
                    }' ?`}
                    description={`'${configMapSecretData?.name}' will not be used in future deployments. Are you sure?`}
                    closeDelete={closeDeleteModal}
                    delete={handleDelete}
                />
            )
        }

        const renderRollARN = (): JSX.Element => {
            if (isHashiOrAWS || isESO) {
                return (
                    <div className="form__row form__row--flex">
                        <div className="w-50">
                            <CustomInput
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

        const renderFilePermission = (): JSX.Element => {
            return (
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
                                    rel="noopener noreferer"
                                >
                                    defaultMode
                                </a>
                                for secrets in kubernetes)<br></br>
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
                                value={state.filePermission.value}
                                autoComplete="off"
                                tabIndex={5}
                                label=""
                                dataTestid="configmap-file-permission-textbox"
                                placeholder={'eg. 0400 or 400'}
                                error={state.filePermission.error}
                                onChange={onFilePermissionChange}
                                disabled={
                                    (!draftMode &&
                                        (state.cmSecretState === CM_SECRET_STATE.INHERITED || readonlyView)) ||
                                    isChartVersion309OrBelow
                                }
                            />
                        </div>
                    )}
                </>
            )
        }

        const renderSubPathCheckBoxContent = (): JSX.Element => {
            return (
                <span data-testid={`${componentType}-sub-path-checkbox`} className="mb-0">
                    Set SubPath (same as
                    <a
                        href="https://kubernetes.io/docs/concepts/storage/volumes/#using-subpath"
                        className="ml-5 mr-5 anchor"
                        target="_blank"
                        rel="noopener noreferer"
                    >
                        subPath
                    </a>
                    for volume mount)<br></br>
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
        }

        const renderSubPath = (): JSX.Element => {
            return (
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
                    {(state.externalType === 'KubernetesSecret' || (componentType !== 'secret' && state.external)) &&
                        state.isSubPathChecked && (
                            <div className="mb-16">
                                <CustomInput
                                    value={state.externalSubpathValues.value}
                                    autoComplete="off"
                                    tabIndex={5}
                                    label=""
                                    placeholder={'Enter keys (Eg. username,configs.json)'}
                                    error={state.externalSubpathValues.error}
                                    onChange={onExternalSubpathValuesChange}
                                    disabled={
                                        !draftMode &&
                                        (state.cmSecretState === CM_SECRET_STATE.INHERITED || readonlyView)
                                    }
                                />
                            </div>
                        )}
                </div>
            )
        }

        const renderUsageTypeVolumeDetails = (): JSX.Element => {
            if (state.selectedType !== 'volume') {
                return null
            }
            return (
                <>
                    <div className="form__row">
                        <CustomInput
                            dataTestid={`${componentType}-volume-path-textbox`}
                            value={state.volumeMountPath.value}
                            autoComplete="off"
                            tabIndex={5}
                            label="Volume mount path*"
                            placeholder="/directory-path"
                            helperText="Keys are mounted as files to volume"
                            error={state.volumeMountPath.error}
                            onChange={onMountPathChange}
                            disabled={!draftMode && (state.cmSecretState === CM_SECRET_STATE.INHERITED || readonlyView)}
                        />
                    </div>
                    {renderSubPath()}
                    {renderFilePermission()}
                </>
            )
        }

        const configMapSecretUsageTypeSelector = (): JSX.Element => {
            return (
                <>
                    <label className="form__label form__label--lower">
                        How do you want to use this {componentType === 'secret' ? 'Secret' : 'ConfigMap'}?
                    </label>
                    <div className="form__row configmap-secret-usage-radio">
                        <RadioGroup
                            value={state.selectedType}
                            name="DeploymentAppTypeGroup"
                            onChange={toggleSelectedType}
                            disabled={!draftMode && (state.cmSecretState === CM_SECRET_STATE.INHERITED || readonlyView)}
                            className="radio-group-no-border"
                        >
                            <RadioGroupItem
                                dataTestId={`${componentType}-${ConfigMapSecretUsageMap.environment.title
                                    .toLowerCase()
                                    .split(' ')
                                    .join('-')}-radio-button`}
                                value={ConfigMapSecretUsageMap.environment.value}
                            >
                                {ConfigMapSecretUsageMap.environment.title}
                            </RadioGroupItem>
                            <RadioGroupItem
                                dataTestId={`${componentType}-${ConfigMapSecretUsageMap.volume.title
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
        }

        const renderName = (): JSX.Element => {
            if (configMapSecretData?.name) {
                return null
            }
            return (
                <div className="form__row">
                    <label className="form__label">Name*</label>
                    <input
                        data-testid={`${componentType}-name-textbox`}
                        value={state.configName.value}
                        autoComplete="off"
                        autoFocus
                        onChange={onConfigNameChange}
                        type="text"
                        className={`form__input`}
                        placeholder={componentType === 'secret' ? 'random-secret' : 'random-configmap'}
                    />
                    {state.configName.error && <label className="form__error">{state.configName.error}</label>}
                </div>
            )
        }

        const renderExternalInfo = (): JSX.Element => {
            if (state.externalType === 'KubernetesSecret' || (componentType !== 'secret' && state.external)) {
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

        const secretDataTypeSelectWithInfo = (): JSX.Element => {
            return (
                <>
                    <ReactSelect
                        placeholder="Select Secret Type"
                        options={getTypeGroups(isJobView)}
                        defaultValue={
                            state.externalType && state.externalType !== ''
                                ? getTypeGroups(isJobView, state.externalType)
                                : getTypeGroups()[0].options[0]
                        }
                        onChange={toggleExternalType}
                        styles={groupStyle()}
                        components={{
                            IndicatorSeparator: null,
                            Option: SecretOptions,
                            GroupHeading,
                        }}
                        classNamePrefix="secret-data-type"
                        isDisabled={!draftMode && (state.cmSecretState === CM_SECRET_STATE.INHERITED || readonlyView)}
                    />
                    {isESO && (
                        <InfoColourBar
                            classname="info_bar cn-9 mt-16 lh-20"
                            message={<ExternalSecretHelpNote />}
                            Icon={InfoIcon}
                            iconSize={20}
                        />
                    )}
                </>
            )
        }

        const dataTypeSelector = (): JSX.Element => {
            return (
                <div className="form__row">
                    <label className="form__label">Data type</label>
                    <div className="form-row__select-external-type">
                        {componentType === 'secret' ? (
                            secretDataTypeSelectWithInfo()
                        ) : (
                            <ReactSelect
                                placeholder="Select ConfigMap Type"
                                options={ConfigMapOptions}
                                value={state.external ? ConfigMapOptions[1] : ConfigMapOptions[0]}
                                onChange={toggleExternalValues}
                                styles={groupStyle()}
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
        }

        const isShowDeleteButton = (): boolean => {
            return (
                ((cmSecretStateLabel !== CM_SECRET_STATE.INHERITED &&
                    cmSecretStateLabel !== CM_SECRET_STATE.UNPUBLISHED) ||
                    (cmSecretStateLabel === CM_SECRET_STATE.INHERITED && draftMode)) &&
                configMapSecretData?.name
            )
        }

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
                                readonlyView={readonlyView}
                                isProtectedView={isProtectedView}
                            />
                        )}
                    <div className="pr-16 pl-16 dc__border-bottom mt-20">
                        {dataTypeSelector()}
                        {renderExternalInfo()}
                        {renderName()}
                        {configMapSecretUsageTypeSelector()}
                        {renderUsageTypeVolumeDetails()}
                        {renderRollARN()}
                        {state.externalType !== 'KubernetesSecret' && (
                            <ConfigMapSecretDataEditorContainer
                                componentType={componentType}
                                state={state}
                                dispatch={dispatch}
                                tempArr={tempArr}
                                readonlyView={readonlyView}
                                draftMode={draftMode}
                            />
                        )}
                    </div>

                    {!readonlyView && (
                        <div
                            className={`flex ${
                                isShowDeleteButton() ? 'dc__content-space' : 'right'
                            } pt-16 pr-16 pb-16 pl-16`}
                        >
                            {isShowDeleteButton() && (
                                <button
                                    className="override-button cta delete m-0-imp h-32 lh-20-imp p-6-12-imp"
                                    onClick={openDeleteModal}
                                >
                                    <Trash className="icon-dim-16 mr-4" />
                                    Delete{isProtectedView ? '...' : ''}
                                </button>
                            )}
                            <button
                                disabled={!draftMode && state.cmSecretState === CM_SECRET_STATE.INHERITED}
                                data-testid={`${componentType === 'secret' ? 'Secret' : 'ConfigMap'}-save-button`}
                                type="button"
                                className="cta h-32 lh-20-imp p-6-12-imp"
                                onClick={handleSubmit}
                            >
                                {state.submitLoading ? <Progressing /> : submitButtonText()}
                            </button>
                        </div>
                    )}
                </div>

                {configMapSecretData?.name && state.showDeleteModal && renderDeleteCMModal()}
                {state.dialog && renderDeleteOverRideModal()}
                {state.showDraftSaveModal && (
                    <SaveChangesModal
                        appId={+appId}
                        envId={envId ? +envId : -1}
                        resourceType={componentType === 'secret' ? 2 : 1}
                        resourceName={state.configName.value}
                        prepareDataToSave={preparePayload}
                        toggleModal={toggleDraftSaveModal}
                        latestDraft={latestDraftData}
                        reload={reloadData}
                    />
                )}
            </>
        )
    },
)
