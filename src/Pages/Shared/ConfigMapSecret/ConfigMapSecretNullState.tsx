import { generatePath, useRouteMatch } from 'react-router-dom'

import { Button, ButtonComponentType, GenericEmptyState, ImageType } from '@devtron-labs/devtron-fe-common-lib'

import EmptyFolder from '@Images/empty-folder.webp'
import EmptyStateImg from '@Images/cm-cs-empty-state.png'
import { ReactComponent as ICAdd } from '@Icons/ic-add.svg'

import { CM_SECRET_EMPTY_STATE_TEXT, getCMSecretNullStateText } from './constants'
import { ConfigMapSecretNullStateProps } from './types'

export const ConfigMapSecretNullState = ({
    componentType,
    componentName,
    nullStateType,
}: ConfigMapSecretNullStateProps) => {
    // HOOKS
    const { path, params } = useRouteMatch()

    const noCMSecretPresent = nullStateType === 'NO_CM_CS'

    return (
        <GenericEmptyState
            {...getCMSecretNullStateText(componentType, componentName)[nullStateType]}
            image={noCMSecretPresent ? EmptyStateImg : EmptyFolder}
            classname="cm-cs-empty-state"
            imageType={ImageType.Large}
            isButtonAvailable={noCMSecretPresent}
            renderButton={() => (
                <Button
                    dataTestId="cm-cs-empty-state-btn"
                    component={ButtonComponentType.link}
                    startIcon={<ICAdd />}
                    text={CM_SECRET_EMPTY_STATE_TEXT[componentType].buttonText}
                    linkProps={{
                        to: generatePath(path, { ...params, name: 'create' }),
                    }}
                />
            )}
        />
    )
}
