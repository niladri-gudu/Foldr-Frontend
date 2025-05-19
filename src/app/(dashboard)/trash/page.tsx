import FetchTrashFiles from "@/components/FetchTrashFiles"
import { ScrollArea } from "@/components/ui/scroll-area"

const TrashPage = () => {
  return (
    <ScrollArea className="h-screen w-full rounded-md border p-4">
      <FetchTrashFiles />
    </ScrollArea>
  )
}
export default TrashPage