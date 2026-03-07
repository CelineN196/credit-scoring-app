"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function History() {
  const [data, setData] = useState<any[]>([]);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zavpytjnovicyzvyvnxm.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphdnB5dGpub3ZpY3l6dnl2bnhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTM5NTIsImV4cCI6MjA4ODI4OTk1Mn0.ovrifgqDbm_I_cqsFfRdCKYIuBjuUeLDDqvXKJ-lg0E'
  ); 

  // Calculate statistics
  const stats = data.length > 0 ? {
    total: data.length,
    approved: data.filter(item => item.approved).length,
    rejected: data.filter(item => !item.approved).length,
    approvalRate: ((data.filter(item => item.approved).length / data.length) * 100).toFixed(1),
    avgScore: (data.reduce((sum, item) => sum + (item.score || 0), 0) / data.length * 100).toFixed(1)
  } : null;

  useEffect(() => {
    const fetchData = async () => {
      const { data: apps, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (apps) setData(apps);
      if (error) console.error("Lỗi Supabase:", error.message);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-black tracking-tighter italic text-indigo-400 uppercase">Application History</h1>
          <p className="text-sm font-medium text-slate-400">Review all submitted credit applications</p>
        </div>
        
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center">
              <div className="text-2xl font-bold text-indigo-400">{stats.total}</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">Tổng đơn</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center">
              <div className="text-2xl font-bold text-emerald-400">{stats.approved}</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">Đã duyệt</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center">
              <div className="text-2xl font-bold text-rose-400">{stats.rejected}</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">Từ chối</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.approvalRate}%</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">Tỷ lệ duyệt</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.avgScore}%</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">Điểm TB</div>
            </div>
          </div>
        )}
        
        <div className="bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800">
          <table className="w-full border-collapse">
            <thead className="bg-slate-800">
              <tr>
                <th className="p-4 text-left text-slate-300 font-semibold">Thu nhập</th>
                <th className="p-4 text-left text-slate-300 font-semibold">Khoản vay</th>
                <th className="p-4 text-left text-slate-300 font-semibold">Điểm AI</th>
                <th className="p-4 text-left text-slate-300 font-semibold">Kết quả</th>
                <th className="p-4 text-left text-slate-300 font-semibold">Mức rủi ro</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-b border-slate-700 hover:bg-slate-800/30 transition-colors">
                  {/* Dùng toán tử ? để tránh lỗi nếu dữ liệu trống */}
                  <td className="p-4 text-slate-300">${(item.input_data?.income || 0).toLocaleString()}</td>
                  <td className="p-4 text-slate-300">${(item.input_data?.loan_amount || 0).toLocaleString()}</td>
                  <td className="p-4 text-indigo-400 font-mono font-semibold">
                    {item.score ? (item.score * 100).toFixed(2) : "0.00"}%
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.approved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {item.approved ? 'APPROVED' : 'REJECTED'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">
                    {item.risk_level}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}