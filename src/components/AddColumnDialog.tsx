import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AddColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (column: {
    title: string;
    status: string;
    color: string;
  }) => Promise<void>;
}

export function AddColumnDialog({
  open,
  onOpenChange,
  onAdd,
}: AddColumnDialogProps) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [color, setColor] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!title.trim() || !status.trim() || !color.trim()) return;
    setLoading(true);
    await onAdd({ title, status, color });
    setLoading(false);
    setTitle("");
    setStatus("");
    setColor("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add New Column</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="column-title">Column Title</Label>
            <Input
              id="column-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. QA Review"
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="column-status">Status Key</Label>
            <Input
              id="column-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="e.g. qa-review (must be unique)"
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="column-color">Color Class</Label>
            <Input
              id="column-color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. status-qa"
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleAdd}
            disabled={
              loading || !title.trim() || !status.trim() || !color.trim()
            }
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {loading ? "Adding..." : "Add Column"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline" type="button" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
