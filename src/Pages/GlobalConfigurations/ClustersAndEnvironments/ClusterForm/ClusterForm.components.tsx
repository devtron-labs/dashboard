import { ButtonVariantType, ComponentSizeType, Icon, InfoBlock } from '@devtron-labs/devtron-fe-common-lib'

export const ClusterFormNavButton = ({
    isActive,
    title,
    subtitle,
    onClick,
}: {
    isActive: boolean
    title: string
    subtitle?: string
    onClick: () => void
}) => (
    <button
        type="button"
        className={`dc__transparent flex column left py-6 px-8 br-4 fw-4 lh-1-5 ${isActive ? 'bcb-1' : ''}`}
        onClick={onClick}
    >
        <span className={`fs-13 ${isActive ? 'cb-5 fw-6' : 'cn-9'}`}>{title}</span>
        {subtitle && <span className="fs-12 cn-7">{subtitle}</span>}
    </button>
)

export const PrometheusWarningInfo = () => (
    <InfoBlock
        variant="warning"
        description="Prometheus configuration will be removed and you
                won’t be able to see metrics for applications deployed in this cluster."
    />
)

export const GrafanaIntegrationRequired = () => (
    <InfoBlock
        variant="help"
        heading="Requires Grafana integration"
        description="Visit Devtron Stack Manager > Install Grafana integration"
        buttonProps={{
            dataTestId: 'enable-grafana',
            text: 'Enable Grafana',
            variant: ButtonVariantType.text,
            size: ComponentSizeType.small,
            endIcon: <Icon name="ic-arrow-right" color={null} />,
        }}
    />
)
