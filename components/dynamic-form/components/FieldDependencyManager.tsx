import React from 'react';
import { Alert, AlertDescription, AlertTitle } from 'web-utils-components/alert';
import { Button } from 'web-utils-components/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'web-utils-components/dialog';
import { AlertTriangle, Trash2, Unlink } from 'lucide-react';
import { fieldDependencyService } from '../services/fieldDependencyService';
import { FormFieldType } from '../formBuilder.types';

interface FieldDependencyManagerProps {
  isOpen: boolean;
  onClose: () => void;
  fieldToDelete: FormFieldType | null;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

export const FieldDependencyManager: React.FC<FieldDependencyManagerProps> = ({
  isOpen,
  onClose,
  fieldToDelete,
  onConfirmDelete,
  onCancelDelete
}) => {
  if (!fieldToDelete) return null;

  const dependencyImpact = fieldDependencyService.checkFieldRemovalImpact(fieldToDelete.key);

  if (!dependencyImpact.hasImpact) {
    // No impact, proceed with normal deletion
    onConfirmDelete();
    return null;
  }

  const handleConfirmWithCleanup = () => {
    // Clean up dependencies first
    fieldDependencyService.unregisterDependenciesForSourceField(fieldToDelete.key);
    onConfirmDelete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Dependency Warning
          </DialogTitle>
          <DialogDescription>
            This field is being used by other fields as a data source dependency.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-800 dark:text-amber-200">
              Field Dependencies Found
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              The following fields depend on "{fieldToDelete.label?.en || fieldToDelete.name}":
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            {dependencyImpact.affectedFields.map((affectedFieldKey, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                <Unlink className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Field: {affectedFieldKey}</span>
              </div>
            ))}
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>What will happen:</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                <li>The field "{fieldToDelete.label?.en || fieldToDelete.name}" will be deleted</li>
                <li>All API dependencies using this field will be removed</li>
                <li>Affected fields will lose their reactive data sources</li>
                <li>You'll need to reconfigure data sources for affected fields</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onCancelDelete}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirmWithCleanup} className="gap-2">
            <Trash2 className="w-4 h-4" />
            Delete Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
