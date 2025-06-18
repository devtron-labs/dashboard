import { FeatureTitleWithInfo } from '@devtron-labs/devtron-fe-common-lib'

const renderAppGroupDescriptionContent = () =>
    'Job allows execution of repetitive tasks in a manual or automated manner. Execute custom tasks or choose from a library of preset plugins in your job pipeline.'

export const renderAdditionalJobsHeaderInfo = () => (
    <FeatureTitleWithInfo
        title="Jobs"
        docLink="JOBS"
        renderDescriptionContent={renderAppGroupDescriptionContent}
        showInfoIconTippy
    />
)
