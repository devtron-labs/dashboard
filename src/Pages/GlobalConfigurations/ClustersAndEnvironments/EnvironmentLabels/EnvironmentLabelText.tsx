import { EnvironmentLabelTextProps } from './types'

export const EnvironmentLabelText = ({ heading, description }: EnvironmentLabelTextProps) => (
    <div className="flex column dc__gap-4 text-center">
        <h4 className="m-0 fs-13 lh-20 fw-6 cn-9">{heading}</h4>
        <p className="m-0 fs-13 lh-20 cn-7">{description}</p>
    </div>
)
