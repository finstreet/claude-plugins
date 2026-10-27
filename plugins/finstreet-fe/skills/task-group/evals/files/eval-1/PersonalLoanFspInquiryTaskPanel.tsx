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

export const PersonalLoanFspInquiryTaskPanel = ({
  completed,
  financingCaseId,
}: Props) => {
  const t = useTranslations(
    "financingCaseOverview.personalLoan.fsp.taskGroups.verifyInquiry.taskPanels.inquiry",
  );

  return (
    <TasksAndActionsLayout>
      <Area gridArea={"tasks"}>
        <TaskPanel
          href={routes.fsp.personalLoan.financingCase.inquiryDetails(
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
