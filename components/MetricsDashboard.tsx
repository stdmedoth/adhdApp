
import React, { useMemo } from 'react';
import { Logs, DailyLog } from '../types';
import { LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { BrainCircuit, Droplets, Bed, BarChart as BarChartIcon } from 'lucide-react';

interface MetricsDashboardProps {
    logs: Logs;
}

const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-lg shadow-xl">
        <p className="label font-bold text-cyan-400">{`Data: ${label}`}</p>
        {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }}>{`${p.name}: ${p.value.toFixed(1)}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

const ChartCard: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode}> = ({title, icon, children}) => (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-lg">
        <div className="flex items-center mb-4">
            <div className="text-cyan-400 mr-3">{icon}</div>
            <h3 className="text-xl font-bold text-slate-100">{title}</h3>
        </div>
        <div className="h-72 w-full">
            {children}
        </div>
    </div>
);


const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ logs }) => {
    const chartData = useMemo(() => {
        return Object.values(logs)
            // Fix: Explicitly type 'log' to resolve properties on type 'unknown' error.
            .filter((log: DailyLog) => log.date)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(log => {
                const checklistItems: (keyof DailyLog)[] = ['wakeUpCheck', 'lightTherapyCheck', 'tyrosineBreakfastCheck', 'mindfulnessCheck', 'shutdownRitualCheck', 'sleepTimeCheck'];
                const completed = checklistItems.filter(key => log[key]).length;
                const adherence = (completed / checklistItems.length) * 100;

                const wakeTimeMinutes = log.sleepLog ? timeToMinutes(log.sleepLog.wakeTime) / 60 : null;

                return {
                    date: new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                    adherence,
                    kneePain: log.trainingLog?.kneePain ?? null,
                    generalFatigue: log.trainingLog?.generalFatigue ?? null,
                    focus: log.cognitiveMetrics?.focusLevel ?? null,
                    clarity: log.cognitiveMetrics?.mentalFog ?? null,
                    energy: log.cognitiveMetrics?.energyLevel ?? null,
                    wakeTime: wakeTimeMinutes
                };
            });
    }, [logs]);

    const socialJetLag = useMemo(() => {
        const weekdays: number[] = [];
        const weekends: number[] = [];

        // Fix: Explicitly type 'log' to resolve properties on type 'unknown' error.
        Object.values(logs).forEach((log: DailyLog) => {
            if (log.sleepLog?.wakeTime) {
                const date = new Date(log.date);
                const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
                const wakeTime = timeToMinutes(log.sleepLog.wakeTime);
                
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    weekends.push(wakeTime);
                } else {
                    weekdays.push(wakeTime);
                }
            }
        });

        if (weekdays.length === 0 || weekends.length === 0) return 0;

        const avgWeekday = weekdays.reduce((a, b) => a + b, 0) / weekdays.length;
        const avgWeekend = weekends.reduce((a, b) => a + b, 0) / weekends.length;
        
        return Math.abs(avgWeekend - avgWeekday);
    }, [logs]);

    if (chartData.length === 0) {
        return <div className="text-center p-10 text-slate-400">Sem dados para exibir. Comece a registrar suas atividades no painel.</div>;
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className='bg-slate-800 border border-slate-700 rounded-lg p-4 text-center'>
                <h2 className='text-xl font-bold text-slate-100'>Pontuação de Jet Lag Social</h2>
                <p className='text-3xl font-bold text-cyan-400 mt-2'>{socialJetLag.toFixed(1)} min</p>
                <p className='text-sm text-slate-400'>(Diferença média de despertar: dias úteis vs. fim de semana. Meta: 0)</p>
            </div>

            <ChartCard title="Correlação: Aderência vs. Performance" icon={<BarChartIcon size={24}/>}>
                <ResponsiveContainer>
                    <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis yAxisId="left" label={{ value: 'Aderência (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} stroke="#94a3b8" />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 10]} label={{ value: 'Performance (0-10)', angle: 90, position: 'insideRight', fill: '#94a3b8' }} stroke="#94a3b8" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="adherence" name="Aderência" fill="#22d3ee" barSize={20} />
                        <Line yAxisId="right" type="monotone" dataKey="focus" name="Foco" stroke="#a3e635" strokeWidth={2} />
                        <Line yAxisId="right" type="monotone" dataKey="clarity" name="Clareza" stroke="#fde047" strokeWidth={2} />
                    </ComposedChart>
                </ResponsiveContainer>
            </ChartCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <ChartCard title="Estresse Físico" icon={<Droplets size={24}/>}>
                    <ResponsiveContainer>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis domain={[0, 10]} stroke="#94a3b8" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="kneePain" name="Dor no Joelho" stroke="#f87171" strokeWidth={2} connectNulls />
                            <Line type="monotone" dataKey="generalFatigue" name="Fadiga Geral" stroke="#fb923c" strokeWidth={2} connectNulls />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
                 <ChartCard title="Performance Cognitiva" icon={<BrainCircuit size={24}/>}>
                     <ResponsiveContainer>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis domain={[0, 10]} stroke="#94a3b8" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="focus" name="Foco" stroke="#a3e635" strokeWidth={2} connectNulls />
                            <Line type="monotone" dataKey="clarity" name="Clareza" stroke="#fde047" strokeWidth={2} connectNulls />
                            <Line type="monotone" dataKey="energy" name="Energia" stroke="#60a5fa" strokeWidth={2} connectNulls />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
                 <ChartCard title="Consistência Circadiana" icon={<Bed size={24}/>}>
                     <ResponsiveContainer>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis domain={[4, 9]} tickFormatter={(val) => `${String(Math.floor(val)).padStart(2, '0')}:${String(Math.round((val % 1) * 60)).padStart(2, '0')}`} stroke="#94a3b8" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <ReferenceLine y={5.5} label="Meta 05:30" stroke="#f87171" strokeDasharray="4 4" />
                            <Line type="monotone" dataKey="wakeTime" name="Hora de Despertar" stroke="#60a5fa" strokeWidth={2} connectNulls />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    );
};

export default MetricsDashboard;