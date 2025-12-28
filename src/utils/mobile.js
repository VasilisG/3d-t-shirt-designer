import { MOBILE_BREAKPOINT } from "../constants";

export const isMobileSize = () => {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}