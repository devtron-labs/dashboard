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

import { InfoBlockVariant } from '@devtron-labs/devtron-fe-common-lib'

import { AnnouncementConfigTypes } from './types'
import { getValidAnnouncementType } from './utils'

export enum BannerVariant {
    INTERNET_CONNECTIVITY = 'INTERNET_CONNECTIVITY',
    VERSION_UPDATE = 'VERSION_UPDATE',
    ANNOUNCEMENT = 'ANNOUNCEMENT',
    LICENSE = 'LICENSE',
}

export const ANNOUNCEMENT_CONFIG: AnnouncementConfigTypes = {
    message: window._env_.ANNOUNCEMENT_BANNER_MSG,
    type: getValidAnnouncementType(window._env_.ANNOUNCEMENT_BANNER_TYPE)
        ? window._env_.ANNOUNCEMENT_BANNER_TYPE
        : InfoBlockVariant.HELP,
    buttonText: window._env_.ANNOUNCEMENT_BANNER_BUTTON_TEXT,
    buttonLink: window._env_.ANNOUNCEMENT_BANNER_BUTTON_LINK,
}

export const ONLINE_BANNER_TIMEOUT = 3000 // online banner timeout
