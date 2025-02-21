import { URLS } from '@Config/routes'
import { ButtonComponentType, ButtonProps, ButtonVariantType, InfoBlock } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICArrowRight } from '@Icons/ic-arrow-right.svg'

export const getConfigureGitOpsCredentialsButtonProps = ({
    size,
    style,
}: Pick<ButtonProps, 'size' | 'style'>): ButtonProps<ButtonComponentType.link> => ({
    dataTestId: 'configure-gitops-credentials',
    size,
    style,
    variant: ButtonVariantType.text,
    text: 'Configure',
    endIcon: <ICArrowRight />,
    component: ButtonComponentType.link,
    linkProps: {
        to: URLS.GLOBAL_CONFIG_GITOPS,
    },
})

export const ConfigureGitopsInfoBlock = () => (
    <InfoBlock
        variant="error"
        heading="GitOps credentials not configured"
        description="GitOps credentials is required to deploy applications via GitOps"
        buttonProps={getConfigureGitOpsCredentialsButtonProps({})}
    />
)
