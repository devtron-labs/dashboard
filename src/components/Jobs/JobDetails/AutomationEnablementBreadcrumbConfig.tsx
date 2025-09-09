import {
    Button,
    ButtonComponentType,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
} from '@devtron-labs/devtron-fe-common-lib/dist'

import { URLS } from '@Config/routes'

export const getAutomationEnablementBreadcrumbConfig = () => ({
    component: {
        'automation-and-enablement': {
            component: (
                <Button
                    dataTestId="redirect-to-overview-btn"
                    component={ButtonComponentType.link}
                    size={ComponentSizeType.xs}
                    variant={ButtonVariantType.borderLess}
                    linkProps={{
                        to: URLS.AUTOMATION_AND_ENABLEMENT_JOB,
                    }}
                    ariaLabel="Redirect to Infrastructure Management Overview"
                    showAriaLabelInTippy={false}
                    icon={<Icon name="ic-cloud" color={null} />}
                />
            ),
        },
        linked: true,
    },
})
