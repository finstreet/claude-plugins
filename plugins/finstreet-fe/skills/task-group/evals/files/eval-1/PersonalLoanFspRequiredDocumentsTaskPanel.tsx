import { routes } from "@/routes";
import { Typography } from "@finstreet/ui/components/base/Typography";
import {
  TasksAndActionsLayout,
  TasksAndActionsLayoutArea as Area,
} from "@finstreet/ui/components/pageLayout/Layout/TasksAndActionsLayout";
import {
  TaskPanel,
  TaskPanelHeader,
  TaskPanelStatus,
  TaskPanelTitle,
  TaskPanelSummary,
} from "@finstreet/ui/components/patterns/TaskPanel";
import { Box } from "@styled-system/jsx";
import { useTranslations } from "next-intl";

type Props = {
  financingCaseId: string;
  completed: boolean;
  completedCount: number;
  totalCount: number;
};

export const PersonalLoanFspRequiredDocumentsTaskPanel = ({
  financingCaseId,
  completed,
  completedCount,
  totalCount,
}: Props) => {
  const t = useTranslations(
    "financingCaseOverview.personalLoan.fsp.taskGroups.verifyInquiry.taskPanels.requiredDocuments",
  );

  return (
    <TasksAndActionsLayout>
      <Area gridArea={"tasks"}>
        <TaskPanel
          href={routes.fsp.personalLoan.financingCase.documents(
            financingCaseId,
          )}
          prefetch={true}
          scroll={true}
          name={t("title")}
        >
          <TaskPanelHeader>
            <TaskPanelStatus status={completed ? "done" : "todo"} />
            <TaskPanelTitle>{t("title")}</TaskPanelTitle>
            <Box hideBelow={"lg"}>
              <TaskPanelSummary justifyContent={"flex-end"}>
                <Typography textAlign={"right"}>
                  {t.rich("summary", {
                    br: () => <br />,
                    strong: (chunks) => <strong>{chunks}</strong>,
                    current: () => completedCount,
                    total: () => totalCount,
                  })}
                </Typography>
              </TaskPanelSummary>
            </Box>
          </TaskPanelHeader>
        </TaskPanel>
      </Area>
      <Area gridArea={"actions"}>
        <></>
      </Area>
    </TasksAndActionsLayout>
  );
};
