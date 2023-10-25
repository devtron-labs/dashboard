import React, {useState } from 'react'
import { ReactComponent as EditIcon } from '../../../assets/icons/ic-pencil.svg'


export default function EditableTextArea({ placeholder, rows, updateContentFunction, intialText = '' }) {
    const [text, setText] = useState(intialText)
    const [editable, setEditable] = useState(false)

    const handleCancelEdit = () => {
        setText(intialText)
        setEditable(!editable)
    }
    const handleSaveContent = () => {
        updateContentFunction(text).then(()=>{
            setEditable(!editable)
        }).catch(()=>{
            //keep editable true
        })
    }
    return (
        <>
            {editable ? (
                <div className="flexbox-col flex-grow-1 dc__gap-12">
                    <textarea
                        rows={rows}
                        placeholder={placeholder}
                        value={text}
                        className="dc__border br-2"
                        style={{ resize: 'vertical' }}
                        onChange={(e) => {
                            setText(e.target.value)
                        }}
                    />
                    <div className="flex dc__gap-12 ml-auto">
                        <button className="bcn-0 dc__border br-4 pt-5 pr-12 pb-5 pl-12 cn-7" onClick={handleCancelEdit}>
                            Cancel
                        </button>
                        <button
                            className="bcb-5 pt-5 pr-12 pb-5 pl-12 cn-0 fw-6 fs-12 dc__no-border br-4"
                            onClick={handleSaveContent}
                        >
                            Save
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flexbox flex-justify dc__gap-10">
                    <div className="fs-13 fw-4 lh-20 cn-9">{text}</div>
                    <EditIcon className="icon-dim-16 cursor mw-16" onClick={() => setEditable(!editable)} />
                </div>
            )}
        </>
    )
}
