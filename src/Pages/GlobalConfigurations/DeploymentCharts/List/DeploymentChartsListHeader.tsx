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

import { getDocumentationUrl, InfoIconTippy, SearchBar } from '@devtron-labs/devtron-fe-common-lib'

import { CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT, DOCUMENTATION } from '@Config/constants'

import { DeploymentChartsListHeaderProps } from '../types'
import UploadButton from './UploadButton'

const DeploymentChartsListHeader = ({
    handleOpenUploadChartModal,
    handleSearch,
    searchKey,
}: DeploymentChartsListHeaderProps) => (
    <div className="flexbox dc__content-space px-20">
        <div className="flex dc__gap-8">
            <h2 className="cn-9 fw-6 fs-16 lh-32 m-0">{CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT.heading}</h2>
            <InfoIconTippy
                heading={CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT.heading}
                infoText={CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT.infoText}
                additionalContent={
                    <p className="p-12 fs-13 fw-4 lh-20">
                        {CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT.additionalParagraphText}
                    </p>
                }
                documentationLinkText={CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT.documentationLinkText}
                documentationLink={getDocumentationUrl(DOCUMENTATION.GLOBAL_CONFIG_CUSTOM_CHART)}
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
