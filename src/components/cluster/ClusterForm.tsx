
import React, {useState} from 'react';
import { showError, Pencil, useForm, Progressing, CustomPassword, VisibleModal, sortCallback } from '../common';
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup';
import { List, CustomInput } from '../globalConfigurations/GlobalConfiguration'
import { getClusterList, saveCluster, updateCluster, saveEnvironment, updateEnvironment, getEnvironmentList, getCluster, retryClusterInstall } from './cluster.service';
import { ResizableTextarea } from '../configMaps/ConfigMap'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { ReactComponent as Database } from '../../assets/icons/ic-env.svg';
import { ReactComponent as ClusterIcon } from '../../assets/icons/ic-cluster.svg';
import { ClusterComponentModal } from './ClusterComponentModal';
import { ClusterInstallStatus } from './ClusterInstallStatus';
import { POLLING_INTERVAL, ClusterListProps, AuthenticationType } from './cluster.type';
import { useHistory } from 'react-router';
import { toast } from 'react-toastify';
import { DOCUMENTATION, ViewType } from '../../config';
import { getEnvName } from './cluster.util';
import Reload from '../Reload/Reload';

export function ClusterForm({ id, cluster_name, server_url, active, config, environments, toggleEditMode, reload, prometheus_url, prometheusAuth }) {
    const [loading, setLoading] = useState(false);
    let authenTicationType = prometheusAuth && prometheusAuth.userName ? AuthenticationType.BASIC : AuthenticationType.ANONYMOUS
    const { state, disable, handleOnChange, handleOnSubmit } = useForm(
        {
            cluster_name: { value: cluster_name, error: "" },
            url: { value: server_url, error: "" },
            userName: { value: prometheusAuth?.userName, error: "" },
            password: { value: prometheusAuth?.password, error: "" },
            tlsClientKey: { value: prometheusAuth?.tlsClientKey, error: "" },
            tlsClientCert: { value: prometheusAuth?.tlsClientCert, error: "" },
            token: { value: config && config.bearer_token ? config.bearer_token : "", error: "" },
            endpoint: { value: prometheus_url || "", error: "" },
            authType: { value: authenTicationType, error: "" }
        },
        {
            cluster_name: {
                required: true,
                validator: { error: 'Name is required', regex: /^.*$/ }
            },
            url: {
                required: true,
                validator: { error: 'URL is required', regex: /^.*$/ }
            },
            authType: {
                required: false,
                validator: { error: 'Authentication Type is required', regex: /^(?!\s*$).+/ }
            },
            userName: {
                required: false,
                validator: { error: 'username is required', regex: /^(?!\s*$).+/ }
            },
            password: {
                required: false,
                validator: { error: 'password is required', regex: /^(?!\s*$).+/ }
            },
            tlsClientKey: {
                required: false,
                validator: { error: 'TLS Key is required', regex: /^(?!\s*$).+/ }
            },
            tlsClientCert: {
                required: false,
                validator: { error: 'TLS Certificate is required', regex: /^(?!\s*$).+/ }
            },
            token: {
                required: true,
                validator: { error: 'token is required', regex: /[^]+/ }
            },
            endpoint: {
                required: true,
                validator: { error: 'endpoint is required', regex: /^.*$/ }
            }
        }, onValidation);

    async function onValidation() {

        let payload = {
            id,
            cluster_name: state.cluster_name.value,
            server_url: state.url.value,
            config: { bearer_token: state.token.value },
            active,
            prometheus_url: state.endpoint.value,
            prometheusAuth: {
                userName: "",
                password: ""
            }
        }

        if (state.authType.value === AuthenticationType.BASIC) {
            let isValid = state.userName?.value && state.password?.value;
            if (!isValid) {
                toast.error("Please add both username and password");
                return;
            }
            else {
                payload.prometheusAuth['userName'] = state.userName.value || "";
                payload.prometheusAuth['password'] = state.password.value || "";
            }
        }
        if (state.tlsClientKey.value || state.tlsClientCert.value) {
            let isValid = state.tlsClientKey.value?.length && state.tlsClientCert.value?.length;
            if (!isValid) {
                toast.error("Please add both TLS Key and Certificate");
                return;
            }
            else {
                payload.prometheusAuth['tlsClientKey'] = state.tlsClientKey.value || "";
                payload.prometheusAuth['tlsClientCert'] = state.tlsClientCert.value || "";
            }
        }
        const api = id ? updateCluster : saveCluster
        try {
            setLoading(true)
            const { result } = await api(payload)
            toast.success(`Successfully ${id ? 'updated' : 'saved'}.`)
            reload()
            toggleEditMode(e => !e)
        }
        catch (err) { showError(err) }
        finally {
            setLoading(false)
        }
    }
    return <form action="" className="cluster-form" onSubmit={handleOnSubmit}>
        <h2 className="form__title">Edit cluster</h2>
        <div className="form__row">
            <CustomInput autoComplete="off" name="cluster_name" value={state.cluster_name.value} error={state.cluster_name.error} onChange={handleOnChange} label="Name*" />
        </div>
        <hr></hr>
        <div className="form__input-header mb-8">Kubernetes Cluster Info</div>
        <div className="form__row">
            <CustomInput autoComplete="off" name="url" value={state.url.value} error={state.url.error} onChange={handleOnChange} label="Server URL*" />
        </div>
        <div className="form__row form__row--bearer-token flex column left top">
            <label htmlFor="" className="form__label">Bearer token*</label>
            <div className="bearer-token">
                <ResizableTextarea className="resizable-textarea__with-max-height" name="token" value={config && config.bearer_token ? config.bearer_token : ""} onChange={handleOnChange} />
            </div>
            {state.token.error && <label htmlFor="" className="form__error">{state.token.error}</label>}
        </div>
        <hr></hr>
        <div className="form__input-header mb-8">Prometheus Info</div>
        <div className="form__row">
            <CustomInput autoComplete="off" name="endpoint" value={state.endpoint.value} error={state.endpoint.error} onChange={handleOnChange} label="Prometheus endpoint*" />
        </div>
        <div className="form__row">
            <span className="form__label">Authentication Type*</span>
            <RadioGroup value={state.authType.value} name={`authType`} onChange={handleOnChange}>
                <RadioGroupItem value={AuthenticationType.BASIC}> Basic  </RadioGroupItem>
                <RadioGroupItem value={AuthenticationType.ANONYMOUS}>  Anonymous  </RadioGroupItem>
            </RadioGroup>
        </div>
        {state.authType.value === AuthenticationType.BASIC ?
            <div className="form__row form__row--flex">
                <div className="w-50 mr-8">
                    <CustomInput name="userName" value={state.userName.value} error={state.userName.error} onChange={handleOnChange} label="Username*" />
                </div>
                <div className="w-50 ml-8">
                    <CustomPassword name="password" value={state.password.value} error={state.userName.error} onChange={handleOnChange} label="Password*" />
                </div>
            </div>
            : null}
        <div className="form__row">
            <span className="form__label">TLS Key</span>
            <ResizableTextarea className="resizable-textarea__with-max-height w-100" name="tlsClientKey" value={state.tlsClientKey.value} onChange={handleOnChange} />
        </div>
        <div className="form__row">
            <span className="form__label">TLS Certificate</span>
            <ResizableTextarea className="resizable-textarea__with-max-height w-100" name="tlsClientCert" value={state.tlsClientCert.value} onChange={handleOnChange} />
        </div>
        <div className="form__buttons">
            <button className="cta cancel" type="button" onClick={e => toggleEditMode(t => !t)}>Cancel</button>
            <button className="cta">{loading ? <Progressing /> : 'Save cluster'}</button>
        </div>
    </form>
}