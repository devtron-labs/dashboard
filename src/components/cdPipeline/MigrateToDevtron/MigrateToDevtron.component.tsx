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

import { SyntheticEvent, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'

import {
    abortPreviousRequests,
    APIResponseHandler,
    BaseURLParams,
    ComponentSizeType,
    DeploymentAppTypes,
    ErrorScreenNotAuthorized,
    GenericSectionErrorState,
    getIsRequestAborted,
    RadioGroup,
    RadioGroupItem,
    SelectPicker,
    Tooltip,
    useAsync,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import {
    MigrateToDevtronBaseFormStateType,
    MigrateToDevtronFormState,
    TriggerTypeRadioProps,
} from '../cdPipeline.types'
import TriggerTypeRadio from '../TriggerTypeRadio'
import ClusterSelect from './ClusterSelect'
import {
    DEPLOYMENT_APP_TYPE_LABEL,
    GENERIC_SECTION_ERROR_STATE_COMMON_PROPS,
    MIGRATE_FROM_CLUSTER_APP_SELECT_CONFIG,
    MIGRATE_FROM_RADIO_GROUP_CONFIG,
    SELECTED_FORM_STATE_KEY,
} from './constants'
import MigrateToDevtronValidationFactory from './MigrateToDevtronValidationFactory'
import { getMigrateAppOptions, validateMigrationSource } from './service'
import { ClusterSelectProps, MigrateToDevtronProps, SelectMigrateAppOptionType } from './types'
import { generateMigrateAppOption, sanitizeValidateMigrationSourceResponse } from './utils'

const SelectMigrateFromRadio = ({ deploymentAppType }: Pick<MigrateToDevtronFormState, 'deploymentAppType'>) => {
    const { title, tooltipContent } = MIGRATE_FROM_RADIO_GROUP_CONFIG[deploymentAppType]

    return (
        <RadioGroupItem dataTestId={`${deploymentAppType}-radio-item`} value={deploymentAppType}>
            <Tooltip
                alwaysShowTippyOnHover
                content={
                    <div className="flexbox-col dc__gap-2">
                        <h6 className="m-0 fs-12 fw-6 lh-18">{tooltipContent.title}</h6>

                        <p className="m-0 fs-12 fw-4 lh-18">{tooltipContent.subtitle}</p>
                    </div>
                }
            >
                <span className="cn-9 fs-13 fw-4 lh-20 dc__underline-dotted">{title}</span>
            </Tooltip>
        </RadioGroupItem>
    )
}

const MigrateToDevtron = ({ migrateToDevtronFormState, setMigrateToDevtronFormState }: MigrateToDevtronProps) => {
    const { appId } = useParams<Pick<BaseURLParams, 'appId'>>()
    const {
        isSuperAdmin,
        featureGitOpsFlags: { isFeatureArgoCdMigrationEnabled },
    } = useMainContext()
    const isFeatureFluxCdMigrationEnabled = window._env_.FEATURE_LINK_EXTERNAL_FLUX_ENABLE
    const migrateAppOptionsControllerRef = useRef<AbortController>(new AbortController())
    const validateMigrationSourceControllerRef = useRef<AbortController>(new AbortController())

    const { deploymentAppType } = migrateToDevtronFormState

    const isMigratingFromHelm = deploymentAppType === DeploymentAppTypes.HELM
    const isMigratingFromArgo = deploymentAppType === DeploymentAppTypes.ARGO
    const isMigratingFromFlux = deploymentAppType === DeploymentAppTypes.FLUX

    const selectedFormState = migrateToDevtronFormState[SELECTED_FORM_STATE_KEY[deploymentAppType]]

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
                        deploymentAppType,
                        abortControllerRef: migrateAppOptionsControllerRef,
                    }),
                migrateAppOptionsControllerRef,
            ),
        [clusterId, deploymentAppType],
        !!clusterId,
    )

    const handleValidateMigrationSource = async () => {
        setMigrateToDevtronFormState((prevState) => ({
            ...prevState,
            migrateFromArgoFormState: {
                ...prevState.migrateFromArgoFormState,
                ...(isMigratingFromArgo
                    ? { validationResponse: sanitizeValidateMigrationSourceResponse(null, DeploymentAppTypes.ARGO) }
                    : {}),
            },
            migrateFromHelmFormState: {
                ...prevState.migrateFromHelmFormState,
                ...(isMigratingFromHelm
                    ? { validationResponse: sanitizeValidateMigrationSourceResponse(null, DeploymentAppTypes.HELM) }
                    : {}),
            },
            migrateFromFluxFormState: {
                ...prevState.migrateFromFluxFormState,
                ...(isMigratingFromFlux
                    ? { validationResponse: sanitizeValidateMigrationSourceResponse(null, DeploymentAppTypes.FLUX) }
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
                ...(isMigratingFromArgo ? { validationResponse: validationResponseData } : {}),
            },
            migrateFromHelmFormState: {
                ...prevState.migrateFromHelmFormState,
                ...(isMigratingFromHelm ? { validationResponse: validationResponseData } : {}),
            },
            migrateFromFluxFormState: {
                ...prevState.migrateFromFluxFormState,
                ...(isMigratingFromFlux ? { validationResponse: validationResponseData } : {}),
            },
        }))
    }

    const [
        isLoadingValidationResponseWithAbortedError,
        ,
        validationResponseErrorWithAbortedError,
        reloadValidationResponse,
    ] = useAsync(handleValidateMigrationSource, [appName, namespace, deploymentAppType], !!appName && !!namespace)

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
            validationResponse: sanitizeValidateMigrationSourceResponse(null, deploymentAppType),
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
                : {}),
            ...(isMigratingFromArgo
                ? {
                      migrateFromArgoFormState: {
                          ...baseFormState,
                      },
                  }
                : {}),
            ...(isMigratingFromFlux
                ? {
                      migrateFromFluxFormState: {
                          ...baseFormState,
                      },
                  }
                : {}),
        }))
    }

    const handleAppSelection = (appOption: SelectMigrateAppOptionType) => {
        if (appOption.value.appName === appName && appOption.value.namespace === namespace) {
            return
        }

        const appInfo = {
            appName: appOption.value.appName,
            namespace: appOption.value.namespace,
            appIcon: appOption.startIcon,
        }

        setMigrateToDevtronFormState((prevState) => ({
            ...prevState,
            migrateFromArgoFormState: {
                ...prevState.migrateFromArgoFormState,
                ...(isMigratingFromArgo ? appInfo : {}),
            },
            migrateFromHelmFormState: {
                ...prevState.migrateFromHelmFormState,
                ...(isMigratingFromHelm ? appInfo : {}),
            },
            migrateFromFluxFormState: {
                ...prevState.migrateFromFluxFormState,
                ...(isMigratingFromFlux ? appInfo : {}),
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

    const handleMigrateFromAppTypeChange = (event: SyntheticEvent) => {
        const { value } = event.target as HTMLInputElement
        setMigrateToDevtronFormState((prevState) => ({
            ...prevState,
            deploymentAppType: value as MigrateToDevtronFormState['deploymentAppType'],
        }))
    }

    if (!isSuperAdmin) {
        return <ErrorScreenNotAuthorized />
    }

    const { clusterSelectLabel, appSelectLabel, appSelectPlaceholder, icon } =
        MIGRATE_FROM_CLUSTER_APP_SELECT_CONFIG[deploymentAppType]

    return (
        <div className="flexbox-col dc__gap-20">
            {(isFeatureArgoCdMigrationEnabled || isFeatureFluxCdMigrationEnabled) && (
                <div className="flexbox-col dc__gap-8">
                    <span className="cn-7 fs-13 fw-4 lh-20">Select type of application to migrate</span>

                    <RadioGroup
                        className="radio-group-no-border migrate-to-devtron__deployment-app-type-radio-group"
                        value={deploymentAppType}
                        name="migrate-from-app-type"
                        onChange={handleMigrateFromAppTypeChange}
                    >
                        <SelectMigrateFromRadio deploymentAppType={DeploymentAppTypes.HELM} />
                        {isFeatureArgoCdMigrationEnabled && (
                            <SelectMigrateFromRadio deploymentAppType={DeploymentAppTypes.ARGO} />
                        )}
                        {isFeatureFluxCdMigrationEnabled && (
                            <SelectMigrateFromRadio deploymentAppType={DeploymentAppTypes.FLUX} />
                        )}
                    </RadioGroup>
                </div>
            )}

            <div className="flexbox dc__gap-8 dc__align-end">
                <ClusterSelect
                    clusterId={clusterId}
                    clusterName={clusterName}
                    handleClusterChange={handleClusterChange}
                    label={clusterSelectLabel}
                />

                <span className="cn-7 fs-20 fw-4 lh-36">/</span>

                <div className="flex-grow-1">
                    <SelectPicker<(typeof appListOptions)[number]['value'], false>
                        inputId="migrate-from-source-app-select"
                        classNamePrefix="migrate-from-source-app-select"
                        label={appSelectLabel}
                        placeholder={appSelectPlaceholder}
                        disabledTippyContent={`Select a cluster to view and select ${DEPLOYMENT_APP_TYPE_LABEL[deploymentAppType]} in that cluster`}
                        icon={icon}
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
                        size={ComponentSizeType.large}
                    />
                </div>
            </div>

            {!!appName && (
                <div className="flex column w-100 dc__gap-16">
                    <div className="w-100 flex column center br-8 bg__primary border__secondary">
                        <APIResponseHandler
                            isLoading={isLoadingValidationResponse}
                            error={validationResponseError}
                            customLoader={
                                <GenericSectionErrorState
                                    progressingProps={{
                                        size: 24,
                                        color: 'N700',
                                    }}
                                    title="Checking compatibility"
                                    subTitle={`Checking if ${DEPLOYMENT_APP_TYPE_LABEL[deploymentAppType]} and its configurations are compatible for migration to deployment pipeline`}
                                    {...GENERIC_SECTION_ERROR_STATE_COMMON_PROPS}
                                />
                            }
                            genericSectionErrorProps={{
                                title: 'Error checking compatibility',
                                subTitle: `An error occurred while checking if ${DEPLOYMENT_APP_TYPE_LABEL[deploymentAppType]} and its configurations are compatible for migration to deployment pipeline`,
                                reload: reloadValidationResponse,
                                ...GENERIC_SECTION_ERROR_STATE_COMMON_PROPS,
                            }}
                        >
                            <MigrateToDevtronValidationFactory
                                appName={appName}
                                refetchValidationResponse={reloadValidationResponse}
                                validationResponse={validationResponse}
                            />
                        </APIResponseHandler>
                    </div>

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
