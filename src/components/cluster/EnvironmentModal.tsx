import React, { useState, useMemo, Component } from 'react'
import { showError, Pencil, useForm, Progressing, CustomPassword, VisibleModal, sortCallback } from '../common';
import { List, CustomInput } from '../globalConfigurations/GlobalConfiguration'
import { getClusterList, saveCluster, updateCluster, saveEnvironment, updateEnvironment, getEnvironmentList, getCluster, retryClusterInstall } from './cluster.service';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';


const DefaultEnvironmentValue = {
    environment_name: "",
    namespace: "",
    isProduction: "true"
}

export function Environment({ id, cluster_id, handleClose, prometheus_endpoint, isNamespaceMandatory = true }) {
    const [loading, setLoading] = useState(false)
    const [ignore, setIngore] = useState(false)
    const [ignoreError, setIngoreError] = useState("")
    const [error, setError] = useState()
    const [values, setValues] = useState(DefaultEnvironmentValue);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setValues({
            ...values,
            [name]: value,
        });
        console.log([name], value)
    };

    return <VisibleModal className="environment-create-modal" close={handleClose}>
        <form className="environment-create-body" onClick={(e) => e.stopPropagation()} >
            <div className="form__row">
                <div className="flex left">
                    <div className="form__title">{id ? 'Update Environment' : 'New Environment'}</div>
                    <Close className="icon-dim-24 align-right cursor" onClick={e => handleClose(false)} />
                </div>
            </div>
            <div className="form__row">
                <CustomInput
                    autoComplete="off"
                    disabled={!!DefaultEnvironmentValue.environment_name}
                    name="environment_name"
                    value={DefaultEnvironmentValue.environment_name}
                    error={error} onChange={handleInputChange}
                    label="Environment Name*" />
            </div>
            <div className="form__row form__row--namespace">
                <CustomInput
                    disabled={!!DefaultEnvironmentValue.namespace || ignore}
                    name="namespace" 
                    value={DefaultEnvironmentValue.namespace}
                    error={error} onChange={handleInputChange}
                    label={`Enter Namespace ${isNamespaceMandatory ? '*' : ''}`} />
            </div>
            {!isNamespaceMandatory && <><div className="form__row form__row--ignore-namespace">
                <input type="checkbox" 
                onChange={e => { setIngore(t => !t); setIngoreError("") }} 
                checked={ignore} />
                <div className="form__label bold">Ignore namespace</div>
            </div>
                <div className="form__row form__row--warn">
                    If left empty, you won't be able to add more
                    environments to this cluster
                </div>
                {ignoreError && <div className="form__row form__error">{ignoreError}</div>}
            </>}
            <div className="form__row">
                <div className="form__label">Environment type*</div>
                <div className="environment-type pointer">
                    <div className="flex left environment environment--production">
                        <label className="form__label">
                            <input
                                type="radio"
                                name="isProduction"
                                checked={DefaultEnvironmentValue.isProduction === 'true'}
                                value="true"
                                onChange={handleInputChange}
                            />
                            <span>Production</span></label>
                    </div>
                    <div className="flex left environment environment--non-production">
                        <label className="form__label">
                            <input
                                type="radio"
                                name="isProduction"
                                checked={DefaultEnvironmentValue.isProduction === 'false'}
                                value="false"
                                onChange={handleInputChange}
                            />
                            <span>Non - Production</span></label>
                    </div>
                </div>
            </div>
            <div className="form__buttons">
                <button className="cta" type="submit" disabled={loading}>{loading ? <Progressing /> : id ? 'Update' : 'Save'}</button>
            </div>
        </form>
    </VisibleModal>
}