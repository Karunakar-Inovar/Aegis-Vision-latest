import * as React from "react";
import {
  Switch as RNSwitch,
  type SwitchProps as RNSwitchProps,
} from "react-native";
import { cssInterop } from "nativewind";

cssInterop(RNSwitch, {
  className: "style",
});

export interface SwitchProps extends RNSwitchProps {}

const Switch = React.forwardRef<RNSwitch, SwitchProps>((props, ref) => (
  <RNSwitch ref={ref} {...props} />
));

Switch.displayName = "Switch";

export { Switch };


