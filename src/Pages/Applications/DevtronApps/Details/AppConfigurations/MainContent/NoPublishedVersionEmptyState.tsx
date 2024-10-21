import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import noArtifact from '@Images/no-artifact@2x.png'

import { NoPublishedVersionEmptyStateProps } from './types'

const NoPublishedVersionEmptyState = ({ isOverride = true }: NoPublishedVersionEmptyStateProps) => (
    <GenericEmptyState
        image={noArtifact}
        title="No published version"
        subTitle={`Published ${isOverride ? 'override' : ''} for this file does not exist`}
    />
)

export default NoPublishedVersionEmptyState
