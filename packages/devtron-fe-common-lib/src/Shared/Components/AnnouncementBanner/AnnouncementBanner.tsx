/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState } from 'react'
import { InfoColourBar } from '../../../Common'
import { ReactComponent as MegaphoneIcon } from '../../../Assets/Icon/ic-megaphone.svg'
import { ReactComponent as Close } from '../../../Assets/Icon/ic-close.svg'
import { setActionWithExpiry, getDateInMilliseconds } from '../Header/utils'

interface AnnouncementBannerType {
    parentClassName?: string
    isCDMaterial?: boolean
}

const AnnouncementBanner = ({ parentClassName = '', isCDMaterial = false }: AnnouncementBannerType) => {
    const message = window?._env_?.ANNOUNCEMENT_BANNER_MSG
    const showAnnouncementBanner = (): boolean => {
        const expiryDateOfHidingAnnouncementBanner: string =
            typeof Storage !== 'undefined' &&
            localStorage.getItem(
                // it will store date and time of next day i.e, it will hide banner until this date
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

    const renderAnnouncementBanner = () => (
        <div className="flex">
            <div>{message}</div>
            {isCDMaterial ? null : (
                <Close className="icon-dim-20 ml-8 fcn-9" onClick={onClickCloseAnnouncememtBanner} />
            )}
        </div>
    )

    return showAnouncementBanner || isCDMaterial ? (
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

export default AnnouncementBanner
