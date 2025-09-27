export type Appointment = {
  appointmentId: string;
  studentId: string;
  studentName: string;
  status: "pending" | "approved" | "done";
  notes: string;
};
