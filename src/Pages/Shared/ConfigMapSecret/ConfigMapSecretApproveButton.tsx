import {
    Button,
    ButtonStyleType,
    ComponentSizeType,
    DraftState,
    useUserEmail,
} from '@devtron-labs/devtron-fe-common-lib'

import { hasApproverAccess, importComponentFromFELibrary } from '@Components/common'

import { hasHashiOrAWS } from './utils'
import { ConfigMapSecretApproveButtonProps } from './types'

const ApproveRequestTippy = importComponentFromFELibrary('ApproveRequestTippy', null, 'function')

export const ConfigMapSecretApproveButton = ({
    componentName,
    configMapSecretData,
    draftData,
    parentName,
    updateCMSecret,
}: ConfigMapSecretApproveButtonProps) => {
    // HOOKS
    const { email } = useUserEmail()

    // CONSTANTS
    const isHashiOrAWS = configMapSecretData && hasHashiOrAWS(configMapSecretData.externalType)

    // Return `null` if draftState is not AwaitApproval
    if (isHashiOrAWS || draftData.draftState !== DraftState.AwaitApproval || !ApproveRequestTippy) {
        return null
    }

    const hasAccess = hasApproverAccess(email, draftData.approvers)

    return (
        <footer className="py-12 px-16 dc__border-top-n1 flex left dc__gap-12 configmap-secret-container__approval-tippy">
            {draftData.canApprove && hasAccess ? (
                <ApproveRequestTippy
                    draftId={draftData.draftId}
                    draftVersionId={draftData.draftVersionId}
                    resourceName={componentName}
                    reload={updateCMSecret}
                    envName={parentName}
                >
                    <Button
                        dataTestId="cm-secret-approve-btn"
                        text="Approve Changes"
                        size={ComponentSizeType.medium}
                        style={ButtonStyleType.positive}
                    />
                </ApproveRequestTippy>
            ) : (
                <Button
                    dataTestId="cm-secret-approve-btn"
                    text="Approve Changes"
                    size={ComponentSizeType.medium}
                    style={ButtonStyleType.positive}
                    disabled
                    showTooltip
                    tooltipProps={{
                        placement: 'top-end',
                        content: hasAccess
                            ? 'You have made changes to this file. Users who have edited cannot approve the changes.'
                            : 'You do not have permission to approve configuration changes for this application - environment combination.',
                    }}
                />
            )}
        </footer>
    )
}
