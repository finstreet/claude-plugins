import { routes } from "@/routes";
import { SubTask } from "@finstreet/ui/components/patterns/SubTask";
import {
  TaskPanel,
  TaskPanelHeader,
  TaskPanelStatus,
  TaskPanelTitle,
  TaskPanelContent,
} from "@finstreet/ui/components/patterns/TaskPanel";
import {
  TasksAndActionsLayout,
  TasksAndActionsLayoutArea as Area,
} from "@finstreet/ui/components/pageLayout/Layout/TasksAndActionsLayout";
import { useTranslations } from "next-intl";

type Props = {
  financingCaseId: string;
  contract: {
    completed: boolean;
    bankDetails: {
      completed: boolean;
    };
    guarantors: {
      completed: boolean;
    };
  };
};

export const BuildingLoanFspContractTaskPanel = ({
  financingCaseId,
  contract,
}: Props) => {
  const t = useTranslations(
    "financingCaseOverview.buildingLoan.fsp.taskGroups.customerDetails.taskPanels.contract",
  );

  return (
    <TasksAndActionsLayout>
      <Area gridArea={"tasks"}>
        <TaskPanel collapsible>
          <TaskPanelHeader>
            <TaskPanelStatus
              status={contract.completed ? "done" : "todo"}
            />
            <TaskPanelTitle>{t("title")}</TaskPanelTitle>
          </TaskPanelHeader>
          <TaskPanelContent>
            <SubTask
              status={
                contract.bankDetails.completed ? "done" : "todo"
              }
              actionLabel={
                contract.bankDetails.completed
                  ? t("subtasks.bankDetails.actions.viewData")
                  : t("subtasks.bankDetails.actions.addData")
              }
              name={t("subtasks.bankDetails.title")}
              href={routes.fsp.buildingLoan.financingCase.bankDetails(
                financingCaseId,
              )}
              prefetch={true}
              scroll={true}
            >
              {t("subtasks.bankDetails.title")}
            </SubTask>
            <SubTask
              status={
                contract.guarantors.completed ? "done" : "todo"
              }
              actionLabel={
                contract.guarantors.completed
                  ? t("subtasks.guarantors.actions.viewData")
                  : t("subtasks.guarantors.actions.addData")
              }
              name={t("subtasks.guarantors.title")}
              href={routes.fsp.buildingLoan.financingCase.guarantors(
                financingCaseId,
              )}
              prefetch={true}
              scroll={true}
            >
              {t("subtasks.guarantors.title")}
            </SubTask>
          </TaskPanelContent>
        </TaskPanel>
      </Area>
      <Area gridArea={"actions"}>
        <></>
      </Area>
    </TasksAndActionsLayout>
  );
};
