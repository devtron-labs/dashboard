import {
    AppThemeType,
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    getComponentSpecificThemeClass,
    Icon,
} from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'

export const UserPermissionsTooltipContent = ({ onClose }: { onClose: () => void }) => (
    <div className="flexbox-col dc__gap-12 p-16 bcn-8 br-8">
        <div className={`flex top dc__content-space ${getComponentSpecificThemeClass(AppThemeType.dark)}`}>
            <Icon name="ic-users" size={40} color="Y500" />
            <Button
                dataTestId="global-configuration-user-permissions-tooltip-close"
                ariaLabel="global-configuration-user-permissions-tooltip-close"
                variant={ButtonVariantType.borderLess}
                style={ButtonStyleType.neutral}
                icon={<Icon name="ic-close-large" color={null} />}
                size={ComponentSizeType.xs}
                onClick={onClose}
                showAriaLabelInTippy={false}
            />
        </div>
        <div className="flexbox-col dc__gap-4 text__white">
            <p className="m-0 fs-14 lh-20 fw-6">Manage Users & Permissions</p>
            <p className="m-0 fs-13 lh-20">Ensure seamless one-click SSO login by adding users to Devtron</p>
        </div>
        <div className="global-configuration__user-permissions-tooltip__btn">
            <Button
                dataTestId="global-configuration-user-permissions-tooltip-btn"
                component={ButtonComponentType.link}
                variant={ButtonVariantType.secondary}
                style={ButtonStyleType.neutral}
                size={ComponentSizeType.small}
                onClick={onClose}
                text="Take me there"
                fullWidth
                linkProps={{
                    to: URLS.GLOBAL_CONFIG_AUTH_USER_PERMISSION,
                }}
            />
        </div>
    </div>
)
