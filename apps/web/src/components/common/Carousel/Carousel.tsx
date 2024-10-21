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

import React, { useEffect } from 'react'
import { ReactComponent as ArrowIcon } from '../../../assets/icons/ic-arrow-left.svg'
import './Carousel.scss'

export default function Carousel({ imageUrls, className }: { imageUrls: string[]; className?: string }) {
    let currentSlideNum = 1

    useEffect(() => {
        changeSlide(currentSlideNum)
    }, [])

    const changeSlide = (slideNum: number) => {
        const allSlides = document.querySelectorAll('.carousel-slide')
        const activeSlide = document.querySelector('.carousel-slide__slide-count')

        if (slideNum > allSlides.length) {
            currentSlideNum = 1
        } else if (slideNum < 1) {
            currentSlideNum = allSlides.length
        } else {
            currentSlideNum = slideNum
        }

        const activeSlideIdx = currentSlideNum - 1

        allSlides.forEach((slide, idx) => {
            if (idx === activeSlideIdx) {
                slide.classList.add('active-slide')
            } else {
                slide.classList.remove('active-slide')
            }
        })

        activeSlide.innerHTML = `${currentSlideNum}/${imageUrls.length}`
    }

    const nextSlide = () => {
        changeSlide(currentSlideNum + 1)
    }

    const prevSlide = () => {
        changeSlide(currentSlideNum - 1)
    }

    return (
        <div className={`carousel-container ${className || ''}`}>
            {imageUrls.map((url, idx) => {
                return (
                    <div key={`carousel-slide-${idx}`} className="carousel-slide">
                        <img src={url} alt={`carousel-img-${idx}`} />
                    </div>
                )
            })}
            <div className="carousel-slide__action-buttons flex">
                <div className="carousel-slide__action flex cursor" onClick={prevSlide}>
                    <ArrowIcon className="icon-dim-20 action-prev__icon" />
                </div>
                <div className="carousel-slide__slide-count ml-12 mr-12" />
                <div className="carousel-slide__action flex cursor" onClick={nextSlide}>
                    <ArrowIcon className="icon-dim-20 action-next__icon" />
                </div>
            </div>
        </div>
    )
}
