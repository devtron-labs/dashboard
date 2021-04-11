import React, { useState } from 'react'
import { showError, useForm, Select, Progressing, useAsync, sortCallback, CustomInput } from '../common';
import { getDockerRegistryList } from '../../services/service';
import { saveRegistryConfig, updateRegistryConfig } from './service';
import { List, ProtectedInput } from '../globalConfigurations/GlobalConfiguration'
import { toast } from 'react-toastify';
import awsRegionList from '../common/awsRegionList.json'
import Tippy from '@tippyjs/react';
import { DOCUMENTATION } from '../../config';
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { ReactComponent as Docker } from '../../assets/icons/ic-docker.svg';

const DockerRegistryType = [
    { label: 'docker hub', value: 'docker-hub' },
    { label: 'ecr', value: 'ecr' },
    { label: 'other', value: 'other' }
];

export default function DockerRegistryList({ ...props }) {
    const [loading, result, error, reload] = useAsync(getDockerRegistryList)
    if (loading && !result) return <Progressing pageLoader />
    if (error) {
        showError(error)
        if (!result) return null
    }
    let dockerRegistryList = result.result || [];
    dockerRegistryList = dockerRegistryList.sort((a, b) => sortCallback("id", a, b))
    dockerRegistryList = [{ id: null }].concat(dockerRegistryList);
    return <section className="mt-16 mb-16 ml-20 mr-20 global-configuration__component flex-1">
        <h2 className="form__title">Docker registries</h2>
        <h5 className="form__subtitle">Manage your organization’s docker registries.&nbsp;
            <a className="learn-more__href" href={DOCUMENTATION.GLOBAL_CONFIG_DOCKER} rel="noopener noreferrer" target="_blank">
                Learn more about docker registries
            </a>
        </h5>
        {dockerRegistryList.map(docker => <CollapsedList reload={reload} {...docker} key={docker.id || Math.random().toString(36).substr(2, 5)} />)}
    </section>
}

function CollapsedList({ id = "", pluginId = null, registryUrl = "", registryType = "", awsAccessKeyId = "", awsSecretAccessKey = "", awsRegion = "", isDefault = false, active = true, username = "", password = "", reload, ...rest }) {
    const [collapsed, toggleCollapse] = useState(true);

    return <article className="bcn-0 br-8 mb-16 bw-1 en-2">
        <List className={id ? collapsed ? "list--edit-collapsed" : "list--edit-expanded" : collapsed ? "" : "list--create-expanded"} onClick={e => toggleCollapse(t => !t)}>
            <List.Logo>
                {id && collapsed ? <Docker className="icon-dim-24 vertical-align-middle" /> : null}
                {!id && collapsed ? <Add className="icon-dim-24 fcb-5 vertical-align-middle" /> : null}
            </List.Logo>
            {id && collapsed ? <List.Title className="" title={id} subtitle={registryUrl} tag={isDefault ? 'DEFAULT' : ''} /> : null}
            {!id && collapsed ? <h3 className="fw-6 cb-5 fs-14 m-0">Add docker registry</h3> : null}
            {id && !collapsed ? <List.Title className="fw-6" title="Edit docker registry" /> : null}
            {!id && !collapsed ? <List.Title className="fw-6" title="Add docker registry" /> : null}
            <span></span>
            {id && <List.DropDown onClick={e => { e.stopPropagation(); toggleCollapse(t => !t) }} className="rotate" style={{ ['--rotateBy' as any]: `${Number(!collapsed) * 180}deg` }} />}
        </List>
        {!collapsed && <DockerForm {...{ id, pluginId, registryUrl, registryType, awsAccessKeyId, awsSecretAccessKey, awsRegion, isDefault, active, username, password, reload, toggleCollapse }} />}
    </article>
}

function DockerForm({ id, pluginId, registryUrl, registryType, awsAccessKeyId, awsSecretAccessKey, awsRegion, isDefault, active, username, password, reload, toggleCollapse, ...rest }) {
    const { state, disable, handleOnChange, handleOnSubmit } = useForm(
        {
            id: { value: id, error: "" },
            registryType: { value: registryType || 'ecr', error: "" },
        },
        {
            id: {
                required: true,
                validator: { error: 'Name is required', regex: /^.*$/ }
            },
            registryType: {
                required: true,
                validator: { error: 'Type is required', regex: /^.*$/ }
            }
        }, onValidation);
    const [loading, toggleLoading] = useState(false)
    const [Isdefault, toggleDefault] = useState(isDefault)

    let awsRegionMap = awsRegionList.reduce((agg, curr) => {
        agg.set(curr.value, curr.name)
        return agg
    }, new Map())

    const [customState, setCustomState] = useState({
        awsAccessKeyId: { value: awsAccessKeyId, error: "" },
        awsSecretAccessKey: { value: awsSecretAccessKey, error: "" },
        registryUrl: { value: registryUrl, error: "" },
        awsRegion: { value: awsRegion, error: "" },
        username: { value: username, error: "" },
        password: { value: password, error: "" }
    })

    function customHandleChange(e) {
        setCustomState(st => ({ ...st, [e.target.name]: { value: e.target.value, error: '' } }))
    }

    async function onValidation() {
        if (state.registryType.value === 'ecr') {
            if (!customState.awsRegion.value || !customState.awsAccessKeyId.value || !customState.awsSecretAccessKey.value || !customState.registryUrl.value) {
                setCustomState(st => ({
                    ...st,
                    awsRegion: { ...st.awsRegion, error: st.awsRegion.value ? '' : 'Mandatory' },
                    awsAccessKeyId: { ...st.awsAccessKeyId, error: st.awsAccessKeyId.value ? '' : 'Mandatory' },
                    awsSecretAccessKey: { ...st.awsSecretAccessKey, error: st.awsSecretAccessKey.value ? '' : 'Mandatory' },
                    registryUrl: { ...st.registryUrl, error: st.registryUrl.value ? '' : 'Mandatory' },
                }))
                return
            }
        }
        else if (state.registryType.value === 'docker-hub') {
            if (!customState.username.value || !customState.password.value) {
                setCustomState(st => ({
                    ...st,
                    username: { ...st.username, error: st.username.value ? '' : 'Mandatory' },
                    password: { ...st.password, error: st.password.value ? '' : 'Mandatory' },
                }))
                return
            }
        }
        else if (state.registryType.value === 'other') {
            if (!customState.username.value || !customState.password.value || !customState.registryUrl.value || !customState.registryUrl.value) {
                setCustomState(st => ({
                    ...st,
                    username: { ...st.username, error: st.username.value ? '' : 'Mandatory' },
                    password: { ...st.password, error: st.password.value ? '' : 'Mandatory' },
                    registryUrl: { ...st.registryUrl, error: st.registryUrl.value ? '' : 'Mandatory' },
                }))
                return
            }
        }

        let payload = {
            id: state.id.value,
            pluginId: 'cd.go.artifact.docker.registry',
            registryType: state.registryType.value,
            isDefault: Isdefault,
            registryUrl: customState.registryUrl.value,
            ...(state.registryType.value === 'ecr' ? { awsAccessKeyId: customState.awsAccessKeyId.value, awsSecretAccessKey: customState.awsSecretAccessKey.value, awsRegion: customState.awsRegion.value } : {}),
            ...(state.registryType.value === 'docker-hub' ? { username: customState.username.value, password: customState.password.value, } : {}),
            ...(state.registryType.value === 'other' ? { username: customState.username.value, password: customState.password.value } : {}),
        }

        const api = id ? updateRegistryConfig : saveRegistryConfig
        try {
            toggleLoading(true)
            const { result } = await api(payload, id)
            if (!id) {
                toggleCollapse(true);
            }
            await reload()
            toast.success('Successfully saved.')
        } catch (err) {
            showError(err)
        } finally {
            toggleLoading(false)
        }
    }

    let selectedDckerRegistryType = DockerRegistryType.find(type => type.value === state.registryType.value);

    return <form onSubmit={handleOnSubmit} className="docker-form">
        <div className="form__row">
            <CustomInput name="id" autoFocus={true} value={state.id.value} autoComplete={"off"} error={[{ name: state.id.error }]} tabIndex={1} onChange={handleOnChange} label="Name*" disabled={!!id} />
        </div>
        <div className="form__row form__row--two-third">
            <div className="flex left column top">
                <label htmlFor="" className="form__label w-100">Registry type*</label>
                <Select name="registryType" tabIndex={2} rootClassName="w-100" onChange={handleOnChange} value={state.registryType.value}>
                    <Select.Button rootClassName="select-button--docker-register">{selectedDckerRegistryType?.label || `Select Docker Registry`}</Select.Button>
                    {DockerRegistryType.map(type => <Select.Option value={type.value} key={type.value}>{type.label}</Select.Option>)}
                </Select>
                {state.registryType.error && <div className="form__error">{state.registryType.error}</div>}
            </div>
            <CustomInput name="registryUrl"
                tabIndex={3}
                label={state.registryType.value !== 'docker-hub' ? "Registry URL*" : "Registry URL"}
                value={customState.registryUrl.value}
                autoComplete="off"
                helperText={state.registryType.value === 'docker-hub' ? "If registry exists on hub.docker.com then leave registry url empty" : ''}
                error={[{ name: customState.registryUrl.error }]}
                onChange={customHandleChange}
                disabled={!!registryUrl} />
        </div>
        {state.registryType.value === 'ecr' && <>
            <div className="form__row">
                <div className="flex left column">
                    <label htmlFor="" className="form__label">AWS region*</label>
                    <Select tabIndex={4} rootClassName="form__input form__input--aws-region" name="awsRegion" onChange={customHandleChange} value={customState.awsRegion.value}>
                        <Select.Button>{customState.awsRegion.value ? awsRegionMap.get(customState.awsRegion.value) : 'Select AWS region'}</Select.Button>
                        {Array.from(awsRegionMap).map(([value, name]) => <Select.Option value={value} key={value}>{name}</Select.Option>)}
                    </Select>
                    {customState.awsRegion.error && <div className="form__error">{customState.awsRegion.error}</div>}
                </div>
            </div>
            <div className="form__row form__row--two-third">
                <CustomInput name="awsAccessKeyId" tabIndex={5} value={customState.awsAccessKeyId.value} error={[{ name: customState.awsAccessKeyId.error }]} onChange={customHandleChange} label="Access key ID*" autoComplete={"off"} />
                <ProtectedInput name="awsSecretAccessKey" tabIndex={6} value={customState.awsSecretAccessKey.value} error={customState.awsSecretAccessKey.error} onChange={customHandleChange} label="Secret access key*" type="password" />
            </div>
        </>}
        {state.registryType.value === 'docker-hub' && <>
            <div className="form__row form__row--two-third">
                <CustomInput name="username" tabIndex={5} value={customState.username.value} autoComplete={"off"} error={[{ name: customState.username.error }]} onChange={customHandleChange} label="Username*" />
                <ProtectedInput name="password" tabIndex={6} value={customState.password.value} error={customState.password.error} onChange={customHandleChange} label="Password*" type="password" />
            </div>
        </>}
        {state.registryType.value === 'other' && <>
            <div className="form__row form__row--two-third">
                <CustomInput name="username" tabIndex={5} value={customState.username.value} autoComplete={"off"} error={[{ name: customState.username.error }]} onChange={customHandleChange} label="Username*" />
                <ProtectedInput name="password" tabIndex={6} value={customState.password.value} error={customState.password.error} onChange={customHandleChange} label="Password*" type="password" />
            </div>
        </>}
        <div className="form__row form__buttons  ">
            <label htmlFor="" className="docker-default flex" onClick={isDefault ? () => { toast.success('Please mark another as default.') } : e => toggleDefault(t => !t)}>
                <input type="checkbox" name="default" checked={Isdefault} onChange={e => { }} />
                <div className="mr-4"> Set as default </div>
                <Tippy className="default-tt" arrow={false} placement="top" content={
                    <span style={{ display: "block", width: "160px" }}> Default docker registry is automatically selected while creating an application. </span>}>
                    <Question className="icon-dim-20" />
                </Tippy>
            </label>
            <button className="cta cancel mr-16" type="button" onClick={e => toggleCollapse(t => !t)}>Cancel</button>
            <button className="cta" type="submit" disabled={loading}>{loading ? <Progressing /> : 'Save'}</button>
        </div>
    </form>
}