
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Logs, DailyLog, TrainingEntry, SleepEntry, CognitiveMetrics } from './types';
import { MICROCYCLE_SCHEDULE } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';
import MetricsDashboard from './components/MetricsDashboard';
import { BarChart, BrainCircuit, Calendar, Droplets, Bed, Moon, Sun, UtensilsCrossed, Zap, Wind, ShieldCheck } from 'lucide-react';

const today = new Date();
const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

// --- Helper Components (defined outside main App to prevent re-renders) ---

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, icon, children, className }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-lg p-4 md:p-6 shadow-lg ${className}`}>
    <div className="flex items-center mb-4">
      <div className="text-cyan-400 mr-3">{icon}</div>
      <h2 className="text-xl font-bold text-slate-100">{title}</h2>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

interface CheckboxItemProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  time?: string;
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({ label, checked, onChange, time }) => (
  <label className="flex items-center justify-between p-3 bg-slate-900/50 rounded-md transition-all hover:bg-slate-700/50 cursor-pointer">
    <div className="flex items-center">
      {time && <span className="text-sm font-mono text-cyan-400 mr-4">{time}</span>}
      <span className={checked ? 'line-through text-slate-400' : 'text-slate-200'}>{label}</span>
    </div>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-5 w-5 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-500"
    />
  </label>
);

// --- Main App Component ---

export default function App() {
  const [logs, setLogs] = useLocalStorage<Logs>('neuro-protocol-logs', {});
  const [activeView, setActiveView] = useState<'dashboard' | 'metrics'>('dashboard');

  const getLogForToday = useCallback((): DailyLog => {
    if (logs[todayDateString]) {
      return logs[todayDateString];
    }
    const newLog: DailyLog = {
      date: todayDateString,
      wakeUpCheck: false,
      lightTherapyCheck: false,
      tyrosineBreakfastCheck: false,
      mindfulnessCheck: false,
      shutdownRitualCheck: false,
      sleepTimeCheck: false,
      trainingLog: null,
      sleepLog: null,
      cognitiveMetrics: null,
    };
    return newLog;
  }, [logs]);

  const [todaysLog, setTodaysLog] = useState<DailyLog>(getLogForToday);
  
  useEffect(() => {
    setTodaysLog(getLogForToday());
  }, [logs, getLogForToday]);

  const updateLog = useCallback(<K extends keyof DailyLog>(field: K, value: DailyLog[K]) => {
    setLogs(prevLogs => ({
      ...prevLogs,
      [todayDateString]: {
        ...getLogForToday(),
        [field]: value,
      }
    }));
  }, [setLogs, getLogForToday]);


  const microcycleDay = useMemo(() => {
    const dayOfWeek = new Date().getDay(); // Sunday = 0, Monday = 1
    return MICROCYCLE_SCHEDULE.find(d => d.day === dayOfWeek) || MICROCYCLE_SCHEDULE[6];
  }, []);
  
  const adherenceScore = useMemo(() => {
    const checklistItems: (keyof DailyLog)[] = [
      'wakeUpCheck', 'lightTherapyCheck', 'tyrosineBreakfastCheck', 
      'mindfulnessCheck', 'shutdownRitualCheck', 'sleepTimeCheck'
    ];
    const completed = checklistItems.filter(key => todaysLog[key]).length;
    return Math.round((completed / checklistItems.length) * 100);
  }, [todaysLog]);

  const Header = () => (
    <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 p-4 border-b border-slate-700">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="text-cyan-400 h-8 w-8" />
          <h1 className="text-2xl font-bold text-white">Cérebro Rápido</h1>
        </div>
        <nav className="flex items-center space-x-2 bg-slate-800 p-1 rounded-lg">
          <button onClick={() => setActiveView('dashboard')} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${activeView === 'dashboard' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>Painel</button>
          <button onClick={() => setActiveView('metrics')} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${activeView === 'metrics' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>Métricas</button>
        </nav>
      </div>
    </header>
  );

  if (activeView === 'metrics') {
    return (
      <div className="min-h-screen">
        <Header />
        <MetricsDashboard logs={logs} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Painel de Controle Diário" icon={<Calendar size={24} />}>
            <div className='flex justify-between items-baseline'>
                <p className="text-slate-400">Hoje: {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
                <div className='text-right'>
                    <p className='font-semibold text-cyan-400'>{microcycleDay.name}</p>
                    <p className='text-sm text-slate-400'>{microcycleDay.description}</p>
                </div>
            </div>
            <div className="space-y-2">
              <CheckboxItem time="05:30" label="Despertar" checked={todaysLog.wakeUpCheck} onChange={c => updateLog('wakeUpCheck', c)} />
              <CheckboxItem time="05:30" label="Terapia de Luz" checked={todaysLog.lightTherapyCheck} onChange={c => updateLog('lightTherapyCheck', c)} />
              <CheckboxItem time="07:00" label="Café da Manhã (Tirosina)" checked={todaysLog.tyrosineBreakfastCheck} onChange={c => updateLog('tyrosineBreakfastCheck', c)} />
              <CheckboxItem time="12:00" label="Pausa de Mindfulness" checked={todaysLog.mindfulnessCheck} onChange={c => updateLog('mindfulnessCheck', c)} />
              <CheckboxItem time="21:00" label="Ritual de Desligamento" checked={todaysLog.shutdownRitualCheck} onChange={c => updateLog('shutdownRitualCheck', c)} />
              <CheckboxItem time="22:00" label="Dormir (Horário Fixo)" checked={todaysLog.sleepTimeCheck} onChange={c => updateLog('sleepTimeCheck', c)} />
            </div>
             <div className="pt-4">
                <h3 className="text-lg font-semibold text-slate-300 mb-2">Aderência Diária</h3>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${adherenceScore}%` }}></div>
                </div>
                <p className="text-right text-sm font-bold mt-1 text-cyan-400">{adherenceScore}%</p>
            </div>
          </Card>
          
          <Card title="Métricas Cognitivas" icon={<Zap size={24} />}>
             <CognitiveLog log={todaysLog.cognitiveMetrics} onSave={data => updateLog('cognitiveMetrics', data)} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Log de Treino e Estresse" icon={<Droplets size={24} />}>
            <TrainingLog log={todaysLog.trainingLog} onSave={data => updateLog('trainingLog', data)} logs={logs} />
          </Card>
          <Card title="Log Circadiano (Sono)" icon={<Bed size={24} />}>
            <SleepLog log={todaysLog.sleepLog} onSave={data => updateLog('sleepLog', data)} />
          </Card>
        </div>
      </main>
    </div>
  );
}

// --- Log Components (inside App.tsx for simplicity, but defined outside the main function) ---

const SliderInput: React.FC<{label: string, value: number, onChange: (val: number) => void, min?: number, max?: number}> = ({label, value, onChange, min = 0, max = 10}) => (
    <div>
        <label className="flex justify-between text-sm font-medium text-slate-300 mb-1">
            <span>{label}</span>
            <span className="font-bold text-cyan-400">{value}</span>
        </label>
        <input 
            type="range" 
            min={min} 
            max={max} 
            value={value} 
            onChange={e => onChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-lg"
        />
    </div>
);

import { TRAINING_TYPES } from './constants';

const TrainingLog: React.FC<{log: TrainingEntry | null, onSave: (data: TrainingEntry) => void, logs: Logs}> = ({ log, onSave, logs }) => {
    const [data, setData] = useState<TrainingEntry>(log || { type: TRAINING_TYPES[0], duration: 45, rpe: 7, sweatSatisfied: true, kneePain: 0, generalFatigue: 2 });

    useEffect(() => {
        setData(log || { type: TRAINING_TYPES[0], duration: 45, rpe: 7, sweatSatisfied: true, kneePain: 0, generalFatigue: 2 });
    }, [log]);

    const isHighImpact = data.type === "Corrida";
    
    const kneePainWarning = useMemo(() => {
        const lastTwoDays = [1, 2].map(d => {
            const date = new Date();
            date.setDate(date.getDate() - d);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            return logs[dateStr]?.trainingLog?.kneePain ?? 0;
        });
        return (data.kneePain > 3 && lastTwoDays.every(pain => pain > 3));
    }, [logs, data.kneePain]);

    return (
        <div className="space-y-4">
             {isHighImpact && <div className="p-2 text-sm bg-yellow-900/50 text-yellow-300 border border-yellow-700 rounded-md">Alerta: Corrida é um exercício de alto impacto. Monitore a dor no joelho.</div>}
             {kneePainWarning && <div className="p-2 text-sm bg-red-900/50 text-red-300 border border-red-700 rounded-md">Alerta: Dor no joelho > 3 por dias consecutivos. Considere substituição estratégica.</div>}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tipo de Treino</label>
                <select value={data.type} onChange={e => setData(d => ({...d, type: e.target.value}))} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500">
                    {TRAINING_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Duração (min)</label>
                <input type="number" value={data.duration} onChange={e => setData(d => ({...d, duration: Number(e.target.value)}))} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2" />
            </div>
            <SliderInput label="Intensidade (RPE)" value={data.rpe} onChange={v => setData(d => ({...d, rpe: v}))} />
            <SliderInput label="Dor no Joelho" value={data.kneePain} onChange={v => setData(d => ({...d, kneePain: v}))} />
            <SliderInput label="Fadiga Corporal Geral" value={data.generalFatigue} onChange={v => setData(d => ({...d, generalFatigue: v}))} />
            <CheckboxItem label="Necessidade de 'Suar' Satisfeita?" checked={data.sweatSatisfied} onChange={c => setData(d => ({...d, sweatSatisfied: c}))} />
            <button onClick={() => onSave(data)} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors">Salvar Treino</button>
        </div>
    );
}

const SleepLog: React.FC<{log: SleepEntry | null, onSave: (data: SleepEntry) => void}> = ({ log, onSave }) => {
    const [data, setData] = useState<SleepEntry>(log || { bedTime: "21:00", sleepTime: "22:00", wakeTime: "05:30" });
     useEffect(() => {
        setData(log || { bedTime: "21:00", sleepTime: "22:00", wakeTime: "05:30" });
    }, [log]);
    
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Hora que foi para a cama</label>
                <input type="time" value={data.bedTime} onChange={e => setData(d => ({...d, bedTime: e.target.value}))} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Hora que adormeceu (est.)</label>
                <input type="time" value={data.sleepTime} onChange={e => setData(d => ({...d, sleepTime: e.target.value}))} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Hora que despertou</label>
                <input type="time" value={data.wakeTime} onChange={e => setData(d => ({...d, wakeTime: e.target.value}))} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2" />
            </div>
            <button onClick={() => onSave(data)} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors">Salvar Sono</button>
        </div>
    );
}

const CognitiveLog: React.FC<{log: CognitiveMetrics | null, onSave: (data: CognitiveMetrics) => void}> = ({ log, onSave }) => {
    const [data, setData] = useState<CognitiveMetrics>(log || { focusLevel: 7, mentalFog: 8, energyLevel: 7 });
    useEffect(() => {
        setData(log || { focusLevel: 7, mentalFog: 8, energyLevel: 7 });
    }, [log]);

    return (
         <div className="space-y-4">
            <SliderInput label="Nível de Foco" value={data.focusLevel} onChange={v => setData(d => ({...d, focusLevel: v}))} />
            <SliderInput label="Clareza Mental (10 = sem névoa)" value={data.mentalFog} onChange={v => setData(d => ({...d, mentalFog: v}))} />
            <SliderInput label="Nível de Motivação/Energia" value={data.energyLevel} onChange={v => setData(d => ({...d, energyLevel: v}))} />
            <button onClick={() => onSave(data)} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors">Salvar Métricas</button>
        </div>
    );
}
