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

import { SyntheticEvent, useEffect, useState } from 'react'
import { ImageWithFallbackProps } from './types'

const ImageWithFallback = ({ imageProps, fallbackImage }: ImageWithFallbackProps) => {
    const [imageUrl, setImageUrl] = useState(imageProps.src)

    useEffect(() => {
        setImageUrl(imageProps.src)
    }, [imageProps.src])

    const handleImageError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
        if (fallbackImage && imageUrl) {
            setImageUrl(null)
        }

        if (imageProps.onError) {
            imageProps.onError(event)
        }
    }

    // If the type is string, the fallback image would be directly added to the img element
    return (
        // Added for type consistency
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
            {imageUrl || (!imageUrl && typeof fallbackImage === 'string') ? (
                <img alt="" {...imageProps} src={imageUrl || (fallbackImage as string)} onError={handleImageError} />
            ) : (
                fallbackImage
            )}
        </>
    )
}

export default ImageWithFallback
