import React, { useRef } from 'react'
import { ReactComponent as DeleteCross } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as InjectTag } from '../../../../assets/icons/inject-tag.svg'
import { KEY_VALUE } from '../../../../config'
import { stopPropagation } from '../../../common'
import { TagDetailType } from '../../types'
import TagLabelValueSelector from './TagLabelValueSelector'

export default function TagDetails({ index, tagData, setTagData, removeTag, tabIndex = 1 }: TagDetailType) {
    const keyRef = useRef(null)
    const valueRef = useRef(null)

    const deleteTag = (e): void => {
        stopPropagation(e)
        removeTag(index)
    }
    const propagateTagToResource = (): void => {
        const _tagData = { ...tagData }
        _tagData.propagate = !_tagData.propagate
        setTagData(index, _tagData)
    }
    return (
        <div className="flexbox mb-8">
            <div
                className={`dc__border h-30 pl-4 pr-4 br-4 mr-8 pointer ${tagData.propagate ? 'bcn-7' : ''}`}
                onClick={propagateTagToResource}
            >
                <InjectTag className={`icon-dim-20 mt-4 ${tagData.propagate ? 'scn-0' : ''}`} />
            </div>
            <TagLabelValueSelector
                selectedTagIndex={index}
                tagData={tagData}
                setTagData={setTagData}
                tagInputType={KEY_VALUE.KEY}
                placeholder="Enter key"
                tabIndex={tabIndex - 1}
                refVar={keyRef}
                dependentRef={valueRef}
            />
            <TagLabelValueSelector
                selectedTagIndex={index}
                tagData={tagData}
                setTagData={setTagData}
                tagInputType={KEY_VALUE.VALUE}
                placeholder="Enter value"
                tabIndex={tabIndex}
                refVar={valueRef}
                dependentRef={keyRef}
            />
            <div className="dc__border pl-4 pr-4 dc__right-radius-4 pointer flex top" onClick={deleteTag}>
                <DeleteCross className="icon-dim-20 mt-4" />
            </div>
        </div>
    )
}
