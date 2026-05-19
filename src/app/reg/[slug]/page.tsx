import { Registration } from "@/components/public/registration";

export default async function PublicRegistrationPage({
  params,
}: PageProps<"/reg/[slug]">) {
  const { slug } = await params;
  return <Registration slug={slug} />;
}
