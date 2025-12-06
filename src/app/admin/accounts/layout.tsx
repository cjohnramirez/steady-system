export default function AccountsLayout({
  children,
  modal, 
}: {
  children: React.ReactNode;
  modal?: React.ReactNode;
}) {
  return (
    <>
      {modal} 
      <div>{children}</div> 
    </>
  );
}
