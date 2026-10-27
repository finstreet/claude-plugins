import { routes } from "@/routes";
import {
  TaskPanel,
  TaskPanelHeader,
  TaskPanelStatus,
  TaskPanelTitle,
} from "@finstreet/ui/components/patterns/TaskPanel";
import {
  TasksAndActionsLayout,
  TasksAndActionsLayoutArea as Area,
} from "@finstreet/ui/components/pageLayout/Layout/TasksAndActionsLayout";
import { useTranslations } from "next-intl";

type Props = {
  financingCaseId: string;
  completed: boolean;
};

export const BuildingLoanFspApplicationTaskPanel = ({
  financingCaseId,
  completed,
}: Props) => {
  const t = useTranslations(
    "financingCaseOverview.buildingLoan.fsp.taskGroups.customerDetails.taskPanels.application",
  );

  return (
    <TasksAndActionsLayout>
      <Area gridArea={"tasks"}>
        <TaskPanel
          href={routes.fsp.buildingLoan.financingCase.applicationDetails(
            financingCaseId,
          )}
          prefetch={true}
          scroll={true}
          name={t("title")}
        >
          <TaskPanelHeader>
            <TaskPanelStatus status={completed ? "done" : "todo"} />
            <TaskPanelTitle>{t("title")}</TaskPanelTitle>
          </TaskPanelHeader>
        </TaskPanel>
      </Area>
      <Area gridArea={"actions"}>
        <></>
      </Area>
    </TasksAndActionsLayout>
  );
};
