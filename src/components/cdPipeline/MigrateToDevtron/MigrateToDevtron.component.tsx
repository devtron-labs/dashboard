import { useEffect, useRef } from 'react'
import {
    abortPreviousRequests,
    APIResponseHandler,
    BaseURLParams,
    DeploymentAppTypes,
    ErrorScreenNotAuthorized,
    GenericSectionErrorState,
    getIsRequestAborted,
    RadioGroup,
    RadioGroupItem,
    SelectPicker,
    useAsync,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import { ReactComponent as ICHelmChart } from '@Icons/ic-helmchart.svg'
import { ReactComponent as ICArgoCDApp } from '@Icons/ic-argocd-app.svg'
import { ClusterSelectProps, MigrateToDevtronProps, SelectMigrateAppOptionType } from './types'
import ClusterSelect from './ClusterSelect'
import { MigrateToDevtronBaseFormStateType, TriggerTypeRadioProps } from '../cdPipeline.types'
import { getMigrateAppOptions, validateMigrationSource } from './service'
import { generateMigrateAppOption, getDeploymentAppTypeLabel, sanitizeValidateMigrationSourceResponse } from './utils'
import { GENERIC_SECTION_ERROR_STATE_COMMON_PROPS } from './constants'
import MigrateToDevtronValidationFactory from './MigrateToDevtronValidationFactory'
import TriggerTypeRadio from '../TriggerTypeRadio'

const MigrateToDevtron = ({
    migrateToDevtronFormState,
    setMigrateToDevtronFormState,
    handleMigrateFromAppTypeChange,
}: MigrateToDevtronProps) => {
    const { appId } = useParams<Pick<BaseURLParams, 'appId'>>()
    const {
        isSuperAdmin,
        featureGitOpsFlags: { isFeatureArgoCdMigrationEnabled },
    } = useMainContext()
    const migrateAppOptionsControllerRef = useRef<AbortController>(new AbortController())
    const validateMigrationSourceControllerRef = useRef<AbortController>(new AbortController())

    const isMigratingFromHelm = migrateToDevtronFormState.deploymentAppType === DeploymentAppTypes.HELM
    const selectedFormState = isMigratingFromHelm
        ? migrateToDevtronFormState.migrateFromHelmFormState
        : migrateToDevtronFormState.migrateFromArgoFormState

    const { clusterId, clusterName, appName, namespace, validationResponse, appIcon } = selectedFormState
    const { isLinkable } = validationResponse || {}

    const [
        isLoadingAppListOptionsWithAbortedError,
        appListOptions,
        appListErrorWithAbortedError,
        reloadAppListOptions,
    ] = useAsync(
        () =>
            abortPreviousRequests(
                () =>
                    getMigrateAppOptions({
                        clusterId,
                        deploymentAppType: migrateToDevtronFormState.deploymentAppType,
                        abortControllerRef: migrateAppOptionsControllerRef,
                    }),
                migrateAppOptionsControllerRef,
            ),
        [clusterId, migrateToDevtronFormState.deploymentAppType],
        !!clusterId,
    )

    const handleValidateMigrationSource = async () => {
        setMigrateToDevtronFormState((prevState) => ({
            ...prevState,
            migrateFromArgoFormState: {
                ...prevState.migrateFromArgoFormState,
                ...(isMigratingFromHelm
                    ? {}
                    : { validationResponse: sanitizeValidateMigrationSourceResponse(null, DeploymentAppTypes.GITOPS) }),
            },
            migrateFromHelmFormState: {
                ...prevState.migrateFromHelmFormState,
                ...(isMigratingFromHelm
                    ? { validationResponse: sanitizeValidateMigrationSourceResponse(null, DeploymentAppTypes.HELM) }
                    : {}),
            },
        }))

        const validationResponseData = await abortPreviousRequests(
            () =>
                validateMigrationSource(
                    { migrateToDevtronFormState, appId: +appId },
                    validateMigrationSourceControllerRef,
                ),
            validateMigrationSourceControllerRef,
        )
        setMigrateToDevtronFormState((prevState) => ({
            ...prevState,
            migrateFromArgoFormState: {
                ...prevState.migrateFromArgoFormState,
                ...(isMigratingFromHelm ? {} : { validationResponse: validationResponseData }),
            },
            migrateFromHelmFormState: {
                ...prevState.migrateFromHelmFormState,
                ...(isMigratingFromHelm ? { validationResponse: validationResponseData } : {}),
            },
        }))
    }

    const [
        isLoadingValidationResponseWithAbortedError,
        ,
        validationResponseErrorWithAbortedError,
        reloadValidationResponse,
    ] = useAsync(
        handleValidateMigrationSource,
        [appName, namespace, migrateToDevtronFormState.deploymentAppType],
        !!appName && !!namespace,
    )

    const isLoadingValidationResponse =
        isLoadingValidationResponseWithAbortedError || getIsRequestAborted(validationResponseErrorWithAbortedError)
    const validationResponseError = isLoadingValidationResponse ? null : validationResponseErrorWithAbortedError

    const isLoadingAppListOptions =
        isLoadingAppListOptionsWithAbortedError || getIsRequestAborted(appListErrorWithAbortedError)
    const appListOptionsError = isLoadingAppListOptions ? null : appListErrorWithAbortedError

    useEffect(
        () => () => {
            migrateAppOptionsControllerRef.current.abort()
            validateMigrationSourceControllerRef.current.abort()
        },
        [],
    )

    const handleClusterChange: ClusterSelectProps['handleClusterChange'] = (clusterOption) => {
        if (clusterOption.value === clusterId) {
            return
        }

        const baseFormState: MigrateToDevtronBaseFormStateType = {
            appName: '',
            namespace: '',
            clusterName: clusterOption.label as string,
            clusterId: clusterOption.value,
            validationResponse: sanitizeValidateMigrationSourceResponse(
                null,
                migrateToDevtronFormState.deploymentAppType,
            ),
            appIcon: null,
        }

        setMigrateToDevtronFormState((prevState) => ({
            ...prevState,
            ...(isMigratingFromHelm
                ? {
                      migrateFromHelmFormState: {
                          ...baseFormState,
                      },
                  }
                : {
                      migrateFromArgoFormState: {
                          ...baseFormState,
                      },
                  }),
        }))
    }

    const handleAppSelection = (appOption: SelectMigrateAppOptionType) => {
        if (appOption.value.appName === appName && appOption.value.namespace === namespace) {
            return
        }

        setMigrateToDevtronFormState((prevState) => ({
            ...prevState,
            migrateFromArgoFormState: {
                ...prevState.migrateFromArgoFormState,
                ...(isMigratingFromHelm
                    ? {}
                    : {
                          appName: appOption.value.appName,
                          namespace: appOption.value.namespace,
                          appIcon: appOption.startIcon,
                      }),
            },
            migrateFromHelmFormState: {
                ...prevState.migrateFromHelmFormState,
                ...(isMigratingFromHelm
                    ? {
                          appName: appOption.value.appName,
                          namespace: appOption.value.namespace,
                          appIcon: appOption.startIcon,
                      }
                    : {}),
            },
        }))
    }

    const getAppOptionValue = (option: (typeof appListOptions)[number]): `${string}-${string}` =>
        `${option.value.appName}-${option.value.namespace}`

    const handleTriggerTypeChange: TriggerTypeRadioProps['onChange'] = (event) => {
        const triggerType = (event.target as HTMLInputElement)
            .value as (typeof migrateToDevtronFormState)['triggerType']

        setMigrateToDevtronFormState((prevState) => ({
            ...prevState,
            triggerType,
        }))
    }

    if (!isSuperAdmin) {
        return <ErrorScreenNotAuthorized />
    }

    return (
        <div className="flexbox-col dc__gap-16">
            {isFeatureArgoCdMigrationEnabled && (
                <div className="flexbox-col dc__gap-8">
                    <span className="cn-7 fs-13 fw-4 lh-20">Select type of application to migrate</span>

                    <RadioGroup
                        className="radio-group-no-border migrate-to-devtron__deployment-app-type-radio-group"
                        value={migrateToDevtronFormState.deploymentAppType}
                        name="migrate-from-app-type"
                        onChange={handleMigrateFromAppTypeChange}
                    >
                        <RadioGroupItem
                            dataTestId={`${DeploymentAppTypes.HELM}-radio-item`}
                            value={DeploymentAppTypes.HELM}
                        >
                            <span className="cn-9 fs-13 fw-4 lh-20 dc__underline-dotted">Helm Release</span>
                        </RadioGroupItem>

                        <RadioGroupItem
                            dataTestId={`${DeploymentAppTypes.GITOPS}-radio-item`}
                            value={DeploymentAppTypes.GITOPS}
                        >
                            <span className="cn-9 fs-13 fw-4 lh-20 dc__underline-dotted">Argo CD Application</span>
                        </RadioGroupItem>
                    </RadioGroup>
                </div>
            )}

            <div className="flexbox dc__gap-8 dc__align-end">
                <ClusterSelect
                    clusterId={clusterId}
                    clusterName={clusterName}
                    handleClusterChange={handleClusterChange}
                    deploymentAppType={migrateToDevtronFormState.deploymentAppType}
                />

                <span className="cn-7 fs-20 fw-4 lh-36">/</span>

                <div className="flex-grow-1">
                    <SelectPicker<(typeof appListOptions)[number]['value'], false>
                        inputId="migrate-from-source-app-select"
                        classNamePrefix="migrate-from-source-app-select"
                        label={isMigratingFromHelm ? 'Release name' : 'Argo CD application'}
                        placeholder={isMigratingFromHelm ? 'Select a helm release' : 'Select an Argo CD application'}
                        disabledTippyContent={`Select a cluster to view and select ${getDeploymentAppTypeLabel(isMigratingFromHelm)} in that cluster`}
                        icon={isMigratingFromHelm ? <ICHelmChart /> : <ICArgoCDApp />}
                        isDisabled={!clusterId}
                        isLoading={isLoadingAppListOptions}
                        optionListError={appListOptionsError}
                        reloadOptionList={reloadAppListOptions}
                        options={appListOptions || []}
                        onChange={handleAppSelection}
                        required
                        value={
                            appName
                                ? generateMigrateAppOption({
                                      appName,
                                      namespace,
                                      startIcon: appIcon,
                                  })
                                : null
                        }
                        getOptionValue={getAppOptionValue}
                    />
                </div>
            </div>

            {!!appName && (
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
                                title={isMigratingFromHelm ? 'Fetching helm release' : 'Checking compatibility'}
                                subTitle={
                                    isMigratingFromHelm
                                        ? `Please ensure the chart used in the helm release is same as the one used in '${appName}' application`
                                        : 'Checking if Argo CD application and its configurations are compatible for migration to deployment pipeline'
                                }
                                {...GENERIC_SECTION_ERROR_STATE_COMMON_PROPS}
                            />
                        }
                        genericSectionErrorProps={{
                            title: 'Error checking compatibility',
                            subTitle: `An error occurred while checking if ${getDeploymentAppTypeLabel(isMigratingFromHelm)} and its configurations are compatible for migration to deployment pipeline`,
                            reload: reloadValidationResponse,
                            ...GENERIC_SECTION_ERROR_STATE_COMMON_PROPS,
                        }}
                    >
                        <div className="w-100 flex column center">
                            <MigrateToDevtronValidationFactory
                                appName={appName}
                                refetchValidationResponse={reloadValidationResponse}
                                validationResponse={validationResponse}
                            />
                        </div>
                    </APIResponseHandler>

                    {isLinkable && (
                        <div className="w-100">
                            <TriggerTypeRadio
                                value={migrateToDevtronFormState.triggerType}
                                onChange={handleTriggerTypeChange}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default MigrateToDevtron
