import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createChallengeWithSideEffects } from "@/features/challenges/api/challengeService";
import { ChallengeForm } from "@/features/challenges/ui/ChallengeForm";
import { useI18n } from "@/shared/lib/i18n";
import { PageShell } from "@/shared/ui/PageShell";
import { useAppStore } from "@/store/useAppStore";
import type { ChallengeFormValues } from "@/shared/types/schemas";

export function CreateChallengePage(): JSX.Element {
  const { t } = useI18n();
  const navigate = useNavigate();
  const pushToast = useAppStore((state) => state.pushToast);
  const [submitting, setSubmitting] = useState(false);
  async function handleSubmit(values: ChallengeFormValues): Promise<void> {
    setSubmitting(true);
    try {
      const challengeId = await createChallengeWithSideEffects(values);
      pushToast({
        title: t("createChallenge.created"),
        tone: "success",
      });
      navigate(`/challenge/${challengeId}`);
    } catch (error) {
      pushToast({
        title:
          error instanceof Error
            ? error.message
            : t("createChallenge.createError"),
        tone: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <PageShell
      title={t("createChallenge.title")}
      description={t("createChallenge.description")}
    >
      <ChallengeForm onSubmit={handleSubmit} submitting={submitting} />
    </PageShell>
  );
}
