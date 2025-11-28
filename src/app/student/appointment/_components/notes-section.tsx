import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

interface NotesSectionProps {
  notes: string;
  setNotes: (open: string) => void;
}

export default function NotesSection({ notes, setNotes }: NotesSectionProps) {
  const MAX_CHAR = 250;
  const charCount = MAX_CHAR - notes.length;

  return (
    <div className="flex flex-col space-y-6 rounded-2xl border border-gray-200 bg-white p-8 h-full">
      <p className="font-medium">Add Notes Here (Optional)</p>
      <InputGroup className="flex-1 h-full">
      <InputGroupTextarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={MAX_CHAR}
        rows={50}
        placeholder="Type your notes here..."
        className="h-full"
      />
      <InputGroupAddon align="block-end">
        <InputGroupText>{charCount} characters left</InputGroupText>
      </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
