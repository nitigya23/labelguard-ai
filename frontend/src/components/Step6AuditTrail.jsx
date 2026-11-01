import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, CheckCircle2, History, Search, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { fetchAuditLogs, AUDIT_CSV_EXPORT_URL } from '../api/client';

export default function Step6AuditTrail({ onRestart }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error("Error loading audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const q = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.actor_name.toLowerCase().includes(q) ||
      log.actor_role.toLowerCase().includes(q) ||
      (log.details && log.details.toLowerCase().includes(q))
    );
  });

  const handleExportCsv = (e) => {
    e.preventDefault();
    const headers = ["Log ID", "Timestamp (UTC)", "Action Type", "Actor Name", "Actor Role", "Change Request ID", "Audit Details"];
    const rows = logs.map(l => [
      l.id,
      l.timestamp,
      `"${l.action}"`,
      `"${l.actor_name}"`,
      `"${l.actor_role}"`,
      l.change_request_id || "",
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "LabelGuard_Audit_Trail.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Release Confirmation Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-[#0B7285] text-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/30">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Release Cycle Finalized
                </span>
                <span className="text-xs text-emerald-100">DHF-REV-3.0 Released</span>
              </div>
              <h2 className="text-2xl font-bold mt-1">Labeling Release Package Deployed</h2>
              <p className="text-xs text-emerald-100 mt-0.5 max-w-2xl">
                All 8 affected product packaging and IFU labels have been promoted to validated Version 3.0. Electronic signatures and rule evaluation results have been logged to the immutable audit trail.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white text-[#0B2545] hover:bg-slate-100 text-xs font-bold rounded-lg shadow-sm transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#0B7285]" />
              <span>Export Audit Trail (CSV)</span>
            </button>

            <button
              onClick={onRestart}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/25 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Start New Change</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-[#0B7285]" />
            <h3 className="text-lg font-bold text-[#0B2545]">
              Immutable Regulatory Audit Trail (21 CFR Part 11 / EU MDR)
            </h3>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search audit trail..."
                className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#0B7285] focus:outline-hidden w-64"
              />
            </div>

            <button
              onClick={loadLogs}
              title="Refresh Logs"
              className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="mt-4 overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-8 text-slate-400 text-xs">Loading audit events...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">No audit records found matching criteria.</div>
          ) : (
            <table className="min-w-full text-xs text-left border border-slate-200 rounded-lg">
              <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Log ID</th>
                  <th className="py-2.5 px-3">Timestamp (UTC)</th>
                  <th className="py-2.5 px-3">Action Type</th>
                  <th className="py-2.5 px-3">Signatory / Actor</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-4">Audit Details / Compliance Finding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredLogs.map((log) => {
                  const isApproval = log.action.includes("APPROVED");
                  const isRelease = log.action.includes("RELEASED");
                  const isInit = log.action.includes("INIT");

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 font-sans">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">#{log.id}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toISOString().replace("T", " ").substring(0, 19)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                            isApproval || isRelease
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : isInit
                              ? "bg-blue-100 text-blue-800 border border-blue-300"
                              : "bg-slate-100 text-slate-800 border border-slate-300"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{log.actor_name}</td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">{log.actor_role}</td>
                      <td className="py-2.5 px-4 text-slate-700 text-xs leading-relaxed max-w-md">
                        {log.details}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Digital audit trail complies with FDA 21 CFR Part 11 Electronic Records and EU MDR Annex IX.</span>
          </div>
          <span>Showing {filteredLogs.length} audit records</span>
        </div>
      </div>
    </div>
  );
}
