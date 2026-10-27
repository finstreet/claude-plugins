import { routes } from "@/routes";
import { FinancingCaseOverviewFlagsType } from "@/shared/backend/models/financingCaseOverview/schema";
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
import { BuildingLoanFspDocumentsActionPanel } from "./BuildingLoanFspDocumentsActionPanel";

type Props = {
  financingCaseId: string;
  completed: boolean;
  flags: FinancingCaseOverviewFlagsType;
};

export const BuildingLoanFspDocumentsTaskPanel = ({
  financingCaseId,
  completed,
  flags,
}: Props) => {
  const t = useTranslations(
    "financingCaseOverview.buildingLoan.fsp.taskGroups.customerDetails.taskPanels.documents",
  );

  return (
    <TasksAndActionsLayout>
      <Area gridArea={"tasks"}>
        <TaskPanel
          href={routes.fsp.buildingLoan.financingCase.documents(
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
        <BuildingLoanFspDocumentsActionPanel
          financingCaseId={financingCaseId}
          actionDisabled={!flags.mutable}
        />
      </Area>
    </TasksAndActionsLayout>
  );
};
