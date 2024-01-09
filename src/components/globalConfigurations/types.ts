import { TippyCustomizedProps } from "@devtron-labs/devtron-fe-common-lib"

export type TippyConfig =
    | (Omit<TippyCustomizedProps, 'theme' | 'children' | 'placement'> & {
          showTippy: true
          /**
           * The nav link route on which the Tippy should be shown
           */
          showOnRoute: string
      })
    | {
          showTippy: false
      }

export interface GlobalConfiguration {
    tippyConfig: TippyConfig
    setTippyConfig: (tippyConfig: TippyConfig) => void
}
