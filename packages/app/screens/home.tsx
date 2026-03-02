import { Platform } from "react-native";
import { cn } from "ui/utils/cn";
import { View, Text, TextInput, Button } from "ui";

export function Home() {
  const isWeb = Platform.OS === "web";
  return (
    <View
      className={cn(
        `flex flex-1 justify-center items-center`,
        isWeb && `bg-black`,
      )}
    >
      <Text className="text-base">
        Edit{" "}
        <Text className="text-base font-bold">
          {" "}
          packages/app/screens/home.tsx
        </Text>{" "}
        to edit this screen.
      </Text>
      <TextInput />
      <Button
          onPress={() => {}}
          variant="default"
        >
          Click me
        </Button>
    </View>
  );
}
