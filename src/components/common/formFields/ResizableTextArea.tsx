import React, { useState } from 'react'

export function ResizableTextArea({ className, defaultRows, value, onChange, onBlur, placeholder }) {
    const [rows, setRows] = useState(defaultRows)
    const handleChange = (event) => {
        reInitRows(event)
        onChange(event)
    }
    const reInitRows = (event) => {
        const textareaLineHeight = 28
        const previousRows = event.target.rows
        event.target.rows = defaultRows
        const currentRows = ~~(event.target.scrollHeight / textareaLineHeight)
        if (currentRows === previousRows) {
            event.target.rows = currentRows
        }
        if (currentRows >= 4) {
            event.target.rows = 4
            event.target.scrollTop = event.target.scrollHeight
        }
        setRows(currentRows)
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
            className={`${className || ''} mh-30 lh-20`}
            style={{ resize: 'none' }}
            onChange={handleChange}
            onBlur={handleOnBlur}
            onFocus={reInitRows}
        />
    )
}
