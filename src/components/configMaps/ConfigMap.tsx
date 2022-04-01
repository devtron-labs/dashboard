import React, { useState, useEffect, useRef } from 'react'
import { Progressing, showError, Select, useThrottledEffect, RadioGroup, not, Info, CustomInput, Checkbox, CHECKBOX_VALUE, isVersionLessThanOrEqualToTarget, isChartRef3090OrBelow } from '../common'
import { useParams } from 'react-router'
import { updateConfig, deleteConfig } from './service';
import { getAppChartRef, getConfigMapList } from '../../services/service';
import { overRideConfigMap, deleteConfigMap as deleteEnvironmentConfig } from '../EnvironmentOverride/service'
import { toast } from 'react-toastify';
import CodeEditor from '../CodeEditor/CodeEditor'
import YAML from 'yaml'
import { DOCUMENTATION, PATTERNS } from '../../config';
import arrowTriangle from '../../assets/icons/ic-chevron-down.svg';
import { ReactComponent as File } from '../../assets/icons/ic-file.svg';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { ReactComponent as Trash } from '../../assets/icons/ic-delete.svg';
import './ConfigMap.scss'

const EXTERNAL_TYPES = {
    "": "Kubernetes ConfigMap",
    "KubernetesConfigMap": "Kubernetes External ConfigMap"
}

const ConfigMap = ({ respondOnSuccess, ...props }) => {
    const { appId } = useParams<{ appId }>()
    const [configmap, setConfigmap] = useState<{ id: number, configData: any[], appId: number }>()
    const [configmapLoading, setConfigmapLoading] = useState(true)
    const [appChartRef, setAppChartRef] = useState<{ id: number, version: string }>();

    useEffect(() => {
        async function initialise() {
            try {
                const appChartRefRes = await getAppChartRef(appId);
                const configmapRes = await getConfigMapList(appId);
                setConfigmap({
                    appId: configmapRes.result.appId,
                    id: configmapRes.result.id,
                    configData: configmapRes.result.configData || [],
                })
                setAppChartRef(appChartRefRes.result);
            } catch (error) {

            } finally {
                setConfigmapLoading(false);
            }
        }
        initialise();
    }, [appId])

    async function reload() {
        try {
            const configmapRes = await getConfigMapList(appId);
            setConfigmap({
                appId: configmapRes.result.appId,
                id: configmapRes.result.id,
                configData: configmapRes.result.configData || [],
            })
        } catch (error) {

        }
    }

    if (configmapLoading) {
        return <Progressing pageLoader />
    }

    let configData = [{ id: null, name: null }].concat(configmap?.configData);
    return <div className="form__app-compose">
        <h1 className="form__title form__title--artifacts">ConfigMaps</h1>
        <p className="form__subtitle form__subtitle--artifacts">ConfigMap is used to store common configuration variables, allowing users to unify environment variables for different modules in a distributed system into one object.&nbsp;
            <a rel="noreferrer noopener" className="learn-more__href" href={DOCUMENTATION.APP_CREATE_CONFIG_MAP} target="blank">Learn more about ConfigMaps</a>
        </p>
        {configData.map((cm, idx) => {
            return <CollapsedConfigMapForm key={cm.name || Math.random().toString(36).substr(2, 5)} {...{ ...cm, title: cm.name ? '' : 'Add ConfigMap' }}
                appChartRef={appChartRef}
                appId={appId} id={configmap.id}
                update={reload}
                index={idx} />
        })}
    </div>
}

interface KeyValueInputInterface {
    keyLabel: string;
    valueLabel: string;
    k: string;
    v: string;
    index: number;
    onChange: any;
    onDelete: any;
    keyError?: string;
    valueError?: string;
    valueType?: string;
}

export const KeyValueInput: React.FC<KeyValueInputInterface> = React.memo(({ keyLabel, valueLabel, k, v, index, onChange, onDelete, keyError = "", valueError = "", valueType = "textarea", ...rest }) => {
    return (
        <article className="form__key-value-inputs">
            {typeof onDelete === 'function' && <Trash onClick={e => onDelete(e, index)} className="cursor icon-delete icon-n4" />}
            <div className="form__field">
                <label>{keyLabel}
                    <input type="text" autoComplete="off" placeholder="" value={k} onChange={e => onChange(index, e.target.value, v)} className="form__input" disabled={typeof onChange !== 'function'} />
                    {keyError ? <span className="form__error">{keyError}</span> : <div />}
                </label>
            </div>
            <div className="form__field">
                <label>{valueLabel}</label>
                {valueType === 'textarea' ?
                    <ResizableTextarea value={v} onChange={e => onChange(index, k, e.target.value)} disabled={typeof onChange !== 'function'} placeholder="" maxHeight={300} />
                    : <input type="text" autoComplete="off" value={v} onChange={e => onChange(index, k, e.target.value)} className="form__input" disabled={typeof onChange !== 'function'} />
                }
                {valueError ? <span className="form__error">{valueError}</span> : <div />}
            </div>
        </article>
    )
})

export function CollapsedConfigMapForm({ appChartRef, title = "", name = "", type = "environment", external = false, data = null, id = null, appId, update = null, index = null, filePermission = "", subPath = false, ...rest }) {
    const [collapsed, toggleCollapse] = useState(true)
    return <section className="mb-12 br-8 bcn-0 bw-1 en-2 pl-20 pr-20 pt-19 pb-19">{collapsed
        ? <ListComponent title={name || title} name={name} onClick={e => toggleCollapse(!collapsed)} collapsible={!title} className={title ? 'fw-5 cb-5 fs-14' : 'fw-5 cn-9 fs-14'} />
        : <ConfigMapForm {...{ appChartRef, name, type, external, data, id, appId, isUpdate: !title, collapse: e => toggleCollapse(!collapsed), update, index, filePermission, subPath, ...rest }} />}
    </section>
}

export function Tab({ title, active, onClick }) {
    return (
        <nav className={`form__tab white-card flex left ${active ? 'active' : ''}`} onClick={e => onClick(title)}>
            <div className="tab__selector"></div>
            <div className="tab__title">{title}</div>
        </nav>
    )
}

interface ResizableTextareaProps {
    minHeight?: number;
    maxHeight?: number;
    value?: string;
    onChange?: (e) => void;
    className?: string;
    placeholder?: string;
    lineHeight?: number;
    padding?: number;
    disabled?: boolean;
    name?: string;
}

export const ResizableTextarea: React.FC<ResizableTextareaProps> = ({ minHeight, maxHeight, value, onChange = null, className = "", placeholder = "Enter your text here..", lineHeight = 14, padding = 12, disabled = false, ...props }) => {
    const [text, setText] = useState("")
    const _textRef = useRef(null)

    useEffect(() => {
        setText(value)
    }, [value])

    function handleChange(e) {
        e.persist();
        setText(e.target.value)
        if (typeof onChange === 'function') onChange(e)
    }

    useThrottledEffect(() => {
        _textRef.current.style.height = 'auto';
        let nextHeight = _textRef.current.scrollHeight
        if (minHeight && nextHeight < minHeight) {
            nextHeight = minHeight
        }
        if (maxHeight && nextHeight > maxHeight) {
            nextHeight = maxHeight
        }
        _textRef.current.style.height = nextHeight + 2 + 'px';
    }, 500, [text])

    return (
        <textarea
            ref={el => _textRef.current = el}
            value={text}
            placeholder={placeholder}
            className={`resizable-textarea ${className}`}
            onChange={handleChange}
            style={{ lineHeight: `${lineHeight}px`, padding: `${padding}px` }}
            spellCheck={false}
            disabled={disabled}
            {...props}
        />
    );
}

export function ListComponent({ title, name = "", subtitle = "", onClick, className = "", collapsible = false }) {
    return <article className={`configuration-list pointer ${className}`} onClick={typeof onClick === 'function' ? onClick : function () { }}>
        {!name ? <Add className="configuration-list__logo icon-dim-24 fcb-5" /> : <File className="configuration-list__logo icon-dim-24" />}
        <div className="configuration-list__info">
            <div className="configuration-list__title">{title}</div>
            {subtitle && <div className="configuration-list__subtitle">{subtitle}</div>}
        </div>
        {collapsible && <img className="configuration-list__arrow pointer" alt="" src={arrowTriangle} />}
    </article>
}

interface keyValueYaml {
    yaml: string;
    handleYamlChange: any;
    error: string;
}
interface KeyValue {
    k: string;
    v: string;
    keyError?: string;
    valueError?: string;
}
interface KeyValueValidated {
    isValid: boolean;
    arr: KeyValue[];
}
export function validateKeyValuePair(arr: KeyValue[]): KeyValueValidated {
    let isValid = true
    arr = arr.reduce((agg, { k, v }) => {
        if (!k && typeof v !== 'string') {
            // filter when both are missing
            return agg
        }
        let keyError: string;
        let valueError: string;
        if (k && typeof v !== 'string') {
            valueError = 'value must not be empty'
            isValid = false
        }
        if (typeof v === 'string' && !PATTERNS.CONFIG_MAP_AND_SECRET_KEY.test(k)) {
            keyError = `Key '${k}' must consist of alphanumeric characters, '.', '-' and '_'`
            isValid = false
        }
        return [...agg, { k, v, keyError, valueError }]
    }, [])
    return { isValid, arr }
}

export function ConfigMapForm({ appChartRef, id, appId, name = "", external, data = null, type = 'environment', mountPath = "", isUpdate = true, collapse = null, index: listIndex, update: updateForm, subPath, filePermission }) {
    const [selectedTab, selectTab] = useState(type === 'environment' ? 'Environment Variable' : 'Data Volume')
    const [isExternalValues, toggleExternalValues] = useState(external)
    const [externalValues, setExternalValues] = useState([])
    const [configName, setName] = useState({ value: name, error: "" })
    const [volumeMountPath, setVolumeMountPath] = useState({ value: mountPath, error: "" })
    const [loading, setLoading] = useState(false)
    const { envId } = useParams<{ envId }>()
    const [yamlMode, toggleYamlMode] = useState(true)
    const { yaml, handleYamlChange, error } = useKeyValueYaml(externalValues, setKeyValueArray, PATTERNS.CONFIG_MAP_AND_SECRET_KEY, `Key must consist of alphanumeric characters, '.', '-' and '_'`)
    const tempArray = useRef([])
    const [isSubPathChecked, setIsSubPathChecked] = useState(!!subPath)
    const [isFilePermissionChecked, setIsFilePermissionChecked] = useState(!!filePermission)
    const [filePermissionValue, setFilePermissionValue] = useState({ value: filePermission, error: "" });
    const isChartVersion309OrBelow = appChartRef && isVersionLessThanOrEqualToTarget(appChartRef.version, [3, 9]) && isChartRef3090OrBelow(appChartRef.id);
    const [externalSubpathValues, setExternalSubpathValues] = useState({value: data ? Object.keys(data).join(',') : '' , error: "" })
    function setKeyValueArray(arr) {
        tempArray.current = arr
    }

    useEffect(() => {

        if (data) {
            setExternalValues(Object.keys(data).map(k => ({ k, v: typeof data[k] === 'object' ? YAML.stringify(data[k], { indent: 2 }) : data[k], keyError: "", valueError: "" })))
        }
        else {
            setExternalValues([{ k: "", v: "", keyError: "", valueError: "" }])
        }
    }, [data])

    function handleChange(index, k, v) {
        setExternalValues(state => {
            state[index] = { k, v, keyError: "", valueError: "" };
            return [...state];
        })
    }

    async function handleDelete() {
        try {
            if (!envId) {
                await deleteConfig(id, appId, name)
                toast.success('Successfully deleted')
                updateForm(listIndex, null)
            }
            else {
                await deleteEnvironmentConfig(id, appId, envId, name);
                toast.success('Successfully deleted')
                updateForm(true)
            }
        }
        catch (err) {
            showError(err)
        }
    }

    function handleFilePermission(e): void {
        let permissionValue = e.target.value;
        setFilePermissionValue({ value: permissionValue, error: "" });
    }

    async function handleSubmit(e) {
        const configmapNameRegex = new RegExp(PATTERNS.CONFIGMAP_AND_SECRET_NAME);
        if (!configName.value) {
            setName({ value: "", error: 'This is a required field' })
            return
        }
        if (configName.value.length > 253) {
            setName({ value: configName.value, error: 'More than 253 characters are not allowed' })
            return
        }
        if (!configmapNameRegex.test(configName.value)) {
            setName({ value: configName.value, error: `Name must start and end with an alphanumeric character. It can contain only lowercase alphanumeric characters, '-' or '.'` })
            return
        }
        if (selectedTab === 'Data Volume' && !volumeMountPath.value) {
            setVolumeMountPath({ value: volumeMountPath.value, error: 'This is a required field' })
            return
        }
        if (selectedTab === 'Data Volume' && isFilePermissionChecked && !isChartVersion309OrBelow) {
            if (!filePermissionValue.value) {
                setFilePermissionValue({ value: filePermissionValue.value, error: 'This is a required field' });
                return;
            }
            else if (filePermissionValue.value.length > 4) {
                setFilePermissionValue({ value: filePermissionValue.value, error: 'More than 4 characters are not allowed' });
                return;
            }
            else if (filePermissionValue.value.length === 4) {
                if (!filePermissionValue.value.startsWith('0')) {
                    setFilePermissionValue({ value: filePermissionValue.value, error: '4 characters are allowed in octal format only, first character should be 0' });
                    return;
                }
            }
            else if (filePermissionValue.value.length < 3) {
                setFilePermissionValue({ value: filePermissionValue.value, error: 'Atleast 3 character are required' });
                return;
            }
            if (!new RegExp(PATTERNS.ALL_DIGITS_BETWEEN_0_AND_7).test(filePermissionValue.value)) {
                setFilePermissionValue({ value: filePermissionValue.value, error: 'This is octal number, use numbers between 0 to 7' });
                return;
            }
         if(selectedTab === 'Data Volume' && isSubPathChecked && isExternalValues ){
                if (!externalSubpathValues.value) {
                    setExternalSubpathValues({ value: externalSubpathValues.value, error: 'This is a required field' });
                    return;
                }
                if (!new RegExp(PATTERNS.CONFIG_MAP_AND_SECRET_MULTPLS_KEYS).test(externalSubpathValues.value)) {
                    setExternalSubpathValues({ value: externalSubpathValues.value, error: `Use (a-z), (0-9), (-), (_),(.); Do not use 'spaces'. Use (,) to separate multiple keys `});
                    return;
                }
            }
        }

        let dataArray = yamlMode ? tempArray.current : externalValues
        const { isValid, arr } = validateKeyValuePair(dataArray)
        if (!isValid) {
            setExternalValues(arr)
            return
        }
        if (arr.length === 0 && !isExternalValues) {
            toast.error('Configmaps without any key value pairs are not allowed')
            return
        }
        try {
            let data = arr.reduce((agg, curr) => {
                if (!curr.k) return agg
                agg[curr.k] = curr.v || ""
                return agg
            }, {})
            setLoading(true)
            let payload = {
                name: configName.value,
                data,
                type: selectedTab === 'Environment Variable' ? 'environment' : 'volume',
                external: isExternalValues,
            }
            if (selectedTab === 'Data Volume') {
                payload['mountPath'] = volumeMountPath.value;
                if (!isChartVersion309OrBelow) {
                    payload['subPath'] = isSubPathChecked;
                }
                if (isFilePermissionChecked && !isChartVersion309OrBelow) {
                    payload['filePermission'] = filePermissionValue.value.length === 3 ? `0${filePermissionValue.value}` : `${filePermissionValue.value}`;
                }
                if (isSubPathChecked && isExternalValues){
                    const externalSubpathKey = externalSubpathValues.value.split(',')
                    const secretKeys = {}
                    externalSubpathKey.forEach((key)=> secretKeys[key] = '')
                    payload['data'] = secretKeys
                }
            }
            if (!envId) {
                const { result } = await updateConfig(id, +appId, payload)
                toast.success(
                    <div className="toast">
                        <div className="toast__title">{name ? 'Updated' : 'Saved'}</div>
                        <div className="toast__subtitle">Changes will be reflected after next deployment.</div>
                    </div>
                    , { autoClose: null })
                if (typeof updateForm === 'function') {
                    collapse();
                    updateForm(listIndex, result)
                }
            }
            else {
                await overRideConfigMap(id, +appId, +envId, [payload])
                toast.success(
                    <div className="toast">
                        <div className="toast__title">Overridden</div>
                        <div className="toast__subtitle">Changes will be reflected after next deployment.</div>
                    </div>
                    , { autoClose: null })
                collapse()
                updateForm(true)
            }
        }
        catch (err) {
            showError(err)
        }
        finally {
            setLoading(false)
        }
    }

    function handleDeleteParam(e, idx) {
        let temp = [...externalValues]
        temp.splice(idx, 1);
        setExternalValues(temp)
    }

    function changeEditorMode(e) {
        if (yamlMode) {
            setExternalValues(tempArray.current)
            toggleYamlMode(not)
            tempArray.current = []
            return
        }
        toggleYamlMode(not)
    }
    const tabs = [{ title: 'Environment Variable' }, { title: 'Data Volume' }].map(data => ({ ...data, active: data.title === selectedTab }))

    return (
        <div className="white-card__config-map">
            <div className="white-card__header">
                {!envId && <div>{isUpdate ? `Edit ConfigMap` : `Add ConfigMap`}</div>}
                <div className="uncollapse__delete flex">
                    {isUpdate && <Trash className="cursor icon-delete icon-n4" onClick={handleDelete} />}
                    {typeof collapse === 'function' && !envId && <img onClick={collapse} src={arrowTriangle} className="rotate pointer" style={{ ['--rotateBy' as any]: '-180deg' }} />}
                </div>
            </div>
            <div className="form__row">
                <label className="form__label">Data type</label>
                <div className="form-row__select-external-type flex">
                    <Select value={isExternalValues ? "KubernetesConfigMap" : ""} onChange={e => { toggleExternalValues(e.target.value !== "") }}>
                        <Select.Button>{isExternalValues ? "Kubernetes External ConfigMap" : "Kubernetes ConfigMap"}</Select.Button>
                        {Object.entries(EXTERNAL_TYPES).map(([value, name]) => <Select.Option key={value} value={value}>{name}</Select.Option>)}
                    </Select>
                </div>
            </div>
            {isExternalValues ? <div className="info__container mb-24">
                <Info />
                <div className="flex column left">
                    <div className="info__title">Using External Configmaps</div>
                    <div className="info__subtitle">Configmap will not be created by system. However, they will be used inside the pod. Please make sure that configmap with the same name is present in the environment.</div>
                </div>
            </div> : null}
            <div className="form__row">
                <label className="form__label">Name*</label>
                <input value={configName.value} autoComplete="off" autoFocus onChange={(e) => setName({ value: e.target.value, error: "" })} type="text" className={`form__input`} placeholder={`random-configmap`} disabled={isUpdate} />
                {configName.error && <label className="form__error">{configName.error}</label>}
            </div>
            <label className="form__label form__label--lower">{`How do you want to use this ConfigMap?`}</label>
            <div className={`form__row form-row__tab`}>
                {tabs.map((data, idx) => <Tab {...data} key={idx} onClick={title => selectTab(title)} />)}
            </div>

            {selectedTab === 'Data Volume' ? <div className="form__row">
                <CustomInput value={volumeMountPath.value}
                    autoComplete="off"
                    tabIndex={5}
                    label={"Volume mount path*"}
                    placeholder={"/directory-path"}
                    helperText={"Keys are mounted as files to volume"}
                    error={volumeMountPath.error}
                    onChange={e => setVolumeMountPath({ value: e.target.value, error: "" })} />
            </div> : null}
            {selectedTab === 'Data Volume' ?
                <div className="mb-16">
                    <Checkbox isChecked={isSubPathChecked}
                        onClick={(e) => { e.stopPropagation(); }}
                        rootClassName="top"
                        disabled={isChartVersion309OrBelow}
                        value={CHECKBOX_VALUE.CHECKED}
                        onChange={(e) => setIsSubPathChecked(!isSubPathChecked)}>
                        <span className="mb-0">Set SubPath (same as
                            <a href="https://kubernetes.io/docs/concepts/storage/volumes/#using-subpath" className="ml-5 mr-5 anchor" target="_blank" rel="noopener noreferer">
                                subPath
                            </a>
                            for volume mount)<br></br>
                            {isSubPathChecked ? <span className="mb-0 cn-5 fs-11">{ isExternalValues ? 'Please provide keys of config map to be mounted' : 'Keys will be used as filename for subpath'}</span> : null}
                           
                            {isChartVersion309OrBelow ? <span className="fs-12 fw-5">
                                <span className="cr-5">Supported for Chart Versions 3.10 and above.</span>
                                <span className="cn-7 ml-5">Learn more about </span>
                                <a href="https://docs.devtron.ai/user-guide/creating-application/deployment-template" rel="noreferrer noopener" target="_blank">Deployment Template &gt; Chart Version</a>
                            </span> : null}
                        </span>
                    </Checkbox>
                    { isExternalValues  && isSubPathChecked? <div className="mb-16">
                        <CustomInput value={externalSubpathValues.value}
                            autoComplete="off"
                            tabIndex={5}
                            label={""}
                            placeholder={"Enter keys (Eg. username,configs.json)"}
                            error={externalSubpathValues.error}
                            onChange={(e) => setExternalSubpathValues({ value: e.target.value, error: "" })}
            />
        </div> : ""}
                </div> : ""}
           
            {selectedTab === 'Data Volume' ? <div className="mb-16">
                <Checkbox isChecked={isFilePermissionChecked}
                    onClick={(e) => { e.stopPropagation() }}
                    rootClassName=""
                    disabled={isChartVersion309OrBelow}
                    value={CHECKBOX_VALUE.CHECKED}
                    onChange={(e) => setIsFilePermissionChecked(!isFilePermissionChecked)}>
                    <span className="mr-5"> Set File Permission (same as
                        <a href="https://kubernetes.io/docs/concepts/configuration/secret/#secret-files-permissions" className="ml-5 mr-5 anchor" target="_blank" rel="noopener noreferer">
                            defaultMode
                        </a>
                     for secrets in kubernetes)<br></br>
                        {isChartVersion309OrBelow ? <span className="fs-12 fw-5">
                            <span className="cr-5">Supported for Chart Versions 3.10 and above.</span>
                            <span className="cn-7 ml-5">Learn more about </span>
                            <a href="https://docs.devtron.ai/user-guide/creating-application/deployment-template" rel="noreferrer noopener" target="_blank">Deployment Template &gt; Chart Version</a>
                        </span> : null}
                    </span>
                </Checkbox>
            </div> : ""}
            {selectedTab === 'Data Volume' && isFilePermissionChecked ? <div className="mb-16">
                <CustomInput value={filePermissionValue.value}
                    autoComplete="off"
                    tabIndex={5}
                    label={""}
                    disabled={isChartVersion309OrBelow}
                    placeholder={"eg. 0400 or 400"}
                    error={filePermissionValue.error}
                    onChange={handleFilePermission} />
            </div> : ""}
            {!isExternalValues && <div className="flex left mb-16">
                <b className="mr-5 bold">Data*</b>
                <RadioGroup className="gui-yaml-switch" name="yaml-mode" initialTab={yamlMode ? 'yaml' : 'gui'} disabled={false} onChange={changeEditorMode}>
                    <RadioGroup.Radio value="gui">GUI</RadioGroup.Radio>
                    <RadioGroup.Radio value="yaml">YAML</RadioGroup.Radio>
                </RadioGroup>
            </div>}
            {!isExternalValues && yamlMode ? <div className="info__container info__container--configmap mb-16">
                <Info /><div className="flex column left">
                    <div className="info__subtitle">GUI Recommended for multi-line data.</div>
                </div>
            </div> : null}

            {!isExternalValues &&
                <>
                    {yamlMode ?
                        <div className="yaml-container">
                            <CodeEditor
                                value={yaml}
                                mode="yaml"
                                inline
                                height={350}
                                onChange={handleYamlChange}
                                shebang={!isExternalValues && selectedTab == "Data Volume" ? "#Check sample for multi-line data." : "#key:value"}>
                                <CodeEditor.Header>
                                    <CodeEditor.ValidationError />
                                    <CodeEditor.Clipboard />
                                </CodeEditor.Header>
                                {error &&
                                    <div className="validation-error-block">
                                        <Info color="#f32e2e" style={{ height: '16px', width: '16px' }} />
                                        <div>{error}</div>
                                    </div>
                                }
                            </CodeEditor>
                        </div>
                        : <>
                            {externalValues.map((data, idx) => <KeyValueInput keyLabel={selectedTab == "Data Volume" ? "File Name" : "Key"} valueLabel={selectedTab == "Data Volume" ? "File Content" : "Value"} {...data} key={idx} index={idx} onChange={handleChange} onDelete={handleDeleteParam} />)}
                            <div className="add-parameter bold pointer flex left" onClick={e => setExternalValues(externalValues => [...externalValues, { k: "", v: "", keyError: "", valueError: "" }])}>
                                <Add />Add parameter
                            </div>
                        </>
                    }
                </>}
            <div className="form__buttons">
                <button type="button" className="cta" onClick={handleSubmit}>{loading ? <Progressing /> : `${name ? 'Update' : 'Save'} ConfigMap`}</button>
            </div>
        </div>
    )
}

export function useKeyValueYaml(keyValueArray, setKeyValueArray, keyPattern, keyError): keyValueYaml {
    //input containing array of [{k, v, keyError, valueError}]
    //return {yaml, handleYamlChange}
    const [yaml, setYaml] = useState("")
    const [error, setError] = useState("")
    useEffect(() => {
        if (!Array.isArray(keyValueArray)) {
            setYaml("")
            setError("")
            return
        }
        setYaml(YAML.stringify(keyValueArray.reduce((agg, { k, v }) => ({ ...agg, [k]: v }), {}), { indent: 2 }))
    }, [keyValueArray])

    function handleYamlChange(yamlConfig) {
        if (!yamlConfig) {
            setKeyValueArray([])
            return
        }
        try {
            let obj = YAML.parse(yamlConfig)
            if (typeof obj !== 'object') {
                setError('Could not parse to valid YAML')
                return null
            }
            let errorneousKeys = []
            let tempArray = Object.keys(obj).reduce((agg, k) => {
                if (!k && !obj[k]) return agg
                let v = obj[k] && ['object', 'number'].includes(typeof obj[k]) ? YAML.stringify(obj[k], { indent: 2 }) : obj[k]
                let keyErr: string;
                if (k && keyPattern.test(k)) {
                    keyErr = ''
                }
                else {
                    keyErr = keyError
                    errorneousKeys.push(k)
                }
                return [...agg, { k, v: v || "", keyError: keyErr, valueError: '' }]
            }, [])
            setKeyValueArray(tempArray)
            let error = ''
            if (errorneousKeys.length > 0) {
                error = `Keys can contain: (Alphanumeric) (-) (_) (.) > Errors: ${errorneousKeys.map(e => `"${e}"`).join(", ")}`
            }
            setError(error)
        }
        catch (err) {
            setError('Could not parse to valid YAML')
        }
    }

    return { yaml, handleYamlChange, error }
}

export default ConfigMap
