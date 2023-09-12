import React, { memo, useState } from 'react'
import { ReactComponent as ICHelp } from '../../../assets/icons/ic-help.svg'
import { ReactComponent as ICDown } from '../../../assets/icons/ic-chevron-down.svg'
import { SCOPED_VARIABLES_DOCUMENTATION } from './constants'

function SuggestionsInfo() {
    const [expanded, setExpanded] = useState<boolean>(false)

    const handleExpansion = () => {
        setExpanded(!expanded)
    }

    return (
        <div className="flexbox-col dc__align-self-stretch p-12 dc__gap-8 bcv-1 dc__border-top-v1">
            <div className="flexbox dc__align-self-stretch dc__align-items-center dc__content-space">
                <div className="flexbox dc__gap-8">
                    <div className="flex center">
                        <ICHelp className="icon-dim-16 fcv-5" />
                    </div>

                    <p className="m-0 fs-13 cn-9 fw-6 lh-20">How to use variable?</p>
                </div>

                <button
                    type="button"
                    className="dc__outline-none-imp dc__no-border p-0 bcv-1 flex center"
                    onClick={handleExpansion}
                >
                    {<ICDown className={`icon-dim-16 fcn-6 ${!expanded ? 'dc__flip-270' : ''}`} />}
                </button>
            </div>

            {expanded && (
                <div className="flex pl-24 dc__gap-4 flex-wrap dc__content-center">
                    <p className="m-0 fs-13 fw-4 lh-20 cn-9">{SCOPED_VARIABLES_DOCUMENTATION}</p>
                </div>
            )}
        </div>
    )
}

export default memo(SuggestionsInfo)
