/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface GanttTask {
  id: string;
  name: string;
  startWeek: number;
  duration: number;
  progress: number;
  status: 'completed' | 'ongoing' | 'not_started';
  responsible?: string;
}

interface GanttChartProps {
  tasks: GanttTask[];
  totalWeeks?: number;
  projectName?: string;
}

const statusColors = {
  completed: { bg: 'bg-green-500', text: 'text-green-700', label: 'Selesai' },
  ongoing: { bg: 'bg-blue-500', text: 'text-blue-700', label: 'Berjalan' },
  not_started: { bg: 'bg-gray-400', text: 'text-gray-600', label: 'Belum Mulai' },
};

export default function GanttChart({ tasks, totalWeeks = 8, projectName }: GanttChartProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const weeksPerPage = 8;
  const totalPages = Math.ceil(totalWeeks / weeksPerPage);

  const startWeek = currentPage * weeksPerPage + 1;
  const endWeek = Math.min(startWeek + weeksPerPage - 1, totalWeeks);
  const visibleWeeks = Array.from({ length: endWeek - startWeek + 1 }, (_, i) => startWeek + i);

  const nextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages - 1));
  const prevPage = () => setCurrentPage(p => Math.max(p - 1, 0));

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-outline-variant flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-headline font-semibold text-on-surface">
            Jadwal Proyek {projectName && `- ${projectName}`}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="p-2 rounded-lg hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-on-surface-variant px-3">
            Minggu {startWeek} - {endWeek}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages - 1}
            className="p-2 rounded-lg hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-b border-outline-variant bg-surface-container-low flex items-center gap-6">
        <span className="text-xs font-medium text-on-surface-variant">Legenda:</span>
        {Object.entries(statusColors).map(([key, colors]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${colors.bg}`} />
            <span className={`text-xs ${colors.text}`}>{colors.label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="px-4 py-3 text-left text-sm font-semibold text-on-surface w-64 sticky left-0 bg-surface-container-low z-10 border-r border-outline-variant">
                Item Pekerjaan
              </th>
              {visibleWeeks.map(week => (
                <th key={week} className="px-2 py-3 text-center text-xs font-medium text-on-surface-variant w-16">
                  M-{week}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-sm font-semibold text-on-surface w-20">
                Progress
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {tasks.map((task, index) => (
              <tr key={task.id} className={index % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low/50'}>
                <td className="px-4 py-3 sticky left-0 bg-inherit z-10 border-r border-outline-variant">
                  <p className="text-sm font-medium text-on-surface">{task.name}</p>
                  {task.responsible && (
                    <p className="text-xs text-on-surface-variant mt-0.5">{task.responsible}</p>
                  )}
                </td>
                {visibleWeeks.map(week => {
                  const taskStart = task.startWeek;
                  const taskEnd = task.startWeek + task.duration - 1;
                  const isInRange = week >= taskStart && week <= taskEnd;
                  const isStart = week === taskStart;
                  const isEnd = week === taskEnd;

                  return (
                    <td key={week} className="px-0 py-1 relative">
                      {isInRange && (
                        <div
                          className={`h-6 ${statusColors[task.status].bg} ${
                            isStart ? 'rounded-l ml-1' : ''
                          } ${isEnd ? 'rounded-r mr-1' : ''}`}
                          title={`${task.name}: Minggu ${taskStart}-${taskEnd} (${task.progress}%)`}
                        >
                          {isStart && task.progress > 0 && (
                            <div
                              className="h-full bg-black/20 rounded-l"
                              style={{ width: `${Math.min(task.progress, 100)}%` }}
                            />
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-medium ${statusColors[task.status].text}`}>
                    {task.progress}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-on-surface-variant">Belum ada item pekerjaan</p>
        </div>
      )}
    </div>
  );
}
