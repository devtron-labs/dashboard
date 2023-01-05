import { components } from "react-select"
import { SelectorMessaging } from "./ciConfigConstant"

export const platformMenuList = (props): JSX.Element => {
  return (
      <components.MenuList {...props}>
          <div className="cn-5 pl-12 pt-4 pb-4 dc__italic-font-style">
             {SelectorMessaging.TARGET_SELECTOR_MENU}
          </div>
          {props.children}
      </components.MenuList>
  )
}