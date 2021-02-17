import React, { useState } from 'react'
import { showError, useForm, Select, Progressing, useAsync } from '../common';
import { getDockerRegistryList } from '../../services/service';
import { saveRegistryConfig, updateRegistryConfig } from './service';
import { List, CustomInput, ProtectedInput } from '../globalConfigurations/GlobalConfiguration'
import { toast } from 'react-toastify';
import awsRegionList from '../common/awsRegionList.json'
import { DOCUMENTATION } from '../../config';

export default function Docker({ ...props }) {
    const [loading, result, error, reload] = useAsync(getDockerRegistryList)
    if (loading && !result) return <Progressing pageLoader />
    if (error) {
        showError(error)
        if (!result) return null
    }
    return (
        <section className="docker-page">
            <h2 className="form__title">Docker registries</h2>
            <h5 className="form__subtitle">Manage your organization’s docker registries.&nbsp;
            <a className="learn-more__href" href={DOCUMENTATION.GLOBAL_CONFIG_DOCKER} rel="noopener noreferrer" target="_blank">
                    Learn more about docker registries
            </a>
            </h5>
            {[{ id: null }].concat(result && Array.isArray(result.result) ? result.result : []).map(docker => <CollapsedList reload={reload} {...docker} key={docker.id || Math.random().toString(36).substr(2, 5)} />)}
        </section>
    )
}

function CollapsedList({ id = "", pluginId = null, registryUrl = "", registryType = "", awsAccessKeyId = "", awsSecretAccessKey = "", awsRegion = "", isDefault = false, active = true, username = "", password = "", reload, ...rest }) {
    const [collapsed, toggleCollapse] = useState(true)
    return (
        <article className={`collapsed-list collapsed-list--docker collapsed-list--${id ? 'update' : 'create'}`}>
            <List onClick={e => toggleCollapse(t => !t)}>
                <List.Logo> <div className={id ? "docker list__logo git-logo" : "add-icon"}></div></List.Logo>
                <div className="flex left">
                    <List.Title title={id || 'Add docker registry'} subtitle={registryUrl} tag={isDefault ? 'DEFAULT' : ''} />
                </div>
                {id && <List.DropDown onClick={e => { e.stopPropagation(); toggleCollapse(t => !t) }} className="rotate" style={{ ['--rotateBy' as any]: `${Number(!collapsed) * 180}deg` }} />}
            </List>
            {!collapsed && <DockerForm {...{ id, pluginId, registryUrl, registryType, awsAccessKeyId, awsSecretAccessKey, awsRegion, isDefault, active, username, password, reload, toggleCollapse }} />}
        </article>
    )
}

function DockerForm({ id, pluginId, registryUrl, registryType, awsAccessKeyId, awsSecretAccessKey, awsRegion, isDefault, active, username, password, reload, toggleCollapse, ...rest }) {
    const { state, disable, handleOnChange, handleOnSubmit } = useForm(
        {
            id: { value: id, error: "" },
            registryUrl: { value: registryUrl, error: "" },
            registryType: { value: registryType || 'ecr', error: "" },
        },
        {
            id: {
                required: true,
                validator: { error: 'Name is required', regex: /^.*$/ }
            },
            registryUrl: {
                required: true,
                validator: { error: 'URL is required', regex: /^.{3,}$/ }
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
        awsRegion: { value: awsRegion, error: "" },
        username: { value: username, error: "" },
        password: { value: password, error: "" }
    })
    function customHandleChange(e) {
        setCustomState(st => ({ ...st, [e.target.name]: { value: e.target.value, error: '' } }))
    }

    async function onValidation() {
        if (state.registryType.value === 'ecr') {
            if (!customState.awsRegion.value || !customState.awsAccessKeyId.value || !customState.awsSecretAccessKey.value) {
                setCustomState(st => ({
                    ...st,
                    awsRegion: { ...st.awsRegion, error: st.awsRegion.value ? '' : 'Mandatory' },
                    awsAccessKeyId: { ...st.awsAccessKeyId, error: st.awsAccessKeyId.value ? '' : 'Mandatory' },
                    awsSecretAccessKey: { ...st.awsSecretAccessKey, error: st.awsSecretAccessKey.value ? '' : 'Mandatory' },
                }))
                return
            }
        }
        else if (state.registryType.value === 'other') {
            if (!customState.username.value || !customState.password.value) {
                setCustomState(st => ({
                    ...st,
                    username: { ...st.username, error: st.username.value ? '' : 'Mandatory' },
                    password: { ...st.password, error: st.password.value ? '' : 'Mandatory' }
                }))
                return
            }
        }

        let payload = {
            id: state.id.value,
            pluginId: 'cd.go.artifact.docker.registry',
            registryUrl: state.registryUrl.value,
            registryType: state.registryType.value,
            isDefault: Isdefault,
            ...(state.registryType.value === 'ecr' ? { awsAccessKeyId: customState.awsAccessKeyId.value, awsSecretAccessKey: customState.awsSecretAccessKey.value, awsRegion: customState.awsRegion.value } : {}),
            ...(state.registryType.value === 'other' ? { username: customState.username.value, password: customState.password.value } : {}),
        }

        const api = id ? updateRegistryConfig : saveRegistryConfig
        try {
            toggleLoading(true)
            const { result } = await api(payload, id)
            await reload()
            toast.success('Successfully saved.')
        } catch (err) {
            showError(err)
        } finally {
            toggleLoading(false)
        }

    }
    return (
        <form onSubmit={handleOnSubmit} className="docker-form">
            <div className="form__row">
                <CustomInput name="id" value={state.id.value} error={state.id.error} onChange={handleOnChange} label="Name*" disabled={!!id} />
            </div>
            <div className="form__row form__row--two-third">
                <div className="flex left column top">
                    <label htmlFor="" className="form__label w-100">Registry type*</label>
                    <Select name="registryType" rootClassName="w-100" onChange={handleOnChange} value={state.registryType.value}>
                        <Select.Button rootClassName="select-button--docker-register">{state.registryType.value}</Select.Button>
                        {['ecr', 'other'].map(type => <Select.Option value={type} key={type}>{type}</Select.Option>)}
                    </Select>
                    {state.registryType.error && <div className="form__error">{state.registryType.error}</div>}
                </div>
                <CustomInput name="registryUrl" value={state.registryUrl.value} error={state.registryUrl.error} onChange={handleOnChange} label="Registry URL*" disabled={!!registryUrl} />
            </div>
            {state.registryType.value === 'ecr' && <>
                <div className="form__row">
                    <div className="flex left column">
                        <label htmlFor="" className="form__label">AWS region*</label>
                        <Select rootClassName="form__input form__input--aws-region" name="awsRegion" onChange={customHandleChange} value={customState.awsRegion.value}>
                            <Select.Button>{customState.awsRegion.value ? awsRegionMap.get(customState.awsRegion.value) : 'Select AWS region'}</Select.Button>
                            {Array.from(awsRegionMap).map(([value, name]) => <Select.Option value={value} key={value}>{name}</Select.Option>)}
                        </Select>
                        {customState.awsRegion.error && <div className="form__error">{customState.awsRegion.error}</div>}
                    </div>
                </div>
                <div className="form__row form__row--two-third">
                    <CustomInput name="awsAccessKeyId" value={customState.awsAccessKeyId.value} error={customState.awsAccessKeyId.error} onChange={customHandleChange} label="Access key ID*" />
                    <ProtectedInput name="awsSecretAccessKey" value={customState.awsSecretAccessKey.value} error={customState.awsSecretAccessKey.error} onChange={customHandleChange} label="Secret access key*" type="password" />
                </div>
            </>}
            {state.registryType.value === 'other' && <>
                <div className="form__row form__row--two-third">
                    <CustomInput name="username" value={customState.username.value} error={customState.username.error} onChange={customHandleChange} label="Username*" />
                    <ProtectedInput name="password" value={customState.password.value} error={customState.password.error} onChange={customHandleChange} label="Password*" type="password" />
                </div>
            </>}
            <div className="form__row form__buttons">
                <label htmlFor="" className="docker-default" onClick={isDefault ? () => { toast.success('Please mark another as default.') } : e => toggleDefault(t => !t)}>
                    <input type="checkbox" name="default" checked={Isdefault} onChange={e => { }} />
                    Set as default
                </label>
                <button className="cta cancel" type="button" onClick={e => toggleCollapse(t => !t)}>Cancel</button>
                <button className="cta" type="submit" disabled={loading}>{loading ? <Progressing /> : 'Save'}</button>
            </div>
        </form>
    )
}