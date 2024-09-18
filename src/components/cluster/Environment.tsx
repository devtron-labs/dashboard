/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState } from 'react'
import { CustomInput, DeleteComponent, Progressing, showError, stopPropagation, ToastManager, ToastVariantType } from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary, useForm } from '../common'
import { saveEnvironment, updateEnvironment, deleteEnvironment } from './cluster.service'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as DeleteEnvironment } from '../../assets/icons/ic-delete-interactive.svg'
import { DC_ENVIRONMENT_CONFIRMATION_MESSAGE, DeleteComponentsName } from '../../config/constantMessaging'

const virtualClusterSaveUpdateApi = importComponentFromFELibrary('virtualClusterSaveUpdateApi', null, 'function')

export default function Environment({
    environment_name,
    namespace,
    id,
    cluster_id,
    prometheus_endpoint,
    isProduction,
    description,
    isNamespaceMandatory = true,
    reload,
    hideClusterDrawer,
    isVirtual,
}) {
    const [loading, setLoading] = useState(false)
    const [ignore] = useState(false)
    const [ignoreError, setIngoreError] = useState('')
    const { state, handleOnChange, handleOnSubmit } = useForm(
        {
            environment_name: { value: environment_name, error: '' },
            namespace: { value: namespace, error: '' },
            isProduction: { value: isProduction ? 'true' : 'false', error: '' },
            description: { value: description, error: '' },
        },
        {
            environment_name: {
                required: true,
                validators: [
                    { error: 'Environment name is required', regex: /^.*$/ },
                    { error: "Use only lowercase alphanumeric characters or '-'", regex: /^[a-z0-9-]+$/ },
                    { error: "Cannot start/end with '-'", regex: /^(?![-]).*[^-]$/ },
                    { error: 'Minimum 1 and Maximum 16 characters required', regex: /^.{1,16}$/ },
                ],
            },
            namespace: {
                required: isNamespaceMandatory,
                validators: [
                    { error: 'Namespace is required', regex: /^.*$/ },
                    { error: "Use only lowercase alphanumeric characters or '-'", regex: /^[a-z0-9-]+$/ },
                    { error: "Cannot start/end with '-'", regex: /^(?![-]).*[^-]$/ },
                    { error: 'Maximum 63 characters required', regex: /^.{1,63}$/ },
                ],
            },
            isProduction: {
                required: true,
                validator: { error: 'token is required', regex: /[^]+/ },
            },
            description: {
                required: false,
                validators: [{ error: 'Maximum 40 characters required', regex: /^.{0,40}$/ }],
            },
        },
        onValidation,
    )
    const [deleting, setDeleting] = useState(false)
    const [confirmation, toggleConfirmation] = useState<boolean>(false)

    const getEnvironmentPayload = () => {
        return {
            id,
            environment_name: state.environment_name.value,
            cluster_id,
            prometheus_endpoint,
            namespace: state.namespace.value || '',
            active: true,
            default: state.isProduction.value === 'true',
            description: state.description.value || '',
        }
    }

    const renderVirtualClusterSaveUpdate = (id) => {
        if (virtualClusterSaveUpdateApi) {
            return virtualClusterSaveUpdateApi(id)
        }
    }

    async function onValidation() {
        let payload
        let api
        if (isVirtual) {
            payload = {
                id,
                environment_name: state.environment_name.value,
                namespace: state.namespace.value || '',
                IsVirtualEnvironment: true,
                cluster_id,
                description: state.description.value || '',
            }
            api = renderVirtualClusterSaveUpdate(id)
        } else {
            if (!state.namespace.value && !ignore) {
                setIngoreError('Enter a namespace or select ignore namespace')
                return
            }
            payload = getEnvironmentPayload()
            api = id ? updateEnvironment : saveEnvironment
        }

        try {
            setLoading(true)
            await api(payload, id)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: `Successfully ${id ? 'updated' : 'saved'}`,
            })
            reload()
            hideClusterDrawer()
        } catch (err) {
            showError(err)
        } finally {
            setLoading(false)
        }
    }

    const clusterDelete = (): void => {
        setDeleting(true)
    }

    const deleteEnv = (): void => {
        hideClusterDrawer()
        reload()
    }

    return (
        <div>
            <div className="bcn-0">
                <div className="flex flex-align-center flex-justify dc__border-bottom bcn-0 pt-12 pr-20 pb-12">
                    <div className="fs-16 fw-6 lh-1-43 ml-20">{id ? 'Edit Environment' : 'Add Environment'}</div>
                    <button type="button" className="dc__transparent flex icon-dim-24" onClick={hideClusterDrawer}>
                        <Close className="icon-dim-24 dc__align-right cursor" />
                    </button>
                </div>
            </div>
            <div onClick={stopPropagation}>
                <div className="dc__overflow-scroll p-20">
                    <div className="mb-16">
                        <CustomInput
                            dataTestid="environment-name"
                            labelClassName="dc__required-field"
                            disabled={!!environment_name}
                            name="environment_name"
                            placeholder={id ? 'sample-env-name' : 'Eg. production'}
                            value={state.environment_name.value}
                            error={state.environment_name.error}
                            onChange={handleOnChange}
                            label="Environment Name"
                        />
                    </div>
                    <div className="mb-16">
                        <CustomInput
                            dataTestid="enter-namespace"
                            labelClassName={isVirtual ? '' : 'dc__required-field'}
                            disabled={!!namespace}
                            name="namespace"
                            placeholder={id ? 'sample-namespace' : 'Eg. prod'}
                            value={state.namespace.value}
                            error={state.namespace.error}
                            onChange={handleOnChange}
                            label="Namespace"
                        />
                    </div>
                    {!isVirtual && (
                        <div className="mb-16 flex left">
                            <label className="pr-16 flex cursor">
                                <input
                                    data-testid="production"
                                    type="radio"
                                    name="isProduction"
                                    checked={state.isProduction.value === 'true'}
                                    value="true"
                                    onChange={handleOnChange}
                                />
                                <span className="ml-10 fw-4 mt-4 fs-13">Production</span>
                            </label>
                            <label className="flex cursor">
                                <input
                                    data-testid="nonProduction"
                                    type="radio"
                                    name="isProduction"
                                    checked={state.isProduction.value === 'false'}
                                    value="false"
                                    onChange={handleOnChange}
                                />
                                <span className="ml-10 fw-4 mt-4 fs-13">Non - Production</span>
                            </label>
                        </div>
                    )}
                    <div className="mb-16">
                        <CustomInput
                            name="description"
                            placeholder="Add a description for this environment"
                            value={state.description.value}
                            error={state.description.error}
                            onChange={handleOnChange}
                            label="Description (Maximum 40 characters allowed)"
                        />
                    </div>
                </div>
                <div className="w-100 dc__border-top flex right pb-8 pt-8 dc__position-fixed dc__position-abs dc__bottom-0 bcn-0">
                    {id && (
                        <button
                            className="cta flex override-button delete scr-5 h-36 ml-20 cluster-delete-icon"
                            type="button"
                            onClick={() => toggleConfirmation(true)}
                        >
                            <DeleteEnvironment className="icon-dim-16 mr-8" />
                            {deleting ? <Progressing /> : 'Delete'}
                        </button>
                    )}
                    <button className="cta cancel flex mt-8 mb-8 h-36" type="button" onClick={hideClusterDrawer}>
                        Cancel
                    </button>
                    <button
                        className="cta ml-8 flex mr-20 mt-8 mb-8 h-36"
                        type="submit"
                        disabled={loading}
                        onClick={handleOnSubmit}
                        data-testid="save-and-update-environment"
                    >
                        {loading ? <Progressing /> : id ? 'Update' : 'Save'}
                    </button>
                </div>

                {confirmation && (
                    <DeleteComponent
                        setDeleting={clusterDelete}
                        deleteComponent={deleteEnvironment}
                        payload={getEnvironmentPayload()}
                        title={state.environment_name.value}
                        toggleConfirmation={toggleConfirmation}
                        component={DeleteComponentsName.Environment}
                        confirmationDialogDescription={DC_ENVIRONMENT_CONFIRMATION_MESSAGE}
                        closeCustomComponent={deleteEnv}
                        reload={deleteEnv}
                    />
                )}
            </div>
        </div>
    )
}
