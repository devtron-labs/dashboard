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
                    <div className="carousel-slide">
                        <img src={url} alt={`carousel-img-${idx}`} />
                    </div>
                )
            })}
            <div className="carousel-slide__action-buttons flex">
                <div className="carousel-slide__action flex cursor" onClick={prevSlide}>
                    <ArrowIcon className="icon-dim-20 action-prev__icon" />
                </div>
                {/* <div className="carousel-slide__active-slide">{`${currentSlideNum}/${imageUrls.length}`}</div> */}
                <div className="carousel-slide__slide-count ml-12 mr-12" />
                <div className="carousel-slide__action flex cursor" onClick={nextSlide}>
                    <ArrowIcon className="icon-dim-20 action-next__icon" />
                </div>
            </div>
        </div>
    )
}
