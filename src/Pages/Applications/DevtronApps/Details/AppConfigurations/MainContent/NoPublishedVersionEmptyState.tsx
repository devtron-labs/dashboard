import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import noArtifact from '@Images/no-artifact@2x.png'

const NoPublishedVersionEmptyState = () => (
    <GenericEmptyState
        image={noArtifact}
        title="No published version"
        subTitle="Published override for this file does not exist"
    />
)

export default NoPublishedVersionEmptyState
