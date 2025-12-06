import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import {
  fetchEmotionalStatus,
  updateStudentEmotionalStatus,
} from "@/app/admin/accounts/@modal/actions";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { strToTitleCase } from "@/lib/format";

export default function FormEmotionalStatusField({
  emotionalStatus,
  setEmotionalStatus,
  user_id,
  enableDescription = true,
}: {
  emotionalStatus: string;
  setEmotionalStatus: (emotionalStatus: string) => void;
  user_id?: string;
  enableDescription?: boolean;
}) {
  const {
    data: emotionalStatusData = [],
    isLoading: isEmotionalStatusLoading,
  } = useQuery({
    queryKey: ["emotional-status"],
    queryFn: () => fetchEmotionalStatus(),
  });

  const mutation = useMutation({
    mutationFn: (newStatus: string) => {
      return updateStudentEmotionalStatus(user_id ?? "", newStatus);
    },
    onSuccess: () => {
      toast.success("Emotional status updated!");
    },
    onError: () => {
      toast.error("Emotional status did not update");
    },
  });

  const handleEmotionalStatusChange = (newStatus: string) => {
    setEmotionalStatus(newStatus);
    if (user_id) mutation.mutate(newStatus);
  };

  return (
    <Field>
      <FieldLabel>Emotional Status</FieldLabel>
      <Select
        value={emotionalStatus ?? ""}
        onValueChange={handleEmotionalStatusChange}
      >
        <SelectTrigger id="select-emotional-status">
          {isEmotionalStatusLoading ? (
            <div className="flex items-center gap-2">
              <Spinner />
              <p>Loading Emotional Status</p>
            </div>
          ) : (
            <SelectValue placeholder="Select Emotional Status" />
          )}
        </SelectTrigger>
        <SelectContent position="item-aligned">
          {emotionalStatusData &&
            emotionalStatusData.map((emotion, idx) => (
              <SelectItem value={emotion.id} key={idx}>
                {strToTitleCase(emotion.name)}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      {enableDescription && (
        <FieldDescription>An emotional status must be chosen</FieldDescription>
      )}
    </Field>
  );
}
