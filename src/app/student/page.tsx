import ProfileSection from "./_components/profile-section";
import StudentAppointmentSection from "./_components/student-appointment-section";

export default function StudentPage() {
  return (
    <div className="space-y-6 p-10">
      <div className="space-y-2">
        <p className="text-4xl">Welcome, student!</p>
        <p>
          This is your personalized dashboard, with your profile and
          appointments
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <ProfileSection />
        <div className="col-span-3 rounded-2xl border border-gray-200 bg-white p-8">
          <StudentAppointmentSection />
        </div>
      </div>
    </div>
  );
}
