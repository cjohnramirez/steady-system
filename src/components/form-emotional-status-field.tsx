import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchEmotionalStatus,
  updateStudentEmotionalStatus,
} from "@/app/admin/accounts/@modal/actions";
import { toast } from "sonner";
import { strToTitleCase } from "@/lib/format";

export default function FormEmotionalStatusField({
  emotionalStatus,
  setEmotionalStatus,
  studentID,
  enableDescription = true,
}: {
  emotionalStatus: string;
  setEmotionalStatus: (emotionalStatus: string) => void;
  studentID?: string;
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
      return updateStudentEmotionalStatus(studentID ?? "", newStatus);
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
    if (studentID) mutation.mutate(newStatus);
  };

  console.log("Emotional status selected: ", emotionalStatus)

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
        <SelectContent align="center">
          {emotionalStatusData &&
            emotionalStatusData.map((emotion) => (
              <SelectItem value={emotion.id} key={emotion.id}>
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
