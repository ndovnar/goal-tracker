import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { GoogleLoginButton } from "@/features/auth/ui/GoogleLoginButton";
import { updateChallengeWithSideEffects } from "@/features/challenges/api/challengeService";
import { ChallengeForm } from "@/features/challenges/ui/ChallengeForm";
import { getChallengeWithItems } from "@/shared/lib/db/repositories";
import { useI18n } from "@/shared/lib/i18n";
import { useAsyncValue } from "@/shared/lib/useAsyncValue";
import { Card } from "@/shared/ui/Card";
import { LoadingCards } from "@/shared/ui/LoadingCards";
import { PageShell } from "@/shared/ui/PageShell";
import { useAppStore } from "@/store/useAppStore";
import type { ChallengeFormValues } from "@/shared/types/schemas";

export function EditChallengePage(): JSX.Element {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { challengeId } = useParams();
  const resolvedChallengeId = challengeId ?? "";
  const dataVersion = useAppStore((state) => state.dataVersion);
  const pushToast = useAppStore((state) => state.pushToast);
  const [submitting, setSubmitting] = useState(false);
  const { data, loading, error } = useAsyncValue(
    () => getChallengeWithItems(resolvedChallengeId),
    [resolvedChallengeId, dataVersion],
  );
  if (!challengeId) {
    return <Navigate to="/" replace />;
  }
  async function handleSubmit(values: ChallengeFormValues): Promise<void> {
    setSubmitting(true);
    try {
      await updateChallengeWithSideEffects(resolvedChallengeId, values);
      pushToast({
        title: t("editChallenge.updated"),
        tone: "success",
      });
      navigate(`/challenge/${resolvedChallengeId}`);
    } catch (updateError) {
      pushToast({
        title:
          updateError instanceof Error
            ? updateError.message
            : t("editChallenge.updateError"),
        tone: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }
  if (loading || !data) {
    return (
      <PageShell
        actions={<GoogleLoginButton />}
        title={t("editChallenge.loadingTitle")}
      >
        {error ? <Card>{error}</Card> : <LoadingCards count={3} />}
      </PageShell>
    );
  }
  const initialValues: ChallengeFormValues = {
    title: data.challenge.title,
    description: data.challenge.description,
    durationDays: data.challenge.durationDays,
    startDate: data.challenge.startDate,
    checklistItems: data.checklistItems.map((item) => ({
      id: item.id,
      label: item.label,
      isRequired: item.isRequired,
      order: item.order,
    })),
  };
  return (
    <PageShell
      actions={<GoogleLoginButton />}
      title={t("editChallenge.title")}
      description={t("editChallenge.description")}
    >
      <ChallengeForm
        key={`${data.challenge.id}:${data.challenge.updatedAt}`}
        onSubmit={handleSubmit}
        submitting={submitting}
        initialValues={initialValues}
        submitLabel={t("editChallenge.form.saveChallenge")}
        submittingLabel={t("editChallenge.form.savingChallenge")}
      />
    </PageShell>
  );
}
