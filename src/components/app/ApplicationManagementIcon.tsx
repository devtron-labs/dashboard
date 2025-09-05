import {
    Button,
    ButtonComponentType,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
    URLS,
} from '@devtron-labs/devtron-fe-common-lib/dist'

export const ApplicationManagementIcon = () => (
    <Button
        dataTestId="redirect-to-devtron-apps"
        component={ButtonComponentType.link}
        size={ComponentSizeType.xs}
        variant={ButtonVariantType.borderLess}
        linkProps={{
            to: URLS.APP_LIST,
        }}
        ariaLabel="Redirect to Devtron Apps"
        showAriaLabelInTippy={false}
        icon={<Icon name="ic-grid-view" color={null} />}
    />
)
