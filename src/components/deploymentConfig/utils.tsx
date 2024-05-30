import React from 'react'

export const getRenderActionButton = (changeEditorMode) => {
    return () => (
        <span
            data-testid="base-deployment-template-switchtoadvanced-button"
            className="cb-5 cursor fw-6"
            onClick={changeEditorMode}
        >
            Switch to Advanced
        </span>
    )
}
