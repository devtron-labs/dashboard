import {
    APIResponseHandler,
    GenericSectionErrorState,
    ResourceKindType,
    SelectPicker,
    SelectPickerOptionType,
    stringComparatorBySortOrder,
    useAsync,
    useGetResourceKindsOptions,
} from '@devtron-labs/devtron-fe-common-lib'
import { SyntheticEvent } from 'react'
import { getArgoInstalledExternalApps } from '@Components/app/list-new/AppListService'
import MigrateToDevtronValidationFactory from './MigrateToDevtronValidationFactory'
import { MigrateFromArgoProps } from './types'
import { MigrateFromArgoFormState } from '../cdPipeline.types'
import { validateMigrationSource } from './service'
import TriggerTypeRadio from '../TriggerTypeRadio'

const RESOURCES_TO_FETCH: ResourceKindType.cluster[] = [ResourceKindType.cluster]

const MigrateFromArgo = ({ migrateToDevtronFormState, setMigrateToDevtronFormState }: MigrateFromArgoProps) => {
    const { isResourcesOptionsLoading, refetchResourcesOptions, resourcesOptionsError, resourcesOptionsMap } =
        useGetResourceKindsOptions({
            resourcesToFetch: RESOURCES_TO_FETCH,
        })

    const [isLoadingArgoAppListResponse, argoAppListResponse, argoAppListResponseError, reloadArgoAppListResponse] =
        useAsync(
            () => getArgoInstalledExternalApps(String(migrateToDevtronFormState.migrateFromArgoFormState.clusterId)),
            [],
            !!migrateToDevtronFormState.migrateFromArgoFormState.clusterId,
        )

    const handleSyncMigrateFromArgoFormStateWithValidationResponse = async () => {
        const validationResponse = await validateMigrationSource(migrateToDevtronFormState)
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
        [],
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
        setMigrateToDevtronFormState((prevState) => ({
            ...prevState,
            migrateFromArgoFormState: {
                ...prevState.migrateFromArgoFormState,
                appName: '',
                namespace: '',
                clusterId: clusterOption.value,
            },
        }))
    }

    const handleArgoAppChange = (
        argoAppOption: SelectPickerOptionType<Pick<MigrateFromArgoFormState, 'appName' | 'namespace'>>,
    ) => {
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
                <SelectPicker
                    inputId="migrate-from-source-cluster-select"
                    classNamePrefix="migrate-from-source-cluster-select"
                    label="Cluster containing Argo CD application"
                    isLoading={isResourcesOptionsLoading}
                    optionListError={resourcesOptionsError}
                    reloadOptionList={refetchResourcesOptions}
                    options={clusterOptions}
                    onChange={handleClusterChange}
                    required
                    placeholder="Select a cluster"
                />

                <span className="cn-7 fs-20 fw-4 lh-36">/</span>

                <SelectPicker
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
                    placeholder="Select an Argo CD application"
                />
            </div>

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
                    />
                }
                genericSectionErrorProps={{
                    title: 'Error checking compatibility',
                    subTitle:
                        'An error occurred while checking if Argo CD application and its configurations are compatible for migration to deployment pipeline',
                    reload: reloadValidationResponse,
                }}
            >
                <MigrateToDevtronValidationFactory
                    appName={migrateToDevtronFormState.migrateFromArgoFormState.appName}
                    refetchValidationResponse={reloadValidationResponse}
                    validationResponse={migrateToDevtronFormState.migrateFromArgoFormState.validationResponse}
                />
            </APIResponseHandler>

            {migrateToDevtronFormState.migrateFromArgoFormState.validationResponse.isLinkable && (
                <TriggerTypeRadio value={migrateToDevtronFormState.triggerType} onChange={handleTriggerTypeChange} />
            )}
        </>
    )
}

export default MigrateFromArgo
