import { URLS } from '@Config/routes'
import { ButtonComponentType, ButtonVariantType, InfoBlock } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICArrowRight } from '@Icons/ic-arrow-right.svg'

export const ConfigureGitopsInfoBlock = () => (
    <InfoBlock
        variant="error"
        heading="GitOps credentials not configured"
        description="GitOps credentials is required to deploy applications via GitOps"
        buttonProps={{
            dataTestId: 'configure-gitops-credentials',
            variant: ButtonVariantType.text,
            text: 'Configure',
            endIcon: <ICArrowRight />,
            component: ButtonComponentType.link,
            linkProps: {
                to: URLS.GLOBAL_CONFIG_GITOPS,
            },
        }}
    />
)
