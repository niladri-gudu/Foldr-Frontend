import FetchStarredFiles from "@/components/FetchStarredFiles"
import { ScrollArea } from "@radix-ui/react-scroll-area"

const StarredPage = () => {
  return (
    <ScrollArea className="h-screen w-full rounded-md border p-4">
      <FetchStarredFiles />
    </ScrollArea>
  )
}
export default StarredPage