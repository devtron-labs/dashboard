import React from 'react'
import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { Link } from 'react-router-dom'
import nullStateImage from '../../../../../assets/img/empty-applist@2x.png'
import { ReactComponent as AddIcon } from '../../../../../assets/icons/ic-add.svg'
import { EMPTY_STATE_STATUS } from '../../../../../config/constantMessaging'
import { URLS } from '../../../../../config'

const NoPermissionGroups = () => {
    const renderAddGroupButton = () => (
        <Link
            type="button"
            to={`${URLS.GLOBAL_CONFIG_AUTH_PERMISSION_GROUPS}/add`}
            role="button"
            className="cta dc__gap-4 flex h-32 anchor"
        >
            <AddIcon />
            Add group
        </Link>
    )

    return (
        <GenericEmptyState
            image={nullStateImage}
            title={EMPTY_STATE_STATUS.NO_GROUPS.TITLE}
            subTitle={EMPTY_STATE_STATUS.NO_GROUPS.SUBTITLE}
            isButtonAvailable
            renderButton={renderAddGroupButton}
            classname="flex-grow-1"
        />
    )
}

export default NoPermissionGroups
