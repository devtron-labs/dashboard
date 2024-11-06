import { CI_MATERIAL_EMPTY_STATE_MESSAGING } from '@Components/app/details/triggerView/Constants'
import { URLS } from '@Config/routes'
import { Button, ButtonVariantType } from '@devtron-labs/devtron-fe-common-lib'
import { useHistory, useRouteMatch } from 'react-router-dom'

export const ReceivedWebhookRedirectButton = () => {
    const { url } = useRouteMatch()
    const { push } = useHistory()

    const onClickRedirectToWebhookModal = () => {
        push(`${url}/${URLS.WEBHOOK_MODAL}`)
    }
    return (
        <Button
            dataTestId="webhook-modal-cta"
            onClick={onClickRedirectToWebhookModal}
            text={CI_MATERIAL_EMPTY_STATE_MESSAGING.ReceivedWebhookRedirectText}
            variant={ButtonVariantType.text}
        />
    )
}
