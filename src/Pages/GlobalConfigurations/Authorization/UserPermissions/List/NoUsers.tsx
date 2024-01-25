import React from 'react'
import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { Link } from 'react-router-dom'
import nullStateImage from '../../../../../assets/img/empty-applist@2x.png'
import { ReactComponent as AddIcon } from '../../../../../assets/icons/ic-add.svg'
import { EMPTY_STATE_STATUS } from '../../../../../config/constantMessaging'
import { URLS } from '../../../../../config'

const renderAddUserButton = () => (
    <Link
        type="button"
        to={`${URLS.GLOBAL_CONFIG_AUTH_USER_PERMISSION}/add`}
        role="button"
        className="cta dc__gap-4 flex h-32 anchor"
    >
        <AddIcon />
        Add user
    </Link>
)

const NoUsers = () => (
    <GenericEmptyState
        image={nullStateImage}
        title={EMPTY_STATE_STATUS.NO_USER.TITLE}
        subTitle={EMPTY_STATE_STATUS.NO_USER.SUBTITLE}
        isButtonAvailable
        renderButton={renderAddUserButton}
        classname="flex-grow-1"
    />
)

export default NoUsers
