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

import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import notFound from '../../assets/img/page-not-found.png'
import { ERROR_EMPTY_SCREEN } from '../../config/constantMessaging'
import { EnvType } from '../v2/appDetails/appDetails.type'

interface AppDetailsEmptyChart {
    envType?: string
}

export const AppDetailsEmptyState = ({ envType }: AppDetailsEmptyChart) => {
    return (
        <GenericEmptyState
            image={notFound}
            classname="w-100 dc__text-center "
            heightToDeduct={300}
            title={ERROR_EMPTY_SCREEN.APP_NOT_AVAILABLE}
            subTitle={
                <>
                    {ERROR_EMPTY_SCREEN.DEPLOYMENT_NOT_EXIST}
                    {envType === EnvType.APPLICATION && ERROR_EMPTY_SCREEN.SELECT_ANOTHER_ENVIRONMENT}
                </>
            }
        />
    )
}
