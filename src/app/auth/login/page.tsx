import LoginPage from "./[role]/page";

export default function LoginRedirect() {
  return <LoginPage params={Promise.resolve({ role: "student" })} />;
}
