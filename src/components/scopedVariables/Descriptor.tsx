import React from 'react'
import { TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import SearchBar from './DescriptorSearchBar'
import { validator } from './utils'
import { DescriptorProps } from './types'
import { importComponentFromFELibrary, HiddenInput } from '../common'
import { ReadFileAs } from '../common/hooks/types'
import { ReactComponent as ICHelpOutline } from '../../assets/img/ic-help-outline.svg'
import { ReactComponent as QuestionFilled } from '../../assets/icons/ic-help.svg'
import { ReactComponent as ICUpload } from '../../assets/icons/ic-upload-blue.svg'
import { ReactComponent as ICSearch } from '../../assets/icons/ic-search.svg'
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from './constants'

export default function Descriptor({ children, showUploadButton, readFile, onSearch }: DescriptorProps) {
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
                className={`scoped-variables-descriptor flex column dc__align-self-stretch bcn-0 dc__content-space dc__align-start pl-20 pr-20 pt-16 ${
                    children ? ' dc__no-bottom-border pb-8' : ' dc__border-bottom pb-16 '
                }}`}
            >
                <div className="flex dc__gap-8 w-100 dc__content-space">
                    <div className="flex dc__gap-8">
                        <p className="cn-9 fs-16 fw-6 m-0">{DEFAULT_TITLE}</p>

                        <TippyCustomized
                            theme={TippyTheme.white}
                            className="w-300 h-100 fcv-5"
                            placement="right"
                            Icon={QuestionFilled}
                            heading={DEFAULT_TITLE}
                            infoText={additonalTippyContent ? null : DEFAULT_DESCRIPTION}
                            showCloseButton
                            trigger="click"
                            interactive
                            additionalContent={additonalTippyContent?.()}
                        >
                            <button
                                className="p-0 h-20 dc__no-background dc__no-border dc__outline-none-imp"
                                type="button"
                            >
                                <ICHelpOutline className="icon-dim-20" />
                            </button>
                        </TippyCustomized>
                    </div>

                    <div className="flex dc__gap-12">
                        {onSearch && <SearchBar onSearch={onSearch} placeholder="Search Variables" Icon={ICSearch} />}

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
