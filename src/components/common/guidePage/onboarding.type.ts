export interface GettingStartedType {
  className: string
  showHelpCard: boolean
  hideGettingStartedCard: () => void
  loginCount: number
}

export interface GuidedPageType {
  openDevtronAppCreateModel: (event) => void
}

export interface OnboardingGuideProps {
  loginCount: number
  isSuperAdmin: boolean
  serverMode: string
}