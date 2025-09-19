//import { DepartmentModal } from "@/app/departments/DepartmentModal";
import { UserGroupModel } from "@/app/departments/[id]/UserGroupModel";
import { AssignUserModel } from "@/app/users/AssignUserModal";
import { Button } from "web-utils-components/button";
import { useUserGroup } from "@/lib/hooks/useUserGroups";
import { AssignUser } from "@/lib/validators/assignUserSchema";
import { Department } from "@/lib/validators/departmentSchema";
import { UserGroup } from "@/lib/validators/userGroupSchema";
import { X } from "lucide-react";
import { useCallback, useState } from "react";

interface CreateModalProps {
  onMutateDepartment?: (
    updateFn?: (current: Department[] | undefined) => Department[] | undefined
  ) => Promise<void>;
  onMutateUsergroup?: (
    updateFn?: (current: UserGroup[] | undefined) => UserGroup[] | undefined
  ) => Promise<void>;
  onClose: () => void;
  department?: Department | null;
  _departmentId?: string;
  userGroup?: UserGroup | null;
  modal?: string;
}

export function CreateModal({
  onClose,
  onMutateDepartment,
  onMutateUsergroup,
  department,
  userGroup,
  modal,
}: CreateModalProps) {
  const [isCreateSuccess, setIsCreateSuccess] = useState<boolean>(false);
  const [isCreateUserGroup, setIsCreateUserGroup] = useState<boolean>(false);
  const [departmentId, setDepartmentId] = useState<string>("");
  const { mutate } = useUserGroup(departmentId);
  const [editAssignUser] = useState<AssignUser | null>(null);
  const [isCreateAssignUser, setIsCreateAssignUser] = useState<boolean>(false);

  const getDepartmentId = (value: Department) => {
    setDepartmentId(value.id?.toString() ?? "");
  };

  const handleUserGroupMutate = useCallback(
    async (
      updateFn?: (current: UserGroup[] | undefined) => UserGroup[] | undefined
    ) => {
      if (updateFn) {
        await mutate(updateFn, false);
      } else {
        await mutate();
      }
    },
    [mutate]
  );

  const getNextSegment = (value: string) => {
    if (value === "userGroup") {
      setIsCreateUserGroup(true);
      setIsCreateSuccess(true);
    }
    if (value === "assignUser") {
      setIsCreateAssignUser(true);
      setIsCreateUserGroup(false);
    }
  };

  return (
    <>
      {(isCreateUserGroup || modal === "userGroup") && (
        <UserGroupModel
          departmentId={departmentId}
          userGroup={userGroup}
          onMutate={onMutateUsergroup ?? (async () => {})}
          onClose={onClose}
          goToNextModal={getNextSegment}
          isCreateDepartment={true}
        />
      )}
      {isCreateAssignUser && (
        <AssignUserModel
          departmentId={departmentId}
          assignUser={editAssignUser}
          onMutate={handleUserGroupMutate}
          onClose={onClose}
          isCreateDepartment={true}
        />
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-2.5 right-2.5 h-8 w-8 p-1.5"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </Button>
    </>
  );
}
