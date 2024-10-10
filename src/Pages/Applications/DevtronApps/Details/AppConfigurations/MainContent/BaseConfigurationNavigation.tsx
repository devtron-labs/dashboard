import {
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
} from '@devtron-labs/devtron-fe-common-lib'
import { BaseConfigurationNavigationProps } from './types'

const BaseConfigurationNavigation = ({ baseConfigurationURL }: BaseConfigurationNavigationProps) => (
    <Button
        dataTestId="base-configuration-navigation"
        component={ButtonComponentType.link}
        linkProps={{
            to: baseConfigurationURL,
        }}
        text="Base Configuration"
        variant={ButtonVariantType.text}
        style={ButtonStyleType.neutral}
        size={ComponentSizeType.xs}
    />
)

export default BaseConfigurationNavigation
