import { RadioGroup, RadioGroupItem } from '@devtron-labs/devtron-fe-common-lib'

import { BITBUCKET_CLOUD_AUTH_MODE_OPTIONS } from './constants'
import type { BitbucketCloudAuthSelectorProps } from './gitops.type'

const BitbucketCloudAuthSelector = ({ authMode, handleAuthModeChange }: BitbucketCloudAuthSelectorProps) => (
    <RadioGroup
        className="radio-group-no-border"
        name="toggle-bitbucket-cloud-auth-mode"
        value={authMode}
        onChange={handleAuthModeChange}
    >
        {BITBUCKET_CLOUD_AUTH_MODE_OPTIONS.map((option) => (
            <RadioGroupItem key={option.value} value={option.value}>
                {option.label}
            </RadioGroupItem>
        ))}
    </RadioGroup>
)

export default BitbucketCloudAuthSelector
