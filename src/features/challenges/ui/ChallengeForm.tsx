import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";

import { useI18n } from "@/shared/lib/i18n";
import { createId } from "@/shared/lib/ids";
import { getTodayDateKey } from "@/shared/lib/date";
import { Button } from "@/shared/ui/Button";
import { InputField, TextAreaField } from "@/shared/ui/Field";
import { Card } from "@/shared/ui/Card";
import {
  getChallengeFormSchema,
  type ChallengeFormValues,
} from "@/shared/types/schemas";

const defaultValues: ChallengeFormValues = {
  title: "",
  description: "",
  durationDays: 60,
  startDate: getTodayDateKey(),
  checklistItems: [
    {
      id: createId("draft"),
      label: "",
      isRequired: true,
      order: 0,
    },
  ],
};

export function ChallengeForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (values: ChallengeFormValues) => Promise<void>;
  submitting: boolean;
}): JSX.Element {
  const { locale, t } = useI18n();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChallengeFormValues>({
    resolver: zodResolver(getChallengeFormSchema(locale)),
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "checklistItems",
  });
  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit((values) => onSubmit(values))}
    >
      <Card className="space-y-4 bg-white/68">
        <InputField
          label={t("createChallenge.form.challengeTitle")}
          placeholder={t("createChallenge.form.challengeTitlePlaceholder")}
          error={errors.title?.message}
          {...register("title")}
        />
        <TextAreaField
          label={t("createChallenge.form.description")}
          placeholder={t("createChallenge.form.descriptionPlaceholder")}
          error={errors.description?.message}
          {...register("description")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label={t("createChallenge.form.durationDays")}
            type="number"
            min={7}
            max={365}
            error={errors.durationDays?.message}
            {...register("durationDays", { valueAsNumber: true })}
          />
          <InputField
            label={t("createChallenge.form.startDate")}
            type="date"
            error={errors.startDate?.message}
            {...register("startDate")}
          />
        </div>
      </Card>
      <Card className="space-y-4 bg-white/68">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink">
              {t("createChallenge.form.dailyChecklist")}
            </h3>
            <p className="text-sm text-slate-600">
              {t("createChallenge.form.dailyChecklistDescription")}
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() =>
              append({
                id: createId("draft"),
                label: "",
                isRequired: true,
                order: fields.length,
              })
            }
          >
            {t("createChallenge.form.addItem")}
          </Button>
        </div>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <InputField
                    label={t("createChallenge.form.habit", {
                      value: index + 1,
                    })}
                    placeholder={t("createChallenge.form.habitPlaceholder")}
                    error={errors.checklistItems?.[index]?.label?.message}
                    {...register(`checklistItems.${index}.label`)}
                  />
                </div>
                <button
                  type="button"
                  className="mt-8 text-sm font-semibold text-sand-700 disabled:text-slate-400"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  {t("createChallenge.form.remove")}
                </button>
              </div>
              <label className="mt-3 flex items-center gap-3 rounded-[24px] border border-slate-200/80 bg-white/80 px-4 py-3 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-slate-300 text-moss-600"
                  {...register(`checklistItems.${index}.isRequired`)}
                />
                {t("createChallenge.form.requiredForCompleteDay")}
              </label>
            </div>
          ))}
        </div>
      </Card>
      <Button type="submit" fullWidth disabled={submitting}>
        {submitting
          ? t("createChallenge.form.creatingChallenge")
          : t("createChallenge.form.createChallenge")}
      </Button>
    </form>
  );
}
