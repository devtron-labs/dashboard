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

import { ProgressingProps } from './Types'

export const Progressing = ({ pageLoader, size, theme, styles, fillColor }: ProgressingProps): JSX.Element => {
    const loaderSize = size ? `${size}px` : pageLoader ? '48px' : '20px'
    return (
        <div className={`loader ${theme || 'default'}-background`} style={styles} data-testid="progressing">
            <div style={{ width: loaderSize, height: loaderSize }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="loader__svg">
                    <g fill="none" fillRule="evenodd" strokeLinecap="round">
                        <animateTransform
                            attributeName="transform"
                            attributeType="XML"
                            dur="0.5s"
                            from="0 12 12"
                            repeatCount="indefinite"
                            to="360 12 12"
                            type="rotate"
                        />
                        <path
                            fill={fillColor || '#06C'}
                            fillRule="nonzero"
                            d="M12 2.5A9.5 9.5 0 1 1 2.5 12a1.5 1.5 0 0 1 3 0A6.5 6.5 0 1 0 12 5.5a1.5 1.5 0 0 1 0-3z"
                        />
                    </g>
                </svg>
            </div>
        </div>
    )
}

export const DetailsProgressing = ({
    loadingText,
    size = 24,
    fullHeight = false,
    styles,
    fillColor,
    children,
}: ProgressingProps): JSX.Element => (
    <div
        className={`details-loader bcn-0 flex column fs-14 fw-6 ${fullHeight ? 'h-100' : 'details-loader-height'}`}
        style={styles}
        data-testid="details-progressing"
    >
        <span style={{ width: `${size}px`, height: `${size}px` }}>
            <Progressing size={size} fillColor={fillColor} />
        </span>
        {loadingText && <span className="mt-10">{loadingText}</span>}
        {children}
    </div>
)
