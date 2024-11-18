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
