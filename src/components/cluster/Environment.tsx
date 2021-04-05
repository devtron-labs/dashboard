import React, { useState } from 'react'
import { CustomInput } from '../globalConfigurations/GlobalConfiguration';
import { showError, useForm, Progressing, VisibleModal } from '../common';
import { saveEnvironment, updateEnvironment } from './cluster.service';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { toast } from 'react-toastify';

export function Environment({ environment_name, namespace, id, cluster_id, handleClose, prometheus_endpoint, isProduction, isNamespaceMandatory = true }) {
    const [loading, setLoading] = useState(false)
    const [ignore, setIngore] = useState(false)
    const [ignoreError, setIngoreError] = useState("")
    const { state, disable, handleOnChange, handleOnSubmit } = useForm(
        {
            environment_name: { value: environment_name, error: "" },
            namespace: { value: namespace, error: "" },
            isProduction: { value: isProduction ? "true" : "false", error: "" },
        },
        {
            environment_name: {
                required: true,
                validator: { error: 'This is required field(max 16 chars).', regex: /^.{1,16}$/ }
            },
            namespace: {
                required: isNamespaceMandatory,
                validator: { error: '^[a-z]+[a-z0-9\-\?]*[a-z0-9]+$ pattern should satisfy.', regex: /^[a-z]+[a-z0-9\-\?]*[a-z0-9]+$/ }
            },
            isProduction: {
                required: true,
                validator: { error: 'token is required', regex: /[^]+/ }
            },
        }, onValidation);

    async function onValidation() {
        if (!state.namespace.value && !ignore) {
            setIngoreError("Enter a namespace or select ignore namespace")
            return
        }
        let payload = {
            id,
            environment_name: state.environment_name.value,
            cluster_id,
            prometheus_endpoint,
            namespace: state.namespace.value || "",
            active: true,
            default: state.isProduction.value === 'true',
        }

        const api = id ? updateEnvironment : saveEnvironment
        try {
            setLoading(true)
            await api(payload, id)
            toast.success(`Successfully ${id ? 'updated' : 'saved'}`)
            handleClose(true)
        }
        catch (err) {
            showError(err)
        }
        finally {
            setLoading(false)
        }
    }

    return <VisibleModal className="environment-create-modal" close={handleClose}>
        <form className="environment-create-body" onClick={(e) => e.stopPropagation()} onSubmit={handleOnSubmit} >
            <div className="form__row">
                <div className="flex left">
                    <div className="form__title">{id ? 'Update Environment' : 'New Environment'}</div>
                    <Close className="icon-dim-24 align-right cursor" onClick={e => handleClose(false)} />
                </div>
            </div>
            <div className="form__row">
                <CustomInput autoComplete="off" disabled={!!environment_name} name="environment_name" value={state.environment_name.value} error={state.environment_name.error} onChange={handleOnChange} label="Environment Name*" />
            </div>
            <div className="form__row form__row--namespace">
                <CustomInput disabled={!!namespace || ignore} name="namespace" value={state.namespace.value} error={state.namespace.error} onChange={handleOnChange} label={`Enter Namespace ${isNamespaceMandatory ? '*' : ''}`} />
            </div>
            {!isNamespaceMandatory && <><div className="form__row form__row--ignore-namespace">
                <input type="checkbox" onChange={e => { setIngore(t => !t); setIngoreError("") }} checked={ignore} />
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
                        <label className="form__label"><input type="radio" name="isProduction" checked={state.isProduction.value === 'true'} value="true" onChange={handleOnChange} /><span>Production</span></label>
                    </div>
                    <div className="flex left environment environment--non-production">
                        <label className="form__label"><input type="radio" name="isProduction" checked={state.isProduction.value === 'false'} value="false" onChange={handleOnChange} /><span>Non - Production</span></label>
                    </div>
                </div>
            </div>
            <div className="form__buttons">
                <button className="cta" type="submit" disabled={loading}>{loading ? <Progressing /> : id ? 'Update' : 'Save'}</button>
            </div>
        </form>
    </VisibleModal>
}