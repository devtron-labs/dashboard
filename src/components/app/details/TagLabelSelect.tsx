import React from 'react'
import PropagateTagInfo from '../create/CustomTagSelector/PropagateTagInfo'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import TagDetails from '../create/CustomTagSelector/TagDetails'

export default function TagLabelSelect({ labelTags, setLabelTags }) {
    const setTagData = (index, tagValue): void => {
        const _tags = [...labelTags]
        _tags[index] = tagValue
        setLabelTags(_tags)
    }

    const addNewTag = (): void => {
        const _tags = [...labelTags]
        _tags.unshift({
            autoGenKey: new Date().getTime(),
            key: '',
            value: '',
            propagate: false,
            isInvalidKey: false,
            isInvalidValue: false,
        })
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
                <PropagateTagInfo />
            </div>
            <div>
                <div className="dc_width-max-content cb-5 fw-6 fs-13 flexbox mr-20 mb-8 cursor" onClick={addNewTag}>
                    <Add className="icon-dim-20 fcb-5" /> Add tag
                </div>
                <div className="mb-8">
                    {labelTags?.map((tagData, index) => (
                        <TagDetails
                            key={`${tagData.autoGenKey}-${index}`}
                            index={index}
                            tagData={tagData}
                            setTagData={setTagData}
                            removeTag={removeTag}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
