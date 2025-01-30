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
import { MigrationSourceValidationReasonType } from '../cdPipeline.types'
import { MigrateToDevtronValidationFactoryProps } from './types'
import './MigrateToDevtronValidationFactory.scss'

const ContentRow = ({ title, value }: { title: string; value: string }) => (
    <>
        <div>
            <h6 className="m-0 dc__underline-dotted dc_max-width__max-content cn-7 fs-13 fw-4 lh-20">{title}</h6>
        </div>

        <Tooltip content={value}>
            <span className="dc__truncate cn-9 fs-13 fw-4 lh-20">{value || '--'}</span>
        </Tooltip>
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

    if (!isLinkable) {
        if (!Object.values(MigrationSourceValidationReasonType).includes(validationFailedReason)) {
            return (
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

    const renderContent = () => {
        if (!isLinkable) {
            return null
        }

        return (
            <div className="display-grid dc__row-gap-8 dc__column-gap-16 validation-response__content-container">
                <ContentRow title="Target cluster" value={destination.clusterName || '--'} />
                <ContentRow title="Target namespace" value={destination.namespace || '--'} />
                <ContentRow title="Target environment" value={destination.environmentName || '--'} />
            </div>
        )
    }

    return (
        <div className="flexbox-col p-16 dc__gap-16 br-8 bg__primary border__secondary">
            <div className="flexbox dc__content-space">
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
            {renderContent()}
        </div>
    )
}

export default MigrateToDevtronValidationFactory
