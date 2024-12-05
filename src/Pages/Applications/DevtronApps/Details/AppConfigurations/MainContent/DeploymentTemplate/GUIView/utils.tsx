import { GUIViewProps } from './types'

export const getRenderActionButton =
    ({ handleChangeToYAMLMode }: Pick<GUIViewProps, 'handleChangeToYAMLMode'>) =>
    () => (
        <button
            type="button"
            className="dc__unset-button-styles"
            onClick={handleChangeToYAMLMode}
            data-testid="base-deployment-template-switchtoadvanced-button"
        >
            <span className="cb-5 cursor fw-6">Switch to Advanced</span>
        </button>
    )
