import { Dimensions } from "react-native";

export const { width, height } = Dimensions.get("window");

export function px(size: number | `${number}`) {
  return Number(size) * (width / height)
}