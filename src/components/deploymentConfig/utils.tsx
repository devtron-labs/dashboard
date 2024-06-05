import React from 'react'

export const getRenderActionButton = (changeEditorMode) => {
    return () => (
        <button
            type="button"
            className="dc__unset-button-styles"
            onClick={changeEditorMode}
            data-testid="base-deployment-template-switchtoadvanced-button"
        >
            <span className="cb-5 cursor fw-6">Switch to Advanced</span>
        </button>
    )
}
