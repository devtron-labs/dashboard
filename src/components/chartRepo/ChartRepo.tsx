import React, { useState } from 'react'
import { showError, useForm, useEffectAfterMount, useAsync, Progressing } from '../common'
import { toast } from 'react-toastify'
import { List, CustomInput, ProtectedInput } from '../globalConfigurations/GlobalConfiguration'
import Tippy from '@tippyjs/react';
import { saveChartProviderConfig, updateChartProviderConfig } from './service'
import { getChartRepoList } from '../../services/service'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { ReactComponent as Helm } from '../../assets/icons/ic-helmchart.svg';
import { DOCUMENTATION } from '../../config';


export default function ChartRepo() {
    const [loading, result, error, reload] = useAsync(getChartRepoList)
    if (loading && !result) return <Progressing pageLoader />
    if (error) {
        showError(error)
        if (!result) return null
    }

    return (
        <section className="global-configuration__component">
            <h2 className="form__title">Chart Repository</h2>
            <p className="form__subtitle">Manage your organization’s chart repositories.
            <span><a rel="noreferrer noopener" target="_blank" className="learn-more__href" href={DOCUMENTATION.GLOBAL_CONFIG_GIT}> Learn more about Git Material</a> </span></p>
            {[{ id: null, default: true, url: "", name: "", active: true, authMode: "ANONYMOUS" }].concat(result && Array.isArray(result.result) ? result.result : []).sort((a, b) => a.name.localeCompare(b.name)).map(chart => <CollapsedList {...chart} key={chart.id || Math.random().toString(36).substr(2, 5)} reload={reload} />)}
        </section>
    );
}

function CollapsedList({ id, name, active, url, authMode, accessToken = "", userName = "", password = "", reload, ...props }) {
    const [collapsed, toggleCollapse] = useState(true);
    const [enabled, toggleEnabled] = useState(active);
    const [loading, setLoading] = useState(false);

    useEffectAfterMount(() => {
        if (!collapsed) return
        async function update() {
            let payload = {
                id: id || 0, name, url, authMode, active: enabled,
                ...(authMode === 'USERNAME_PASSWORD' ? { username: userName, password } : {}),
                ...(authMode === 'ACCESS_TOKEN' ? { accessToken } : {})
            }
            try {
                setLoading(true);
                await updateChartProviderConfig(payload, id);
                await reload();
                toast.success(`Repository ${enabled ? 'enabled' : 'disabled'}.`)
            } catch (err) {
                showError(err);
            } finally {
                setLoading(false);
            }
        }
        update()
    }, [enabled])

    return (
        <article className={`collapsed-list ${id ? 'collapsed-list--chart' : 'collapsed-list--git'}  collapsed-list--${id ? 'update' : 'create'}`}>
            <List onClick={e => toggleCollapse(t => !t)}>
                <List.Logo>{id ? <div className={`${url} list__logo`}><Helm className="icon-dim-24 fcb-5 vertical-align-middle " /></div> : <Add className="icon-dim-24 fcb-5 vertical-align-middle" />}</List.Logo>
                <div className="flex left ml-8">
                    <List.Title title={id && !collapsed ? 'Edit repository' : name || "Add repository"} subtitle={collapsed ? url : null} />
                    {id &&
                        <Tippy className="default-tt" arrow={false} placement="bottom" content={enabled ? 'Disable chart repository' : 'Enable chart repository'}>
                            <span style={{ marginLeft: 'auto' }}>
                                {loading ? (
                                    <Progressing />
                                ) : (
                                        <List.Toggle onSelect={(en) => toggleEnabled(en)} enabled={enabled} />
                                    )}
                            </span>
                        </Tippy>
                    }
                </div>
                {id && <List.DropDown onClick={e => { e.stopPropagation(); toggleCollapse(t => !t) }} className="rotate" style={{ ['--rotateBy' as any]: `${Number(!collapsed) * 180}deg` }} />}
            </List>
            {!collapsed && <ChartForm {...{ id, name, active, url, authMode, accessToken, userName, password, reload, toggleCollapse }} />}
        </article>
    )
}
function ChartForm({ id = null, name = "", active = false, url = "", authMode = "ANONYMOUS", accessToken = "", userName = "", password = "", reload, toggleCollapse, ...props }) {
    const { state, disable, handleOnChange, handleOnSubmit } = useForm(
        {
            name: { value: name, error: "" },
            url: { value: url, error: "" },
            auth: { value: authMode, error: "" }
        },
        {
            name: {
                required: true,
                validator: { error: 'Name is required', regex: /^.{5,}$/ }
            },
            url: {
                required: true,
                validator: { error: 'URL is required', regex: /^.{10,}$/ }
            },
            auth: {
                required: true,
                validator: { error: 'Mode is required', regex: /^.*$/ }
            }
        }, onValidation);
    const [loading, setLoading] = useState(false)
    const [customState, setCustomState] = useState({ password: { value: password, error: '' }, username: { value: userName, error: '' }, accessToken: { value: accessToken, error: '' } })
    const customHandleChange = e => setCustomState(state => ({ ...state, [e.target.name]: { value: e.target.value, error: "" } }))

    async function onValidation() {
        if (state.auth.value === 'USERNAME_PASSWORD') {
            if (!customState.password.value || !customState.username.value) {
                setCustomState(state => ({ ...state, password: { value: state.password.value, error: 'Required' }, username: { value: state.username.value, error: 'Required' } }))
                return
            }
        }
        else if (state.auth.value === "ACCESS_TOKEN") {
            if (!customState.accessToken.value) {
                setCustomState(state => ({ ...state, accessToken: { value: '', error: 'Required' } }))
                return
            }
        }

        let payload = {
            id: id || 0,
            name: state.name.value,
            url: state.url.value,
            authMode: state.auth.value,
            active: true,
            ...(state.auth.value === 'USERNAME_PASSWORD' ? { username: customState.username.value, password: customState.password.value } : {}),
            ...(state.auth.value === 'ACCESS_TOKEN' ? { accessToken: customState.accessToken.value } : {})
        }
        const api = id ? updateChartProviderConfig : saveChartProviderConfig

        try {
            setLoading(true)
            const { result } = await api(payload, id);

            await reload();
            toast.success('Successfully saved.')
        }
        catch (err) {
            showError(err)
        }
        finally {
            setLoading(false);
        }
    }
    return (
        <form onSubmit={handleOnSubmit} className="git-form">
            <div className="form__row form__row--two-third">
                <CustomInput autoComplete="off" value={state.name.value} onChange={handleOnChange} name="name" error={state.name.error} label="Name*" />
                <CustomInput autoComplete="off" value={state.url.value} onChange={handleOnChange} name="url" error={state.url.error} label="URL*" />
            </div>
            <div className="form__label">Authentication type*</div>
            <div className="form__row form__row--auth-type pointer">
                {[{ label: 'User auth', value: 'USERNAME_PASSWORD' }, { label: 'Password/Auth token', value: "ACCESS_TOKEN" }, { label: 'Anonymous', value: 'ANONYMOUS' },]
                    .map(({ label: Lable, value }) => <label key={value} className="flex left pointer">

                        <input type="radio" name="auth" value={value} onChange={handleOnChange} checked={value === state.auth.value} /> {Lable}
                    </label>)}

            </div>
            {state.auth.error && <div className="form__error">{state.auth.error}</div>}
            {state.auth.value === 'USERNAME_PASSWORD' && <div className="form__row form__row--two-third">
                <CustomInput value={customState.username.value} onChange={customHandleChange} name="username" error={customState.username.error} label="Username*" />
                <ProtectedInput value={customState.password.value} onChange={customHandleChange} name="password" error={customState.password.error} label="Password*" />
            </div>}
            {state.auth.value === "ACCESS_TOKEN" && <div className="form__row">
                <ProtectedInput value={customState.accessToken.value} onChange={customHandleChange} name="accessToken" error={customState.accessToken.error} label="Access token*" />
            </div>}
            <div className="form__row form__buttons">
                <button className="cta cancel" type="button" onClick={e => toggleCollapse(t => !t)}>Cancel</button>
                <button className="cta" type="submit" disabled={loading}>{loading ? <Progressing /> : id ? 'Update' : 'Save'}</button>
            </div>
        </form>
    )
}

