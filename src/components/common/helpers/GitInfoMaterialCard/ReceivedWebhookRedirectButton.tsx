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

import { CI_MATERIAL_EMPTY_STATE_MESSAGING } from '@Components/app/details/triggerView/Constants'
import { URLS } from '@Config/routes'
import { Button, ButtonComponentType, ButtonVariantType, noop } from '@devtron-labs/devtron-fe-common-lib'
import { useRouteMatch } from 'react-router-dom'
import { ReceivedWebhookRedirectButtonType } from './types'

export const ReceivedWebhookRedirectButton = ({ setIsWebhookBulkCI, isBulk }: ReceivedWebhookRedirectButtonType) => {
    const { url } = useRouteMatch()

    const handleClick = () => {
        setIsWebhookBulkCI(true)
    }

    return (
        <Button
            dataTestId="webhook-modal-cta"
            variant={ButtonVariantType.text}
            component={ButtonComponentType.link}
            text={CI_MATERIAL_EMPTY_STATE_MESSAGING.ReceivedWebhookRedirectText}
            linkProps={{
                to: `${url}/${URLS.WEBHOOK_MODAL}`,
            }}
            onClick={isBulk ? handleClick : noop}
        />
    )
}
