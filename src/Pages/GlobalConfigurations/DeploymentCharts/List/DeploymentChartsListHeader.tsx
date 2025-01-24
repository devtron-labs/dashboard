import { CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT, DOCUMENTATION } from '@Config/constants'
import { InfoIconTippy, SearchBar } from '@devtron-labs/devtron-fe-common-lib'
import UploadButton from './UploadButton'
import { DeploymentChartsListHeaderProps } from '../types'

const DeploymentChartsListHeader = ({
    handleOpenUploadChartModal,
    handleSearch,
    searchKey,
}: DeploymentChartsListHeaderProps) => (
    <div className="flexbox dc__content-space px-20">
        <div className="flex dc__gap-8">
            <span className="cn-9 fw-6 fs-16 lh-32">{CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT.heading}</span>
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
                iconClassName="icon-dim-20 fcn-6"
            />
        </div>
        <div className="flex dc__gap-8">
            <SearchBar initialSearchText={searchKey} handleEnter={handleSearch} />
            <UploadButton handleOpenUploadChartModal={handleOpenUploadChartModal} />
        </div>
    </div>
)

export default DeploymentChartsListHeader
