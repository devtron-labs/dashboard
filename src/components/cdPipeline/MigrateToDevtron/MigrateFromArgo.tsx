import { SyntheticEvent } from 'react'
import {
    APIResponseHandler,
    BaseURLParams,
    GenericSectionErrorState,
    ResourceKindType,
    SelectPicker,
    SelectPickerOptionType,
    stringComparatorBySortOrder,
    useAsync,
    useGetResourceKindsOptions,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'

import { getArgoInstalledExternalApps } from '@Components/app/list-new/AppListService'
import TriggerTypeRadio from '../TriggerTypeRadio'
import MigrateToDevtronValidationFactory from './MigrateToDevtronValidationFactory'
import { MigrateFromArgoProps } from './types'
import { MigrateFromArgoFormState } from '../cdPipeline.types'
import { validateMigrationSource } from './service'

const RESOURCES_TO_FETCH: ResourceKindType.cluster[] = [ResourceKindType.cluster]

const MigrateFromArgo = ({ migrateToDevtronFormState, setMigrateToDevtronFormState }: MigrateFromArgoProps) => {
    const { appId } = useParams<Pick<BaseURLParams, 'appId'>>()

    const { isResourcesOptionsLoading, refetchResourcesOptions, resourcesOptionsError, resourcesOptionsMap } =
        useGetResourceKindsOptions({
            resourcesToFetch: RESOURCES_TO_FETCH,
        })

    const [isLoadingArgoAppListResponse, argoAppListResponse, argoAppListResponseError, reloadArgoAppListResponse] =
        useAsync(
            () => getArgoInstalledExternalApps(String(migrateToDevtronFormState.migrateFromArgoFormState.clusterId)),
            [migrateToDevtronFormState.migrateFromArgoFormState.clusterId],
            !!migrateToDevtronFormState.migrateFromArgoFormState.clusterId,
        )

    const handleSyncMigrateFromArgoFormStateWithValidationResponse = async () => {
        setMigrateToDevtronFormState((prevState) => ({
            ...prevState,
            migrateFromArgoFormState: {
                ...prevState.migrateFromArgoFormState,
                validationResponse: {
                    isLinkable: false,
                    errorDetail: {
                        validationFailedReason: null,
                        validationFailedMessage: '',
                    },
                    applicationMetadata: {
                        source: {
                            repoURL: '',
                            chartPath: '',
                            chartMetadata: {
                                requiredChartVersion: '',
                                savedChartName: '',
                                valuesFileName: '',
                                requiredChartName: '',
                            },
                        },
                        destination: {
                            clusterName: '',
                            clusterServerUrl: '',
                            namespace: '',
                            environmentName: '',
                            environmentId: 0,
                        },
                        status: null,
                    },
                },
            },
        }))

        const validationResponse = await validateMigrationSource(migrateToDevtronFormState, +appId)
        setMigrateToDevtronFormState((prevState) => ({
            ...prevState,
            migrateFromArgoFormState: {
                ...prevState.migrateFromArgoFormState,
                validationResponse,
            },
        }))
    }

    const [isLoadingValidationResponse, , validationResponseError, reloadValidationResponse] = useAsync(
        handleSyncMigrateFromArgoFormStateWithValidationResponse,
        [
            migrateToDevtronFormState.migrateFromArgoFormState.appName,
            migrateToDevtronFormState.migrateFromArgoFormState.namespace,
        ],
        !!migrateToDevtronFormState.migrateFromArgoFormState.appName &&
            !!migrateToDevtronFormState.migrateFromArgoFormState.namespace,
    )

    const clusterOptions = (resourcesOptionsMap?.[ResourceKindType.cluster] || [])
        .filter((cluster) => !cluster.isVirtual)
        .map<SelectPickerOptionType<number>>((cluster) => ({
            label: cluster.name,
            value: cluster.id,
        }))
        .sort((a, b) => stringComparatorBySortOrder(a.label as string, b.label as string))

    const argoAppListOptions = (argoAppListResponse?.result || [])
        .map<SelectPickerOptionType<Pick<MigrateFromArgoFormState, 'appName' | 'namespace'>>>((argoApp) => ({
            label: argoApp.appName || '',
            value: {
                appName: argoApp.appName || '',
                namespace: argoApp.namespace || '',
            },
            description: `Namespace: ${argoApp.namespace || '--'}`,
        }))
        .sort((a, b) => stringComparatorBySortOrder(a.label as string, b.label as string))

    const handleClusterChange = (clusterOption: SelectPickerOptionType<number>) => {
        if (clusterOption.value === migrateToDevtronFormState.migrateFromArgoFormState.clusterId) {
            return
        }

        setMigrateToDevtronFormState((prevState) => ({
            ...prevState,
            migrateFromArgoFormState: {
                ...prevState.migrateFromArgoFormState,
                appName: '',
                namespace: '',
                clusterName: clusterOption.label as string,
                clusterId: clusterOption.value,
            },
        }))
    }

    const handleArgoAppChange = (
        argoAppOption: SelectPickerOptionType<Pick<MigrateFromArgoFormState, 'appName' | 'namespace'>>,
    ) => {
        if (
            argoAppOption.value.appName === migrateToDevtronFormState.migrateFromArgoFormState.appName &&
            argoAppOption.value.namespace === migrateToDevtronFormState.migrateFromArgoFormState.namespace
        ) {
            return
        }

        setMigrateToDevtronFormState((prevState) => ({
            ...prevState,
            migrateFromArgoFormState: {
                ...prevState.migrateFromArgoFormState,
                appName: argoAppOption.value.appName,
                namespace: argoAppOption.value.namespace,
            },
        }))
    }

    const handleTriggerTypeChange = (event: SyntheticEvent) => {
        const triggerType = (event.target as HTMLInputElement)
            .value as (typeof migrateToDevtronFormState)['triggerType']
        setMigrateToDevtronFormState((prevState) => ({
            ...prevState,
            triggerType,
        }))
    }

    return (
        <>
            <div className="flexbox dc__gap-8 dc__align-end">
                <div className="w-250">
                    <SelectPicker<(typeof clusterOptions)[number]['value'], false>
                        inputId="migrate-from-source-cluster-select"
                        classNamePrefix="migrate-from-source-cluster-select"
                        label="Cluster containing Argo CD application"
                        isLoading={isResourcesOptionsLoading}
                        optionListError={resourcesOptionsError}
                        reloadOptionList={refetchResourcesOptions}
                        options={clusterOptions}
                        onChange={handleClusterChange}
                        value={
                            migrateToDevtronFormState.migrateFromArgoFormState.clusterId
                                ? {
                                      label: migrateToDevtronFormState.migrateFromArgoFormState.clusterName,
                                      value: migrateToDevtronFormState.migrateFromArgoFormState.clusterId,
                                  }
                                : null
                        }
                        required
                        placeholder="Select a cluster"
                        autoFocus
                    />
                </div>

                <span className="cn-7 fs-20 fw-4 lh-36">/</span>

                <div className="flex-grow-1">
                    <SelectPicker<(typeof argoAppListOptions)[number]['value'], false>
                        inputId="migrate-from-source-argo-app-select"
                        classNamePrefix="migrate-from-source-argo-app-select"
                        label="Argo CD application"
                        isLoading={isLoadingArgoAppListResponse}
                        optionListError={argoAppListResponseError}
                        reloadOptionList={reloadArgoAppListResponse}
                        options={argoAppListOptions}
                        onChange={handleArgoAppChange}
                        disabledTippyContent="Select a cluster to view and select Argo CD applications in that cluster"
                        isDisabled={!migrateToDevtronFormState.migrateFromArgoFormState.clusterId}
                        required
                        value={
                            migrateToDevtronFormState.migrateFromArgoFormState.appName
                                ? {
                                      label: migrateToDevtronFormState.migrateFromArgoFormState.appName || '',
                                      value: {
                                          appName: migrateToDevtronFormState.migrateFromArgoFormState.appName || '',
                                          namespace: migrateToDevtronFormState.migrateFromArgoFormState.namespace || '',
                                      },
                                      description: `Namespace: ${migrateToDevtronFormState.migrateFromArgoFormState.namespace || '--'}`,
                                  }
                                : null
                        }
                        placeholder="Select an Argo CD application"
                    />
                </div>
            </div>

            {migrateToDevtronFormState.migrateFromArgoFormState.appName && (
                <div className="flex column w-100 dc__gap-16">
                    <APIResponseHandler
                        isLoading={isLoadingValidationResponse}
                        error={validationResponseError}
                        customLoader={
                            <GenericSectionErrorState
                                progressingProps={{
                                    size: 24,
                                    fillColor: 'var(--N700)',
                                }}
                                title="Checking compatibility"
                                subTitle="Checking if Argo CD application and its configurations are compatible for migration to deployment pipeline"
                                rootClassName="dc__mxw-400"
                                description=""
                            />
                        }
                        genericSectionErrorProps={{
                            title: 'Error checking compatibility',
                            subTitle:
                                'An error occurred while checking if Argo CD application and its configurations are compatible for migration to deployment pipeline',
                            reload: reloadValidationResponse,
                            rootClassName: 'dc__mxw-400',
                            description: '',
                        }}
                    >
                        <div className="w-100">
                            <MigrateToDevtronValidationFactory
                                appName={migrateToDevtronFormState.migrateFromArgoFormState.appName}
                                refetchValidationResponse={reloadValidationResponse}
                                validationResponse={
                                    migrateToDevtronFormState.migrateFromArgoFormState.validationResponse
                                }
                            />
                        </div>
                    </APIResponseHandler>

                    {migrateToDevtronFormState.migrateFromArgoFormState.validationResponse.isLinkable && (
                        <div className="w-100">
                            <TriggerTypeRadio
                                value={migrateToDevtronFormState.triggerType}
                                onChange={handleTriggerTypeChange}
                            />
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

export default MigrateFromArgo
