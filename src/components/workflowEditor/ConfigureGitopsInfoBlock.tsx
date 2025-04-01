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
