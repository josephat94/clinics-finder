'use client';

import { useTranslations } from "next-intl";
import { FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { OpenDaysSelector } from "@/components/ui/open-days-selector";
import { TimeSelect, isValidTimeRange } from "@/components/ui/time-select";
import {
  createEmptyScheduleBlock,
  createEmptyScheduleHours,
  getUsedDaysFromSchedule,
  type ClinicScheduleBlock,
  type ClinicScheduleHours,
  type ScheduleValidationError,
  type WeekdayValue,
} from "@/utils/clinic-schedule";

const DAY_KEY = {
  monday: "dayMonday",
  tuesday: "dayTuesday",
  wednesday: "dayWednesday",
  thursday: "dayThursday",
  friday: "dayFriday",
  saturday: "daySaturday",
  sunday: "daySunday",
} as const;

export interface WeeklyScheduleEditorProps {
  value: ClinicScheduleBlock[];
  onChange: (schedule: ClinicScheduleBlock[]) => void;
  error?: ScheduleValidationError | null;
  disabled?: boolean;
}

export function WeeklyScheduleEditor({
  value,
  onChange,
  error,
  disabled = false,
}: WeeklyScheduleEditorProps) {
  const t = useTranslations("clinics");
  const common = useTranslations("common");
  const blocks = value.length ? value : [];

  const formatError = (issue: ScheduleValidationError) => {
    const block = issue.block + 1;
    if (issue.code === "missingDays")
      return t("scheduleMissingDays", { block });
    if (issue.code === "missingHours")
      return t("scheduleMissingHours", { block });
    if (issue.code === "overlap") return t("scheduleOverlap", { block });
    if (issue.code === "duplicateDay") {
      return t("scheduleDuplicateDay", { block, day: t(DAY_KEY[issue.day]) });
    }
    const range = issue.range + 1;
    if (issue.code === "bothTimes")
      return t("scheduleBothTimes", { block, range });
    if (issue.code === "incompleteRange")
      return t("scheduleIncomplete", { block, range });
    return t("scheduleTimeOrder", { block, range });
  };

  const updateBlock = (index: number, patch: Partial<ClinicScheduleBlock>) => {
    onChange(
      blocks.map((block, blockIndex) =>
        blockIndex === index ? { ...block, ...patch } : block,
      ),
    );
  };

  const updateHourRange = (
    blockIndex: number,
    hourIndex: number,
    patch: Partial<ClinicScheduleHours>,
  ) => {
    const block = blocks[blockIndex];
    if (!block) return;

    updateBlock(blockIndex, {
      hours: block.hours.map((hour, currentHourIndex) =>
        currentHourIndex === hourIndex ? { ...hour, ...patch } : hour,
      ),
    });
  };

  const addBlock = () => {
    onChange([...blocks, createEmptyScheduleBlock()]);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, blockIndex) => blockIndex !== index));
  };

  const addHourRange = (blockIndex: number) => {
    const block = blocks[blockIndex];
    if (!block) return;

    updateBlock(blockIndex, {
      hours: [...block.hours, createEmptyScheduleHours()],
    });
  };

  const removeHourRange = (blockIndex: number, hourIndex: number) => {
    const block = blocks[blockIndex];
    if (!block || block.hours.length <= 1) return;

    updateBlock(blockIndex, {
      hours: block.hours.filter(
        (_, currentHourIndex) => currentHourIndex !== hourIndex,
      ),
    });
  };

  const getBlockError = (blockIndex: number) => {
    if (!error || error.block !== blockIndex) return undefined;
    if ("range" in error) return undefined;
    return formatError(error);
  };

  const getHourRangeError = (blockIndex: number, hourIndex: number) => {
    if (!error || error.block !== blockIndex || !("range" in error))
      return undefined;
    if (error.range !== hourIndex) return undefined;
    return formatError(error);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {t("scheduleTitle")}
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {t("scheduleHelp")}
          </p>
        </div>
        <Button
          className="min-w-fit"
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={addBlock}
        >
          {t("addSchedule")}
        </Button>
      </div>

      {blocks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center dark:border-zinc-700">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t("noSchedule")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, blockIndex) => {
            const disabledDays = getUsedDaysFromSchedule(blocks, blockIndex);
            const blockError = getBlockError(blockIndex);

            return (
              <div
                key={blockIndex}
                className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {t("scheduleBlock", { index: blockIndex + 1 })}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    onClick={() => removeBlock(blockIndex)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    <FaTrash className="h-3.5 w-3.5" />
                    {common("delete")}
                  </Button>
                </div>

                <OpenDaysSelector
                  label={t("days")}
                  value={block.days}
                  disabledDays={disabledDays}
                  onChange={(days: WeekdayValue[]) =>
                    updateBlock(blockIndex, { days })
                  }
                  error={
                    error?.code === "missingDays" && error.block === blockIndex
                  }
                  errorText={blockError}
                  disabled={disabled}
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {t("hourRanges")}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled}
                      onClick={() => addHourRange(blockIndex)}
                    >
                      {t("addRange")}
                    </Button>
                  </div>

                  {block.hours.map((hour, hourIndex) => {
                    const hourError = getHourRangeError(blockIndex, hourIndex);

                    return (
                      <div
                        key={hourIndex}
                        className="space-y-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                            {t("range", { index: hourIndex + 1 })}
                          </span>
                          {block.hours.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={disabled}
                              onClick={() =>
                                removeHourRange(blockIndex, hourIndex)
                              }
                              className="text-red-600 hover:text-red-700 dark:text-red-400"
                            >
                              <FaTrash className="h-3 w-3" />
                              {t("remove")}
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <TimeSelect
                            label={t("openingTime")}
                            name={`opening_time_${blockIndex}_${hourIndex}`}
                            value={hour.opening_time}
                            onChange={(openingTime) =>
                              updateHourRange(blockIndex, hourIndex, {
                                opening_time: openingTime,
                              })
                            }
                            maxExclusive={hour.closing_time || null}
                            placeholder={t("selectOpening")}
                            popoverZIndex={250}
                            disabled={disabled}
                            error={
                              !!hour.opening_time &&
                              !!hour.closing_time &&
                              !isValidTimeRange(
                                hour.opening_time,
                                hour.closing_time,
                              )
                            }
                            errorText={t("beforeClosing")}
                          />

                          <TimeSelect
                            label={t("closingTime")}
                            name={`closing_time_${blockIndex}_${hourIndex}`}
                            value={hour.closing_time}
                            onChange={(closingTime) =>
                              updateHourRange(blockIndex, hourIndex, {
                                closing_time: closingTime,
                              })
                            }
                            minExclusive={hour.opening_time || null}
                            placeholder={t("selectClosing")}
                            popoverZIndex={250}
                            disabled={disabled}
                            error={
                              !!hour.opening_time &&
                              !!hour.closing_time &&
                              !isValidTimeRange(
                                hour.opening_time,
                                hour.closing_time,
                              )
                            }
                            errorText={t("afterOpening")}
                          />
                        </div>

                        {hourError && (
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {hourError}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {blockError && error?.code !== "missingDays" && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {blockError}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
