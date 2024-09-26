import { CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT, DOCUMENTATION } from '@Config/constants'
import { InfoIconTippy } from '@devtron-labs/devtron-fe-common-lib'
import UploadButton from './UploadButton'
import { DeploymentChartsListHeaderProps } from '../types'

const DeploymentChartsListHeader = ({ handleOpenUploadChartModal }: DeploymentChartsListHeaderProps) => (
    <div className="flexbox dc__content-space cn-9 fw-6 fs-16">
        <div className="flex">
            {CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT.heading}
            <InfoIconTippy
                heading={CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT.heading}
                infoText={CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT.infoText}
                additionalContent={
                    <p className="p-12 fs-13 fw-4 lh-20">
                        {CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT.additionalParagraphText}
                    </p>
                }
                documentationLinkText={CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT.documentationLinkText}
                documentationLink={DOCUMENTATION.CUSTOM_CHART}
                iconClassName="icon-dim-16 fcn-6 ml-4"
            />
        </div>
        <UploadButton handleOpenUploadChartModal={handleOpenUploadChartModal} />
    </div>
)

export default DeploymentChartsListHeader
