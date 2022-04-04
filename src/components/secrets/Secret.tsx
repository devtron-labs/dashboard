import React, { useState, useEffect, useRef } from 'react'
import { Progressing, showError, Select, RadioGroup, not, Info, ToastBody, CustomInput, Checkbox, CHECKBOX_VALUE, isVersionLessThanOrEqualToTarget, isChartRef3090OrBelow } from '../common'
import { useParams } from 'react-router'
import { updateSecret, deleteSecret, getSecretKeys } from '../secrets/service';
import { getAppChartRef } from '../../services/service';
import { overRideSecret, deleteSecret as deleteEnvironmentSecret, unlockEnvSecret } from '../EnvironmentOverride/service'
import { toast } from 'react-toastify';
import { KeyValueInput, useKeyValueYaml, validateKeyValuePair } from '../configMaps/ConfigMap'
import { getSecretList } from '../../services/service';
import CodeEditor from '../CodeEditor/CodeEditor'
import { DOCUMENTATION, PATTERNS } from '../../config';
import YAML from 'yaml'
import keyIcon from '../../assets/icons/ic-key.svg'
import addIcon from '../../assets/icons/ic-add.svg'
import arrowTriangle from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Trash } from '../../assets/icons/ic-delete.svg';
import { KeyValueFileInput } from '../util/KeyValueFileInput';
import '../configMaps/ConfigMap.scss';

let sampleJSON = [{
    "key": "service/credentials",
    "name": "secret-key",
    "property": "property-name",
    "isBinary": true
},
{
    "key": "service/credentials",
    "name": "secret-key",
    "property": "property-name",
    "isBinary": true
}];

let dataHeader = <div>
    # Sample Data<br></br>
    # key: Secret key in backend<br></br>
    # name: Name for this key in the generated secret<br></br>
    # property: Property to extract if secret in backend is a JSON object(optional)<br></br>
    # isBinary: Set this to true if configuring an item for a binary file stored(optional)<br></br>
</div>

const sample = YAML.stringify(sampleJSON);

const Secret = ({ respondOnSuccess, ...props }) => {
    const [appChartRef, setAppChartRef] = useState<{ id: number, version: string }>();
    const [list, setList] = useState(null)
    const [secretLoading, setSecretLoading] = useState(true)

    useEffect(() => {
        initialise()
    }, [])
    const { appId } = useParams<{ appId }>()

    async function initialise() {
        try {
            const appChartRefRes = await getAppChartRef(appId);
            const { result } = await getSecretList(appId);
            if (Array.isArray(result.configData)) {
                result.configData = result.configData.map(config => {
                    if (config.data) {
                        config.data = decode(config.data) //doesnt do anything because data.value will be empty
                    }
                    return config
                })
            
            }
            setAppChartRef(appChartRefRes.result);
            setList(result);
        }
        catch (err) {
            showError(err)
        }
        finally {
            setSecretLoading(false)
        }
    }

    function update(index, result) {

        try {
            setList(list => {
                let configData = list.configData
                if (result === null) { //delete
                    configData.splice(index, 1)
                    list.configData = [...configData]
                    return { ...list }
                }
                else if (typeof index !== 'number' && Array.isArray(result.configData)) { //insert after create success
                    configData.unshift({ ...result.configData[0], data: result.configData[0].externalType === "" ? decode(result.configData[0].data) : result.configData[0].data })
                    list.configData = [...configData]
                    return { ...list }
                }
                else { //unlock
                    configData[index] = result && Array.isArray(result.configData) && result.configData.length > 0 ? result.configData[0] : null
                    list.configData[index] = { ...list.configData[index], data: result.configData[0].externalType === "" ? decode(result.configData[0].data) : result.configData[0].data }
                    return { ...list }
                }
            })
        }
        catch (err) {
        }
    }

    function decode(data) {
        return Object.keys(data).map(m => ({ key: m, value: data[m] ? atob(data[m]) : data[m] })).reduce((agg, curr) => { agg[curr.key] = curr.value; return agg }, {})
    }
    if (secretLoading) return <Progressing pageLoader />
    return (
        <div className="form__app-compose">
            <h1 className="form__title form__title--artifacts">Secrets</h1>
            <p className="form__subtitle form__subtitle--artifacts">A Secret is an object that contains sensitive data such as passwords, OAuth tokens, and SSH keys.
            <a className="learn-more__href" rel="noreferer noopener" href={DOCUMENTATION.APP_CREATE_SECRET} target="blank"> Learn more about Secrets</a></p>
            <CollapsedSecretForm appId={appId} id={list.id || 0} title="Add Secret" appChartRef={appChartRef} update={update} initialise={initialise} />
            {list && Array.isArray(list.configData) && list.configData.filter(cs => cs).map((cs, idx) => <CollapsedSecretForm key={cs.name}
                {...cs}
                appChartRef={appChartRef}
                appId={appId} id={list.id}
                update={update}
                index={idx}
                initialise={initialise} />)}
        </div>
    )
}


export function CollapsedSecretForm({ title = "", roleARN = "", appChartRef, secretData = [], mountPath = "", name = "", type = "environment", external = false, data = null, id = null, appId, update = null, index = null, initialise = null, externalType = "", filePermission = "", subPath = false, ...rest }) {
    const [collapsed, toggleCollapse] = useState(true)
    return <section className="mb-12 br-8 bcn-0 bw-1 en-2 pl-20 pr-20 pt-19 pb-19">{collapsed
        ? <ListComponent title={name || title} onClick={e => toggleCollapse(!collapsed)} icon={title ? addIcon : keyIcon} collapsible={!title} className={title ? 'fw-5 cb-5 fs-14' : 'fw-5 cn-9 fs-14'} />
        : <SecretForm name={name}
            appChartRef={appChartRef}
            secretData={secretData}
            mountPath={mountPath}
            roleARN={roleARN}
            type={type}
            external={external}
            data={data}
            id={id}
            appId={appId}
            isUpdate={!title}
            collapse={(e) => toggleCollapse(!collapsed)}
            update={update}
            index={index}
            keyValueEditable={false}
            initialise={initialise}
            externalType={externalType}
            subPath={subPath}
            filePermission={filePermission}
        />}
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

export function ListComponent({ icon = "", title, subtitle = "", onClick, className = "", collapsible = false }) {
    return (
        <article className={`configuration-list pointer ${className}`} onClick={typeof onClick === 'function' ? onClick : function () { }}>
            <img src={icon} className="configuration-list__logo icon-dim-24 fcb-5" />
            <div className="configuration-list__info">
                <div className="">{title}</div>
                {subtitle && <div className="configuration-list__subtitle">{subtitle}</div>}
            </div>
            {collapsible && <img className="configuration-list__arrow pointer" src={arrowTriangle} />}
        </article>
    )
}
interface SecretFormProps {
    id: number;
    appChartRef: { id: number; version: string };
    appId: number;
    roleARN: string;
    name: string;
    index: number;
    external: boolean;
    externalType: string;
    secretData: { key: string; name: string; property: string; isBinary: boolean }[];
    type: string;
    data: { k: string; v: string; }[];
    isUpdate: boolean;
    mountPath: string;
    keyValueEditable?: boolean;
    filePermission: string;
    subPath: boolean;
    update: (...args) => void;
    collapse: (...args) => void;
    initialise?: () => void;
}

export const SecretForm: React.FC<SecretFormProps> = function (props) {
    const [selectedTab, selectTab] = useState(props.type === 'environment' ? 'Environment Variable' : 'Data Volume')
    const [externalValues, setExternalValues] = useState([])
    const [configName, setName] = useState({ value: props.name, error: "" })
    const [volumeMountPath, setVolumeMountPath] = useState({ value: props.mountPath, error: "" })
    const [roleARN, setRoleARN] = useState({ value: props.roleARN, error: "" })
    const [loading, setLoading] = useState(false)
    const [secretMode, toggleSecretMode] = useState(props.isUpdate)
    const [externalType, setExternalType] = useState(props.externalType)
    const { appId, envId } = useParams<{ appId, envId }>()
    const [yamlMode, toggleYamlMode] = useState(true)
    const { yaml, handleYamlChange, error } = useKeyValueYaml(externalValues, setKeyValueArray, PATTERNS.CONFIG_MAP_AND_SECRET_KEY, `Key must consist of alphanumeric characters, '.', '-' and '_'`)
    const { yaml: lockedYaml } = useKeyValueYaml(externalValues.map(({ k, v }) => ({ k, v: Array(8).fill("*").join("") })), setKeyValueArray, PATTERNS.CONFIG_MAP_AND_SECRET_KEY, `Key must consist of alphanumeric characters, '.', '-' and '_'`)
    const tempArray = useRef([])
    const [isSubPathChecked, setIsSubPathChecked] = useState(!!props.subPath)
    const [isFilePermissionChecked, setIsFilePermissionChecked] = useState(!!props.filePermission)
    const [filePermissionValue, setFilePermissionValue] = useState({ value: props.filePermission, error: "" })
    const isChartVersion309OrBelow = props.appChartRef && isVersionLessThanOrEqualToTarget(props.appChartRef.version, [3, 9]) && isChartRef3090OrBelow(props.appChartRef.id);
    const [externalSubpathValues, setExternalSubpathValues] = useState<{value: string; error: string}>({value: props.data ? Object.keys(props.data).join(',') : '' , error: "" })

    let tempSecretData: any[] = props?.secretData || [];
    tempSecretData = tempSecretData.map((s) => {
        return {
            fileName: s.key,
            name: s.name,
            isBinary: s.isBinary,
            property: s.property
        }
    })
    let jsonForSecretDataYaml: any[] = props?.secretData || [];
    jsonForSecretDataYaml = jsonForSecretDataYaml.map(j => {
        let temp = {};
        temp['isBinary'] = j.isBinary;
        if (j.key) { temp['key'] = j.key; }
        if (j.property) { temp['property'] = j.property };
        if (j.name) { temp['name'] = j.name };
        return temp;
    })
    const [secretData, setSecretData] = useState(tempSecretData);
    const [secretDataYaml, setSecretDataYaml] = useState(YAML.stringify(jsonForSecretDataYaml))
    const [codeEditorRadio, setCodeEditorRadio] = useState("data")
    const isExternalValues = externalType !== "KubernetesSecret";
    const tabs = [{ title: 'Environment Variable' }, { title: 'Data Volume' }].map(data => ({ ...data, active: data.title === selectedTab }))
    const externalTypes = {
        "": "Kubernetes Secret",
        "KubernetesSecret": "Kubernetes External Secret",
        "AWSSecretsManager": "AWS Secrets Manager",
        "AWSSystemManager": "AWS System Manager",
        "HashiCorpVault": "Hashi Corp Vault"
    }
    const isHashiOrAWS = (externalType === "AWSSecretsManager" || externalType === "AWSSystemManager" || externalType === "HashiCorpVault");

    function setKeyValueArray(arr) {
        tempArray.current = arr
    }
    useEffect(() => {
        if (props.data) {
            setExternalValues(Object.keys(props.data).map(k => ({ k, v: typeof props.data[k] === 'object' ? YAML.stringify(props.data[k], { indent: 2 }) : props.data[k], keyError: "", valueError: "" })))
        }
        else {
            setExternalValues([{ k: "", v: "", keyError: "", valueError: "" }])
        }
    }, [props.data])

    useEffect(() => {
        if (!props.isUpdate) return
        handleSecretFetch()
    }, [])

    function handleRoleARNChange(event) {
        setRoleARN({ value: event.target.value, error: "" });
    }

    function handleChange(index, k, v) {
        setExternalValues(state => {
            state[index] = { k, v, keyError: "", valueError: "" };
            return [...state];
        })
    }

    async function handleSecretFetch() {
        try {
            if (envId) {
                const { result } = await unlockEnvSecret(props.id, props.appId, +envId, props.name)
                props.update(props.index, result)
                toggleSecretMode(false)
            }
            else {
                const { result } = await getSecretKeys(props.id, props.appId, props.name)
                props.update(props.index, result);
                toggleSecretMode(false)
            }
        }
        catch (err) {
            toast.warn(<ToastBody title="View-only access" subtitle="You won't be able to make any changes" />)
        }
    }

    async function handleDelete() {
        try {
            if (!envId) {
                await deleteSecret(props.id, props.appId, props.name)
                toast.success('Successfully deleted')
                props.update(props.index, null)
            }
            else {
                await deleteEnvironmentSecret(props.id, props.appId, +envId, props.name)
                toast.success('Successfully deleted')
                props.update(props.index, null)
            }
        }
        catch (err) {
            showError(err)
        }
    }

    async function handleSubmit(e) {
        const secretNameRegex = new RegExp(PATTERNS.CONFIGMAP_AND_SECRET_NAME);

        if (secretMode) {
            toast.warn(<ToastBody title="View-only access" subtitle="You won't be able to make any changes" />)
            return
        }
        if (!configName.value) {
            setName({ value: "", error: 'This is a required field' })
            return
        }
        if (configName.value.length > 253) {
            setName({ value: configName.value, error: 'More than 253 characters are not allowed' })
            return
        }
        if (!secretNameRegex.test(configName.value)) {
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
        }
        if (!new RegExp(PATTERNS.ALL_DIGITS_BETWEEN_0_AND_7).test(filePermissionValue.value)) {
            setFilePermissionValue({ value: filePermissionValue.value, error: 'This is octal number, use numbers between 0 to 7' });
            return;
        }
        if(selectedTab === 'Data Volume' && isSubPathChecked ){
            if (!externalSubpathValues.value) {
                setExternalSubpathValues({ value: externalSubpathValues.value, error: 'This is a required field' });
                return;
            }
            if (!new RegExp(PATTERNS.CONFIG_MAP_AND_SECRET_MULTPLS_KEYS).test(externalSubpathValues.value)) {
                setExternalSubpathValues({ value: externalSubpathValues.value, error: `Use (a-z), (0-9), (-), (_), (.); Use (,) to separate multiple keys` });
                return;
            }
        }
        let dataArray = yamlMode ? tempArray.current : externalValues
        const { isValid, arr } = validateKeyValuePair(dataArray)
        if (!isValid) {
            setKeyValueArray(arr)
            return
        }
        if ((externalType === "" && !arr.length)) {
            toast.warn('Please add secret data before saving.')
            return
        }
        if (isHashiOrAWS) {
            let secretDataArray = secretData;
            let isValid = secretDataArray.reduce((isValid, s) => {
                isValid = isValid && !!s.fileName && !!s.name;
                return isValid
            }, true);
            if (!isValid) {
                toast.warn("Please check key and name");
                return;
            }
        }
        setLoading(true)
        try {
            let data = arr.reduce((agg, curr) => {
                let value = curr.v
                agg[curr.k] = externalType === "" ? btoa(value) : value //encode only when Kubernetes Secret
                return agg
            }, {})
            //Add Mandatory fields
            let payload = {
                name: configName.value,
                type: selectedTab === 'Environment Variable' ? 'environment' : 'volume',
                external: !!externalType,
                roleARN: isHashiOrAWS ? roleARN.value : "",
                externalType,
            }
            //Adding conditional fields
            if (isHashiOrAWS) {
                payload['secretData'] = secretData.map((s) => {
                    return {
                        key: s.fileName,
                        name: s.name,
                        isBinary: s.isBinary,
                        property: s.property
                    }
                });
                payload['secretData'] = payload['secretData'].filter(s => (s.key || s.name || s.property));
            }
            else if (externalType === "") {
                payload['data'] = data
            }

            if (selectedTab === 'Data Volume') {
                payload['mountPath'] = volumeMountPath.value;
                if (!isChartVersion309OrBelow) {
                    payload['subPath'] = isSubPathChecked;
                }
                if (isFilePermissionChecked && !isChartVersion309OrBelow) {
                    payload['filePermission'] = filePermissionValue.value.length == 3 ? `0${filePermissionValue.value}` : `${filePermissionValue.value}`;
                }
                if (!isExternalValues && isSubPathChecked){
                    const externalSubpathKey = externalSubpathValues.value.replace(/\s+/g, '').split(',')
                    const secretKeys = {}
                    externalSubpathKey.forEach((key)=> secretKeys[key] = '')
                   payload['data'] = secretKeys
                }
            }

            if (!envId) {
                const { result } = await updateSecret(props.id, +props.appId, payload)
                toast.success(<ToastBody title={`${props.name ? 'Updated' : 'Saved'}`} subtitle="Changes will be reflected after next deployment." />);
                if (typeof props.update === 'function') {
                    props.update(props.index, result)
                    props.initialise()
                }
                props.collapse()
            }
            else {
                await overRideSecret(props.id, +props.appId, +envId, [payload])
                toast.success(<ToastBody title="Overridden" subtitle="Changes will be reflected after next deployment." />)
                props.collapse()
                props.update(true)
            }
        }
        catch (err) {
            showError(err)
        }
        finally {
            setLoading(false)
        }
    }

    function handleSecretDataChange(index: number, key: string, value: string | boolean): void {
        let json = secretData;
        setSecretData(state => {
            state[index] = { ...state[index], [key]: value };
            json = state;
            return [...state];
        })
        json = json.map((j) => {
            let temp = {};
            temp['isBinary'] = j.isBinary;
            if (j.fileName) { temp['key'] = j.fileName; }
            if (j.property) { temp['property'] = j.property };
            if (j.name) { temp['name'] = j.name };
            return temp;
        })
        let secretYaml = YAML.stringify(json);
        setSecretDataYaml(secretYaml);
    }

    function handleSecretDataDelete(index: number): void {
        let json = secretData;
        setSecretData(state => {
            state.splice(index, 1);
            json = state;
            return [...state];
        })
        json = json.map((j) => {
            return {
                key: j.fileName,
                name: j.name,
                property: j.property,
                isBinary: j.isBinary
            }
        })
        let secretYaml = YAML.stringify(json);
        setSecretDataYaml(secretYaml);
    }

    function handleSecretDataYamlChange(yaml): void {
        if (codeEditorRadio !== "data") return;
        setSecretDataYaml(yaml);
        try {
            if (!yaml || !yaml.length) {
                setSecretData([]);
                return;
            }
            let json = YAML.parse(yaml);
            if (Array.isArray(json)) {
                json = json.map((j) => {
                    let temp = {};
                    temp['isBinary'] = j.isBinary;
                    if (j.key) { temp['fileName'] = j.key; }
                    if (j.property) { temp['property'] = j.property };
                    if (j.name) { temp['name'] = j.name };
                    return temp;
                })
                setSecretData(json);
            }
        } catch (error) {
            // console.log(error)
        }
    }

    function handleDeleteParam(e, idx: number): void {
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

    return <div className="white-card__config-map">
        <div className="white-card__header">
            {!envId && <div>{props.isUpdate ? `Edit Secret` : `Add Secret`}</div>}
            <div className="uncollapse__delete flex">
                {props.isUpdate && !secretMode && <Trash className="icon-n4 cursor icon-delete" onClick={handleDelete} />}
                {typeof props.collapse === 'function' && !envId && <img onClick={props.collapse} src={arrowTriangle} className="rotate pointer" style={{ ['--rotateBy' as any]: '-180deg' }} />}
            </div>
        </div>
        <div className="form__row">
            <label className="form__label">Data type</label>
            <div className="form-row__select-external-type flex">
                <Select value={externalType} onChange={e => { setExternalType(e.target.value) }} disabled={secretMode}>
                    <Select.Button>{externalType || (externalType === "") ? externalTypes[externalType] : `Select Secret Type`}</Select.Button>
                    {Object.entries(externalTypes).map(([value, name]) =>
                        <Select.Option key={value} value={value}>{name}</Select.Option>)}
                </Select>
            </div>
        </div>
        {externalType === "KubernetesSecret" ? <div className="info__container mb-24">
        <Info className="icon-dim-20"/>
            <div className="flex column left">
           <div className="info__title">Using External Secrets</div>
                <div className="info__subtitle">Secret will not be created by system. However, they will be used inside the pod. Please make sure that secret with the same name is present in the environment.</div>
            </div>
        </div> : null}
        <div className="form-row">
            <label className="form__label">Name*</label>
            <input value={configName.value} autoComplete="off" onChange={props.isUpdate ? null : e => setName({ value: e.target.value, error: "" })} type="text" className={`form__input`} placeholder={`random-secret`} disabled={props.isUpdate} />
            {configName.error && <label className="form__error">{configName.error}</label>}
        </div>
        <label className="forn__label--lower form__label">{`How do you want to use this Secret?`}</label>
        <div className={`form-row form-row__tab ${secretMode ? 'disabled' : ''}`}>
            {tabs.map((data, idx) => <Tab {...data} key={idx} onClick={(secretMode) ? e => { } : title => selectTab(title)} />)}
        </div>
        {selectedTab === "Data Volume" ? <div className="form__row">
            <CustomInput value={volumeMountPath.value}
                autoComplete="off"
                tabIndex={5}
                label={"Volume mount path*"}
                placeholder={"Enter mount path"}
                helperText={"keys are mounted as files to volume"}
                error={volumeMountPath.error}
                onChange={e => setVolumeMountPath({ value: e.target.value, error: "" })} />
        </div> : null}
        {selectedTab === 'Data Volume' &&
            <div className="mb-16">
                <Checkbox isChecked={isSubPathChecked}
                    onClick={(e) => { e.stopPropagation() }}
                    rootClassName=""
                    disabled={isChartVersion309OrBelow}
                    value={CHECKBOX_VALUE.CHECKED}
                    onChange={(e) => setIsSubPathChecked(!isSubPathChecked)}>
                    <span className="mr-5">
                        Set SubPath (same as
                        <a href="https://kubernetes.io/docs/concepts/storage/volumes/#using-subpath" className="ml-5 mr-5 anchor" target="_blank" rel="noopener noreferer">
                            subPath
                        </a>
                        for volume mount)<br></br>
                        {isSubPathChecked && <span className="mb-0 cn-5 fs-11">{ externalType === "KubernetesSecret" ? 'Please provide keys of secret to be mounted' : 'Keys will be used as filename for subpath'}</span>}
                        {isChartVersion309OrBelow ? <span className="fs-12 fw-5">
                            <span className="cr-5">Supported for Chart Versions 3.10 and above.</span>
                            <span className="cn-7 ml-5">Learn more about </span>
                            <a href="https://docs.devtron.ai/user-guide/creating-application/deployment-template" rel="noreferrer noopener" target="_blank">Deployment Template &gt; Chart Version</a>
                        </span> : null}
                    </span>
                </Checkbox>
            </div>}
            {selectedTab === 'Data Volume' && !isExternalValues && isSubPathChecked && <div className="mb-16">
            <CustomInput value={externalSubpathValues.value}
                autoComplete="off"
                tabIndex={5}
                label={""}
                placeholder={"Enter keys (Eg. username,configs.json)"}
                error={externalSubpathValues.error}
                onChange={(e) => setExternalSubpathValues({ value: e.target.value, error: "" })}
            />
        </div>}
        {selectedTab === 'Data Volume' && <div className="mb-16">
            <Checkbox isChecked={isFilePermissionChecked}
                onClick={(e) => { e.stopPropagation() }}
                rootClassName=""
                value={CHECKBOX_VALUE.CHECKED}
                disabled={isChartVersion309OrBelow}
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
        </div>}
        {selectedTab === 'Data Volume' && isFilePermissionChecked && <div className="mb-16">
            <CustomInput value={filePermissionValue.value}
                autoComplete="off"
                tabIndex={5}
                label={""}
                disabled={isChartVersion309OrBelow}
                placeholder={"eg. 0400 or 400"}
                error={filePermissionValue.error}
                onChange={(e) => setFilePermissionValue({ value: e.target.value, error: "" })}
            />
        </div>}
        {isHashiOrAWS ? <div className="form__row">
            <CustomInput value={roleARN.value}
                autoComplete="off"
                tabIndex={4}
                label={"Role ARN"}
                placeholder={"Enter Role ARN"}
                error={roleARN.error}
                onChange={event => handleRoleARNChange(event)} />
        </div> : null}
        {isExternalValues && <div className="flex left mb-16">
            <b className="mr-5 bold">Data*</b>
            <RadioGroup className="gui-yaml-switch" name="yaml-mode" initialTab={yamlMode ? 'yaml' : 'gui'} disabled={false} onChange={changeEditorMode}>
                <RadioGroup.Radio value="gui">GUI</RadioGroup.Radio>
                <RadioGroup.Radio value="yaml">YAML</RadioGroup.Radio>
            </RadioGroup>
        </div>}
        {externalType === "" && <>
            {yamlMode ?
                <div className="yaml-container">
                    <CodeEditor
                        value={secretMode ? lockedYaml : yaml}
                        mode="yaml"
                        inline
                        height={350}
                        onChange={handleYamlChange}
                        readOnly={secretMode}
                        shebang={externalType === "" && selectedTab == "Data Volume" ? "#Check sample for multi-line data." : "#key:value"}>
                        <CodeEditor.Header>
                            <CodeEditor.ValidationError />
                            <CodeEditor.Clipboard />
                        </CodeEditor.Header>
                        {error &&
                            <div className="validation-error-block">
                                <Info color="#f32e2e" style={{ height: '16px', width: '16px' }} />
                                <div>{error}</div>
                            </div>}
                    </CodeEditor>
                </div>
                : externalValues.map((data, idx) =>
                    <KeyValueInput
                        keyLabel={externalType === "" && selectedTab == "Data Volume" ? "File Name" : "Key"}
                        valueLabel={externalType === "" && selectedTab == "Data Volume" ? "File Content" : "Value"}
                        k={data.k}
                        v={secretMode ? Array(8).fill('*').join("") : data.v}
                        keyError={data.keyError}
                        valueError={data.valueError}
                        key={idx}
                        index={idx}
                        onChange={secretMode ? null : handleChange}
                        onDelete={secretMode ? null : handleDeleteParam}
                    />)}

        </>}
        {isHashiOrAWS && yamlMode ? <div className="yaml-container">
            <CodeEditor value={codeEditorRadio === "sample" ? sample : secretDataYaml}
                mode="yaml"
                inline
                height={350}
                onChange={handleSecretDataYamlChange}
                readOnly={secretMode && codeEditorRadio === "sample"}
                shebang={codeEditorRadio === "data" ? "#Check sample for usage." : dataHeader}>
                <CodeEditor.Header>
                    <RadioGroup className="gui-yaml-switch"
                        name="data-mode"
                        initialTab={codeEditorRadio}
                        disabled={false}
                        onChange={(event) => { setCodeEditorRadio(event.target.value) }}>
                        <RadioGroup.Radio value="data">Data</RadioGroup.Radio>
                        <RadioGroup.Radio value="sample">Sample</RadioGroup.Radio>
                    </RadioGroup>
                    <CodeEditor.Clipboard />
                </CodeEditor.Header>
            </CodeEditor>
        </div>
            : <React.Fragment>
                {isHashiOrAWS && secretData.map((data, index) => <div>
                    <KeyValueFileInput key={index}
                        index={index}
                        fileName={data.fileName}
                        name={data.name}
                        property={data.property}
                        isBinary={data.isBinary}
                        handleChange={handleSecretDataChange}
                        handleDelete={handleSecretDataDelete} />
                </div>
                )}
            </React.Fragment>}
        {!secretMode && isExternalValues && !yamlMode && <div className="add-parameter bold pointer flex left anchor"
            onClick={(event) => {
                if (isHashiOrAWS) { setSecretData((secretData) => [...secretData, { fileName: "", property: "", isBinary: true, name: "" }]) }
                else setExternalValues((externalValues) => [...externalValues, { k: "", v: "", keyError: "", valueError: "" }])
            }}>
            <img src={addIcon} alt="add" />
                Add parameter
            </div>}
        <div className="form__buttons">
            <button type="button" className="cta" onClick={handleSubmit}>{loading ? <Progressing /> : `${props.name ? 'Update' : 'Save'} Secret`}</button>
        </div>
    </div >
}

export default Secret
