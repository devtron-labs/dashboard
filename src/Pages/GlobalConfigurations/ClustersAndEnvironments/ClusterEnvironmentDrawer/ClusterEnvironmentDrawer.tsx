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

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CustomInput,
    DeleteComponent,
    noop,
    showError,
    TagType,
    UseFormSubmitHandler,
    useForm,
    ToastManager,
    ToastVariantType,
    ServerErrors,
    Drawer,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Close } from '@Icons/ic-close.svg'
import { ReactComponent as DeleteEnvironment } from '@Icons/ic-delete-interactive.svg'
import { importComponentFromFELibrary } from '@Components/common'
import { saveEnvironment, updateEnvironment, deleteEnvironment } from '@Components/cluster/cluster.service'
import { DC_ENVIRONMENT_CONFIRMATION_MESSAGE, DeleteComponentsName } from '@Config/constantMessaging'

import { ClusterEnvironmentDrawerFormProps, ClusterEnvironmentDrawerProps, ClusterNamespacesDTO } from './types'
import { getClusterNamespaceByName, getClusterEnvironmentUpdatePayload, getNamespaceLabels } from './utils'
import { clusterEnvironmentDrawerFormValidationSchema } from './schema'

const virtualClusterSaveUpdateApi = importComponentFromFELibrary('virtualClusterSaveUpdateApi', null, 'function')
const getClusterNamespaces = importComponentFromFELibrary('getClusterNamespaces', noop, 'function')
const EnvironmentLabels = importComponentFromFELibrary('EnvironmentLabels', null, 'function')

const getVirtualClusterSaveUpdate = (_id) => virtualClusterSaveUpdateApi?.(_id)

export const ClusterEnvironmentDrawer = ({
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
}: ClusterEnvironmentDrawerProps) => {
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
        error: ServerErrors
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
        setClusterNamespaces({
            isFetching: setNamespaceLabelsAfterFetch,
            data: null,
            error: null,
        })

        try {
            // Fetch namespaces from the cluster
            const { result } = await getClusterNamespaces(clusterId)

            // Update clusterNamespaces state with fetched data
            setClusterNamespaces({
                isFetching: false,
                data: result,
                error: null,
            })

            if (setNamespaceLabelsAfterFetch) {
                // Find the specific namespace and update namespaceLabels state
                const clusterNamespace = getClusterNamespaceByName(result, _namespace)
                setNamespaceLabels({
                    labels: getNamespaceLabels(clusterNamespace),
                    resourceVersion: clusterNamespace?.resourceVersion ?? null,
                })
            }

            return result
        } catch (error) {
            // Handle error and update state with error message
            setClusterNamespaces({
                isFetching: false,
                data: null,
                error,
            })

            return null
        }
    }

    // FORM METHODS
    const { data, errors, register, handleSubmit, trigger } = useForm<ClusterEnvironmentDrawerFormProps>({
        initialValues: {
            environmentName,
            namespace,
            isProduction: !!isProduction,
            description,
        },
        validations: clusterEnvironmentDrawerFormValidationSchema({ isNamespaceMandatory: !isVirtual }),
    })

    const onValidation =
        (clusterNamespacesData = clusterNamespaces.data): UseFormSubmitHandler<ClusterEnvironmentDrawerFormProps> =>
        async (formData) => {
            const payload = getClusterEnvironmentUpdatePayload({
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
                api = getVirtualClusterSaveUpdate(id)
            } else {
                api = id ? updateEnvironment : saveEnvironment
            }

            try {
                setCrudLoading(true)
                await api(payload, id)
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: `Successfully ${id ? 'updated' : 'saved'}`,
                })
                reload()
                hideClusterDrawer()
            } catch (err) {
                setCrudLoading(false)
                if (err.code === 409) {
                    ToastManager.showToast({
                        variant: ToastVariantType.error,
                        title: 'Namespace manifest changed',
                        description: err.errors[0].userMessage,
                    })
                    const clusterNamespace = getClusterNamespaceByName(clusterNamespacesData, formData.namespace)
                    setNamespaceLabels({
                        labels: getNamespaceLabels(clusterNamespace),
                        resourceVersion: clusterNamespace.resourceVersion,
                    })
                } else {
                    showError(err)
                }
            }
        }

    const withLabelEditValidation: UseFormSubmitHandler<ClusterEnvironmentDrawerFormProps> = async () => {
        setCrudLoading(true)
        try {
            const response = await fetchClusterNamespaces(data.namespace, false)
            if (response) {
                onValidation(response)(data)
            }
        } catch {
            setCrudLoading(false)
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
        <Drawer position="right" width="800px" onEscape={hideClusterDrawer} onClose={hideClusterDrawer}>
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
                    onSubmit={handleSubmit(namespaceLabels.labels ? withLabelEditValidation : onValidation())}
                >
                    <div className="dc__overflow-scroll p-20 flex-grow-1">
                        <div className="mb-16">
                            <CustomInput
                                dataTestid="environment-name"
                                labelClassName="dc__required-field"
                                disabled={!!environmentName}
                                placeholder={id ? 'sample-env-name' : 'Eg. production'}
                                value={data.environmentName}
                                error={errors.environmentName}
                                {...register('environmentName')}
                                label="Environment Name"
                                autoFocus={!id}
                                noTrim
                            />
                        </div>
                        <div className="mb-16">
                            <CustomInput
                                dataTestid="enter-namespace"
                                labelClassName={isVirtual ? '' : 'dc__required-field'}
                                disabled={!!namespace}
                                placeholder={id ? 'sample-namespace' : 'Eg. prod'}
                                value={data.namespace}
                                error={errors.namespace}
                                {...register('namespace')}
                                label="Namespace"
                                noTrim
                            />
                        </div>
                        {!isVirtual && (
                            <div className="mb-16 flex left">
                                <label htmlFor="env-production-checkbox" className="pr-16 flex cursor">
                                    <input
                                        id="env-production-checkbox"
                                        data-testid="production"
                                        type="radio"
                                        checked={data.isProduction}
                                        value="true"
                                        {...register('isProduction', (value) => value === 'true')}
                                    />
                                    <span className="ml-10 fw-4 mt-4 fs-13">Production</span>
                                </label>
                                <label htmlFor="env-non-production-checkbox" className="flex cursor">
                                    <input
                                        id="env-non-production-checkbox"
                                        data-testid="nonProduction"
                                        type="radio"
                                        checked={!data.isProduction}
                                        value="false"
                                        {...register('isProduction', (value) => value === 'true')}
                                    />
                                    <span className="ml-10 fw-4 mt-4 fs-13">Non - Production</span>
                                </label>
                            </div>
                        )}
                        <div className="mb-16">
                            <CustomInput
                                placeholder="Add a description for this environment"
                                value={data.description}
                                error={errors.description}
                                {...register('description')}
                                label="Description (Maximum 40 characters allowed)"
                                autoFocus={!!id}
                                noTrim
                            />
                        </div>
                        {EnvironmentLabels && !isVirtual && (
                            <div className="dc__border-top-n1 pt-16">
                                <EnvironmentLabels
                                    tags={namespaceLabels.labels}
                                    setTags={setTags}
                                    isLoading={clusterNamespaces.isFetching}
                                    addLabel={addLabel}
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
                        deleteComponent={deleteEnvironment}
                        payload={getClusterEnvironmentUpdatePayload({
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
        </Drawer>
    )
}
