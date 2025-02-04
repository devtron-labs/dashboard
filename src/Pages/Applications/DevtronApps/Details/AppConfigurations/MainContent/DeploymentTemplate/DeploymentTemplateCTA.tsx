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

import {
    BaseURLParams,
    Button,
    ComponentSizeType,
    DTApplicationMetricsFormField,
    InvalidYAMLTippyWrapper,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import { ReactComponent as ICArrowRight } from '@Icons/ic-arrow-right.svg'
import { DeploymentTemplateCTAProps } from './types'

// For protect we will have a separate component
const DeploymentTemplateCTA = ({
    isLoading,
    isDisabled,
    isAppMetricsEnabled,
    showApplicationMetrics,
    selectedChart,
    isCiPipeline,
    handleSave,
    toggleAppMetrics,
    parsingError,
    restoreLastSavedYAML,
    isDryRunView,
}: DeploymentTemplateCTAProps) => {
    const { envId } = useParams<BaseURLParams>()

    const renderAppMetrics = () => {
        if (isDryRunView) {
            return (
                <DTApplicationMetricsFormField
                    isAppMetricsEnabled={isAppMetricsEnabled}
                    showApplicationMetrics={showApplicationMetrics}
                    onlyShowCurrentStatus
                />
            )
        }

        return (
            <DTApplicationMetricsFormField
                showApplicationMetrics={showApplicationMetrics}
                isLoading={isLoading}
                selectedChart={selectedChart}
                isDisabled={isDisabled}
                toggleAppMetrics={toggleAppMetrics}
                isAppMetricsEnabled={isAppMetricsEnabled}
                parsingError={parsingError}
                restoreLastSavedYAML={restoreLastSavedYAML}
            />
        )
    }

    return (
        <footer className="flexbox dc__content-space p-12 bg__primary dc__border-top dc__align-items-center">
            <div
                className={`flexbox ${showApplicationMetrics ? 'dc__content-space' : 'dc__content-end'} dc__align-items-center flex-grow-1`}
            >
                {renderAppMetrics()}

                <InvalidYAMLTippyWrapper parsingError={parsingError} restoreLastSavedYAML={restoreLastSavedYAML}>
                    <div>
                        <Button
                            dataTestId={
                                !envId && !isCiPipeline
                                    ? 'base-deployment-template-save-and-next-button'
                                    : 'base-deployment-template-save-changes-button'
                            }
                            disabled={isDisabled}
                            onClick={handleSave}
                            isLoading={isLoading}
                            text={!envId && !isCiPipeline ? 'Save & Next' : 'Save changes'}
                            endIcon={
                                !envId && !isCiPipeline ? (
                                    <ICArrowRight
                                        className={`icon-dim-16 dc__no-shrink ${isDisabled ? 'scn-4' : 'scn-0'}`}
                                    />
                                ) : null
                            }
                            size={ComponentSizeType.medium}
                        />
                    </div>
                </InvalidYAMLTippyWrapper>
            </div>
        </footer>
    )
}

export default DeploymentTemplateCTA
