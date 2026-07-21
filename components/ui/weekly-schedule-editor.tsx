'use client';

import { FaTrash } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { OpenDaysSelector } from '@/components/ui/open-days-selector';
import { TimeSelect, isValidTimeRange } from '@/components/ui/time-select';
import {
  createEmptyScheduleBlock,
  createEmptyScheduleHours,
  getUsedDaysFromSchedule,
  type ClinicScheduleBlock,
  type ClinicScheduleHours,
  type WeekdayValue,
} from '@/utils/clinic-schedule';

export interface WeeklyScheduleEditorProps {
  value: ClinicScheduleBlock[];
  onChange: (schedule: ClinicScheduleBlock[]) => void;
  error?: string | null;
  disabled?: boolean;
}

export function WeeklyScheduleEditor({
  value,
  onChange,
  error,
  disabled = false,
}: WeeklyScheduleEditorProps) {
  const blocks = value.length ? value : [];

  const updateBlock = (
    index: number,
    patch: Partial<ClinicScheduleBlock>
  ) => {
    onChange(
      blocks.map((block, blockIndex) =>
        blockIndex === index ? { ...block, ...patch } : block
      )
    );
  };

  const updateHourRange = (
    blockIndex: number,
    hourIndex: number,
    patch: Partial<ClinicScheduleHours>
  ) => {
    const block = blocks[blockIndex];
    if (!block) return;

    updateBlock(blockIndex, {
      hours: block.hours.map((hour, currentHourIndex) =>
        currentHourIndex === hourIndex ? { ...hour, ...patch } : hour
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
      hours: block.hours.filter((_, currentHourIndex) => currentHourIndex !== hourIndex),
    });
  };

  const getBlockError = (blockIndex: number) => {
    if (!error?.startsWith(`Horario ${blockIndex + 1}`)) return undefined;
    return error.replace(`Horario ${blockIndex + 1}`, '').replace(/^:\s*/, '').replace(/^, rango \d+:\s*/, '');
  };

  const getHourRangeError = (blockIndex: number, hourIndex: number) => {
    const prefix = `Horario ${blockIndex + 1}, rango ${hourIndex + 1}:`;
    if (!error?.startsWith(prefix)) return undefined;
    return error.replace(prefix, '').trim();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Horarios semanales
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Agrupa días con el mismo horario y agrega varios rangos si abren
            en la mañana y en la tarde.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={addBlock}
        >
          Agregar horario
        </Button>
      </div>

      {blocks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center dark:border-zinc-700">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Sin horarios configurados. Usa &quot;Agregar horario&quot; para
            definir cuándo abre la clínica.
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
                    Horario {blockIndex + 1}
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
                    Eliminar
                  </Button>
                </div>

                <OpenDaysSelector
                  label="Días"
                  value={block.days}
                  disabledDays={disabledDays}
                  onChange={(days: WeekdayValue[]) =>
                    updateBlock(blockIndex, { days })
                  }
                  error={!!blockError && blockError.includes('día')}
                  errorText={blockError}
                  disabled={disabled}
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Rangos horarios
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled}
                      onClick={() => addHourRange(blockIndex)}
                    >
                      Agregar rango
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
                            Rango {hourIndex + 1}
                          </span>
                          {block.hours.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={disabled}
                              onClick={() => removeHourRange(blockIndex, hourIndex)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400"
                            >
                              <FaTrash className="h-3 w-3" />
                              Quitar
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <TimeSelect
                            label="Hora de apertura"
                            name={`opening_time_${blockIndex}_${hourIndex}`}
                            value={hour.opening_time}
                            onChange={(openingTime) =>
                              updateHourRange(blockIndex, hourIndex, {
                                opening_time: openingTime,
                              })
                            }
                            maxExclusive={hour.closing_time || null}
                            placeholder="Selecciona hora de apertura"
                            popoverZIndex={250}
                            disabled={disabled}
                            error={
                              !!hour.opening_time &&
                              !!hour.closing_time &&
                              !isValidTimeRange(hour.opening_time, hour.closing_time)
                            }
                            errorText="Debe ser anterior a la hora de cierre"
                          />

                          <TimeSelect
                            label="Hora de cierre"
                            name={`closing_time_${blockIndex}_${hourIndex}`}
                            value={hour.closing_time}
                            onChange={(closingTime) =>
                              updateHourRange(blockIndex, hourIndex, {
                                closing_time: closingTime,
                              })
                            }
                            minExclusive={hour.opening_time || null}
                            placeholder="Selecciona hora de cierre"
                            popoverZIndex={250}
                            disabled={disabled}
                            error={
                              !!hour.opening_time &&
                              !!hour.closing_time &&
                              !isValidTimeRange(hour.opening_time, hour.closing_time)
                            }
                            errorText="Debe ser posterior a la hora de apertura"
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

                {blockError &&
                  !blockError.includes('día') &&
                  !error?.includes(', rango ') && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {blockError}
                    </p>
                  )}
              </div>
            );
          })}
        </div>
      )}

      {error &&
        !error.startsWith('Horario ') && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
    </div>
  );
}
