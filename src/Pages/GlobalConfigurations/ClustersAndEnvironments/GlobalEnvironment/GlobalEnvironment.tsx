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

import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

import {
    CustomInput,
    DeleteComponent,
    noop,
    Progressing,
    showError,
    TagType,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Close } from '@Icons/ic-close.svg'
import { ReactComponent as DeleteEnvironment } from '@Icons/ic-delete-interactive.svg'
import { importComponentFromFELibrary } from '@Components/common'
import { UseFormSubmitHandler, useForm } from '@Components/common/hooks/useForm'
import { saveEnvironment, updateEnvironment, deleteEnvironment } from '@Components/cluster/cluster.service'
import { DC_ENVIRONMENT_CONFIRMATION_MESSAGE, DeleteComponentsName } from '@Config/constantMessaging'
import { EnvironmentLabels } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/EnvironmentLabels'
import { getClusterNamespaces } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/clustersAndEnvironments.service'

import { GlobalEnvironmentFormProps, GlobalEnvironmentProps } from './types'
import { getClusterNamespaceByName, getGlobalEnvironmentUpdatePayload, getNamespaceLabels } from './utils'
import { globalEnvironmentFormValidationSchema } from './schema'

const virtualClusterSaveUpdateApi = importComponentFromFELibrary('virtualClusterSaveUpdateApi', null, 'function')
const renderVirtualClusterSaveUpdate = (_id) => virtualClusterSaveUpdateApi?.(_id)

export const GlobalEnvironment = ({
    environmentName,
    namespace,
    id,
    clusterId,
    prometheusEndpoint,
    isProduction,
    description,
    reload,
    hideClusterDrawer,
    isVirtual,
}: GlobalEnvironmentProps) => {
    // STATES
    const [loading, setLoading] = useState(false)
    const [confirmation, toggleConfirmation] = useState<boolean>(false)
    // State is set when namespace labels have been externally modified which causes conflicts.
    const [namespaceLabelsConflictErr, setNamespaceLabelsConflictErr] = useState(null)
    // State used for `shouldRun` param of `useAsync` hook for fetching cluster namespaces.
    const [fetchClusterNamespaces, setFetchClusterNamespaces] = useState(false)
    // State for storing namespace labels fetched from cluster.
    const [namespaceLabels, setNamespaceLabels] = useState<TagType[]>(null)

    // REFS
    // Ref to store the namespace resource version (used by BE to check if namespace labels have been modified externally).
    const resourceVersion = useRef<string>(null)
    /**
     * Tracks whether the environment update button has been clicked.
     *
     * This ref is used to determine if the user has initiated an environment update,
     * which may influence subsequent logic or state updates in the component.
     */
    const isEnvironmentUpdateButtonClicked = useRef(false)

    // ASYNC CALLS
    const [clusterNamespacesLoader, clusterNamespaces, clusterNamespacesErr, reloadClusterNamespaces] = useAsync(
        () => getClusterNamespaces(clusterId),
        [clusterId, fetchClusterNamespaces],
        fetchClusterNamespaces,
        { resetOnChange: false },
    )

    // FORM METHODS
    const { data, errors, handleChange, handleSubmit, trigger } = useForm<GlobalEnvironmentFormProps>({
        initialValues: {
            environmentName,
            namespace,
            isProduction: !!isProduction,
            description,
        },
        validations: globalEnvironmentFormValidationSchema({ isNamespaceMandatory: !isVirtual }),
    })

    const onValidation: UseFormSubmitHandler<GlobalEnvironmentFormProps> = async (formData) => {
        const payload = getGlobalEnvironmentUpdatePayload({
            data: formData,
            clusterId,
            id,
            namespaceLabels,
            prometheusEndpoint,
            resourceVersion: resourceVersion.current,
            isVirtual,
        })

        let api
        if (isVirtual) {
            api = renderVirtualClusterSaveUpdate(id)
        } else {
            api = id ? updateEnvironment : saveEnvironment
        }

        try {
            setLoading(true)
            await api(payload, id)
            toast.success(`Successfully ${id ? 'updated' : 'saved'}`)
            reload()
            hideClusterDrawer()
            setNamespaceLabelsConflictErr(null)
        } catch (err) {
            showError(err)
            if (err.code === 409) {
                setNamespaceLabelsConflictErr(err.errors[0].userMessage)
            }
        } finally {
            setLoading(false)
        }
    }

    const withLabelEditValidation = () => {
        setNamespaceLabelsConflictErr(null)
        setFetchClusterNamespaces(true)
        isEnvironmentUpdateButtonClicked.current = true
    }

    useEffect(() => {
        if (!isEnvironmentUpdateButtonClicked.current) {
            if (!clusterNamespacesLoader && clusterNamespaces) {
                setFetchClusterNamespaces(false)
                const clusterNamespace = getClusterNamespaceByName(clusterNamespaces.result, data.namespace)
                setNamespaceLabels(getNamespaceLabels(clusterNamespace))
                resourceVersion.current = clusterNamespace?.resourceVersion ?? null
            } else {
                setNamespaceLabels(null)
            }
        } else if (
            isEnvironmentUpdateButtonClicked.current &&
            !clusterNamespacesLoader &&
            !clusterNamespacesErr &&
            clusterNamespaces
        ) {
            isEnvironmentUpdateButtonClicked.current = false
            setFetchClusterNamespaces(false)
            onValidation(data)
        }

        if (!clusterNamespacesLoader && clusterNamespacesErr) {
            setFetchClusterNamespaces(false)
        }
    }, [clusterNamespacesLoader, clusterNamespaces, clusterNamespacesErr])

    // METHODS
    const deleteEnv = () => {
        hideClusterDrawer()
        reload()
    }

    const addLabel = () => {
        const nameSpaceErr = trigger('namespace')
        if (!nameSpaceErr) {
            setFetchClusterNamespaces(true)
        }
    }

    const retryClusterNamespaces = () => {
        setNamespaceLabelsConflictErr(null)
        reloadClusterNamespaces()
    }

    return (
        <div className="h-100 bcn-0 flexbox-col">
            <div className="flexbox dc__align-items-center dc__content-space dc__border-bottom bcn-0 py-12 px-20">
                <h3 className="m-0 fs-16 fw-6 lh-1-43">{id ? 'Edit Environment' : 'Add Environment'}</h3>
                <button
                    type="button"
                    aria-label="close-btn"
                    className="dc__transparent flex icon-dim-24"
                    onClick={hideClusterDrawer}
                >
                    <Close className="icon-dim-24 dc__align-right cursor" />
                </button>
            </div>
            <form
                className="flex-grow-1 flexbox-col"
                onSubmit={handleSubmit(namespaceLabels ? withLabelEditValidation : onValidation)}
            >
                <div className="dc__overflow-scroll p-20 flex-grow-1">
                    <div className="mb-16">
                        <CustomInput
                            dataTestid="environment-name"
                            labelClassName="dc__required-field"
                            disabled={!!environmentName}
                            name="environmentName"
                            placeholder={id ? 'sample-env-name' : 'Eg. production'}
                            value={data.environmentName}
                            error={errors.environmentName}
                            onChange={handleChange('environmentName')}
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
                            value={data.namespace}
                            error={errors.namespace}
                            onChange={handleChange('namespace')}
                            label="Namespace"
                        />
                    </div>
                    {!isVirtual && (
                        <div className="mb-16 flex left">
                            <label htmlFor="env-production-checkbox" className="pr-16 flex cursor">
                                <input
                                    id="env-production-checkbox"
                                    data-testid="production"
                                    type="radio"
                                    name="isProduction"
                                    checked={data.isProduction}
                                    value="true"
                                    onChange={handleChange('isProduction', (value) => value === 'true')}
                                />
                                <span className="ml-10 fw-4 mt-4 fs-13">Production</span>
                            </label>
                            <label htmlFor="env-non-production-checkbox" className="flex cursor">
                                <input
                                    id="env-non-production-checkbox"
                                    data-testid="nonProduction"
                                    type="radio"
                                    name="isProduction"
                                    checked={!data.isProduction}
                                    value="false"
                                    onChange={handleChange('isProduction', (value) => value === 'true')}
                                />
                                <span className="ml-10 fw-4 mt-4 fs-13">Non - Production</span>
                            </label>
                        </div>
                    )}
                    <div className="mb-16">
                        <CustomInput
                            name="description"
                            placeholder="Add a description for this environment"
                            value={data.description}
                            error={errors.description}
                            onChange={handleChange('description')}
                            label="Description (Maximum 40 characters allowed)"
                        />
                    </div>
                    {!isVirtual && (
                        <div className="dc__border-top-n1 pt-16">
                            <EnvironmentLabels
                                tags={namespaceLabels}
                                setTags={setNamespaceLabels}
                                isLoading={clusterNamespacesLoader}
                                addLabel={addLabel}
                                isError={!!namespaceLabelsConflictErr}
                                error={clusterNamespacesErr?.errors[0].userMessage ?? namespaceLabelsConflictErr}
                                reload={retryClusterNamespaces}
                            />
                        </div>
                    )}
                </div>
                <div className="dc__border-top flexbox dc__align-items-center dc__content-space py-16 px-20 dc__position-sticky dc__bottom-0 bcn-0">
                    {id && (
                        <button
                            className="cta flex override-button delete scr-5 h-36 m-0-imp"
                            type="button"
                            onClick={() => toggleConfirmation(true)}
                        >
                            <DeleteEnvironment className="icon-dim-16 mr-8" />
                            <span>Delete</span>
                        </button>
                    )}
                    <div className="flex dc__gap-12 ml-auto">
                        <button className="cta cancel flex h-36" type="button" onClick={hideClusterDrawer}>
                            Cancel
                        </button>
                        <button
                            className="cta flex h-36"
                            type="submit"
                            disabled={loading || clusterNamespacesLoader}
                            data-testid="save-and-update-environment"
                        >
                            {loading && <Progressing />}
                            {!loading && (id ? 'Update' : 'Save')}
                        </button>
                    </div>
                </div>
            </form>
            {confirmation && (
                <DeleteComponent
                    setDeleting={noop}
                    deleteComponent={deleteEnvironment}
                    payload={getGlobalEnvironmentUpdatePayload({
                        data,
                        clusterId,
                        id,
                        namespaceLabels,
                        prometheusEndpoint,
                        resourceVersion: resourceVersion.current,
                        isVirtual,
                    })}
                    title={data.environmentName}
                    toggleConfirmation={toggleConfirmation}
                    component={DeleteComponentsName.Environment}
                    confirmationDialogDescription={DC_ENVIRONMENT_CONFIRMATION_MESSAGE}
                    closeCustomComponent={deleteEnv}
                    reload={deleteEnv}
                />
            )}
        </div>
    )
}
