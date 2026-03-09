import {
    Button,
    ButtonComponentType,
    ButtonVariantType,
    Collapse,
    ComponentSizeType,
    DTSwitch,
    Icon,
    InfoBlock,
    URLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { SSO_CONFIG } from './constants'
import LearnMoreTippy from './LearnMoreTippy'
import { AutoAssignToggleTileProps } from './types'

/**
 * Tile with toggle for SSO permission management
 */
const AutoAssignToggleTile = ({ isSelected, onChange, ssoType }: AutoAssignToggleTileProps) => {
    const config = SSO_CONFIG[ssoType]
    if (!config) {
        return null
    }

    const { permissionGroupName, tippyConfig, documentationLink, devtronDocLink } = config

    const handleChange = () => {
        onChange(!isSelected)
    }

    return (
        <div className="flexbox dc__content-space p-12 br-4 dc__border dc__gap-12">
            <div className="flexbox-col dc__gap-8 flex-grow-1">
                <div className="flexbox-col dc__gap-2 fs-13 lh-20">
                    <p className="mb-0 fw-6 cn-9">Auto-assign permission to users on SSO login</p>
                    <p className="mb-0 fw-4 cn-7">
                        When enabled, users will be auto-assigned a Permission Group mapped with Groups on &quot;
                        {permissionGroupName}&quot;.&nbsp;
                        <LearnMoreTippy
                            {...tippyConfig}
                            documentationLink={documentationLink}
                            documentationText={permissionGroupName}
                            devtronDocLink={devtronDocLink}
                        />
                    </p>
                </div>

                <Collapse expand={isSelected}>
                    <InfoBlock
                        description={
                            <div className="flexbox">
                                <span>Please ensure&nbsp;</span>
                                <Button
                                    dataTestId="permission-groups-link"
                                    component={ButtonComponentType.link}
                                    linkProps={{
                                        to: URLS.PERMISSION_GROUPS,
                                        target: '_blank',
                                        rel: 'noreferrer noopener',
                                    }}
                                    text="Permission Groups"
                                    endIcon={<Icon name="ic-arrow-square-out" color={null} />}
                                    size={ComponentSizeType.xxs}
                                    variant={ButtonVariantType.text}
                                />
                                <span>
                                    &nbsp;are created on Devtron with same names as Groups on &quot;
                                    {permissionGroupName}&quot;.
                                </span>
                            </div>
                        }
                    />
                </Collapse>
            </div>

            <DTSwitch
                name="sso-permissions-auto-assign"
                ariaLabel="Auto assign permission toggle"
                isChecked={isSelected}
                onChange={handleChange}
            />
        </div>
    )
}

export default AutoAssignToggleTile
