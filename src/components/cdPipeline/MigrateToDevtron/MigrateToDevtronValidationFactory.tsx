import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    ButtonProps,
    InfoColourBar,
    Tooltip,
    ButtonComponentType,
    URLS as COMMON_URLS,
    isNullOrUndefined,
    GenericSectionErrorState,
} from '@devtron-labs/devtron-fe-common-lib'
import { Link } from 'react-router-dom'
import { URLS } from '@Config/routes'
import { ReactComponent as ICErrorExclamation } from '@Icons/ic-error-exclamation.svg'
import { ReactComponent as ICArgoCDApp } from '@Icons/ic-argocd-app.svg'
import { ReactComponent as ICArrowClockwise } from '@Icons/ic-arrow-clockwise.svg'
import { ReactComponent as ICInfoFilled } from '@Icons/ic-info-filled.svg'
import { AddClusterFormPrefilledInfoType, AddEnvironmentFormPrefilledInfoType } from '@Components/cluster/cluster.type'
import {
    ADD_CLUSTER_FORM_LOCAL_STORAGE_KEY,
    ADD_ENVIRONMENT_FORM_LOCAL_STORAGE_KEY,
} from '@Components/cluster/constants'
import { MigrationSourceValidationReasonType } from '../cdPipeline.types'
import { MigrateToDevtronValidationFactoryProps } from './types'
import { GENERIC_SECTION_ERROR_STATE_COMMON_PROPS } from './constants'
import './MigrateToDevtronValidationFactory.scss'

interface ContentRowProps {
    title: string
    value?: string
    buttonProps?: ButtonProps
    titleTooltip: string
}

const TARGET_CLUSTER_TOOLTIP = 'Cluster in which the Argo CD application is deploying your microservice'
const TARGET_NAMESPACE_TOOLTIP = 'Namespace in which the Argo CD application is deploying your microservice'
const TARGET_ENVIRONMENT_TOOLTIP =
    'A deployment pipeline will be created for the target environment. Environment is a unique combination of cluster and namespace in Devtron.'

const ContentRow = ({ title, value, buttonProps, titleTooltip }: ContentRowProps) => (
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

const MigrateToDevtronValidationFactory = ({
    validationResponse,
    appName,
    refetchValidationResponse,
}: Readonly<MigrateToDevtronValidationFactoryProps>) => {
    if (!validationResponse) {
        return null
    }

    const { isLinkable, errorDetail, applicationMetadata } = validationResponse
    const { validationFailedReason, validationFailedMessage } = errorDetail || {}
    const { source, status, destination } = applicationMetadata || {}

    const renderGitOpsNotConfiguredDescription = () => (
        <p className="m-0">
            GitOps credentials is required to deploy applications via GitOps.&nbsp;
            <Link
                to={URLS.GLOBAL_CONFIG_GITOPS}
                data-testid="configure-gitops-button"
                target="_blank"
                className="anchor"
            >
                Configure
            </Link>
            &nbsp;and try again.
        </p>
    )

    const renderChartVersionNotFoundDescription = () => (
        <p className="m-0">
            Chart version &apos;{source.chartMetadata.requiredChartVersion}&apos; not found for &apos;
            {source.chartMetadata.requiredChartName}&apos; chart.&nbsp;
            <Link
                to={COMMON_URLS.GLOBAL_CONFIG_DEPLOYMENT_CHARTS_LIST}
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
                        subTitle={`Argo CD application uses '${source.chartMetadata.savedChartName}' chart where as this application uses '${source.chartMetadata.requiredChartName}' chart. You can upload your own charts in Global Configuration > Deployment Charts.`}
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
                title="Target cluster"
                value={destination.clusterName || '--'}
                titleTooltip={TARGET_CLUSTER_TOOLTIP}
            />
            <ContentRow
                title="Target namespace"
                value={destination.namespace || '--'}
                titleTooltip={TARGET_NAMESPACE_TOOLTIP}
            />
            <ContentRow
                title="Target environment"
                value={destination.environmentName || '--'}
                titleTooltip={TARGET_ENVIRONMENT_TOOLTIP}
            />
        </div>
    )

    const handleAddEnvironmentClick = () => {
        if (typeof Storage !== 'undefined') {
            const environmentFormData: AddEnvironmentFormPrefilledInfoType = {
                namespace: destination.namespace,
            }

            localStorage.setItem(ADD_ENVIRONMENT_FORM_LOCAL_STORAGE_KEY, JSON.stringify(environmentFormData))
        }
    }

    const handleAddClusterClick = () => {
        if (typeof Storage !== 'undefined') {
            const clusterFormData: AddClusterFormPrefilledInfoType = {
                serverURL: destination.clusterServerUrl,
            }

            localStorage.setItem(ADD_CLUSTER_FORM_LOCAL_STORAGE_KEY, JSON.stringify(clusterFormData))
        }
    }

    const renderContent = () => {
        switch (validationFailedReason) {
            case MigrationSourceValidationReasonType.CLUSTER_NOT_FOUND:
                return (
                    <div className="display-grid dc__row-gap-8 dc__column-gap-16 validation-response__content-container">
                        <ContentRow
                            title="Target cluster"
                            value={destination.clusterServerUrl}
                            buttonProps={{
                                dataTestId: 'connect-cluster-button',
                                text: 'Connect Cluster',
                                variant: ButtonVariantType.text,
                                size: ComponentSizeType.large,
                                component: ButtonComponentType.link,
                                onClick: handleAddClusterClick,
                                linkProps: {
                                    to: `${URLS.GLOBAL_CONFIG_CLUSTER}${URLS.CREATE_CLUSTER}`,
                                },
                            }}
                            titleTooltip={TARGET_CLUSTER_TOOLTIP}
                        />
                        <ContentRow
                            title="Target namespace"
                            value={destination.namespace || '--'}
                            titleTooltip={TARGET_NAMESPACE_TOOLTIP}
                        />
                    </div>
                )

            case MigrationSourceValidationReasonType.ENVIRONMENT_NOT_FOUND:
                return (
                    <div className="display-grid dc__row-gap-8 dc__column-gap-16 validation-response__content-container">
                        <ContentRow
                            title="Target cluster"
                            value={destination.clusterName || '--'}
                            titleTooltip={TARGET_CLUSTER_TOOLTIP}
                        />
                        <ContentRow
                            title="Target namespace"
                            value={destination.namespace || '--'}
                            titleTooltip={TARGET_NAMESPACE_TOOLTIP}
                        />
                        <ContentRow
                            title="Target environment"
                            buttonProps={{
                                dataTestId: 'add-environment-button',
                                text: 'Add Environment',
                                variant: ButtonVariantType.text,
                                size: ComponentSizeType.large,
                                component: ButtonComponentType.link,
                                onClick: handleAddEnvironmentClick,
                                linkProps: {
                                    to: `${URLS.GLOBAL_CONFIG_CLUSTER}/${destination.clusterName}${URLS.CREATE_ENVIRONMENT}`,
                                },
                            }}
                            titleTooltip={TARGET_ENVIRONMENT_TOOLTIP}
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

        if (validationFailedReason === MigrationSourceValidationReasonType.ENVIRONMENT_ALREADY_PRESENT) {
            return 'A pipeline already exists for this environment. Delete the existing deployment pipeline and try again.'
        }

        if (validationFailedReason === MigrationSourceValidationReasonType.APPLICATION_ALREADY_LINKED) {
            return 'This Argo CD application is already linked to a deployment pipeline'
        }

        if (validationFailedReason === MigrationSourceValidationReasonType.ENFORCED_POLICY_VIOLATION) {
            return 'Cannot migrate Argo CD Application. Deployment via Helm is enforced on the target environment.'
        }

        return validationFailedMessage
    }

    const getInfoBarInfoVariantMessage = () => {
        if (!shouldRenderInfoVariantWithContent) {
            return null
        }

        if (isLinkable) {
            return 'A deployment pipeline will be created for the target environment'
        }

        if (validationFailedReason === MigrationSourceValidationReasonType.CLUSTER_NOT_FOUND) {
            return 'Connect the target cluster with Devtron and try again'
        }

        if (validationFailedReason === MigrationSourceValidationReasonType.ENVIRONMENT_NOT_FOUND) {
            return `Add an environment with namespace '${destination.namespace}' in '${destination.clusterName}' cluster and try again`
        }

        return validationFailedMessage
    }

    const renderContentInfoBar = () => {
        if (shouldRenderInfoVariantWithContent) {
            return (
                <InfoColourBar
                    Icon={ICInfoFilled}
                    message={getInfoBarInfoVariantMessage()}
                    classname="dc__overflow-hidden py-6 px-10 bg__secondary border-top__secondary"
                />
            )
        }

        if (shouldRenderInfoErrorVariantWithContent) {
            return (
                <InfoColourBar
                    Icon={ICErrorExclamation}
                    message={getInfoErrorVariantMessage()}
                    classname="dc__overflow-hidden py-6 px-10 bcr-50 border-top__secondary"
                />
            )
        }

        return null
    }

    return (
        <div className="flexbox-col dc__gap-16 br-8 bg__primary border__secondary w-100">
            <div className="flexbox px-16 pt-16 dc__content-space">
                <div className="flexbox dc__gap-12">
                    <ICArgoCDApp className="icon-dim-36 dc__no-shrink" />

                    <div className="flexbox-col dc__gap-2">
                        <Tooltip content={appName}>
                            <h5 className="m-0 cn-9 fs-13 fw-6 lh-20 dc__truncate">{appName}</h5>
                        </Tooltip>

                        {status && (
                            // TODO: Can make a component for this
                            <span
                                data-testid="deployment-status-name"
                                className={`app-summary__status-name fs-13 mr-8 fw-6 f-${status.toLowerCase()} dc__first-letter-capitalize--imp`}
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
