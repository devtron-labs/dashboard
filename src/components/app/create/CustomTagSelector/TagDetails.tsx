import React from 'react'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as InjectTag } from '../../../../assets/icons/inject-tag.svg'
import TagLabelValueSelector from './TagLabelValueSelector'

export default function TagDetails() {
    return (
        <div className="flexbox mb-8">
            <div className="dc__border pl-4 pr-4 br-4 mr-8 pointer">
                <InjectTag className="icon-dim-20 mt-4" />
            </div>
            {/* <input type="text" className="form__input h-28 dc__no-right-radius" />
            <input type="text" className="form__input h-28 dc__no-left-radius dc__no-left-border" /> */}
            <TagLabelValueSelector selectedVariableIndex={0} propagateToResource={true} isRequired={true} />
            <TagLabelValueSelector selectedVariableIndex={0} />
            <div className="dc__border pl-4 pr-4 dc__right-radius-4 pointer">
                <Close className="icon-dim-20 mt-4" />
            </div>
        </div>
    )
}
