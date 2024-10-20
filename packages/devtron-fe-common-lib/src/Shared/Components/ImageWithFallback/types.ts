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

import { ImgHTMLAttributes } from 'react'

export interface ImageWithFallbackProps {
    /**
     * Props for the image
     */
    imageProps: ImgHTMLAttributes<HTMLImageElement>
    /**
     * Fallback image; can be a url or a jsx element
     */
    fallbackImage: string | JSX.Element
}
