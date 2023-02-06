import React from 'react'
import PropagateTagInfo from '../create/CustomTagSelector/PropagateTagInfo'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import TagDetails from '../create/CustomTagSelector/TagDetails'
import { TagLabelSelectType } from '../types'
import { DEFAULT_TAG_DATA } from '../config'

export default function TagLabelSelect({ isCreateApp, labelTags, setLabelTags, tabIndex = 0 }: TagLabelSelectType) {
    const setTagData = (index, tagValue): void => {
        const _tags = [...labelTags]
        _tags[index] = tagValue
        setLabelTags(_tags)
    }

    const addNewTag = (): void => {
        const _tags = [...labelTags]
        _tags.splice(0, 0, DEFAULT_TAG_DATA)
        setLabelTags(_tags)
    }

    const removeTag = (index: number): void => {
        const _tags = [...labelTags]
        _tags.splice(index, 1)
        setLabelTags(_tags)
    }

    return (
        <div>
            <div className="flexbox dc__content-space mb-8">
                <span>Tags</span>
                <PropagateTagInfo isCreateApp={isCreateApp} />
            </div>
            <div>
                <div className="dc_width-max-content cb-5 fw-6 fs-13 flexbox mr-20 mb-8 cursor" onClick={addNewTag}>
                    <Add className="icon-dim-20 fcb-5" /> Add tag
                </div>
                <div className="mb-8">
                    {labelTags?.map((tagData, index) => (
                        <TagDetails
                            key={`tag-${index}`}
                            index={index}
                            tagData={tagData}
                            setTagData={setTagData}
                            removeTag={removeTag}
                            tabIndex={tabIndex + (index + 2)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
