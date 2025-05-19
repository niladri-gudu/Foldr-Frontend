import FilePageClient from "./client";

export default async function FilePageWrapper(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  return <FilePageClient id={id} />;
}