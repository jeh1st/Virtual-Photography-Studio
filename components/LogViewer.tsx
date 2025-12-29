
import { useEffect, useState, Fragment, type FC } from 'react';
import { db } from '../services/idbService';
import { GenerationLog } from '../types';

export const LogViewer: FC = () => {
    const [logs, setLogs] = useState<GenerationLog[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'FAILED' | 'SUCCESS'>('ALL');
    const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

    const fetchLogs = async () => {
        const items = await db.history.reverse().toArray();
        setLogs(items);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
        if (filter === 'ALL') return true;
        return log.status === filter;
    });

    const formatTime = (ts: number) => new Date(ts).toLocaleString();

    return (
        <div className="flex-grow overflow-y-auto p-6 bg-gray-950">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Generation Logs</h2>
                        <p className="text-gray-400 text-sm">Debug safety filters and inspect generation history.</p>
                    </div>
                    <div className="flex bg-gray-900 rounded-lg p-1 border border-white/10 gap-2">
                        {['ALL', 'SUCCESS', 'FAILED'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                {f}
                            </button>
                        ))}
                        <div className="w-px bg-white/10 my-1"></div>
                        <button
                            onClick={async () => { await db.history.clear(); fetchLogs(); }}
                            className="px-3 py-1.5 rounded-md text-xs font-bold text-rose-400 hover:bg-rose-900/20 hover:text-white transition-all flex items-center gap-2"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Clear
                        </button>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-xl border border-white/5 overflow-hidden shadow-2xl">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-gray-800 text-gray-200 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Mode</th>
                                <th className="px-6 py-4">Prompt Start</th>
                                <th className="px-6 py-4">Error / Metadata</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {filteredLogs.map((log) => (
                                <Fragment key={log.id}>
                                    <tr
                                        onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id!)}
                                        className={`hover:bg-gray-800/50 cursor-pointer transition-colors ${expandedLogId === log.id ? 'bg-gray-800/30' : ''}`}
                                    >
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">{formatTime(log.timestamp)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${log.status === 'SUCCESS'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-indigo-300">{log.sessionMode || 'Standard'}</td>
                                        <td className="px-6 py-4 truncate max-w-[200px] text-gray-300">{log.prompt}</td>
                                        <td className="px-6 py-4 truncate max-w-[200px]">
                                            {log.error ? <span className="text-rose-400">{log.error}</span> : <span className="text-gray-600 italic">No errors</span>}
                                        </td>
                                    </tr>
                                    {expandedLogId === log.id && (
                                        <tr className="bg-black/20">
                                            <td colSpan={5} className="px-6 py-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-1">Full Prompt</h4>
                                                        <div className="bg-black/50 p-3 rounded-lg border border-white/5 text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                                                            {log.prompt}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-1">Metadata Snapshot</h4>
                                                            <pre className="bg-black/50 p-3 rounded-lg border border-white/5 text-[10px] font-mono text-teal-400 overflow-x-auto">
                                                                {JSON.stringify(log.metadata, null, 2)}
                                                            </pre>
                                                        </div>
                                                        {log.error && (
                                                            <div>
                                                                <h4 className="text-[10px] uppercase font-bold text-rose-500 mb-1">Error Details</h4>
                                                                <div className="bg-rose-950/20 p-3 rounded-lg border border-rose-900/50 text-xs text-rose-300">
                                                                    {log.error}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                        No logs found matching filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
