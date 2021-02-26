import React, { useState, useMemo, Component, useEffect } from 'react'
import { showError, CustomInput, Pencil, useForm, Progressing, CustomPassword, VisibleModal, sortCallback } from '../common';
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup';
import { List } from '../globalConfigurations/GlobalConfiguration'
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

function ClusterForm({ id, authenTicationType, cluster_name, server_url, active, config, environments, toggleEditMode, reload, prometheus_url, prometheusAuth }) {

    const [form, setForm] = useState({
        isSaving: false,
        cluster_name: cluster_name,
        server_url: server_url,
        bearer_token: config && config.bearer_token ? config.bearer_token : "",
        userName: prometheusAuth?.userName,
        password: prometheusAuth?.password,
        tlsClientKey: prometheusAuth?.tlsClientKey,
        tlsClientCert: prometheusAuth?.tlsClientCert,
        prometheus_url: prometheus_url || "",
        authenTicationType: authenTicationType,
    })

    const [error, setError] = useState({
        cluster_name: [],
        server_url: [],
        userName: [],
        password: [],
        bearer_token: [],
        tlsClientKey: [],
        tlsClientCert: []
    })

    function handleOnSubmit() {
        let payload = {
            id,
            cluster_name: form.cluster_name,
            server_url: form.server_url,
            config: { bearer_token: form.bearer_token },
            active,
            prometheus_url: form.prometheus_url,
            prometheusAuth: {
                userName: form.userName,
                password: form.password,
            }
        }
    }

    function handleChange(event, key) {
        let allErrors = [];
        let value = event.target.value;

        setForm({
            ...form,
            [key]: value,
        })

        if (key === 'cluster_name') {
            let lowercaseAlphanumeric = new RegExp(/^[a-z0-9\-\.]*$/);
            let startAndEndWithAlphanumeric = new RegExp(/^[a-z]+[a-z]$/);
            if (value.length < 3) {
                allErrors.push({ name: "Length is less tthan 3" });
            }
            if (value.length > 25) {
                allErrors.push({ name: "Max 25 characters are allowed" });
            }
            if (!lowercaseAlphanumeric.test(value)) {
                allErrors.push({ name: "Use only lowercase alphanumeric characters, “-“ or “.”" });
            }
            if (!startAndEndWithAlphanumeric.test(value)) {
                allErrors.push({ name: "Start/End with alphanumeric" });
            }
        }


        if (key === 'server_url') {

        }

        if (key === 'prometheus_url') {

        }

        if (key === 'userName') {

        }

        if (key === 'password') {

        }

        if (key === 'tlsClientKey') {

        }

        if (key === 'tlsClientCert') {

        }

        setError({
            ...error,
            [key]: allErrors,
        })
    }

    return <form action="" className="cluster-form" onSubmit={handleOnSubmit}>
        <h2 className="form__title">Edit cluster</h2>
        <div className="form__row">
            <CustomInput autoComplete="off" name="cluster_name" value={form.cluster_name}
                error={error.cluster_name}
                onChange={(event) => handleChange(event, 'cluster_name')}
                label="Name*" />
        </div>
        <hr></hr>
        <div className="form__input-header mb-8">Kubernetes Cluster Info</div>
        <div className="form__row">
            <CustomInput autoComplete="off" name="url"
                value={form.server_url}
                error={error.server_url}
                onChange={(event) => handleChange(event, 'server_url')}
                label="Server URL*" />
        </div>
        <div className="form__row form__row--bearer-token flex column left top">
            <label htmlFor="" className="form__label">Bearer token*</label>
            <div className="bearer-token">
                <ResizableTextarea className="resizable-textarea__with-max-height"
                    name="token"
                    value={config && config.bearer_token ? config.bearer_token : ""}
                    onChange={(event) => handleChange(event, 'bearer_token')} />
            </div>
            {form.bearer_token.length && <div className="form__error">

            </div>}
        </div>
        <hr></hr>
        <div className="form__input-header mb-8">Prometheus Info</div>
        <div className="form__row">
            <CustomInput autoComplete="off"
                name="endpoint"
                value={form.prometheus_url}
                error={form.prometheus_url}
                onChange={(event) => handleChange(event, 'prometheus_url')}
                label="Prometheus endpoint*" />
        </div>
        <div className="form__row">
            <span className="form__label">Authentication Type*</span>
            <RadioGroup value={form.authenTicationType}
                name={`authType`}
                onChange={(event) => handleChange(event, 'authenTicationType')}>
                <RadioGroupItem value={AuthenticationType.BASIC}> Basic  </RadioGroupItem>
                <RadioGroupItem value={AuthenticationType.ANONYMOUS}>  Anonymous  </RadioGroupItem>
            </RadioGroup>
        </div>
        {form.authenTicationType === AuthenticationType.BASIC ?
            <div className="form__row form__row--flex">
                <div className="w-50 mr-8">
                    <CustomInput name="userName"
                        value={form.userName}
                        error={error.userName}
                        onChange={(event) => handleChange(event, 'userName')}
                        label="Username*" />
                </div>
                <div className="w-50 ml-8">
                    <CustomPassword name="password"
                        value={form.password}
                        error={error.password}
                        onChange={(event) => handleChange(event, 'password')}
                        label="Password*" />
                </div>
            </div>
            : null}
        <div className="form__row">
            <span className="form__label">TLS Key</span>
            <ResizableTextarea className="resizable-textarea__with-max-height w-100"
                name="tlsClientKey"
                value={form.tlsClientKey}
                onChange={(event) => handleChange(event, 'tlsClientKey')} />
        </div>
        <div className="form__row">
            <span className="form__label">TLS Certificate</span>
            <ResizableTextarea className="resizable-textarea__with-max-height w-100"
                name="tlsClientCert"
                value={form.tlsClientCert}
                onChange={(event) => handleChange(event, 'tlsClientCert')} />
        </div>
        <div className="form__buttons">
            <button className="cta cancel" type="button" onClick={e => toggleEditMode(t => !t)}>Cancel</button>
            <button className="cta">{form.isSaving ? <Progressing /> : 'Save cluster'}</button>
        </div>
    </form>
}