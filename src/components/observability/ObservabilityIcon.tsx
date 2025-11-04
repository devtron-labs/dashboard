import {
    Button,
    ButtonComponentType,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
    URLS,
} from '@devtron-labs/devtron-fe-common-lib'

const ObservabilityIconComponent = () => (
    <Button
        dataTestId="redirect-to-observability-overview-btn"
        component={ButtonComponentType.link}
        size={ComponentSizeType.xs}
        variant={ButtonVariantType.borderLess}
        linkProps={{
            to: URLS.OBSERVABILITY_OVERVIEW,
        }}
        ariaLabel="Observability"
        showAriaLabelInTippy
        icon={<Icon name="ic-binoculars" color={null} />}
    />
)

export default ObservabilityIconComponent
