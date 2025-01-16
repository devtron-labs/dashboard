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

import React from 'react'
import { FeatureTitleWithInfo, SearchBar } from '@devtron-labs/devtron-fe-common-lib'
import { validator } from './utils'
import { DescriptorProps } from './types'
import { importComponentFromFELibrary, HiddenInput } from '../common'
import { ReadFileAs } from '../common/hooks/types'
import { ReactComponent as ICUpload } from '../../assets/icons/ic-upload-blue.svg'
import { ReactComponent as ICSearch } from '../../assets/icons/ic-search.svg'
import { HEADER_TEXT } from '@Config/constants'

export default function Descriptor({ children, showUploadButton, readFile, searchKey, onSearch }: DescriptorProps) {
    const handleReUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (readFile) {
            readFile(e.target.files![0], validator, ReadFileAs.TEXT)
        }
    }

    const additonalTippyContent = importComponentFromFELibrary('scopedVariablesHelpTippyText')

    return (
        <>
            <div
                className={`scoped-variables-descriptor flex column dc__align-self-stretch bg__primary dc__content-space dc__align-start pl-20 pr-20 pt-16 ${
                    children ? ' dc__no-bottom-border pb-8' : ' dc__border-bottom pb-16 '
                }}`}
            >
                <div className="flex dc__gap-8 w-100 dc__content-space">
                    <FeatureTitleWithInfo
                        title={HEADER_TEXT.SCOPED_VARIABLES.title}
                        renderDescriptionContent={() =>
                            additonalTippyContent ? null : HEADER_TEXT.SCOPED_VARIABLES.description
                        }
                        additionalContent={additonalTippyContent?.()}
                        docLink={HEADER_TEXT.SCOPED_VARIABLES.docLink}
                        showInfoIconTippy
                    />

                    <div className="flex dc__gap-12">
                        {onSearch && (
                            <SearchBar
                                containerClassName="w-250"
                                dataTestId="search-by-variable-name"
                                initialSearchText={searchKey}
                                inputProps={{
                                    placeholder: 'Search',
                                }}
                                handleEnter={onSearch}
                            />
                        )}

                        {showUploadButton && (
                            <button
                                className="descriptor-container__upload-button bcb-5 cn-0 flexbox center p-0 dc__no-border dc__outline-none-imp dc__gap-6 dc__border-radius-4-imp mw-56"
                                type="button"
                            >
                                <HiddenInput handleFileUpload={handleReUpload} id="descriptor-variables-input">
                                    <div className="flex dc__gap-6 center pt-6 pr-10 pb-6 pl-8">
                                        <ICUpload width={14} height={14} className="scn-0" />
                                        <p className="fs-13 fw-6 lh-20 m-0">Upload new file to replace</p>
                                    </div>
                                </HiddenInput>
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {children}
        </>
    )
}
