import React from 'react'
import { ReactComponent as MegaphoneIcon } from '../../assets/icons/ic-megaphone.svg'
import { InfoColourBar } from '@devtron-labs/devtron-fe-common-lib'

export default function AnnouncementBanner({ parentClassName = '' }) {
    const message = window?._env_?.ANNOUNCEMENT_BANNER_MSG
    if (!message) {
        return null
    }

    return (
        <div className={`announcement-banner-container ${parentClassName}`}>
            <InfoColourBar
                message={message}
                classname="announcement-bar fw-6 lh-20"
                Icon={MegaphoneIcon}
                iconSize={20}
            />
        </div>
    )
}