import React, { useState } from 'react'

export function ResizableTextArea({ className, defaultRows, value, onChange, onBlur, placeholder }) {
    const [rows, setRows] = useState(defaultRows)
    const handleChange = (event) => {
        reInitRows(event)
        onChange(event)
    }
    const reInitRows = (event) => {
        const textareaLineHeight = 28
        event.target.rows = defaultRows // reset number of rows in textarea
        const currentRows = ~~(event.target.scrollHeight / textareaLineHeight)
        if (currentRows !== rows) {
            setRows(currentRows)
        }
    }
    const handleOnBlur = (event) => {
        setRows(defaultRows)
        onBlur(event)
    }
    return (
        <textarea
            rows={rows}
            value={value}
            placeholder={placeholder}
            className={`${className || ''} lh-28`}
            style={{ resize: 'none' }}
            onChange={handleChange}
            onBlur={handleOnBlur}
            onFocus={reInitRows}
        />
    )
}
