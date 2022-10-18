import React from 'react'
import InfoColourBar from './infocolourBar/InfoColourbar'
import { ReactComponent as MegaphoneIcon } from '../../assets/icons/ic-megaphone.svg'

export default function AnnouncementBanner({ parentClassName = '' }) {
    return (
        <div className={`announcement-banner-container ${parentClassName}`}>
            <InfoColourBar
                message="AVOID DEPLOYING non critical changes to production between 21st to 31st Oct 2022"
                classname="announcement-bar fw-6 lh-20"
                Icon={MegaphoneIcon}
                iconSize={20}
            />
        </div>
    )
}
