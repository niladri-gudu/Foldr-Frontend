/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
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
import { useFileOperations } from "../hooks/useFileOperations";

export default function FileActions({ file }: { file: any }) {
  const fileId = file._id;
  const isStarred = file.starred;
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<
    "trash" | "delete" | "share" | "remove" | null
  >(null);
  const [isUserValid, setIsUserValid] = useState(false);
  const [email, setEmail] = useState("");
  const [validationResult, setValidationResult] = useState<string | null>(null);

  const {
    starFile,
    trashFile,
    deleteFile,
    restoreFile,
    shareFile,
    removeSharedFile,
  } = useFileOperations();

  const openDialog = (mode: "trash" | "delete" | "share" | "remove") => {
    setDialogMode(mode);
    setOpen(true);
  };

  const handleStarred = async () => {
    const success = await starFile(fileId, isStarred);
    if (success) {
      setOpen(false);
    }
  };

  const handleRestore = async () => {
    const success = await restoreFile(fileId);
    if (success) {
      setOpen(false);
    }
  };

  const handleTrash = async () => {
    const success = await trashFile(fileId);
    if (success) {
      setOpen(false);
    }
  };

  const handleDelete = async () => {
    const success = await deleteFile(fileId);
    if (success) {
      setOpen(false);
    }
  };

  const validateUser = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/file/shared/validate`,
        {
          method: "POST",
          credentials: "include",
          headers: {
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
    const result = await shareFile(fileId, email);
    if (result.success) {
      setOpen(false);
      setEmail("");
      setValidationResult(null);
    }
  };

  const handleSharedRemove = async () => {
    const success = await removeSharedFile(fileId);
    if (success) {
      setOpen(false);
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
              {(pathname === "/home" || pathname === "/starred") && (
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
                  <DialogTrigger asChild>
                    <ContextMenuItem
                      onClick={() => openDialog("trash")}
                      className="cursor-pointer text-red-500"
                    >
                      <Trash2 />
                      <span>Move to Trash</span>
                    </ContextMenuItem>
                  </DialogTrigger>
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
              {pathname === "/shared" && (
                <DialogTrigger asChild>
                  <ContextMenuItem
                    onClick={() => openDialog("remove")}
                    className="cursor-pointer text-red-500"
                  >
                    <Trash2 />
                    <span>Remove from shared</span>
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

          {dialogMode === "remove" && (
            <>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This will remove the file from your shared files.
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
                  onClick={handleSharedRemove}
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