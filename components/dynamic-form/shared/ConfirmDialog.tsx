"use client";

import { Button } from "web-utils-components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "web-utils-components/dialog";

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: (confirmed: boolean | null) => void;
}

export const ConfirmDialog = ({ open, onConfirm }: ConfirmDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={() => onConfirm(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm</DialogTitle>
          <DialogDescription>
            Do you want update the selected to all parent/child nodes?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onConfirm(false);
            }}
          >
            No
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onConfirm(true);
            }}
          >
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
