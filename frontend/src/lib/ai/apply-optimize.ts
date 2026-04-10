import type { OptimizeResumeResponse } from "@/lib/types/ai";
import type { ResumeFullUpdateFormValues } from "@/lib/validation/resume-schema";
import type { UseFormSetValue } from "react-hook-form";

export function applyOptimizeResult(
  result: OptimizeResumeResponse,
  setValue: UseFormSetValue<ResumeFullUpdateFormValues>,
  getValues: () => ResumeFullUpdateFormValues,
): void {
  if (result.summary != null && String(result.summary).trim() !== "") {
    setValue("summary.body", String(result.summary).trim(), { shouldDirty: true, shouldTouch: true });
  }

  const snapshot = getValues();
  const exps = snapshot.experiences;
  result.experience_bullets.forEach((bullets, i) => {
    if (i < exps.length) {
      setValue(`experiences.${i}.bullets`, bullets, { shouldDirty: true, shouldTouch: true });
    }
  });

  if (result.skill_phrases.length > 0) {
    const skills = snapshot.skills;
    if (!skills.length) {
      setValue(
        "skills",
        [{ category: "Core skills", items: [...result.skill_phrases], sort_order: 0 }],
        { shouldDirty: true, shouldTouch: true },
      );
    } else {
      setValue("skills.0.items", [...result.skill_phrases], { shouldDirty: true, shouldTouch: true });
    }
  }
}
