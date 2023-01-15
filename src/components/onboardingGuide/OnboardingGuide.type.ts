export interface GuideCommonHeaderType{
  loginCount: number
  title: string
  subtitle: string
  isGettingStartedClicked: boolean
}

export interface OnboardingGuideProps {
    loginCount: number
    isSuperAdmin: boolean
    serverMode: string
    isGettingStartedClicked: boolean
}

export interface GettingStartedType {
  className: string
  showHelpCard: boolean
  hideGettingStartedCard: (count?: string) => void
  loginCount: number
}

export interface GuidedPageType {
  openDevtronAppCreateModel: (event) => void
}
