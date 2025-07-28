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

import { useEffect, useMemo, useState } from 'react'

import {
    API_STATUS_CODES,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    CustomInput,
    Drawer,
    getSelectPickerOptionByValue,
    Icon,
    ModalSidebarPanel,
    noop,
    SelectPicker,
    SelectPickerOptionType,
    ServerErrors,
    showError,
    stopPropagation,
    TagType,
    ToastManager,
    ToastVariantType,
    useAsync,
    useForm,
    UseFormSubmitHandler,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Trash } from '@Icons/ic-delete-interactive.svg'
import { importComponentFromFELibrary } from '@Components/common'
import { getClusterListing } from '@Components/ResourceBrowser/ResourceBrowser.service'
import { getNamespaceFromLocalStorage } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/cluster.util'
import { ADD_ENVIRONMENT_FORM_LOCAL_STORAGE_KEY } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/constants'

import {
    deleteEnvironment,
    getClusterList as getClusterDetails,
    saveEnvironment,
    updateEnvironment,
} from '../cluster.service'
import { EnvironmentDeleteComponent } from '../EnvironmentDeleteComponent'
import { clusterEnvironmentDrawerFormValidationSchema } from './schema'
import { ClusterNamespacesDTO, EnvDrawerProps, EnvironmentFormType } from './types'
import { getClusterEnvironmentUpdatePayload, getClusterNamespaceByName, getNamespaceLabels } from './utils'

const virtualClusterSaveUpdateApi = importComponentFromFELibrary('virtualClusterSaveUpdateApi', null, 'function')
const getClusterNamespaces = importComponentFromFELibrary('getClusterNamespaces', noop, 'function')
const EnvironmentLabels = importComponentFromFELibrary('EnvironmentLabels', null, 'function')
const AssignCategorySelect = importComponentFromFELibrary('AssignCategorySelect', null, 'function')

const getVirtualClusterSaveUpdate = (_id) => virtualClusterSaveUpdateApi?.(_id)

const INITIAL_NAMESPACES = {
    isFetching: false,
    data: null,
    error: null,
}

const INITIAL_NAMESPACE_LABELS = {
    labels: null,
    resourceVersion: null,
}

export const ClusterEnvironmentDrawer = ({
    envId,
    envName,
    namespace,
    clusterId,
    clusterName,
    isProduction,
    description,
    reload,
    hideClusterDrawer,
    isVirtualCluster,
    category,
}: EnvDrawerProps) => {
    // STATES
    // Manages the loading state for create and update actions
    const [crudLoading, setCrudLoading] = useState(false)
    // Controls the visibility of the delete confirmation dialog
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    // Stores namespace labels and resourceVersion fetched from the cluster
    const [namespaceLabels, setNamespaceLabels] = useState<{ labels: TagType[]; resourceVersion: string }>(
        INITIAL_NAMESPACE_LABELS,
    )
    // Stores the response from the clusterNamespaces API, including fetching state, data, and any error messages
    const [clusterNamespaces, setClusterNamespaces] = useState<{
        isFetching: boolean
        data: ClusterNamespacesDTO[]
        error: ServerErrors
    }>(INITIAL_NAMESPACES)

    // Need different state since validations change on basis of this state
    const [isSelectedClusterVirtual, setIsSelectedClusterVirtual] = useState(isVirtualCluster ?? false)

    const [clusterListLoading, clusterListResult, clusterListError, reloadClusterList] = useAsync(
        () => getClusterListing(true),
        [],
        !envId, // No need of cluster list in case of edit env
    )

    // FORM METHODS
    const { data, errors, register, handleSubmit, trigger, reset } = useForm<EnvironmentFormType>({
        initialValues: {
            clusterId: clusterId ?? null,
            envName: envName ?? '',
            namespace: envId ? namespace : getNamespaceFromLocalStorage(''),
            isProduction: !!isProduction,
            category: category ?? null,
            description: description ?? '',
        },
        validations: clusterEnvironmentDrawerFormValidationSchema({ isNamespaceMandatory: !isSelectedClusterVirtual }),
    })

    const [, clusterDetails] = useAsync(
        () => getClusterDetails([data.clusterId]),
        [data.clusterId],
        !envId && !!data.clusterId,
    )

    useEffect(() => {
        if (clusterDetails) {
            setIsSelectedClusterVirtual(clusterDetails[0].isVirtualCluster)
            setClusterNamespaces(INITIAL_NAMESPACES)
            setNamespaceLabels(INITIAL_NAMESPACE_LABELS)
            reset(data, { keepErrors: false })
        }
    }, [clusterDetails])

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
            const { result } = await getClusterNamespaces(data.clusterId)

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

    useEffect(
        () => () => {
            if (localStorage.getItem(ADD_ENVIRONMENT_FORM_LOCAL_STORAGE_KEY)) {
                localStorage.removeItem(ADD_ENVIRONMENT_FORM_LOCAL_STORAGE_KEY)
            }
        },
        [],
    )

    const onValidation =
        (clusterNamespacesData = clusterNamespaces.data): UseFormSubmitHandler<EnvironmentFormType> =>
        async (formData) => {
            const payload = getClusterEnvironmentUpdatePayload({
                data: formData,
                envId,
                namespaceLabels: namespaceLabels.labels,
                resourceVersion: namespaceLabels.resourceVersion,
                isVirtualCluster: isSelectedClusterVirtual,
            })

            let api
            if (isSelectedClusterVirtual) {
                api = getVirtualClusterSaveUpdate(envId)
            } else {
                api = envId ? updateEnvironment : saveEnvironment
            }

            try {
                setCrudLoading(true)
                await api(payload, envId)
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: `Successfully ${envId ? 'updated' : 'saved'}`,
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

    const withLabelEditValidation: UseFormSubmitHandler<EnvironmentFormType> = async () => {
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
            isVirtualCluster: isSelectedClusterVirtual,
            envId,
        })
        await deleteEnvironment(payload)
        redirectToListAfterReload()
    }

    const clusterOptions = useMemo(
        () =>
            envId
                ? [{ label: clusterName, value: clusterId }]
                : (clusterListResult ?? []).map((cluster) => ({
                      label: cluster.name,
                      value: cluster.id,
                  })),
        [clusterListResult],
    )

    const renderContent = () => (
        <>
            <div className="flexbox flex-grow-1 mh-0">
                <ModalSidebarPanel
                    heading="Environment"
                    icon={<Icon name="ic-bg-environment" size={40} color={null} />}
                    documentationLink="GLOBAL_CONFIG_CLUSTER"
                    rootClassName="dc__no-background-imp p-20"
                >
                    <div className="flexbox-col dc__gap-20">
                        <span>An environment represents a specific namespace within a cluster.</span>
                        <span>
                            You can deploy your applications to one or more environments (e.g., development, testing,
                            production).
                        </span>
                    </div>
                </ModalSidebarPanel>
                <div className="flexbox p-20 bg__secondary flex-grow-1 dc__overflow-auto">
                    <div className="flexbox-col dc__gap-16 bg__primary br-12 p-20 flex-grow-1 dc__h-fit-content">
                        <div className="flexbox dc__gap-8">
                            <div className="w-250 dc__no-shrink">
                                <SelectPicker
                                    inputId="create-env-select-cluster"
                                    label="Cluster"
                                    required
                                    options={clusterOptions}
                                    value={getSelectPickerOptionByValue(clusterOptions, data.clusterId, null)}
                                    icon={<Icon name="ic-bg-cluster" color={null} />}
                                    placeholder="Select cluster"
                                    isLoading={clusterListLoading}
                                    optionListError={clusterListError}
                                    reloadOptionList={reloadClusterList}
                                    isDisabled={!!envId} // Disable if env id exist
                                    onChange={
                                        register('clusterId', {
                                            isCustomComponent: true,
                                            sanitizeFn: (option: SelectPickerOptionType) => option.value,
                                        }).onChange
                                    }
                                    error={errors.clusterId}
                                    size={ComponentSizeType.large}
                                    fullWidth
                                />
                            </div>
                            <span className="lh-36 fs-20 fw-4 cn-7 pt-26">/</span>
                            <CustomInput
                                disabled={!!envId}
                                placeholder={envId ? 'sample-env-name' : 'Eg. production'}
                                value={data.envName}
                                error={errors.envName}
                                {...register('envName')}
                                label="Environment Name"
                                autoFocus={!envId}
                                shouldTrim={false}
                                required
                                fullWidth
                            />
                        </div>

                        <CustomInput
                            disabled={!!envId}
                            placeholder={envId ? 'sample-namespace' : 'Eg. prod'}
                            value={data.namespace}
                            error={errors.namespace}
                            {...register('namespace')}
                            label="Namespace"
                            shouldTrim={false}
                            required={!isSelectedClusterVirtual}
                        />

                        <CustomInput
                            placeholder="Add a description for this environment"
                            value={data.description}
                            error={errors.description}
                            {...register('description')}
                            label="Description (Maximum 40 characters allowed)"
                            autoFocus={!!envId}
                            shouldTrim={false}
                        />
                        <div className="flex left dc__gap-24 fs-13">
                            <div className="dc__required-field cn-7">Type of Environment</div>
                            <div className="flex left dc__gap-16">
                                <label htmlFor="env-production-checkbox" className="flex cursor mb-0">
                                    <input
                                        id="env-production-checkbox"
                                        data-testid="production"
                                        type="radio"
                                        checked={data.isProduction}
                                        value="true"
                                        {...register('isProduction', {
                                            sanitizeFn: (value) => value === 'true',
                                            noTrim: true,
                                        })}
                                    />
                                    <span className="ml-10 fw-4 mt-4">Production</span>
                                </label>
                                <label htmlFor="env-non-production-checkbox" className="flex cursor mb-0">
                                    <input
                                        id="env-non-production-checkbox"
                                        data-testid="nonProduction"
                                        type="radio"
                                        checked={!data.isProduction}
                                        value="false"
                                        {...register('isProduction', {
                                            sanitizeFn: (value) => value === 'true',
                                            noTrim: true,
                                        })}
                                    />
                                    <span className="ml-10 fw-4 mt-4">Non - Production</span>
                                </label>
                            </div>
                        </div>
                        {AssignCategorySelect && (
                            <div className="w-250">
                                <AssignCategorySelect
                                    selectedCategory={data.category}
                                    setSelectedCategory={register('category', { isCustomComponent: true }).onChange}
                                />
                            </div>
                        )}

                        {EnvironmentLabels && !isSelectedClusterVirtual && (
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
                </div>
            </div>
            <div className="dc__border-top flexbox dc__align-items-center dc__content-space py-16 px-20 bg__primary">
                {envId && (
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
                        text={envId ? 'Update' : 'Save'}
                        dataTestId="save-and-update-environment"
                        isLoading={crudLoading}
                        disabled={crudLoading || clusterNamespaces.isFetching}
                        buttonProps={{
                            type: 'submit',
                        }}
                    />
                </div>
            </div>
        </>
    )

    return (
        <Drawer position="right" width="1024px" onEscape={hideClusterDrawer} onClose={hideClusterDrawer}>
            <form
                className="h-100 bg__primary flexbox-col"
                onClick={stopPropagation}
                onSubmit={handleSubmit(namespaceLabels.labels ? withLabelEditValidation : onValidation())}
                noValidate
            >
                <div className="flexbox dc__align-items-center dc__content-space dc__border-bottom bg__primary py-12 px-20">
                    <h3 className="m-0 fs-16 fw-6 lh-1-43 cn-9 dc__truncate">{envId ? 'Edit' : 'Add'} Environment</h3>
                    <Button
                        dataTestId="close-env-modal"
                        ariaLabel="close-btn"
                        icon={<Icon name="ic-close-large" color={null} />}
                        onClick={hideClusterDrawer}
                        showAriaLabelInTippy={false}
                        size={ComponentSizeType.xs}
                        style={ButtonStyleType.negativeGrey}
                        variant={ButtonVariantType.borderLess}
                    />
                </div>

                {renderContent()}

                {showDeleteConfirmation && (
                    <EnvironmentDeleteComponent
                        environmentName={data.envName}
                        onDelete={onDelete}
                        closeConfirmationModal={closeConfirmationModal}
                    />
                )}
            </form>
        </Drawer>
    )
}
