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
import { toast } from 'react-toastify'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CustomInput,
    DeleteComponent,
    noop,
    showError,
    TagType,
    ToastBody,
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
import { ClusterNamespacesDTO } from '../clustersAndEnvironments.types'

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
    // Manages the loading state for create and update actions
    const [crudLoading, setCrudLoading] = useState(false)
    // Controls the visibility of the delete confirmation dialog
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    // Stores namespace labels and resourceVersion fetched from the cluster
    const [namespaceLabels, setNamespaceLabels] = useState<{ labels: TagType[]; resourceVersion: string }>({
        labels: null,
        resourceVersion: null,
    })
    // Stores the response from the clusterNamespaces API, including fetching state, data, and any error messages
    const [clusterNamespaces, setClusterNamespaces] = useState<{
        isFetching: boolean
        data: ClusterNamespacesDTO[]
        error: string
    }>({
        isFetching: false,
        data: null,
        error: null,
    })

    /**
     * Fetches the list of namespaces from the cluster and updates the state accordingly. \
     * Optionally sets namespace labels after the fetch is complete.
     *
     * @param _namespace - The specific namespace to fetch.
     * @param [setNamespaceLabelsAfterFetch=true] - Flag to determine if namespace labels should be updated after fetching.
     *
     * @returns A promise that resolves to the fetched list of namespaces or `null` if the fetch fails.
     */
    const fetchClusterNamespaces = async (_namespace: string, setNamespaceLabelsAfterFetch = true) => {
        // Update clusterNamespaces state to reflect fetching state and reset data and error
        setClusterNamespaces((prev) => ({
            ...prev,
            isFetching: setNamespaceLabelsAfterFetch,
            data: null,
            error: null,
            resourceVersion: null,
        }))

        try {
            // Fetch namespaces from the cluster
            const { result } = await getClusterNamespaces(clusterId)

            // Update clusterNamespaces state with fetched data
            setClusterNamespaces({
                isFetching: false,
                data: result,
                error: null,
            })

            // Find the specific namespace and update namespaceLabels state
            const clusterNamespace = getClusterNamespaceByName(result, _namespace)
            setNamespaceLabels({
                labels: setNamespaceLabelsAfterFetch ? getNamespaceLabels(clusterNamespace) : namespaceLabels.labels,
                resourceVersion: clusterNamespace?.resourceVersion ?? null,
            })

            return result
        } catch (err) {
            // Handle error and update state with error message
            setClusterNamespaces((prev) => ({
                ...prev,
                isFetching: false,
                data: null,
                error: err.errors[0].userMessage,
            }))

            return null
        }
    }

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

    const onValidation =
        (clusterNamespacesData = clusterNamespaces.data): UseFormSubmitHandler<GlobalEnvironmentFormProps> =>
        async (formData) => {
            const payload = getGlobalEnvironmentUpdatePayload({
                data: formData,
                clusterId,
                id,
                namespaceLabels: namespaceLabels.labels,
                prometheusEndpoint,
                resourceVersion: namespaceLabels.resourceVersion,
                isVirtual,
            })

            let api
            if (isVirtual) {
                api = renderVirtualClusterSaveUpdate(id)
            } else {
                api = id ? updateEnvironment : saveEnvironment
            }

            try {
                setCrudLoading(true)
                await api(payload, id)
                toast.success(`Successfully ${id ? 'updated' : 'saved'}`)
                reload()
                hideClusterDrawer()
            } catch (err) {
                if (err.code === 409) {
                    toast.error(<ToastBody title="Namespace manifest changed" subtitle={err.errors[0].userMessage} />)
                    const clusterNamespace = getClusterNamespaceByName(clusterNamespacesData, formData.namespace)
                    setNamespaceLabels({
                        ...namespaceLabels,
                        labels: getNamespaceLabels(clusterNamespace),
                    })
                } else {
                    showError(err)
                }
            } finally {
                setCrudLoading(false)
            }
        }

    const withLabelEditValidation: UseFormSubmitHandler<GlobalEnvironmentFormProps> = async () => {
        setCrudLoading(true)
        const response = await fetchClusterNamespaces(data.namespace, false)
        if (response) {
            onValidation(response)(data)
        }
    }

    // METHODS
    const deleteEnv = () => {
        hideClusterDrawer()
        reload()
    }

    const setTags = (tags: TagType[]) => setNamespaceLabels((prev) => ({ ...prev, labels: tags }))

    const addLabel = async () => {
        const nameSpaceErr = trigger('namespace')
        if (!nameSpaceErr) {
            await fetchClusterNamespaces(data.namespace)
        }
    }

    const refetchNamespaceLabels = async () => {
        await fetchClusterNamespaces(data.namespace)
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
                onSubmit={handleSubmit(namespaceLabels ? withLabelEditValidation : onValidation())}
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
                                tags={namespaceLabels.labels}
                                setTags={setTags}
                                isLoading={clusterNamespaces.isFetching}
                                addLabel={addLabel}
                                isError={!!clusterNamespaces.error}
                                error={clusterNamespaces.error}
                                reload={refetchNamespaceLabels}
                            />
                        </div>
                    )}
                </div>
                <div className="dc__border-top flexbox dc__align-items-center dc__content-space py-16 px-20 dc__position-sticky dc__bottom-0 bcn-0">
                    {id && (
                        <Button
                            variant={ButtonVariantType.secondary}
                            style={ButtonStyleType.negative}
                            text="Delete"
                            startIcon={<DeleteEnvironment />}
                            dataTestId="environment-delete-btn"
                            onClick={() => setShowDeleteConfirmation(true)}
                        />
                    )}
                    <div className="flex dc__gap-12 ml-auto">
                        <Button
                            variant={ButtonVariantType.secondary}
                            style={ButtonStyleType.neutral}
                            text="Cancel"
                            dataTestId="environment-cancel-btn"
                            onClick={hideClusterDrawer}
                        />
                        <Button
                            text={id ? 'Update' : 'Save'}
                            dataTestId="save-and-update-environment"
                            isLoading={crudLoading}
                            disabled={crudLoading || clusterNamespaces.isFetching}
                            buttonProps={{
                                type: 'submit',
                            }}
                        />
                    </div>
                </div>
            </form>
            {showDeleteConfirmation && (
                <DeleteComponent
                    setDeleting={noop}
                    deleteComponent={deleteEnvironment}
                    payload={getGlobalEnvironmentUpdatePayload({
                        data,
                        clusterId,
                        id,
                        prometheusEndpoint,
                        isVirtual,
                    })}
                    title={data.environmentName}
                    toggleConfirmation={setShowDeleteConfirmation}
                    component={DeleteComponentsName.Environment}
                    confirmationDialogDescription={DC_ENVIRONMENT_CONFIRMATION_MESSAGE}
                    closeCustomComponent={deleteEnv}
                    reload={deleteEnv}
                />
            )}
        </div>
    )
}
