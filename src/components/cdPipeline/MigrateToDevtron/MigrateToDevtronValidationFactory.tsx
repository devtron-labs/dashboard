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

import { ComponentProps } from 'react'
import { generatePath, Link } from 'react-router-dom'

import {
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    DeploymentAppTypes,
    GenericSectionErrorState,
    ImageWithFallback,
    InfoBlock,
    isNullOrUndefined,
    Tooltip,
    URLS as COMMON_URLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICArgoCDApp } from '@Icons/ic-argocd-app.svg'
import { ReactComponent as ICArrowClockwise } from '@Icons/ic-arrow-clockwise.svg'
import { ReactComponent as ICDefaultChart } from '@Icons/ic-default-chart.svg'
import { ReactComponent as ICFluxCDApp } from '@Icons/ic-fluxcd-app.svg'
import { URLS } from '@Config/routes'
import {
    AddClusterFormPrefilledInfoType,
    AddEnvironmentFormPrefilledInfoType,
} from '@Pages/GlobalConfigurations/ClustersAndEnvironments/cluster.type'
import {
    ADD_CLUSTER_FORM_LOCAL_STORAGE_KEY,
    ADD_ENVIRONMENT_FORM_LOCAL_STORAGE_KEY,
} from '@Pages/GlobalConfigurations/ClustersAndEnvironments/constants'
import { CreateClusterTypeEnum } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/CreateCluster/types'

import { MigrationSourceValidationReasonType } from '../cdPipeline.types'
import {
    DEPLOYMENT_APP_TYPE_LABEL,
    GENERIC_SECTION_ERROR_STATE_COMMON_PROPS,
    TARGET_ENVIRONMENT_INFO_LIST,
} from './constants'
import { MigrateToDevtronValidationFactoryProps, ValidationResponseContentRowProps } from './types'
import {
    getTargetClusterTooltipInfo,
    getTargetNamespaceTooltipInfo,
    renderGitOpsNotConfiguredDescription,
} from './utils'

import './MigrateToDevtronValidationFactory.scss'

const renderContentTooltip = (title: string, infoList: string[]) => (
    <div className="flexbox-col dc__gap-2">
        <h6 className="m-0 fs-12 fw-6 lh-18 text__white">{title}</h6>

        <div className="flexbox-col dc__gap-12">
            {infoList?.map((info) => (
                <span key={info} className="fs-12 fw-4 lh-18 text__white">
                    {info}
                </span>
            ))}
        </div>
    </div>
)

const ContentRow = ({ title, value, buttonProps, titleTooltip }: ValidationResponseContentRowProps) => (
    <>
        <div>
            <Tooltip content={titleTooltip} alwaysShowTippyOnHover>
                <h6 className="m-0 dc__underline-dotted dc_max-width__max-content cn-7 fs-13 fw-4 lh-20">{title}</h6>
            </Tooltip>
        </div>

        <div className="flexbox dc__gap-8">
            {!isNullOrUndefined(value) && (
                <Tooltip content={value}>
                    <span className="dc__truncate cn-9 fs-13 fw-4 lh-20">{value || '--'}</span>
                </Tooltip>
            )}

            {buttonProps && <Button {...buttonProps} />}
        </div>
    </>
)

const MigratingFromIcon = ({
    deploymentAppType,
    chartIcon,
}: {
    deploymentAppType: DeploymentAppTypes
    chartIcon: string
}) => {
    const iconClass = 'icon-dim-36 dc__no-shrink'

    switch (deploymentAppType) {
        case DeploymentAppTypes.ARGO:
            return <ICArgoCDApp className={iconClass} />
        case DeploymentAppTypes.HELM:
            return (
                <ImageWithFallback
                    imageProps={{
                        height: 36,
                        width: 36,
                        src: chartIcon,
                        alt: 'Helm Release',
                    }}
                    fallbackImage={<ICDefaultChart className={iconClass} />}
                />
            )
        case DeploymentAppTypes.FLUX:
            return <ICFluxCDApp className={iconClass} />
        default:
            return <ICDefaultChart className={iconClass} />
    }
}

const MigrateToDevtronValidationFactory = ({
    validationResponse,
    appName,
    refetchValidationResponse,
}: Readonly<MigrateToDevtronValidationFactoryProps>) => {
    if (!validationResponse) {
        return null
    }

    const {
        isLinkable,
        errorDetail,
        requiredChartName,
        requiredChartVersion,
        savedChartName,
        destination,
        status,
        deploymentAppType,
        chartIcon,
    } = validationResponse
    const { validationFailedReason, validationFailedMessage } = errorDetail || {}

    const deploymentAppTypeLabel = DEPLOYMENT_APP_TYPE_LABEL[deploymentAppType]

    const targetClusterTooltipInfo = getTargetClusterTooltipInfo(deploymentAppType)
    const targetNamespaceTooltipInfo = getTargetNamespaceTooltipInfo(deploymentAppType)

    const renderChartVersionNotFoundDescription = () => (
        <p className="m-0">
            Chart version &apos;{requiredChartVersion}&apos; not found for &apos;{requiredChartName}&apos; chart.&nbsp;
            <Link
                to={COMMON_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_DEPLOYMENT_CHARTS}
                data-testid="upload-chart-button"
                target="_blank"
                className="anchor"
            >
                Upload Chart
            </Link>
            &nbsp;and try again.
        </p>
    )

    if (!isLinkable) {
        if (!Object.values(MigrationSourceValidationReasonType).includes(validationFailedReason)) {
            return (
                <GenericSectionErrorState
                    title={validationFailedReason}
                    subTitle={validationFailedMessage || 'Something went wrong'}
                    reload={refetchValidationResponse}
                    {...GENERIC_SECTION_ERROR_STATE_COMMON_PROPS}
                />
            )
        }

        switch (validationFailedReason) {
            // First rendering states requiring only infobar
            case MigrationSourceValidationReasonType.CHART_TYPE_MISMATCH:
                return (
                    <GenericSectionErrorState
                        title="Chart type mismatch"
                        subTitle={`This ${deploymentAppTypeLabel} uses '${requiredChartName}' chart where as this application uses '${savedChartName}' chart. You can upload your own charts in Global Configuration > Deployment Charts.`}
                        reload={refetchValidationResponse}
                        {...GENERIC_SECTION_ERROR_STATE_COMMON_PROPS}
                    />
                )
            case MigrationSourceValidationReasonType.INTERNAL_SERVER_ERROR:
                return (
                    <GenericSectionErrorState
                        title="Something went wrong"
                        subTitle={validationFailedMessage || ''}
                        reload={refetchValidationResponse}
                        {...GENERIC_SECTION_ERROR_STATE_COMMON_PROPS}
                    />
                )

            case MigrationSourceValidationReasonType.GITOPS_NOT_FOUND: {
                return (
                    <GenericSectionErrorState
                        title="GitOps credentials not configured"
                        subTitle={renderGitOpsNotConfiguredDescription()}
                        reload={refetchValidationResponse}
                        {...GENERIC_SECTION_ERROR_STATE_COMMON_PROPS}
                    />
                )
            }

            case MigrationSourceValidationReasonType.CHART_VERSION_NOT_FOUND: {
                return (
                    <GenericSectionErrorState
                        title="Chart version not found"
                        subTitle={renderChartVersionNotFoundDescription()}
                        reload={refetchValidationResponse}
                        {...GENERIC_SECTION_ERROR_STATE_COMMON_PROPS}
                    />
                )
            }

            default:
                break
        }
    }

    const renderAllContentFields = () => (
        <div className="display-grid dc__row-gap-8 dc__column-gap-16 validation-response__content-container">
            <ContentRow
                title={targetClusterTooltipInfo.heading}
                value={destination.clusterName || '--'}
                titleTooltip={renderContentTooltip(targetClusterTooltipInfo.heading, targetClusterTooltipInfo.infoList)}
            />
            <ContentRow
                title={targetNamespaceTooltipInfo.heading}
                value={destination.namespace || '--'}
                titleTooltip={renderContentTooltip(
                    targetNamespaceTooltipInfo.heading,
                    targetNamespaceTooltipInfo.infoList,
                )}
            />
            <ContentRow
                title={TARGET_ENVIRONMENT_INFO_LIST.heading}
                value={destination.environmentName || '--'}
                titleTooltip={renderContentTooltip(
                    TARGET_ENVIRONMENT_INFO_LIST.heading,
                    TARGET_ENVIRONMENT_INFO_LIST.infoList,
                )}
            />
        </div>
    )

    const handleAddEnvironmentClick = () => {
        const environmentFormData: AddEnvironmentFormPrefilledInfoType = {
            namespace: destination.namespace,
        }

        localStorage.setItem(ADD_ENVIRONMENT_FORM_LOCAL_STORAGE_KEY, JSON.stringify(environmentFormData))
    }

    const handleAddClusterClick = () => {
        const clusterFormData: AddClusterFormPrefilledInfoType = {
            serverURL: destination.clusterServerUrl,
        }

        localStorage.setItem(ADD_CLUSTER_FORM_LOCAL_STORAGE_KEY, JSON.stringify(clusterFormData))
    }

    const renderContent = () => {
        switch (validationFailedReason) {
            case MigrationSourceValidationReasonType.CLUSTER_NOT_FOUND:
                return (
                    <div className="display-grid dc__row-gap-8 dc__column-gap-16 validation-response__content-container">
                        <ContentRow
                            title={targetClusterTooltipInfo.heading}
                            value={destination.clusterServerUrl}
                            buttonProps={{
                                dataTestId: 'connect-cluster-button',
                                text: 'Connect Cluster',
                                variant: ButtonVariantType.text,
                                size: ComponentSizeType.large,
                                component: ButtonComponentType.link,
                                onClick: handleAddClusterClick,
                                linkProps: {
                                    to: generatePath(URLS.GLOBAL_CONFIG_CREATE_CLUSTER, {
                                        type: CreateClusterTypeEnum.CONNECT_CLUSTER,
                                    }),
                                    target: '_blank',
                                },
                            }}
                            titleTooltip={renderContentTooltip(
                                targetClusterTooltipInfo.heading,
                                targetClusterTooltipInfo.infoList,
                            )}
                        />
                        <ContentRow
                            title={targetNamespaceTooltipInfo.heading}
                            value={destination.namespace || '--'}
                            titleTooltip={renderContentTooltip(
                                targetNamespaceTooltipInfo.heading,
                                targetNamespaceTooltipInfo.infoList,
                            )}
                        />
                    </div>
                )

            case MigrationSourceValidationReasonType.ENVIRONMENT_NOT_FOUND:
                return (
                    <div className="display-grid dc__row-gap-8 dc__column-gap-16 validation-response__content-container">
                        <ContentRow
                            title={targetClusterTooltipInfo.heading}
                            value={destination.clusterName || '--'}
                            titleTooltip={renderContentTooltip(
                                targetClusterTooltipInfo.heading,
                                targetClusterTooltipInfo.infoList,
                            )}
                        />
                        <ContentRow
                            title={targetNamespaceTooltipInfo.heading}
                            value={destination.namespace || '--'}
                            titleTooltip={renderContentTooltip(
                                targetNamespaceTooltipInfo.heading,
                                targetNamespaceTooltipInfo.infoList,
                            )}
                        />
                        <ContentRow
                            title={TARGET_ENVIRONMENT_INFO_LIST.heading}
                            buttonProps={{
                                dataTestId: 'add-environment-button',
                                text: 'Add Environment',
                                variant: ButtonVariantType.text,
                                size: ComponentSizeType.large,
                                component: ButtonComponentType.link,
                                onClick: handleAddEnvironmentClick,
                                linkProps: {
                                    to: `${URLS.GLOBAL_CONFIG_CLUSTER}/${destination.clusterName}${URLS.CREATE_ENVIRONMENT}`,
                                    target: '_blank',
                                },
                            }}
                            titleTooltip={renderContentTooltip(
                                TARGET_ENVIRONMENT_INFO_LIST.heading,
                                TARGET_ENVIRONMENT_INFO_LIST.infoList,
                            )}
                        />
                    </div>
                )

            default:
                return renderAllContentFields()
        }
    }

    const shouldRenderInfoVariantWithContent =
        isLinkable ||
        validationFailedReason === MigrationSourceValidationReasonType.CLUSTER_NOT_FOUND ||
        validationFailedReason === MigrationSourceValidationReasonType.ENVIRONMENT_NOT_FOUND

    const shouldRenderInfoErrorVariantWithContent =
        validationFailedReason === MigrationSourceValidationReasonType.APPLICATION_ALREADY_LINKED ||
        validationFailedReason === MigrationSourceValidationReasonType.ENFORCED_POLICY_VIOLATION ||
        validationFailedReason === MigrationSourceValidationReasonType.ENVIRONMENT_ALREADY_PRESENT

    const getInfoErrorVariantMessage = () => {
        if (!shouldRenderInfoErrorVariantWithContent) {
            return null
        }

        switch (validationFailedReason) {
            case MigrationSourceValidationReasonType.ENVIRONMENT_ALREADY_PRESENT:
                return 'A pipeline already exists for this environment. Delete the existing deployment pipeline and try again.'

            case MigrationSourceValidationReasonType.APPLICATION_ALREADY_LINKED:
                return `This ${deploymentAppTypeLabel} is already linked to a deployment pipeline`

            case MigrationSourceValidationReasonType.ENFORCED_POLICY_VIOLATION:
                return `Cannot migrate ${deploymentAppTypeLabel}. Deployment via Helm is enforced on the target environment.`

            default:
                return validationFailedMessage
        }
    }

    const getInfoBarInfoVariantMessage = () => {
        if (!shouldRenderInfoVariantWithContent) {
            return null
        }

        if (isLinkable) {
            return 'A deployment pipeline will be created for the target environment'
        }

        switch (validationFailedReason) {
            case MigrationSourceValidationReasonType.CLUSTER_NOT_FOUND:
                return 'Connect the target cluster with Devtron and try again'

            case MigrationSourceValidationReasonType.ENVIRONMENT_NOT_FOUND:
                return `Add an environment with namespace '${destination.namespace}' in '${destination.clusterName}' cluster and try again`

            default:
                return validationFailedMessage
        }
    }

    const renderContentInfoBar = () => {
        const commonInfoBlockProps: Pick<
            ComponentProps<typeof InfoBlock>,
            'borderConfig' | 'borderRadiusConfig' | 'size'
        > = {
            borderConfig: {
                top: false,
                bottom: false,
                left: false,
                right: false,
            },
            borderRadiusConfig: {
                top: false,
            },
            size: ComponentSizeType.medium,
        }

        if (shouldRenderInfoVariantWithContent) {
            return (
                <InfoBlock variant="neutral" description={getInfoBarInfoVariantMessage()} {...commonInfoBlockProps} />
            )
        }

        if (shouldRenderInfoErrorVariantWithContent) {
            return <InfoBlock variant="error" description={getInfoErrorVariantMessage()} {...commonInfoBlockProps} />
        }

        return null
    }

    return (
        <div className="flexbox-col dc__gap-16 w-100 dc__overflow-hidden">
            <div className="flexbox px-16 pt-16 dc__content-space">
                <div className="flexbox dc__gap-12">
                    <MigratingFromIcon chartIcon={chartIcon} deploymentAppType={deploymentAppType} />

                    <div className="flexbox-col">
                        <Tooltip content={appName}>
                            <h5 className="m-0 cn-9 fs-13 fw-6 lh-20 dc__truncate">{appName}</h5>
                        </Tooltip>

                        {status && (
                            <span
                                data-testid="deployment-status-name"
                                className={`app-summary__status-name fs-12 fw-4 lh-18 f-${status.toLowerCase()} dc__first-letter-capitalize--imp dc__truncate`}
                            >
                                {status}
                            </span>
                        )}
                    </div>
                </div>

                <Button
                    ariaLabel="Re-validate"
                    dataTestId="re-validate-button"
                    icon={<ICArrowClockwise />}
                    showAriaLabelInTippy={false}
                    onClick={refetchValidationResponse}
                    size={ComponentSizeType.xs}
                    variant={ButtonVariantType.borderLess}
                    style={ButtonStyleType.neutral}
                />
            </div>
            <div className="px-16 flexbox-col">{renderContent()}</div>
            {renderContentInfoBar()}
        </div>
    )
}

export default MigrateToDevtronValidationFactory
