import React, { useEffect, useState } from 'react'
import { ReactComponent as MegaphoneIcon } from '../../assets/icons/ic-megaphone.svg'
import { InfoColourBar } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { getDateInMilliseconds } from '../apiTokens/authorization.utils'
import { setActionWithExpiry } from './helpers/Helpers'

export default function AnnouncementBanner({ parentClassName = '' }) {
    const isAnouncementBanner = (): boolean => {
        if (!localStorage.getItem('expiryDateOfHidingAnnouncementBanner')) {
            return true
        }

        return (
            getDateInMilliseconds(new Date().valueOf()) >
            getDateInMilliseconds(localStorage.getItem('expiryDateOfHidingAnnouncementBanner'))
        )
    }
    const message = window?._env_?.ANNOUNCEMENT_BANNER_MSG
    const [showAnouncementBanner, setshowAnouncementBanner] = useState(message ? isAnouncementBanner() : false)
   
    if (!message) {
        return null
    }

    const onClickCloseAnnouncememtBanner = () => {
        setshowAnouncementBanner(false)
        if (typeof Storage !== 'undefined') {
            setActionWithExpiry('expiryDateOfHidingAnnouncementBanner', 1)
        }
    }

    const renderAnnouncementBanner = () => {
        return (
            <div className="flex">
                <div>{message}</div>
                <Close className="icon-dim-20 ml-8 fcn-9" onClick={onClickCloseAnnouncememtBanner} />
            </div>
        )
    }

    return showAnouncementBanner ? (
        <div className={`announcement-banner-container ${parentClassName}`}>
            <InfoColourBar
                message={renderAnnouncementBanner()}
                classname="announcement-bar fw-6 lh-20"
                Icon={MegaphoneIcon}
                iconSize={20}
            />
        </div>
    ) : null
}
