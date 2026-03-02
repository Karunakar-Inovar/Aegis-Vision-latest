import * as React from "react";
import {
  TextInput,
  type TextInputProps,
  NativeSyntheticEvent,
  TextInputChangeEventData,
} from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";

cssInterop(TextInput, {
  className: "style",
});

type SyntheticChangeEvent = {
  target: {
    value: string;
  };
};

export interface TextareaProps
  extends Omit<TextInputProps, "onChange" | "multiline" | "onChangeText"> {
  className?: string;
  onChange?: (event: SyntheticChangeEvent) => void;
  onChangeText?: (value: string) => void;
  rows?: number;
}

const Textarea = React.forwardRef<TextInput, TextareaProps>(
  ({ className, rows = 3, onChange, onChangeText, editable = true, ...props }, ref) => {
    const handleChangeText = React.useCallback(
      (text: string) => {
        onChange?.({ target: { value: text } });
        onChangeText?.(text);
      },
      [onChange, onChangeText]
    );

    const handleNativeChange = (event: NativeSyntheticEvent<TextInputChangeEventData>) => {
      const text = event.nativeEvent.text;
      onChange?.({ target: { value: text } });
      props.onChange?.(event);
    };

    return (
      <TextInput
        ref={ref}
        multiline
        textAlignVertical="top"
        numberOfLines={rows}
        editable={editable}
        className={cn(
          "min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-ring disabled:opacity-50",
          className
        )}
        onChangeText={handleChangeText}
        onChange={handleNativeChange}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };

