import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../organisms/dialog";
import { Textarea } from "../organisms/textarea";
import { Button } from "../atoms/button";
import { View, Text } from "react-native";
import { cssInterop } from "nativewind";

cssInterop(View, {
  className: "style",
});

cssInterop(Text, {
  className: "style",
});

export interface FalsePositiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (note: string) => void;
  trigger?: React.ReactNode;
  cameraName?: string;
  defaultNote?: string;
}

export const FalsePositiveModal = ({
  open,
  onOpenChange,
  onSubmit,
  trigger,
  cameraName,
  defaultNote = "",
}: FalsePositiveModalProps) => {
  const [note, setNote] = React.useState(defaultNote);

  React.useEffect(() => {
    setNote(defaultNote);
  }, [defaultNote, open]);

  const handleSubmit = () => {
    onSubmit(note);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as False Positive</DialogTitle>
          <DialogDescription>
            Confirm that this alert was a false positive so we can retrain the model and reduce noise.
          </DialogDescription>
        </DialogHeader>
        <View className="space-y-3">
          {cameraName ? (
            <Text className="text-sm text-muted-foreground">
              Camera:{" "}
              <Text className="font-medium text-foreground">
                {cameraName}
              </Text>
            </Text>
          ) : null}
          <Textarea
            placeholder="Add a note for the AI team (optional)"
            value={note}
            onChangeText={setNote}
          />
        </View>
        <DialogFooter>
          <Button variant="outline" onPress={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onPress={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};









