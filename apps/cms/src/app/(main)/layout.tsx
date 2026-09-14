import { getInitialUserData } from "@/lib/queries/user";
import { UserProvider } from "@/providers/user";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getInitialUserData();

  return (
    <UserProvider initialUser={user}>
      <div>{children}</div>
    </UserProvider>
  );
}
