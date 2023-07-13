import React, { useReducer, useRef } from 'react'
import { overRideConfigMap, deleteConfigMap, unlockEnvSecret } from '../service'
import { useParams } from 'react-router'
import { Info, RadioGroup, CustomInput, isVersionLessThanOrEqualToTarget, isChartRef3090OrBelow } from '../../common'
import {
    showError,
    Progressing,
    ConfirmationDialog,
    Checkbox,
    CHECKBOX_VALUE,
    not,
    stopPropagation,
} from '@devtron-labs/devtron-fe-common-lib'
import { KeyValueInput, useKeyValueYaml } from '../../configMaps/ConfigMap'
import { toast } from 'react-toastify'
import warningIcon from '../../../assets/img/warning-medium.svg'
import CodeEditor from '../../CodeEditor/CodeEditor'
import YAML from 'yaml'
import { DOCUMENTATION, PATTERNS, ROLLOUT_DEPLOYMENT } from '../../../config'
import { Override, Tab } from '../ConfigMapSecret.components'
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
    handleSecretDataYamlChange,
    unlockSecrets,
} from '../Secret/secret.utils'
import { Option } from '../../v2/common/ReactSelect.utils'
import '../../EnvironmentOverride/environmentOverride.scss'

export const ConfigMapSecretForm = React.memo(
    ({
        appChartRef,
        toggleCollapse,
        configMapSecretData,
        id,
        reload,
        isOverrideView,
        componentType,
    }: ConfigMapSecretFormProps): JSX.Element => {
        const memoizedReducer = React.useCallback(ConfigMapReducer, [])

        function memoisedRemove(e, idx) {
            dispatch({ type: ConfigMapActionTypes.keyValueDelete, payload: { index: idx } })
        }
        const [state, dispatch] = useReducer(memoizedReducer, initState(configMapSecretData))
        const tabs = [
            { title: 'Environment Variable', value: 'environment' },
            { title: 'Data Volume', value: 'volume' },
        ].map((data) => ({
            ...data,
            active: data.value === state.selectedType,
        }))
        const { appId, envId } = useParams<{ appId; envId }>()
        const tempArr = useRef([])
        function setKeyValueArray(arr) {
            tempArr.current = arr
        }
        const { yaml, handleYamlChange, error } = useKeyValueYaml(
            state.duplicate,
            setKeyValueArray,
            PATTERNS.CONFIG_MAP_AND_SECRET_KEY,
            `Key must consist of alphanumeric characters, '.', '-' and '_'`,
        )
        const isChartVersion309OrBelow =
            appChartRef &&
            appChartRef.name === ROLLOUT_DEPLOYMENT &&
            isVersionLessThanOrEqualToTarget(appChartRef.version, [3, 9]) &&
            isChartRef3090OrBelow(appChartRef.id)

        const isHashiOrAWS = componentType === 'secret' && hasHashiOrAWS(state.externalType)
        const isESO = componentType === 'secret' && hasESO(state.externalType)

        function changeEditorMode() {
            if (state.yamlMode) {
                if (state.duplicate) {
                    dispatch({
                        type: ConfigMapActionTypes.multipleOptions,
                        payload: { duplicate: tempArr.current, yamlMode: !state.yamlMode },
                    })
                    tempArr.current = []
                    return
                }
                tempArr.current = []
            }
            dispatch({ type: ConfigMapActionTypes.toggleYamlMode })
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
                        state.configName,
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
                            mountPath: state.mountPath || configMapSecretData?.defaultMountPath,
                        },
                    })
                }
            }
        }

        function handleSecretDataChange(index: number, key: string, value: string | boolean): void {
            const _secretData = [...state.secretData]
            _secretData[index] = { ...state[index], [key]: value }
            let json = [..._secretData]
            json = json.map((j) => {
                let temp = {}
                temp['isBinary'] = j.isBinary
                if (j.fileName) {
                    temp['key'] = j.fileName
                }
                if (j.property) {
                    temp['property'] = j.property
                }
                if (j.name) {
                    temp['name'] = j.name
                }
                return temp
            })
            dispatch({
                type: ConfigMapActionTypes.multipleOptions,
                payload: { secretDataYaml: YAML.stringify(json), secretData: _secretData },
            })
        }

        function handleSecretDataDelete(index: number): void {
            const _secretData = [...state.secretData]
            _secretData.splice(index, 1)
            let json = [..._secretData]
            json = json.map((j) => {
                return {
                    key: j.fileName,
                    name: j.name,
                    property: j.property,
                    isBinary: j.isBinary,
                }
            })
            dispatch({
                type: ConfigMapActionTypes.multipleOptions,
                payload: { secretDataYaml: YAML.stringify(json), secretData: _secretData },
            })
        }

        const handleSecretYamlChange = (yaml) => {
            handleSecretDataYamlChange(yaml, state.codeEditorRadio, isESO, dispatch)
        }

        function stringify(value) {
            if (!value) return value
            if (typeof value === 'object') {
                return YAML.stringify(value, { indent: 2 })
            }
            if (typeof value === 'string') {
                return value
            }
            try {
                return value.toString()
            } catch (err) {
                return ''
            }
        }

        async function handleSubmit(e) {
            e.preventDefault()
            let dataArray = state.yamlMode ? tempArr.current : state.duplicate
            const isInvalid = dataArray.some(
                (dup) => !dup.k || !new RegExp(PATTERNS.CONFIG_MAP_AND_SECRET_KEY).test(dup.k),
            )
            if (isInvalid) {
                if (!state.yamlMode) {
                    dispatch({ type: ConfigMapActionTypes.createErrors })
                }
                return
            }
            if (state.selectedType === 'volume' && state.isFilePermissionChecked && !isChartVersion309OrBelow) {
                if (!state.filePermission.value) {
                    dispatch({
                        type: ConfigMapActionTypes.setFilePermission,
                        payload: { value: state.filePermission.value, error: 'This is a required field' },
                    })
                    return
                } else if (state.filePermission.value.length > 4) {
                    dispatch({
                        type: ConfigMapActionTypes.setFilePermission,
                        payload: { value: state.filePermission.value, error: 'More than 4 characters are not allowed' },
                    })
                    return
                } else if (state.filePermission.value.length === 4) {
                    if (!state.filePermission.value.startsWith('0')) {
                        dispatch({
                            type: ConfigMapActionTypes.setFilePermission,
                            payload: {
                                value: state.filePermission.value,
                                error: '4 characters are allowed in octal format only, first character should be 0',
                            },
                        })
                        return
                    }
                } else if (state.filePermission.value.length < 3) {
                    dispatch({
                        type: ConfigMapActionTypes.setFilePermission,
                        payload: { value: state.filePermission.value, error: 'Atleast 3 character are required' },
                    })
                    return
                }
                if (!new RegExp(PATTERNS.ALL_DIGITS_BETWEEN_0_AND_7).test(state.filePermission.value)) {
                    dispatch({
                        type: ConfigMapActionTypes.setFilePermission,
                        payload: {
                            value: state.filePermission.value,
                            error: 'This is octal number, use numbers between 0 to 7',
                        },
                    })
                    return
                }
            }
            if (dataArray.length === 0 && !state.external) {
                toast.error('Configmaps without any data are not allowed.')
                return
            }
            try {
                let payload = {
                    name: state.configName.value,
                    type: state.selectedType,
                    external: state.external,
                    data: dataArray.reduce((agg, { k, v }) => ({ ...agg, [k]: v ?? '' }), {}),
                }

                if (state.selectedType === 'volume') {
                    payload['mountPath'] = state.mountPath
                    if (!state.external && !isChartVersion309OrBelow) {
                        payload['subPath'] = state.subPath
                    }
                    if (state.isFilePermissionChecked && !isChartVersion309OrBelow) {
                        payload['filePermission'] =
                            state.filePermission.value.length == 3
                                ? `0${state.filePermission.value}`
                                : `${state.filePermission.value}`
                    }
                }

                dispatch({ type: ConfigMapActionTypes.submitLoading })
                await overRideConfigMap(id, +appId, +envId, [payload])
                await reload()
                toast.success(
                    <div className="toast">
                        <div className="toast__title">Overridden</div>
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
                const { result } = await deleteConfigMap(id, +appId, +envId, state.configName.value)
                toggleCollapse(not)
                await reload()
                toast.success('Restored to global.')
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
            dispatch({ type: ConfigMapActionTypes.setExternalType, payload: selectedExternalType.value })
        }

        const toggleSelectedType = (title: string): void => {
            dispatch({ type: ConfigMapActionTypes.setSelectedType, payload: title })
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
            dispatch({ type: ConfigMapActionTypes.setConfigName, payload: e.target.value })
        }

        return (
            <>
                <form onSubmit={handleSubmit} className="override-config-map-form white-card__config-map mt-2">
                    {isOverrideView && state.configName && configMapSecretData?.global && (
                        <Override
                            external={state.external && state.selectedType === 'environment'}
                            overridden={!!state.duplicate}
                            onClick={handleOverride}
                            loading={state.overrideLoading}
                        />
                    )}
                    <div className="form__row">
                        <label className="form__label">Data type</label>
                        <div className="form-row__select-external-type">
                            {componentType === 'secret' ? (
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
                    {!configMapSecretData?.name && (
                        <>
                            {state.external && (
                                <div className="dc__info-container mb-24">
                                    <Info />
                                    <div className="flex column left">
                                        <div className="dc__info-title">Using External Configmaps</div>
                                        <div className="dc__info-subtitle">
                                            Configmap will not be created by system. However, they will be used inside
                                            the pod. Please make sure that configmap with the same name is present in
                                            the environment.
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="form__row">
                                <label className="form__label">Name*</label>
                                <input
                                    data-testid="configmap-name-textbox"
                                    value={state.configName.value}
                                    autoComplete="off"
                                    autoFocus
                                    onChange={onConfigNameChange}
                                    type="text"
                                    className={`form__input`}
                                    placeholder={`random-configmap`}
                                />
                                {state.configName.error && (
                                    <label className="form__error">{state.configName.error}</label>
                                )}
                            </div>
                        </>
                    )}
                    <label className="form__label form__label--lower">{`How do you want to use this ConfigMap?`}</label>
                    <div className={`form__row form-row__tab`}>
                        {tabs.map((tabData, idx) => (
                            <Tab
                                {...tabData}
                                key={idx}
                                disabled={
                                    !!(isOverrideView && configMapSecretData?.name && configMapSecretData?.global)
                                }
                                onClick={toggleSelectedType}
                                type="configmap"
                            />
                        ))}
                    </div>
                    {state.selectedType === 'volume' && (
                        <>
                            <div className="form__row">
                                <CustomInput
                                    dataTestid="configmap-volume-path-textbox"
                                    value={state.volumeMountPath.value}
                                    autoComplete="off"
                                    tabIndex={5}
                                    label={'Volume mount path*'}
                                    placeholder={'/directory-path'}
                                    helperText={'Keys are mounted as files to volume'}
                                    error={state.volumeMountPath.error}
                                    onChange={onMountPathChange}
                                    disabled={
                                        isOverrideView && configMapSecretData?.name && configMapSecretData?.global
                                    }
                                />
                            </div>
                            <div className="mb-16">
                                <Checkbox
                                    isChecked={state.isSubPathChecked}
                                    onClick={stopPropagation}
                                    rootClassName="top"
                                    disabled={isChartVersion309OrBelow}
                                    value={CHECKBOX_VALUE.CHECKED}
                                    onChange={toggleSubpath}
                                >
                                    <span data-testid="configmap-sub-path-checkbox" className="mb-0">
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
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="mb-16">
                                <Checkbox
                                    isChecked={state.isFilePermissionChecked}
                                    onClick={stopPropagation}
                                    rootClassName=""
                                    disabled={isChartVersion309OrBelow}
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
                                        disabled={isChartVersion309OrBelow}
                                        placeholder={'eg. 0400 or 400'}
                                        error={state.filePermission.error}
                                        onChange={onFilePermissionChange}
                                    />
                                </div>
                            )}
                        </>
                    )}
                    {(isHashiOrAWS || isESO) && (
                        <div className="form__row form__row--flex">
                            <div className="w-50">
                                <CustomInput
                                    value={state.roleARN}
                                    autoComplete="off"
                                    label={'Role ARN'}
                                    disabled={state.locked}
                                    placeholder={'Enter Role ARN'}
                                    onChange={handleRoleARNChange}
                                />
                            </div>
                        </div>
                    )}
                    {!state.external && (
                        <>
                            <div className="flex left mb-16">
                                <b className="mr-5 dc__bold">Data*</b>
                                <RadioGroup
                                    className="gui-yaml-switch"
                                    name="yaml-mode"
                                    initialTab={state.yamlMode ? 'yaml' : 'gui'}
                                    disabled={false}
                                    onChange={changeEditorMode}
                                >
                                    <RadioGroup.Radio value="gui" dataTestId="gui-from-config-map">
                                        GUI
                                    </RadioGroup.Radio>
                                    <RadioGroup.Radio value="yaml" dataTestId="yaml-from-config-map">
                                        YAML
                                    </RadioGroup.Radio>
                                </RadioGroup>
                            </div>

                            {state.yamlMode ? (
                                <div className="yaml-container">
                                    <CodeEditor
                                        value={
                                            state.duplicate
                                                ? yaml
                                                : YAML.stringify(configMapSecretData?.defaultData, { indent: 2 })
                                        }
                                        mode="yaml"
                                        inline
                                        height={350}
                                        onChange={handleYamlChange}
                                        //readOnly={!state.duplicate}
                                        shebang="#key: value"
                                    >
                                        <CodeEditor.Header>
                                            <CodeEditor.ValidationError />
                                            <CodeEditor.Clipboard />
                                        </CodeEditor.Header>
                                        {error && (
                                            <div className="validation-error-block">
                                                <Info color="#f32e2e" style={{ height: '16px', width: '16px' }} />
                                                <div>{error}</div>
                                            </div>
                                        )}
                                    </CodeEditor>
                                </div>
                            ) : state.duplicate ? (
                                state.duplicate.map((config, idx) => (
                                    <KeyValueInput
                                        keyLabel={state.selectedType === 'volume' ? 'File Name' : 'Key'}
                                        valueLabel={state.selectedType === 'volume' ? 'File Content' : 'Value'}
                                        {...config}
                                        index={idx}
                                        key={idx}
                                        onChange={(index, k, v) =>
                                            dispatch({
                                                type: ConfigMapActionTypes.keyValueChange,
                                                payload: { index, k, v },
                                            })
                                        }
                                        onDelete={memoisedRemove}
                                    />
                                ))
                            ) : (
                                Object.keys(configMapSecretData?.defaultData).map((config, idx) => (
                                    <KeyValueInput
                                        keyLabel={state.selectedType === 'volume' ? 'File Name' : 'Key'}
                                        valueLabel={state.selectedType === 'volume' ? 'File Content' : 'Value'}
                                        k={config}
                                        v={stringify(configMapSecretData?.defaultData[config])}
                                        index={idx}
                                        onChange={null}
                                        onDelete={null}
                                    />
                                ))
                            )}
                        </>
                    )}
                    {state.duplicate && !state.yamlMode && (
                        <span
                            className="dc__bold anchor pointer"
                            onClick={(e) => dispatch({ type: ConfigMapActionTypes.addParam })}
                        >
                            +Add params
                        </span>
                    )}
                    {!(state.external && state.selectedType === 'environment') && (
                        <div className="form__buttons">
                            <button className="cta" type="submit">
                                {state.submitLoading ? <Progressing /> : 'Save'}
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
