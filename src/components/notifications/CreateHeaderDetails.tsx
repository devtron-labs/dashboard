import React, { useRef } from 'react'
import { ReactComponent as DeleteCross } from '../../assets/icons/ic-cross.svg'
import {
    KEY_VALUE,
    stopPropagation,
} from '@devtron-labs/devtron-fe-common-lib'
import { CreateHeaderDetailsType } from './types'
import { HeaderValueSelector } from './HeaderValueSelector'

export default function CreateTagDetails({
    index,
    headerData,
    setHeaderData,
    removeHeader,
    headerIndex = 1,
}: CreateHeaderDetailsType) {
    
    const deleteHeader = (e): void => {
        e.stopPropagation()
        removeHeader(index)
    }

    return (
        <div className="flexbox mb-8">
            
            <HeaderValueSelector
                selectedHeaderIndex={index}
                headerData={headerData}
                setHeaderData={setHeaderData}
                headerInputType={KEY_VALUE.KEY}
                placeholder="Enter key"
                headerIndex={headerIndex - 1}
            />
            <HeaderValueSelector
                selectedHeaderIndex={index}
                headerData={headerData}
                setHeaderData={setHeaderData}
                headerInputType={KEY_VALUE.VALUE}
                placeholder="Enter value"
                headerIndex={headerIndex - 1}
            />
            
            <div className="dc__border pl-4 pr-4 dc__right-radius-4 pointer flex top" onClick={deleteHeader} data-testid={`delete-header-${index}`}>
                <DeleteCross className="icon-dim-20 mt-4" />
            </div>
        </div>
    )
}
