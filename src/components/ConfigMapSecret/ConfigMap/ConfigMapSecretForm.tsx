import React, { useEffect, useReducer, useRef } from 'react'
import {
    overRideConfigMap,
    unlockEnvSecret,
    overRideSecret,
    updateConfig,
    deleteEnvSecret,
    deleteEnvConfigMap,
} from '../service'
import { useParams } from 'react-router'
import { CustomInput, isVersionLessThanOrEqualToTarget, isChartRef3090OrBelow } from '../../common'
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
} from '@devtron-labs/devtron-fe-common-lib'
import { toast } from 'react-toastify'
import warningIcon from '../../../assets/img/warning-medium.svg'
import { DOCUMENTATION, PATTERNS, ROLLOUT_DEPLOYMENT, URLS } from '../../../config'
import { Override, Tab, validateKeyValuePair } from '../ConfigMapSecret.components'
import { ConfigMapSecretFormProps } from '../Types'
import { ConfigMapReducer, initState } from './ConfigMap.reducer'
import { ConfigMapActionTypes } from './ConfigMap.type'
import ReactSelect from 'react-select'
import {
    SecretOptions,
    getTypeGroups,
    groupStyle,
    GroupHeading,
    ConfigMapOptions,
    hasHashiOrAWS,
    hasESO,
    unlockSecrets,
    secretValidationInfoToast,
    CODE_EDITOR_RADIO_STATE,
} from '../Secret/secret.utils'
import { Option } from '../../v2/common/ReactSelect.utils'
import { NavLink } from 'react-router-dom'
import { ReactComponent as InfoIcon } from '../../../assets/icons/info-filled.svg'
import { ConfigMapSecretUsageMap, EXTERNAL_INFO_TEXT } from '../Constants'
import { ConfigMapSecretDataEditorContainer } from './ConfigMapSecretDataEditorContainer'
import { getSecretKeys, updateSecret } from '../../secrets/service'
import YAML from 'yaml'
import '../../EnvironmentOverride/environmentOverride.scss'
import { INVALID_YAML_MSG } from '../../../config/constantMessaging'

export const ConfigMapSecretForm = React.memo(
    ({
        appChartRef,
        toggleCollapse,
        configMapSecretData,
        id,
        isOverrideView,
        componentType,
        update,
        index,
    }: ConfigMapSecretFormProps): JSX.Element => {
        const memoizedReducer = React.useCallback(ConfigMapReducer, [])
        const tempArr = useRef([])
        const [state, dispatch] = useReducer(
            memoizedReducer,
            initState(configMapSecretData, isOverrideView, componentType),
        )
        const tabs = [
            { title: 'Environment Variable', value: 'environment' },
            { title: 'Data Volume', value: 'volume' },
        ].map((data) => ({
            ...data,
            active: data.value === state.selectedType,
        }))
        const { appId, envId } = useParams<{ appId; envId }>()

        const isChartVersion309OrBelow =
            appChartRef &&
            appChartRef.name === ROLLOUT_DEPLOYMENT &&
            isVersionLessThanOrEqualToTarget(appChartRef.version, [3, 9]) &&
            isChartRef3090OrBelow(appChartRef.id)

        const isHashiOrAWS = componentType === 'secret' && hasHashiOrAWS(state.externalType)
        const isESO = componentType === 'secret' && hasESO(state.externalType)
        useEffect(() => {
            if (!configMapSecretData?.name || !state.duplicate) return
            handleSecretFetch()
        }, [])

        // useEffect(() => {
        //     if (configMapSecretData?.data) {
        //         const data = configMapSecretData.data
        //         dispatch({
        //             type: ConfigMapActionTypes.setExternalValues,
        //             payload: Object.keys(data).map((k) => ({
        //                 k,
        //                 v: typeof data[k] === 'object' ? YAML.stringify(data[k], { indent: 2 }) : data[k],
        //                 keyError: '',
        //                 valueError: '',
        //             })),
        //         })
        //     } else {
        //         dispatch({
        //             type: ConfigMapActionTypes.setExternalValues,
        //             payload: [{ k: '', v: '', keyError: '', valueError: '' }],
        //         })
        //     }
        // }, [configMapSecretData?.data])

        useEffect(() => {
            if (isESO && !state.yamlMode) {
                dispatch({
                    type: ConfigMapActionTypes.toggleYamlMode,
                })
            }
        }, [isESO, state.yamlMode])

        async function handleSecretFetch() {
            try {
                const { result } = envId
                    ? await unlockEnvSecret(id, appId, +envId, configMapSecretData?.name)
                    : await getSecretKeys(id, appId, configMapSecretData?.name)
                update(index, result)
                dispatch({ type: ConfigMapActionTypes.toggleSecretMode, payload: false })
            } catch (err) {
                toast.warn(<ToastBody title="View-only access" subtitle="You won't be able to make any changes" />)
            }
        }

        async function handleOverride(e) {
            e.preventDefault()
            if (state.duplicate) {
                if (state.data) {
                    dispatch({ type: ConfigMapActionTypes.toggleDialog })
                } else {
                    //temporary copy, removecopy
                    dispatch({ type: ConfigMapActionTypes.removeDuplicate })
                }
            } else {
                //duplicate
                if (componentType === 'secret') {
                    unlockSecrets(
                        id,
                        +appId,
                        +envId,
                        state.configName.value,
                        configMapSecretData.global,
                        isESO,
                        dispatch,
                    )
                } else {
                    const duplicate = Object.keys(state.defaultData ?? {}).map((k) => ({
                        k,
                        v: state.defaultData[k],
                        keyError: '',
                        valueError: '',
                    }))
                    dispatch({
                        type: ConfigMapActionTypes.multipleOptions,
                        payload: {
                            duplicate: duplicate,
                            volumeMountPath: state.volumeMountPath || {
                                value: configMapSecretData?.defaultMountPath,
                                error: '',
                            },
                        },
                    })
                }
            }
        }

        async function handleSubmit(e) {
            e.preventDefault()
            const configMapSecretNameRegex = new RegExp(PATTERNS.CONFIGMAP_AND_SECRET_NAME)
            let isErrorInForm = false
            if (state.secretMode) {
                toast.warn(<ToastBody title="View-only access" subtitle="You won't be able to make any changes" />)
                return
            }
            if (!state.configName.value) {
                dispatch({
                    type: ConfigMapActionTypes.setConfigName,
                    payload: { value: state.configName.value, error: 'This is a required field' },
                })
                isErrorInForm = true
            } else if (state.configName.value.length > 253) {
                dispatch({
                    type: ConfigMapActionTypes.setConfigName,
                    payload: { value: state.configName.value, error: 'More than 253 characters are not allowed' },
                })
                isErrorInForm = true
            } else if (!configMapSecretNameRegex.test(state.configName.value)) {
                dispatch({
                    type: ConfigMapActionTypes.setConfigName,
                    payload: {
                        value: state.configName.value,
                        error: `Name must start and end with an alphanumeric character. It can contain only lowercase alphanumeric characters, '-' or '.'`,
                    },
                })
                isErrorInForm = true
            }
            if (state.selectedType === 'volume') {
                if (!state.volumeMountPath.value) {
                    dispatch({
                        type: ConfigMapActionTypes.setVolumeMountPath,
                        payload: { value: state.volumeMountPath.value, error: 'This is a required field' },
                    })
                    isErrorInForm = true
                }
                if (state.isFilePermissionChecked && !isChartVersion309OrBelow) {
                    if (!state.filePermission.value) {
                        dispatch({
                            type: ConfigMapActionTypes.setFilePermission,
                            payload: { value: state.filePermission.value, error: 'This is a required field' },
                        })
                        isErrorInForm = true
                    } else if (state.filePermission.value.length > 4) {
                        dispatch({
                            type: ConfigMapActionTypes.setFilePermission,
                            payload: {
                                value: state.filePermission.value,
                                error: 'More than 4 characters are not allowed',
                            },
                        })
                        isErrorInForm = true
                    } else if (state.filePermission.value.length === 4) {
                        if (!state.filePermission.value.startsWith('0')) {
                            dispatch({
                                type: ConfigMapActionTypes.setFilePermission,
                                payload: {
                                    value: state.filePermission.value,
                                    error: '4 characters are allowed in octal format only, first character should be 0',
                                },
                            })
                            isErrorInForm = true
                        }
                    } else if (state.filePermission.value.length < 3) {
                        dispatch({
                            type: ConfigMapActionTypes.setFilePermission,
                            payload: { value: state.filePermission.value, error: 'Atleast 3 character are required' },
                        })
                        isErrorInForm = true
                    }
                    if (!new RegExp(PATTERNS.ALL_DIGITS_BETWEEN_0_AND_7).test(state.filePermission.value)) {
                        dispatch({
                            type: ConfigMapActionTypes.setFilePermission,
                            payload: {
                                value: state.filePermission.value,
                                error: 'This is octal number, use numbers between 0 to 7',
                            },
                        })
                        isErrorInForm = true
                    }
                }
                if (state.isSubPathChecked && state.isExternalValues) {
                    if (!state.externalSubpathValues.value) {
                        dispatch({
                            type: ConfigMapActionTypes.setExternalSubpathValues,
                            payload: { value: state.externalSubpathValues.value, error: 'This is a required field' },
                        })
                        isErrorInForm = true
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
                        isErrorInForm = true
                    }
                }
            }

            let dataArray = state.yamlMode ? tempArr.current : state.externalValues
            const { isValid, arr } = validateKeyValuePair(dataArray)
            if (!isValid) {
                toast.error(INVALID_YAML_MSG)
                dispatch({
                    type: ConfigMapActionTypes.setExternalValues,
                    payload: arr,
                })
                return
            }

            if (isErrorInForm) {
                return
            }
            if (componentType)
                if (dataArray.length === 0 && (!state.external || state.externalType === '')) {
                    toast.error(`Please add ${componentType} data before saving.`)
                    return
                }

            if (componentType === 'secret' && (isHashiOrAWS || isESO)) {
                let isValid = true
                if (isESO) {
                    isValid = state.esoData?.reduce((isValid, s) => {
                        isValid = isValid && !!s?.secretKey && !!s.key
                        return isValid
                    }, !state.secretStore != !state.secretStoreRef && !!state.esoData?.length)
                } else {
                    isValid = state.secretData.reduce((isValid, s) => {
                        isValid = isValid && !!s.fileName && !!s.name
                        return isValid
                    }, !!state.secretData.length)
                }

                if (!isValid) {
                    secretValidationInfoToast(isESO, state.secretStore, state.secretStoreRef)
                    return
                }
            }
            try {
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
                        delete payload[CODE_EDITOR_RADIO_STATE.DATA]
                    } else if (isESO) {
                        payload['esoSecretData'] = {
                            secretStore: state.secretStore,
                            esoData: state.esoData,
                            secretStoreRef: state.secretStoreRef,
                            refreshInterval: state.refreshInterval,
                        }
                        payload['roleARN'] = state.roleARN.value
                        delete payload[CODE_EDITOR_RADIO_STATE.DATA]
                    }
                }
                if (state.selectedType === 'volume') {
                    payload['mountPath'] = state.volumeMountPath.value
                    if (!isChartVersion309OrBelow) {
                        payload['subPath'] = state.subPath
                    }
                    if (state.isFilePermissionChecked && !isChartVersion309OrBelow) {
                        payload['filePermission'] =
                            state.filePermission.value.length == 3
                                ? `0${state.filePermission.value}`
                                : `${state.filePermission.value}`
                    }

                    if (state.isSubPathChecked && state.external) {
                        const externalSubpathKey = state.externalSubpathValues.value.replace(/\s+/g, '').split(',')
                        const secretKeys = {}
                        externalSubpathKey.forEach((key) => (secretKeys[key] = ''))
                        payload['data'] = secretKeys
                    }
                }
                dispatch({ type: ConfigMapActionTypes.submitLoading })
                let toastTitle = ''
                if (!envId) {
                    const { result } =
                        componentType === 'secret'
                            ? await updateSecret(id, +appId, payload)
                            : await updateConfig(id, +appId, payload)
                    toastTitle = `${payload.name ? 'Updated' : 'Saved'}`
                    update(index, result)
                } else {
                    componentType === 'secret'
                        ? await overRideSecret(id, +appId, +envId, [payload])
                        : await overRideConfigMap(id, +appId, +envId, [payload])
                    toastTitle = 'Overridden'
                    update(true)
                }
                toast.success(
                    <div className="toast">
                        <div className="toast__title">{toastTitle}</div>
                        <div className="toast__subtitle">Changes will be reflected after next deployment.</div>
                    </div>,
                )
                toggleCollapse((collapse) => !collapse)
                dispatch({ type: ConfigMapActionTypes.success })
            } catch (err) {
                showError(err)
                dispatch({ type: ConfigMapActionTypes.error })
            } finally {
            }
        }

        async function handleDelete(e) {
            try {
                componentType === 'secret'
                    ? await deleteEnvSecret(id, appId, +envId, configMapSecretData?.name)
                    : await deleteEnvConfigMap(id, appId, envId, configMapSecretData?.name)
                toast.success('Restored to global.')

                update(index, null)
                toggleCollapse(not)
                dispatch({ type: ConfigMapActionTypes.success })
            } catch (err) {
                showError(err)
                dispatch({ type: ConfigMapActionTypes.error })
            } finally {
                dispatch({ type: ConfigMapActionTypes.toggleDialog })
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

        const handleAddParam = (): void => {
            if (isOverrideView) {
                if (isHashiOrAWS) {
                    dispatch({
                        type: ConfigMapActionTypes.setSecretData,
                        payload: [...state.secretData, { fileName: '', property: '', isBinary: true, name: '' }],
                    })
                } else {
                    dispatch({ type: ConfigMapActionTypes.addParam })
                }
            } else {
                if (isHashiOrAWS) {
                    dispatch({
                        type: ConfigMapActionTypes.setSecretData,
                        payload: [...state.secretData, { fileName: '', property: '', isBinary: true, name: '' }],
                    })
                } else
                    dispatch({
                        type: ConfigMapActionTypes.setExternalValues,
                        payload: [...state.externalValues, { k: '', v: '', keyError: '', valueError: '' }],
                    })
            }
        }

        const ExternalSecretHelpNote = () => {
            return (
                <div className="fs-13 fw-4 lh-18">
                    <NavLink
                        to={`${URLS.CHARTS_DISCOVER}?appStoreName=external-secret`}
                        className="dc__link"
                        target="_blank"
                    >
                        External Secrets Operator
                    </NavLink>
                    &nbsp;should be installed in the target cluster.&nbsp;
                    <a
                        className="dc__link"
                        href={DOCUMENTATION.EXTERNAL_SECRET}
                        rel="noreferrer noopener"
                        target="_blank"
                    >
                        Learn more
                    </a>
                </div>
            )
        }

        return (
            <>
                <form onSubmit={handleSubmit} className="override-config-map-form white-card__config-map mt-20">
                    {isOverrideView && configMapSecretData?.name && configMapSecretData?.global && (
                        <Override
                            external={state.external && state.selectedType === 'environment'}
                            overridden={!!state.duplicate}
                            onClick={handleOverride}
                            loading={state.overrideLoading}
                            type={componentType}
                        />
                    )}
                    <div className="form__row">
                        <label className="form__label">Data type</label>
                        <div className="form-row__select-external-type">
                            {componentType === 'secret' ? (
                                <>
                                    <ReactSelect
                                        placeholder="Select Secret Type"
                                        options={getTypeGroups()}
                                        defaultValue={
                                            state.externalType && state.externalType !== ''
                                                ? getTypeGroups(state.externalType)
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
                                        isDisabled={
                                            isOverrideView && configMapSecretData?.name && configMapSecretData?.global
                                        }
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
                                        isOverrideView && configMapSecretData?.name && configMapSecretData?.global
                                    }
                                />
                            )}
                        </div>
                    </div>
                    {(state.externalType === 'KubernetesSecret' || (componentType !== 'secret' && state.external)) && (
                        <InfoColourBar
                            classname="info_bar cn-9 mt-16 mb-16 lh-20"
                            message={
                                <div className="flex column left">
                                    <div className="dc__info-title">{EXTERNAL_INFO_TEXT[componentType].title}</div>
                                    <div className="dc__info-subtitle">
                                        {EXTERNAL_INFO_TEXT[componentType].infoText}
                                    </div>
                                </div>
                            }
                            Icon={InfoIcon}
                            iconSize={20}
                        />
                    )}
                    {!configMapSecretData?.name && (
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
                    )}
                    <label className="form__label form__label--lower">
                        How do you want to use this {componentType === 'secret' ? 'Secret' : 'ConfigMap'}?
                    </label>
                    <div className="form__row configmap-secret-usage-radio">
                        <RadioGroup
                            value={state.selectedType}
                            name="DeploymentAppTypeGroup"
                            onChange={toggleSelectedType}
                            disabled={!!(isOverrideView && configMapSecretData?.name && configMapSecretData?.global)}
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
                    {state.selectedType === 'volume' && (
                        <>
                            <div className="form__row">
                                <CustomInput
                                    dataTestid={`${componentType}-volume-path-textbox`}
                                    value={state.volumeMountPath.value}
                                    autoComplete="off"
                                    tabIndex={5}
                                    label={'Volume mount path*'}
                                    placeholder={'/directory-path'}
                                    helperText={'Keys are mounted as files to volume'}
                                    error={state.volumeMountPath.error}
                                    onChange={onMountPathChange}
                                    disabled={!state.duplicate}
                                />
                            </div>
                            <div className="mb-16">
                                <Checkbox
                                    isChecked={state.isSubPathChecked}
                                    onClick={stopPropagation}
                                    rootClassName="top"
                                    disabled={!state.duplicate}
                                    value={CHECKBOX_VALUE.CHECKED}
                                    onChange={toggleSubpath}
                                >
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
                                                <span className="cr-5">
                                                    Supported for Chart Versions 3.10 and above.
                                                </span>
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
                                </Checkbox>
                                {state.external && state.isSubPathChecked && (
                                    <div className="mb-16">
                                        <CustomInput
                                            value={state.externalSubpathValues.value}
                                            autoComplete="off"
                                            tabIndex={5}
                                            label={''}
                                            placeholder={'Enter keys (Eg. username,configs.json)'}
                                            error={state.externalSubpathValues.error}
                                            onChange={onExternalSubpathValuesChange}
                                            disabled={!state.duplicate}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="mb-16">
                                <Checkbox
                                    isChecked={state.isFilePermissionChecked}
                                    onClick={stopPropagation}
                                    rootClassName=""
                                    disabled={!state.duplicate || isChartVersion309OrBelow}
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
                                                <span className="cr-5">
                                                    Supported for Chart Versions 3.10 and above.
                                                </span>
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
                                        label={''}
                                        dataTestid="configmap-file-permission-textbox"
                                        placeholder={'eg. 0400 or 400'}
                                        error={state.filePermission.error}
                                        onChange={onFilePermissionChange}
                                        disabled={!state.duplicate || isChartVersion309OrBelow}
                                    />
                                </div>
                            )}
                        </>
                    )}
                    {(isHashiOrAWS || isESO) && (
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
                                    disabled={!state.duplicate || state.locked}
                                />
                            </div>
                        </div>
                    )}
                    <ConfigMapSecretDataEditorContainer
                        id={id}
                        configMapSecretData={configMapSecretData}
                        isOverrideView={isOverrideView}
                        componentType={componentType}
                        state={state}
                        dispatch={dispatch}
                        tempArr={tempArr}
                    />
                    {/* {(!isOverrideView || state.duplicate) && !state.yamlMode && (
                        <span className="dc__bold anchor pointer" onClick={handleAddParam}>
                            +Add params
                        </span>
                    )} */}
                    {/* {!(state.external && state.selectedType === 'environment') && (
                        <div className="form__buttons">
                            <button className="cta" type="submit">
                                {state.submitLoading ? <Progressing /> : 'Save'}
                            </button>
                        </div>
                    )} */}
                    {!(configMapSecretData?.external && configMapSecretData?.selectedType === 'environment') && (
                        <div className="form__buttons">
                            <button
                                disabled={!state.duplicate}
                                data-testid={`${componentType === 'secret' ? 'Secret' : 'ConfigMap'}-save-button`}
                                type="button"
                                className="cta"
                                onClick={handleSubmit}
                            >
                                {state.submitLoading ? (
                                    <Progressing />
                                ) : (
                                    `${configMapSecretData?.name ? 'Update' : 'Save'} ${
                                        componentType === 'secret' ? 'Secret' : 'ConfigMap'
                                    }`
                                )}
                            </button>
                        </div>
                    )}
                </form>

                {state.dialog && (
                    <ConfirmationDialog className="confirmation-dialog__body--w-400">
                        <ConfirmationDialog.Icon src={warningIcon} />
                        <ConfirmationDialog.Body
                            title="Delete override ?"
                            subtitle="Are you sure you want to delete the modified configuration. This action can’t be undone."
                        />
                        <ConfirmationDialog.ButtonGroup>
                            <button
                                type="button"
                                className="cta cancel"
                                onClick={(e) => dispatch({ type: ConfigMapActionTypes.toggleDialog })}
                            >
                                Cancel
                            </button>
                            <button type="button" className="cta delete" onClick={handleDelete}>
                                Confirm
                            </button>
                        </ConfirmationDialog.ButtonGroup>
                    </ConfirmationDialog>
                )}
            </>
        )
    },
)
