import React from 'react'
import { ReactComponent as DeleteCross } from '../../assets/icons/ic-cross.svg'
import { CreateHeaderDetailsType } from './types'

export default function CreateHeaderDetails({
    index,
    headerData,
    setHeaderData,
    removeHeader,
}: CreateHeaderDetailsType) {

    const deleteHeader = (e): void => {
        e.stopPropagation()
        removeHeader(index)
    }

    const handleInputChange = (e): void => {
        const _headerData = { ...headerData }
        _headerData[e.target.name] = e.target.value
        setHeaderData(index, _headerData)
    }

    return (
        <div className="flexbox mb-8">
            <input
                className="form__input tag-input pt-4-imp pb-4-imp fs-13 dc__no-right-radius"
                value={headerData?.["key"]}
                name="key"
                onChange={handleInputChange}
                placeholder="Enter key"
                data-testid={`header-key-${index}`}
            />
            <input
                className="form__input tag-input pt-4-imp pb-4-imp fs-13 dc__no-border-radius dc__no-right-border dc__no-left-border"
                value={headerData?.["value"]}
                name="value"
                onChange={handleInputChange}
                placeholder="Enter-value"
                data-testid={`header-value-${index}`}
            />

            <div className="dc__border pl-4 pr-4 dc__right-radius-4 pointer flex top" onClick={deleteHeader} data-testid={`delete-header-${index}`}>
                <DeleteCross className="icon-dim-20 mt-4" />
            </div>
        </div>
    )
}
