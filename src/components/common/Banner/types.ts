import { INTERNET_CONNECTIVITY } from './constants'

export interface BannerConfigType {
    text: string
    rootClassName: string
    type?: INTERNET_CONNECTIVITY
    icon?: string
}
