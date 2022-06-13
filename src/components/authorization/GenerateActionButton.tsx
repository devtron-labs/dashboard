import React from 'react'

function GenerateActionButton({ handleGenerateRowActionButton }) {
    return (
        <button onClick={() => handleGenerateRowActionButton('create')} className="add-link cta flex cursor">
            Generate new token
        </button>
    )
}

export default GenerateActionButton
