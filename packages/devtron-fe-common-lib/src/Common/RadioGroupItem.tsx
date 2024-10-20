/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { RadioGroupItemProps } from './Types'
import { RadioGroupContext } from './RadioGroup'

const RadioGroupItem = ({ value, disabled, children, dataTestId }: RadioGroupItemProps) => (
    <RadioGroupContext.Consumer>
        {(context) => (
            // eslint-disable-next-line jsx-a11y/label-has-associated-control
            <label className={disabled || context.disabled ? 'form__radio-item disabled' : 'form__radio-item'}>
                <input
                    type="radio"
                    className="form__checkbox"
                    name={context.name}
                    disabled={context.disabled || disabled}
                    onChange={context.onChange}
                    value={value}
                    checked={context.value === value}
                    data-testid={dataTestId}
                />
                <span className="form__radio-item-content" data-testid={`${dataTestId}-span`}>
                    <span className="radio__button" />
                    <span className="radio__title">{children}</span>
                </span>
            </label>
        )}
    </RadioGroupContext.Consumer>
)

export default RadioGroupItem
