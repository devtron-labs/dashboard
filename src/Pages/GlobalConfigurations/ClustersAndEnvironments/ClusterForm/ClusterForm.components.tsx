import { ButtonVariantType, ComponentSizeType, Icon, InfoBlock } from '@devtron-labs/devtron-fe-common-lib'

import { ClusterFormNavButtonProps } from './types'

export const ClusterFormNavButton = ({ isActive, title, subtitle, onClick, hasError }: ClusterFormNavButtonProps) => (
    <button
        type="button"
        className={`dc__transparent flex column left py-6 px-8 br-4 fw-4 lh-1-5 ${isActive ? 'bcb-1' : ''}`}
        onClick={onClick}
    >
        <div className="flexbox dc__content-space dc__gap-8 w-100">
            <span className={`fs-13 ${isActive ? 'cb-5 fw-6' : 'cn-9'} dc__truncate lh-1-5`}>{title}</span>
            {hasError && <Icon name="ic-warning-fill" size={20} color="R500" />}
        </div>
        {typeof subtitle === 'string' ? <span className="fs-12 cn-7">{subtitle}</span> : subtitle}
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
