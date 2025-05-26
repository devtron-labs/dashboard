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

import { useEffect, useState } from 'react'
import { generatePath } from 'react-router-dom'

import {
    API_STATUS_CODES,
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    CustomInput,
    Drawer,
    GenericEmptyState,
    noop,
    SelectPickerOptionType,
    ServerErrors,
    showError,
    stopPropagation,
    TagType,
    ToastManager,
    ToastVariantType,
    Tooltip,
    useForm,
    UseFormSubmitHandler,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICAdd } from '@Icons/ic-add.svg'
import { ReactComponent as Close } from '@Icons/ic-close.svg'
import { ReactComponent as Trash } from '@Icons/ic-delete-interactive.svg'
import { importComponentFromFELibrary } from '@Components/common'
import { URLS } from '@Config/routes'
import { getNamespaceFromLocalStorage } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/cluster.util'
import { ADD_ENVIRONMENT_FORM_LOCAL_STORAGE_KEY } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/constants'

import { deleteEnvironment, saveEnvironment, updateEnvironment } from '../cluster.service'
import { CreateClusterTypeEnum } from '../CreateCluster/types'
import { EnvironmentDeleteComponent } from '../EnvironmentDeleteComponent'
import { clusterEnvironmentDrawerFormValidationSchema } from './schema'
import { ClusterEnvironmentDrawerFormProps, ClusterEnvironmentDrawerProps, ClusterNamespacesDTO } from './types'
import { getClusterEnvironmentUpdatePayload, getClusterNamespaceByName, getNamespaceLabels } from './utils'

const virtualClusterSaveUpdateApi = importComponentFromFELibrary('virtualClusterSaveUpdateApi', null, 'function')
const getClusterNamespaces = importComponentFromFELibrary('getClusterNamespaces', noop, 'function')
const EnvironmentLabels = importComponentFromFELibrary('EnvironmentLabels', null, 'function')
const AssignCategorySelect = importComponentFromFELibrary('AssignCategorySelect', null, 'function')

const getVirtualClusterSaveUpdate = (_id) => virtualClusterSaveUpdateApi?.(_id)

export const ClusterEnvironmentDrawer = ({
    environmentName,
    namespace,
    id,
    clusterId,
    isProduction,
    description,
    reload,
    hideClusterDrawer,
    isVirtual,
    clusterName,
    category,
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

    const [selectedCategory, setSelectedCategory] = useState<SelectPickerOptionType>({
        label: category?.name,
        value: category?.id,
    })

    const addEnvironmentHeaderText = `Add Environment in '${clusterName}'`

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

    const parsedNamespace = namespace ?? ''

    // FORM METHODS
    const { data, errors, register, handleSubmit, trigger } = useForm<ClusterEnvironmentDrawerFormProps>({
        initialValues: {
            environmentName: environmentName ?? '',
            namespace: !id ? getNamespaceFromLocalStorage(parsedNamespace) : parsedNamespace,
            isProduction: !!isProduction,
            category: { id: category?.id, name: category?.name },
            description: description ?? '',
        },
        validations: clusterEnvironmentDrawerFormValidationSchema({ isNamespaceMandatory: !isVirtual }),
    })

    useEffect(
        () => () => {
            if (localStorage.getItem(ADD_ENVIRONMENT_FORM_LOCAL_STORAGE_KEY)) {
                localStorage.removeItem(ADD_ENVIRONMENT_FORM_LOCAL_STORAGE_KEY)
            }
        },
        [],
    )

    const onValidation =
        (clusterNamespacesData = clusterNamespaces.data): UseFormSubmitHandler<ClusterEnvironmentDrawerFormProps> =>
        async (formData) => {
            const payload = getClusterEnvironmentUpdatePayload({
                data: formData,
                clusterId,
                id,
                namespaceLabels: namespaceLabels.labels,
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
                if (err.code === API_STATUS_CODES.CONFLICT) {
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
    const redirectToListAfterReload = () => {
        hideClusterDrawer()
        reload()
    }

    const setTags = (tags: TagType[]) => setNamespaceLabels((prev) => ({ ...prev, labels: tags }))

    const refetchNamespaceLabels = async () => {
        await fetchClusterNamespaces(data.namespace)
    }

    const addLabel = async () => {
        const nameSpaceErr = trigger('namespace')
        if (!nameSpaceErr) {
            await refetchNamespaceLabels()
        }
    }

    const showConfirmationModal = () => setShowDeleteConfirmation(true)
    const closeConfirmationModal = () => setShowDeleteConfirmation(false)

    const onDelete = async () => {
        const payload = getClusterEnvironmentUpdatePayload({
            data,
            clusterId,
            id,
            isVirtual,
        })
        await deleteEnvironment(payload)
        redirectToListAfterReload()
    }

    const renderCreateClusterButton = () => (
        <Button
            dataTestId="add_cluster_button"
            linkProps={{
                to: generatePath(URLS.GLOBAL_CONFIG_CREATE_CLUSTER, {
                    type: CreateClusterTypeEnum.CONNECT_CLUSTER,
                }),
            }}
            component={ButtonComponentType.link}
            startIcon={<ICAdd />}
            size={ComponentSizeType.medium}
            text="Add cluster"
        />
    )

    const handleSelectedCategory = (_selectedCategory) => {
        setSelectedCategory(_selectedCategory)
        register('category').onChange({
            target: { name: 'category', value: { id: _selectedCategory.value, name: _selectedCategory.label } },
        })
    }

    const renderContent = () => {
        if (!clusterId) {
            return (
                <GenericEmptyState
                    title="Cluster not found"
                    subTitle="Please add cluster before adding an environment."
                    isButtonAvailable
                    renderButton={renderCreateClusterButton}
                />
            )
        }

        return (
            <form
                className="flex-grow-1 flexbox-col mh-0"
                onSubmit={handleSubmit(namespaceLabels.labels ? withLabelEditValidation : onValidation())}
                noValidate
            >
                <div className="flexbox-col dc__overflow-auto p-20 flex-grow-1 dc__gap-16">
                    <CustomInput
                        disabled={!!environmentName}
                        placeholder={id ? 'sample-env-name' : 'Eg. production'}
                        value={data.environmentName}
                        error={errors.environmentName}
                        {...register('environmentName')}
                        label="Environment Name"
                        autoFocus={!id}
                        shouldTrim={false}
                        required
                    />

                    <CustomInput
                        disabled={!!namespace}
                        placeholder={id ? 'sample-namespace' : 'Eg. prod'}
                        value={data.namespace}
                        error={errors.namespace}
                        {...register('namespace')}
                        label="Namespace"
                        shouldTrim={false}
                        required={!isVirtual}
                    />

                    <CustomInput
                        placeholder="Add a description for this environment"
                        value={data.description}
                        error={errors.description}
                        {...register('description')}
                        label="Description (Maximum 40 characters allowed)"
                        autoFocus={!!id}
                        shouldTrim={false}
                    />
                    {!isVirtual && (
                        <div className="flex left dc__gap-24 fs-13">
                            <div className="dc__required-field cn-7">Type of cluster</div>
                            <div className="flex left dc__gap-16">
                                <label htmlFor="env-production-checkbox mb-0" className="flex cursor">
                                    <input
                                        id="env-production-checkbox"
                                        data-testid="production"
                                        type="radio"
                                        checked={data.isProduction}
                                        value="true"
                                        {...register('isProduction', { sanitizeFn: (value) => value === 'true' })}
                                    />
                                    <span className="ml-10 fw-4 mt-4">Production</span>
                                </label>
                                <label htmlFor="env-non-production-checkbox mb-0" className="flex cursor">
                                    <input
                                        id="env-non-production-checkbox"
                                        data-testid="nonProduction"
                                        type="radio"
                                        checked={!data.isProduction}
                                        value="false"
                                        {...register('isProduction', { sanitizeFn: (value) => value === 'true' })}
                                    />
                                    <span className="ml-10 fw-4 mt-4">Non - Production</span>
                                </label>
                            </div>
                        </div>
                    )}
                    {AssignCategorySelect && (
                        <div className="w-250">
                            <AssignCategorySelect
                                selectedCategory={selectedCategory}
                                setSelectedCategory={handleSelectedCategory}
                            />
                        </div>
                    )}

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
                <div className="dc__border-top flexbox dc__align-items-center dc__content-space py-16 px-20 dc__bottom-0 bg__primary">
                    {id && (
                        <Button
                            text="Delete"
                            variant={ButtonVariantType.secondary}
                            style={ButtonStyleType.negative}
                            startIcon={<Trash />}
                            dataTestId="environment-delete-btn"
                            onClick={showConfirmationModal}
                        />
                    )}
                    <div className="flex right w-100 dc__gap-12">
                        <Button
                            text="Cancel"
                            variant={ButtonVariantType.secondary}
                            style={ButtonStyleType.neutral}
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
        )
    }

    return (
        <Drawer position="right" width="800px" onEscape={hideClusterDrawer} onClose={hideClusterDrawer}>
            <div className="h-100 bg__primary flexbox-col" onClick={stopPropagation}>
                <div className="flexbox dc__align-items-center dc__content-space dc__border-bottom bg__primary py-12 px-20">
                    {/* NOTE: only in case of add environment, can we have truncation */}
                    <Tooltip content={addEnvironmentHeaderText}>
                        <h3 className="m-0 fs-16 fw-6 lh-1-43 dc__truncate">
                            {id ? 'Edit Environment' : addEnvironmentHeaderText}
                        </h3>
                    </Tooltip>
                    <button
                        type="button"
                        aria-label="close-btn"
                        className="dc__transparent flex icon-dim-24"
                        onClick={hideClusterDrawer}
                    >
                        <Close className="icon-dim-24 dc__align-right cursor" />
                    </button>
                </div>

                {renderContent()}

                {showDeleteConfirmation && (
                    <EnvironmentDeleteComponent
                        environmentName={data.environmentName}
                        onDelete={onDelete}
                        closeConfirmationModal={closeConfirmationModal}
                    />
                )}
            </div>
        </Drawer>
    )
}
