import LoginClient from "./login-client";

type SearchParams = Promise<{
  next?: string;
}>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return <LoginClient nextPath={params.next ?? ""} />;
}
