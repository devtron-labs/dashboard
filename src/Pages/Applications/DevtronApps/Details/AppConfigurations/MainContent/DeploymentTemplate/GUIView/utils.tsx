import { GUIViewProps } from './types'

export const makeObjectFromJsonPathArray = (index: number, paths: string[]) => {
    if (index >= paths.length) {
        return {
            'ui:widget': 'hidden',
        }
    }
    if (paths[index] === '$') {
        return makeObjectFromJsonPathArray(index + 1, paths)
    }
    const key = paths[index]
    const isKeyNumber = !Number.isNaN(Number(key)) || key === '*'
    if (isKeyNumber) {
        return { items: makeObjectFromJsonPathArray(index + 1, paths) }
    }
    return { [key]: makeObjectFromJsonPathArray(index + 1, paths) }
}

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
