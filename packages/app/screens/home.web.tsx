import { Platform } from "react-native";
import { cn } from "ui/utils/cn";
import { View, Text, Button, TextInput } from "ui";

export function Home() {
  const isWeb = Platform.OS === "web";
  return (
    <View className={cn(`flex flex-1 justify-center items-center`)}>
      <Text
        style={{
          textAlign: "center",
        }}
      >
        Welcome to this app
      </Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="email@example.com"
        variant="outline"
      />
      <Button
        onPress={() => { }}
        variant="default"
      >
        Click me
      </Button>
    </View>
  );
}
