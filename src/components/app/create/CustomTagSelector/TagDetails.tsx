import React from 'react'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as InjectTag } from '../../../../assets/icons/inject-tag.svg'

export default function TagDetails() {
    return (
        <div className="flexbox mb-8">
            <InjectTag className="icon-dim-20 mt-4 mr-8 min-w-20" />
            <input type="text" className="form__input h-28 dc__no-right-radius" />
            <input type="text" className="form__input h-28 dc__no-left-radius dc__no-left-border" />
            <Close className="icon-dim-20 mt-4 min-w-20" />
        </div>
    )
}
