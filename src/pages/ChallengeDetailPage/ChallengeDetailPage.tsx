import { useState } from "react";
import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { GoogleLoginButton } from "@/features/auth/ui/GoogleLoginButton";
import { deleteChallengeWithSideEffects } from "@/features/challenges/api/challengeService";
import { DailyCheckInPanel } from "@/features/checkins/ui/DailyCheckInPanel";
import { DayGrid } from "@/features/challenges/ui/DayGrid";
import { getChallengeDetail } from "@/shared/lib/db/repositories";
import { formatDisplayDate } from "@/shared/lib/date";
import { useI18n } from "@/shared/lib/i18n";
import { useAsyncValue } from "@/shared/lib/useAsyncValue";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { LoadingCards } from "@/shared/ui/LoadingCards";
import { PageShell } from "@/shared/ui/PageShell";
import { ProgressBar } from "@/shared/ui/ProgressBar";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { useAppStore } from "@/store/useAppStore";

export function ChallengeDetailPage(): JSX.Element {
  const { locale, t } = useI18n();
  const navigate = useNavigate();
  const { challengeId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const dataVersion = useAppStore((state) => state.dataVersion);
  const pushToast = useAppStore((state) => state.pushToast);
  const [isDeleting, setIsDeleting] = useState(false);
  const selectedDate = searchParams.get("date");
  const { data, loading, error } = useAsyncValue(
    () => getChallengeDetail(challengeId ?? "", selectedDate),
    [challengeId, selectedDate, dataVersion],
  );
  if (!challengeId) {
    return <Navigate to="/" replace />;
  }
  if (loading || !data) {
    return (
      <PageShell
        actions={<GoogleLoginButton />}
        title={t("challengeDetail.loadingTitle")}
      >
        {error ? <Card>{error}</Card> : <LoadingCards count={3} />}
      </PageShell>
    );
  }
  const resolvedChallengeId = challengeId;
  const challenge = data.challenge;
  async function handleDeleteChallenge(): Promise<void> {
    if (
      !window.confirm(
        t("challengeDetail.deleteConfirm", {
          title: challenge.title,
        }),
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteChallengeWithSideEffects(resolvedChallengeId);
      pushToast({
        title: t("challengeDetail.deleteSuccess"),
        tone: "success",
      });
      navigate("/");
    } catch (deleteError) {
      pushToast({
        title:
          deleteError instanceof Error
            ? deleteError.message
            : t("challengeDetail.deleteError"),
        tone: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  }
  return (
    <PageShell
      actions={<GoogleLoginButton />}
      title={challenge.title}
      description={challenge.description}
    >
      <Card className="space-y-5 bg-slate-50/88">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">
              {t("challengeDetail.dayProgress", {
                current: Math.max(data.summary.currentDay, 1),
                duration: data.summary.durationDays,
              })}
            </p>
            <h2 className="text-2xl font-semibold text-ink">
              {challenge.title}
            </h2>
            <p className="text-sm text-slate-600">
              {formatDisplayDate(challenge.startDate, locale)} {t("common.to")}{" "}
              {formatDisplayDate(challenge.endDate, locale)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <StatusBadge value={data.summary.todayStatus} />
            <Button
              variant="secondary"
              onClick={() => navigate(`/challenge/${resolvedChallengeId}/edit`)}
            >
              {t("challengeDetail.editChallenge")}
            </Button>
            <Button
              variant="danger"
              disabled={isDeleting}
              onClick={() => void handleDeleteChallenge()}
            >
              {isDeleting
                ? t("challengeDetail.deletingChallenge")
                : t("challengeDetail.deleteChallenge")}
            </Button>
          </div>
        </div>
        <ProgressBar value={data.summary.completionPercentage} />
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="border-slate-200/80 bg-slate-50/80 shadow-none">
            <p className="text-sm text-slate-600">
              {t("challengeDetail.completion")}
            </p>
            <p className="mt-3 text-2xl font-semibold text-ink">
              {data.summary.completionPercentage}%
            </p>
          </Card>
          <Card className="border-slate-200/80 bg-slate-50/80 shadow-none">
            <p className="text-sm text-slate-600">
              {t("challengeDetail.completedDays")}
            </p>
            <p className="mt-3 text-2xl font-semibold text-ink">
              {data.summary.completedDays}
            </p>
          </Card>
          <Card className="border-slate-200/80 bg-slate-50/80 shadow-none">
            <p className="text-sm text-slate-600">
              {t("challengeDetail.currentStreak")}
            </p>
            <p className="mt-3 text-2xl font-semibold text-ink">
              {data.summary.currentStreak}
            </p>
          </Card>
          <Card className="border-slate-200/80 bg-slate-50/80 shadow-none">
            <p className="text-sm text-slate-600">
              {t("challengeDetail.longestStreak")}
            </p>
            <p className="mt-3 text-2xl font-semibold text-ink">
              {data.summary.longestStreak}
            </p>
          </Card>
        </div>
      </Card>
      <Card className="space-y-4 bg-slate-50/88">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-ink">
            {t("challengeDetail.timeline")}
          </h3>
          <p className="text-sm text-slate-600">
            {t("challengeDetail.timelineDescription")}
          </p>
        </div>
        <DayGrid
          days={data.dayStates}
          selectedDate={data.selectedDay?.date ?? null}
          onSelect={(date) => setSearchParams({ date })}
        />
      </Card>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DailyCheckInPanel
          challengeId={challengeId}
          selectedDay={data.selectedDay}
          checklistItems={data.checklistItems}
        />
        <Card className="space-y-4 bg-slate-50/88">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-ink">
              {t("challengeDetail.habitAdherence")}
            </h3>
            <p className="text-sm text-slate-600">
              {t("challengeDetail.habitAdherenceDescription")}
            </p>
          </div>
          <div className="space-y-3">
            {data.habitAdherence.map((item) => (
              <div
                key={item.itemId}
                className="rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-600">
                      {t("challengeDetail.habitDays", {
                        completed: item.completedDays,
                        eligible: item.eligibleDays,
                      })}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-ink">
                    {item.adherencePercentage}%
                  </p>
                </div>
                <ProgressBar
                  className="mt-3"
                  value={item.adherencePercentage}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
