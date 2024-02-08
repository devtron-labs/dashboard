import React, { useState } from 'react'
import { ReactComponent as MegaphoneIcon } from '../../assets/icons/ic-megaphone.svg'
import { InfoColourBar } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { getDateInMilliseconds } from '../../Pages/GlobalConfigurations/Authorization/APITokens/authorization.utils'
import { setActionWithExpiry } from './helpers/Helpers'

export default function AnnouncementBanner({ parentClassName = '', isCDMaterial = false }) {
 
    const message = window?._env_?.ANNOUNCEMENT_BANNER_MSG
    const showAnnouncementBanner = (): boolean => {
        const expiryDateOfHidingAnnouncementBanner: string =   typeof Storage !== 'undefined' && localStorage.getItem(
            //it will store date and time of next day i.e, it will hide banner until this date
            'expiryDateOfHidingAnnouncementBanner',
        )
        const showAnnouncementBannerNextDay: boolean =
            typeof Storage !== 'undefined' &&
            getDateInMilliseconds(localStorage.getItem('dashboardLoginTime')) >
                getDateInMilliseconds(expiryDateOfHidingAnnouncementBanner)

        if (showAnnouncementBannerNextDay && !expiryDateOfHidingAnnouncementBanner) {
            return true
        }

        return getDateInMilliseconds(new Date().valueOf()) > getDateInMilliseconds(expiryDateOfHidingAnnouncementBanner)
    }

    const [showAnouncementBanner, setshowAnouncementBanner] = useState(message ? showAnnouncementBanner() : false)

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
                {isCDMaterial ? (
                    null
                ) : (
                    <Close className="icon-dim-20 ml-8 fcn-9" onClick={onClickCloseAnnouncememtBanner} />
                )}
            </div>
        )
    }

    return (showAnouncementBanner || isCDMaterial) ? (
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
