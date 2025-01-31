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
} from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '@Config/routes'
import { ReactComponent as ICErrorExclamation } from '@Icons/ic-error-exclamation.svg'
import { ReactComponent as ICArgoCDApp } from '@Icons/ic-argocd-app.svg'
import { ReactComponent as ICArrowClockwise } from '@Icons/ic-arrow-clockwise.svg'
import { ReactComponent as ICArrowRight } from '@Icons/ic-arrow-right.svg'
import { ReactComponent as ICUpload } from '@Icons/ic-upload.svg'
import { ReactComponent as ICInfoFilled } from '@Icons/ic-info-filled.svg'
import { MigrationSourceValidationReasonType } from '../cdPipeline.types'
import { MigrateToDevtronValidationFactoryProps } from './types'
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
            <Tooltip content={value}>
                <span className="dc__truncate cn-9 fs-13 fw-4 lh-20">{value || '--'}</span>
            </Tooltip>

            {buttonProps && <Button {...buttonProps} />}
        </div>
    </>
)

const MigrateToDevtronValidationFactory = ({
    validationResponse,
    appName,
    refetchValidationResponse,
}: MigrateToDevtronValidationFactoryProps) => {
    if (!validationResponse) {
        return null
    }

    const { isLinkable, errorDetail, applicationMetadata } = validationResponse
    const { validationFailedReason, validationFailedMessage } = errorDetail || {}
    const { source, status, destination } = applicationMetadata || {}

    const renderUnknownError = () => (
        <InfoColourBar
            classname="error_bar"
            Icon={ICErrorExclamation}
            iconClass="icon-dim-20 dc__no-shrink"
            textConfig={{
                heading: validationFailedReason,
                description: validationFailedMessage || 'Something went wrong',
            }}
        />
    )

    if (!isLinkable) {
        if (!Object.values(MigrationSourceValidationReasonType).includes(validationFailedReason)) {
            return renderUnknownError()
        }

        switch (validationFailedReason) {
            // First rendering states requiring only infobar
            case MigrationSourceValidationReasonType.CHART_TYPE_MISMATCH:
                return (
                    <InfoColourBar
                        classname="error_bar"
                        Icon={ICErrorExclamation}
                        iconClass="icon-dim-20 dc__no-shrink"
                        textConfig={{
                            heading: 'Chart type mismatch',
                            description: `Argo CD application uses ${source.chartMetadata.savedChartName} chart where as this application uses ${source.chartMetadata.requiredChartName} chart. You can upload your own charts in Global Configuration > Deployment Charts.`,
                        }}
                    />
                )
            case MigrationSourceValidationReasonType.INTERNAL_SERVER_ERROR:
                return (
                    <InfoColourBar
                        classname="error_bar"
                        Icon={ICErrorExclamation}
                        iconClass="icon-dim-20 dc__no-shrink"
                        textConfig={{
                            heading: 'Something went wrong',
                            description: validationFailedMessage || '',
                        }}
                    />
                )

            case MigrationSourceValidationReasonType.GITOPS_NOT_FOUND: {
                const actionButtonConfig: ButtonProps = {
                    dataTestId: 'configure-gitops-button',
                    text: 'Configure',
                    endIcon: <ICArrowRight />,
                    variant: ButtonVariantType.text,
                    size: ComponentSizeType.medium,
                    component: ButtonComponentType.link,
                    linkProps: {
                        to: URLS.GLOBAL_CONFIG_GITOPS,
                    },
                }

                return (
                    <InfoColourBar
                        classname="error_bar"
                        Icon={ICErrorExclamation}
                        iconClass="icon-dim-20 dc__no-shrink"
                        textConfig={{
                            heading: 'GitOps credentials not configured',
                            description: 'GitOps credentials is required to deploy applications via GitOps',
                            actionButtonConfig,
                        }}
                    />
                )
            }

            case MigrationSourceValidationReasonType.CHART_VERSION_NOT_FOUND: {
                const actionButtonConfig: ButtonProps = {
                    dataTestId: 'upload-chart-button',
                    text: 'Upload Chart',
                    startIcon: <ICUpload />,
                    variant: ButtonVariantType.text,
                    size: ComponentSizeType.medium,
                    component: ButtonComponentType.link,
                    linkProps: {
                        to: COMMON_URLS.GLOBAL_CONFIG_DEPLOYMENT_CHARTS_LIST,
                    },
                }

                return (
                    <InfoColourBar
                        classname="error_bar"
                        Icon={ICErrorExclamation}
                        iconClass="icon-dim-20 dc__no-shrink"
                        textConfig={{
                            heading: 'Chart version not found',
                            description: `Chart version '${source.chartMetadata.requiredChartVersion}' not found for '${source.chartMetadata.requiredChartName}' chart`,
                            actionButtonConfig,
                        }}
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
                                linkProps: {
                                    to: `${URLS.GLOBAL_CONFIG_CLUSTER}/${destination.environmentId}/${URLS.CREATE_ENVIRONMENT}`,
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

        if (validationFailedMessage === MigrationSourceValidationReasonType.ENVIRONMENT_NOT_FOUND) {
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
        <div className="flexbox-col dc__gap-16 br-8 bg__primary border__secondary">
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
                                className={`app-summary__status-name fs-13 mr-8 fw-6 f-${status.toLowerCase()}`}
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
