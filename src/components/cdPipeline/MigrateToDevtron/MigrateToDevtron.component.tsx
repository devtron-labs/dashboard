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

import { useEffect, useRef } from 'react'
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
    useAsync,
    useMainContext,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import { ReactComponent as ICDefaultChart } from '@Icons/ic-default-chart.svg'
import { ReactComponent as ICArgoCDApp } from '@Icons/ic-argocd-app.svg'
import { ClusterSelectProps, MigrateToDevtronProps, SelectMigrateAppOptionType } from './types'
import ClusterSelect from './ClusterSelect'
import {
    MigrateToDevtronBaseFormStateType,
    MigrateToDevtronFormState,
    TriggerTypeRadioProps,
} from '../cdPipeline.types'
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

    const renderSelectMigrateFromRadioGroup = (deploymentAppType: MigrateToDevtronFormState['deploymentAppType']) => (
        <RadioGroupItem dataTestId={`${deploymentAppType}-radio-item`} value={deploymentAppType}>
            <Tooltip
                alwaysShowTippyOnHover
                content={
                    <div className="flexbox-col dc__gap-2">
                        <h6 className="m-0 fs-12 fw-6 lh-18">
                            {deploymentAppType === DeploymentAppTypes.HELM
                                ? 'Migrate helm release'
                                : 'Migrate Argo CD Application'}
                        </h6>

                        <p className="m-0 fs-12 fw-4 lh-18">
                            {deploymentAppType === DeploymentAppTypes.HELM
                                ? 'Migrate an existing Helm Release to manage deployments via CD pipeline'
                                : 'Migrate an existing Argo CD Application to manage deployments via CD pipeline'}
                        </p>
                    </div>
                }
            >
                <span className="cn-9 fs-13 fw-4 lh-20 dc__underline-dotted">
                    {deploymentAppType === DeploymentAppTypes.HELM ? 'Helm Release' : 'Argo CD Application'}
                </span>
            </Tooltip>
        </RadioGroupItem>
    )

    if (!isSuperAdmin) {
        return <ErrorScreenNotAuthorized />
    }

    return (
        <div className="flexbox-col dc__gap-20">
            {isFeatureArgoCdMigrationEnabled && (
                <div className="flexbox-col dc__gap-8">
                    <span className="cn-7 fs-13 fw-4 lh-20">Select type of application to migrate</span>

                    <RadioGroup
                        className="radio-group-no-border migrate-to-devtron__deployment-app-type-radio-group"
                        value={migrateToDevtronFormState.deploymentAppType}
                        name="migrate-from-app-type"
                        onChange={handleMigrateFromAppTypeChange}
                    >
                        {renderSelectMigrateFromRadioGroup(DeploymentAppTypes.HELM)}
                        {renderSelectMigrateFromRadioGroup(DeploymentAppTypes.GITOPS)}
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
                        icon={isMigratingFromHelm ? <ICDefaultChart /> : <ICArgoCDApp />}
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
                                    subTitle={`Checking if ${getDeploymentAppTypeLabel(isMigratingFromHelm)} and its configurations are compatible for migration to deployment pipeline`}
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
