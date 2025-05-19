/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Trash2, Share, Star, ArchiveRestore } from "lucide-react";
import { ContextMenuContent, ContextMenuItem } from "./ui/context-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

export default function FileActions({ file }: { file: any }) {
  const fileId = file._id;
  const isStarred = file.starred;
  const pathname = usePathname();
  const router = useRouter();
  const { getToken } = useAuth();

  const [open, setOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<
    "trash" | "delete" | "share" | null
  >(null);
  const [isUserValid, setIsUserValid] = useState(false);
  const [email, setEmail] = useState("");
  const [validationResult, setValidationResult] = useState<string | null>(null);

  const openDialog = (mode: "trash" | "delete" | "share") => {
    setDialogMode(mode);
    setOpen(true);
  };

  const handleStarred = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/file/starred/${fileId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        toast.success(
          isStarred ? "Removed from favorites" : "Marked as favorite"
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Failed to update favorite status");
      }
    } catch (error) {
      toast.error("An error occurred while updating favorite status");
    }
  };

  const handleRestore = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/file/restore/${fileId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        toast.success("File restored from trash");
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Failed to restore file");
      }
    } catch (error) {
      toast.error("An error occurred while restoring the file");
    }
  };

  const handleTrash = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/file/trash/${fileId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        toast.success("File moved to trash");
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Failed to move file to trash");
      }
    } catch (error) {
      toast.error("An error occurred while moving file to trash");
    }
  };

  const handleDelete = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/file/delete/${fileId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        toast.success("File deleted permanently");
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Failed to delete file");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the file");
    }
  };

  const validateUser = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/file/shared/validate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        setValidationResult(`User found: ${data.user.email}`);
        setIsUserValid(true);
      } else if (res.status === 400) {
        setValidationResult("You cannot share a file with yourself");
        setIsUserValid(false);
      } else {
        setValidationResult("User not found");
        setIsUserValid(false);
      }
    } catch (error) {
      setValidationResult("Error validating user");
      console.log("Error validating user:", error);
    }
  };

  const handleShare = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/file/shared/${fileId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("File shared successfully");
        setOpen(false);
        setEmail("");
        setValidationResult(null);
        router.refresh();
      } else {
        toast.error(data.message || "Failed to share file");
      }
    } catch (error) {
      toast.error("An error occurred while sharing the file");
      console.error("Error sharing file:", error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <ContextMenuContent>
          {(pathname === "/home" ||
            pathname === "/starred" ||
            pathname === "/shared") && (
            <>
              <ContextMenuItem
                onClick={handleStarred}
                className="cursor-pointer"
              >
                <Star />
                <span>
                  {isStarred ? "Remove from Favourite" : "Mark as Favourite"}
                </span>
              </ContextMenuItem>
              <DialogTrigger asChild>
                <ContextMenuItem
                  onClick={() => openDialog("share")}
                  className="cursor-pointer"
                >
                  <Share />
                  <span>Share with Others</span>
                </ContextMenuItem>
              </DialogTrigger>
              {(pathname === "/home" || pathname === "/starred") && (
                <DialogTrigger asChild>
                  <ContextMenuItem
                    onClick={() => openDialog("trash")}
                    className="cursor-pointer text-red-500"
                  >
                    <Trash2 />
                    <span>Move to Trash</span>
                  </ContextMenuItem>
                </DialogTrigger>
              )}
              {pathname === "/shared" && (
                <DialogTrigger asChild>
                  <ContextMenuItem
                    onClick={() => openDialog("delete")}
                    className="cursor-pointer text-red-500"
                  >
                    <Trash2 />
                    <span>Remove</span>
                  </ContextMenuItem>
                </DialogTrigger>
              )}
            </>
          )}

          {pathname === "/trash" && (
            <>
              <ContextMenuItem
                onClick={handleRestore}
                className="cursor-pointer"
              >
                <ArchiveRestore />
                <span>Remove from Trash</span>
              </ContextMenuItem>
              <DialogTrigger asChild>
                <ContextMenuItem
                  onClick={() => openDialog("delete")}
                  className="cursor-pointer text-red-500"
                >
                  <Trash2 />
                  <span>Delete Permanently</span>
                </ContextMenuItem>
              </DialogTrigger>
            </>
          )}
        </ContextMenuContent>

        <DialogContent>
          {dialogMode === "trash" && (
            <>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  The file will be moved to trash. You can restore it later.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleTrash}
                  className="cursor-pointer"
                >
                  Confirm
                </Button>
              </div>
            </>
          )}

          {dialogMode === "delete" && (
            <>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This will permanently delete the file. This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="cursor-pointer"
                >
                  Confirm
                </Button>
              </div>
            </>
          )}

          {dialogMode === "share" && (
            <>
              <DialogHeader>
                <DialogTitle>Share File</DialogTitle>
                <DialogDescription>
                  Enter the email of the user you want to share with.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2 pt-4">
                <Input
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setValidationResult(null);
                    setIsUserValid(false);
                  }}
                />
                {validationResult && (
                  <p
                    className={`text-sm ${
                      isUserValid ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {validationResult}
                  </p>
                )}
                <div className="flex justify-end gap-4 pt-2">
                  <Button
                    variant="secondary"
                    onClick={validateUser}
                    className="cursor-pointer"
                  >
                    Validate User
                  </Button>
                  <Button
                    onClick={handleShare}
                    disabled={!isUserValid}
                    className="cursor-pointer"
                  >
                    Share
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
