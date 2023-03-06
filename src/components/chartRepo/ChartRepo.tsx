import React, { useState } from 'react'
import { showError, useForm, useEffectAfterMount, useAsync, Progressing, ToastBody, Checkbox, CHECKBOX_VALUE } from '../common'
import { toast } from 'react-toastify'
import { List, CustomInput, ProtectedInput } from '../globalConfigurations/GlobalConfiguration'
import Tippy from '@tippyjs/react';
import { saveChartProviderConfig, updateChartProviderConfig, validateChartRepoConfiguration, reSyncChartRepo, deleteChartRepo } from './chartRepo.service';
import { getChartRepoList } from '../../services/service'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { ReactComponent as Helm } from '../../assets/icons/ic-helmchart.svg';
import { DOCUMENTATION, PATTERNS, CHART_REPO_TYPE, CHART_REPO_AUTH_TYPE, CHART_REPO_LABEL } from '../../config';
import { ValidateForm, VALIDATION_STATUS } from '../common/ValidateForm/ValidateForm';
import "./chartRepo.scss";
import DeleteComponent from '../../util/DeleteComponent';
import { DC_CHART_REPO_CONFIRMATION_MESSAGE, DeleteComponentsName } from '../../config/constantMessaging';
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup';

export default function ChartRepo() {
    const [loading, result, error, reload] = useAsync(getChartRepoList)
    const [fetching, setFetching] = useState(false);
    if (loading && !result) return <Progressing pageLoader />
    if (error) {
        showError(error)
        if (!result) return null
    }

    async function refetchCharts(e) {
        if (fetching) {
            return;
        }
        setFetching(true);
        toast.success("Re-sync initiated. It may take upto 5 minutes for it to complete.")
        await reSyncChartRepo().then((response) => {
            setFetching(false);
        }).catch((error) => {
            showError(error);
            setFetching(false);
        })
    }

    return (
        <section className="global-configuration__component">
            <h2 className="form__title">Chart Repository</h2>
            <p className="form__subtitle">Manage your organization’s chart repositories.
            <span><a rel="noreferrer noopener" target="_blank" className="dc__link" href={DOCUMENTATION.GLOBAL_CONFIG_CHART}> Learn more</a> </span></p>
            <CollapsedList  id={null} default={true} url={""} name={""} active={true} isEditable={true} authMode={"ANONYMOUS"}  key={Math.random().toString(36).substr(2, 5)} reload={reload} />
            <div className="chartRepo_form__subtitle dc__float-left dc__bold">Repositories({(result && Array.isArray(result.result) ? result.result : []).length})</div>
            <Tippy className="default-tt" arrow={false} placement="top" content="Refetch chart from repositories">
                <div className="chartRepo_form__subtitle dc__float-right">
                    <a rel="noreferrer noopener" target="_blank" className={`dc__link ${fetching? '': 'cursor'}`} onClick={refetchCharts}><span>
                        <svg width="16" height="16" viewBox="2 -2 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.0105 6.23225H14.0105V3.23225" stroke="#0066CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4.11096 4.11091C4.62168 3.60019 5.228 3.19506 5.89529 2.91866C6.56258 2.64226 7.27778 2.5 8.00005 2.5C8.72232 2.5 9.43752 2.64226 10.1048 2.91866C10.7721 3.19506 11.3784 3.60019 11.8891 4.11091L14.0105 6.23223" stroke="#0066CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4.9895 9.76775H1.9895V12.7677" stroke="#0066CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M11.8891 11.8891C11.3784 12.3998 10.7721 12.8049 10.1048 13.0813C9.4375 13.3577 8.7223 13.5 8.00003 13.5C7.27776 13.5 6.56256 13.3577 5.89527 13.0813C5.22798 12.8049 4.62167 12.3998 4.11094 11.8891L1.98962 9.76776" stroke="#0066CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg></span>
                        <span>Refetch Charts</span>
                    </a>
                </div>
            </Tippy>
            {[].concat(result && Array.isArray(result.result) ? result.result : []).sort((a, b) => a.name.localeCompare(b.name)).map(chart => <CollapsedList {...chart} key={chart.id || Math.random().toString(36).substr(2, 5)} reload={reload} />)}
        </section>
    );
}

function CollapsedList({ id, name, active, url, authMode, isEditable, accessToken = "", userName = "", password = "", reload, ...props }) {
    const [collapsed, toggleCollapse] = useState(true);
    const [enabled, toggleEnabled] = useState(active);
    const [loading, setLoading] = useState(false);

    useEffectAfterMount(() => {
        if (!collapsed) return
        async function update() {
            let payload = {
                id: id || 0, name, url, authMode, active: enabled,
                ...(authMode === CHART_REPO_AUTH_TYPE.USERNAME_PASSWORD ? { username: userName, password } : {}),
                ...(authMode === CHART_REPO_AUTH_TYPE.ACCESS_TOKEN ? { accessToken } : {})
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

    const setToggleCollapse = () => {
        if (!id){
            toggleCollapse(false)
        }
    }

    const handleCollapse = (e) => {
        if (isEditable) {
            e.stopPropagation()
            toggleCollapse((t) => !t)
        } else {
            toast.info(
                `Cannot edit chart repo "${name}". Some charts from this repository are being used by helm apps.`,
            )
        }
    }
    return (
        <article className={`collapsed-list dc__clear-both ${id ? 'collapsed-list--chart' : 'collapsed-list--git'} collapsed-list--${id ? 'update' : 'create dashed'}`}>
            <List onClick={setToggleCollapse} className={`${!id && !collapsed ? 'no-grid-column':''}`}>
                <List.Logo>{id ? <div className={`${url} list__logo`}><Helm className="icon-dim-24 fcb-5 dc__vertical-align-middle " /></div> : collapsed && <Add className="icon-dim-24 fcb-5 dc__vertical-align-middle" />}</List.Logo>
                <div className="flex left">
                    <List.Title style={{color: !id && !collapsed ? 'var(--N900)': ''}} title={id && !collapsed ? 'Edit repository' : name || "Add repository"} subtitle={collapsed ? url : null} />
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
                {id && <List.DropDown onClick={handleCollapse} className="rotate" style={{ ['--rotateBy' as any]: `${Number(!collapsed) * 180}deg` }} />}
            </List>
            {!collapsed && <ChartForm {...{ id, name, active, url, authMode, accessToken, userName, password, reload, toggleCollapse, collapsed }} />}
        </article>
    )
}

function ChartForm({ id = null, name = "", active = false, url = "", authMode = "ANONYMOUS", accessToken = "", userName = "", password = "", reload, toggleCollapse, collapsed, ...props }) {

    const [validationError, setValidationError] = useState({ errtitle: "", errMessage: "" });
    const [validationStatus, setValidationStatus] = useState(VALIDATION_STATUS.DRY_RUN || VALIDATION_STATUS.FAILURE || VALIDATION_STATUS.LOADER || VALIDATION_STATUS.SUCCESS)
    const [loading, setLoading] = useState(false);
    const [customState, setCustomState] = useState({ password: { value: password, error: '' }, username: { value: userName, error: '' }, accessToken: { value: accessToken, error: '' } })
    const [secureWithTls, setSecureWithTls] = useState(false)
    const { state, disable, handleOnChange, handleOnSubmit } = useForm(
        {
            name: { value: name, error: "" },
            url: { value: url, error: "" },
            auth: { value: authMode, error: "" }
        },
        {
            name: {
                required: true,
                validators: [
                  { error: 'Name is required', regex: /^.*$/ },
              ]
            },
            url: {
                required: true,
                validators: [
                  { error: 'URL is required', regex: /^.*$/ },
                  { error: 'Invalid URL', regex: PATTERNS.URL },
              ]
            },
            auth: {
                required: true,
                validator: { error: 'Mode is required', regex: /^.*$/ }
            }
        }, onClickSave);

    const customHandleChange = e => setCustomState(state => ({ ...state, [e.target.name]: { value: e.target.value, error: "" } }))
    const [deleting, setDeleting] = useState(false);
    const [confirmation, toggleConfirmation] = useState(false);
    const [chartRepoType, setChartRepoType] = useState<string>(CHART_REPO_TYPE.PUBLIC)
    
    if(chartRepoType===CHART_REPO_TYPE.PUBLIC){
        state.auth.value= CHART_REPO_AUTH_TYPE.ANONYMOUS
    }else{
        state.auth.value= CHART_REPO_AUTH_TYPE.USERNAME_PASSWORD
    }


    const chartRepoPayload = {
        id: id || 0,
        name: state.name.value,
        url: state.url.value,
        authMode: id
            ? password.length > 0
                ? CHART_REPO_AUTH_TYPE.USERNAME_PASSWORD
                : CHART_REPO_AUTH_TYPE.ANONYMOUS
            : chartRepoType === CHART_REPO_TYPE.PUBLIC
            ? CHART_REPO_AUTH_TYPE.ANONYMOUS
            : CHART_REPO_AUTH_TYPE.USERNAME_PASSWORD,
        active: true,
        ...(state.auth.value === CHART_REPO_AUTH_TYPE.USERNAME_PASSWORD || authMode === CHART_REPO_AUTH_TYPE.USERNAME_PASSWORD
            ? { allow_insecure_connection: !secureWithTls }
            : {}),
        ...(state.auth.value === CHART_REPO_AUTH_TYPE.USERNAME_PASSWORD || authMode === CHART_REPO_AUTH_TYPE.USERNAME_PASSWORD
            ? { username: customState.username.value, password: customState.password.value }
            : {}),
        ...(state.auth.value === CHART_REPO_AUTH_TYPE.ACCESS_TOKEN ? { accessToken: customState.accessToken.value } : {}),
    }

    const isFormInvalid = () => {
        let isValid = true

        if (state.name.error.length > 0 || state.url.error.length > 0) {
            isValid = false
        }

        if (state.auth.value === CHART_REPO_AUTH_TYPE.USERNAME_PASSWORD) {
            if (!customState.password.value || !customState.username.value) {
                setCustomState(state => ({ ...state, password: { value: state.password.value, error: 'Required' }, username: { value: state.username.value, error: 'Required' } }))
                isValid = false
            }
        }
        else if (state.auth.value === "ACCESS_TOKEN") {
            if (!customState.accessToken.value) {
                setCustomState(state => ({ ...state, accessToken: { value: '', error: 'Required' } }))
                isValid = false
            }
        }
        return isValid
    }

    async function onClickValidate() {
        setValidationStatus(VALIDATION_STATUS.LOADER)
        let isInvalid = isFormInvalid();
        if (!isInvalid) {
            toast.error("Some Required Fields are missing");
            return
        }

        let promise = validateChartRepoConfiguration(chartRepoPayload)
        await promise.then((response) => {
            let validateResp = response?.result
            if (!validateResp.actualErrMsg.length) {
                setValidationStatus(VALIDATION_STATUS.SUCCESS)
                toast.success("Configuration validated");
            } else if (validateResp.actualErrMsg.length > 0) {
                setValidationStatus(VALIDATION_STATUS.FAILURE)
                setValidationError({ errtitle: validateResp?.customErrMsg, errMessage: validateResp.actualErrMsg })
                toast.error("Configuration validation failed");
            }
        }).catch((error) => {
            showError(error);
            setValidationStatus(VALIDATION_STATUS.DRY_RUN)
            setLoading(false);
        })
    }

    async function onClickSave(e) {
        setValidationStatus(VALIDATION_STATUS.LOADER)
        let isInvalid = isFormInvalid();
        if (!isInvalid) {
            toast.error("Some Required Fields are missing");
            return
        }
        const api = id ? updateChartProviderConfig : saveChartProviderConfig

        try {
            setLoading(true);
            const { result } = await api(chartRepoPayload, id);

            if (result && !result?.actualErrMsg) {
                setValidationStatus(VALIDATION_STATUS.SUCCESS)
                toast.success(
                    <ToastBody
                        title="Chart repo saved"
                        subtitle="It may take upto 5 mins for the charts to be listed in the chart store."
                    />,
                );
                await reload();
            } else {
                setValidationStatus(VALIDATION_STATUS.FAILURE)
                setLoading(false);
                setValidationError({ errtitle: result?.customErrMsg, errMessage: result.actualErrMsg })
                toast.error("Configuration validation failed");
            }
        }
        catch (err) {
            showError(err)
            setValidationStatus(VALIDATION_STATUS.DRY_RUN)
        }
        finally {
            setLoading(false);
        }
    }

    function toggleIsPublicChartType(e) {
        setCustomState(state => ({ ...state, password: { value: '', error: '' }, username: { value: '', error: '' } }))

        if (chartRepoType === CHART_REPO_TYPE.PUBLIC) {
            setChartRepoType(CHART_REPO_TYPE.PRIVATE)
        } else {
            setChartRepoType(CHART_REPO_TYPE.PUBLIC)
        }
    }

    function toggleSkipTLSVerification(e) {
        setSecureWithTls(!secureWithTls)
    }
    const handleDeleteClick = () => toggleConfirmation(true)
    const handleCancelClick = (e) => toggleCollapse((t) => !t)

    return (
        <form onSubmit={handleOnSubmit} className="git-form" autoComplete="off">
            {!id && (
                <RadioGroup
                    className="chartrepo-type__radio-group"
                    value={chartRepoType}
                    name={`chartrepo-type_${chartRepoType}`}
                    onChange={toggleIsPublicChartType}
                >
                    {CHART_REPO_LABEL.map(({ label, value }) => (
                        <RadioGroupItem value={value}>
                            <span className={`dc__no-text-transform ${chartRepoType === value ? 'fw-6' : 'fw-4'}`}>
                                {label}
                            </span>
                        </RadioGroupItem>
                    ))}
                </RadioGroup>
            )}
            <ValidateForm
                id={id}
                onClickValidate={onClickValidate}
                validationError={validationError}
                isChartRepo={true}
                validationStatus={validationStatus}
                configName="chart repo"
            />

            <div className="form__row form__row--two-third">
                <CustomInput
                    autoComplete="off"
                    value={state.name.value}
                    onChange={handleOnChange}
                    name="name"
                    error={state.name.error}
                    label="Name*"
                />
                <CustomInput
                    autoComplete="off"
                    value={state.url.value}
                    onChange={handleOnChange}
                    name="url"
                    error={state.url.error}
                    label="URL*"
                />
                {(chartRepoType !== CHART_REPO_TYPE.PUBLIC ||
                    (id && authMode === CHART_REPO_AUTH_TYPE.USERNAME_PASSWORD)) && (
                    <>
                        <CustomInput
                            autoComplete="off"
                            value={customState.username.value}
                            onChange={customHandleChange}
                            name="username"
                            error={customState.username.error}
                            label="Username*"
                            labelClassName="mt-12"
                        />
                        <ProtectedInput
                            value={customState.password.value}
                            onChange={customHandleChange}
                            name="password"
                            error={customState.password.error}
                            label="Password*"
                            labelClassName="mt-12"
                        />
                        <Checkbox
                            rootClassName="fs-13 dc__hover-n50 pt-8 pb-8 mt-12"
                            isChecked={secureWithTls}
                            value={CHECKBOX_VALUE.CHECKED}
                            onChange={toggleSkipTLSVerification}
                        >
                            <div className="ml-1">Secure With TLS</div>
                        </Checkbox>
                    </>
                )}
            </div>

            <div className="form__row form__buttons">
                {id && (
                    <button
                        className="cta delete dc__m-auto chart_repo__delete-button"
                        type="button"
                        onClick={handleDeleteClick}
                    >
                        {deleting ? <Progressing /> : 'Delete'}
                    </button>
                )}
                <button className="cta cancel" type="button" onClick={handleCancelClick}>
                    Cancel
                </button>
                <button className="cta" type="submit" disabled={loading}>
                    {loading ? <Progressing /> : id ? 'Update' : 'Save'}
                </button>
            </div>
            {confirmation && (
                <DeleteComponent
                    setDeleting={setDeleting}
                    deleteComponent={deleteChartRepo}
                    payload={chartRepoPayload}
                    title={state.name?.value}
                    toggleConfirmation={toggleConfirmation}
                    component={DeleteComponentsName.ChartRepository}
                    confirmationDialogDescription={DC_CHART_REPO_CONFIRMATION_MESSAGE}
                    reload={reload}
                />
            )}
        </form>
    )
}
