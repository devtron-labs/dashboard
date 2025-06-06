import { Icon } from '@devtron-labs/devtron-fe-common-lib'

import { CICDStepperProps } from './types'

export const CICDStepper = ({ config }: CICDStepperProps) => (
    <div className="ci-cd-pipeline__stepper-container flexbox-col flex-grow-1 dc__align-self-start">
        {config.map(({ id, icon, title, content }) => (
            <div key={id} className="ci-cd-pipeline__stepper flex left top dc__gap-8">
                <div className="dc__position-rel flex p-7 br-6 border__secondary bg__modal--secondary">
                    <Icon name={icon} color={null} size={20} />
                </div>
                <div className="flexbox-col flex-grow-1 br-6 border__secondary">
                    <div className="px-11 pt-8 pb-7 border__secondary--bottom bg__modal--secondary">
                        <p className="m-0 fs-13 lh-20 fw-6 cn-9">{title}</p>
                    </div>
                    <div className="flex-grow-1 p-16">{content}</div>
                </div>
            </div>
        ))}
    </div>
)
