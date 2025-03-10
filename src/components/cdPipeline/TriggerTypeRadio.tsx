import { RadioGroup, RadioGroupItem, TriggerType } from '@devtron-labs/devtron-fe-common-lib'
import { TriggerTypeRadioProps } from './cdPipeline.types'

const TriggerTypeRadio = ({ value, onChange }: TriggerTypeRadioProps) => (
    <div className="cd-pipeline__trigger-type">
        <span className="cn-7 fs-13 fw-4 lh-20">When do you want the pipeline to execute?</span>
        <RadioGroup value={value} name="trigger-type" onChange={onChange} className="chartrepo-type__radio-group">
            <RadioGroupItem dataTestId="cd-auto-mode-button" value={TriggerType.Auto}>
                Automatic
            </RadioGroupItem>
            <RadioGroupItem dataTestId="cd-manual-mode-button" value={TriggerType.Manual}>
                Manual
            </RadioGroupItem>
        </RadioGroup>
    </div>
)

export default TriggerTypeRadio
