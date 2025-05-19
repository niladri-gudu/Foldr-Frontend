// app/file/[id]/page.tsx (Server Component)

import FilePageClient from "./client";

type PageProps = {
  params: { id: string };
};

export default function FilePageWrapper({ params }: PageProps) {
  return <FilePageClient id={params.id} />;
}
