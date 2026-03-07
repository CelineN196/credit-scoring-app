"use client";
import { useEffect, useState } from 'react';

export default function Stats() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        const res = await fetch(`${apiUrl}/applications`);
        if (!res.ok) throw new Error('Failed to fetch data');
        const applications = await res.json();
        setData(applications);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate comprehensive statistics
  const stats = data.length > 0 ? {
    totalApps: data.length,
    approved: data.filter(item => item.approved).length,
    rejected: data.filter(item => !item.approved).length,
    approvalRate: ((data.filter(item => item.approved).length / data.length) * 100).toFixed(1),
    avgScore: (data.reduce((sum, item) => sum + (item.score || 0), 0) / data.length * 100).toFixed(1),

    // Risk level distribution
    riskLevels: {
      low: data.filter(item => item.risk_level?.toLowerCase().includes('low')).length,
      medium: data.filter(item => item.risk_level?.toLowerCase().includes('medium')).length,
      high: data.filter(item => item.risk_level?.toLowerCase().includes('high')).length,
    },

    // Score distribution
    scoreRanges: {
      excellent: data.filter(item => (item.score || 0) >= 0.8).length,
      good: data.filter(item => (item.score || 0) >= 0.6 && (item.score || 0) < 0.8).length,
      fair: data.filter(item => (item.score || 0) >= 0.4 && (item.score || 0) < 0.6).length,
      poor: data.filter(item => (item.score || 0) < 0.4).length,
    },

    // Recent trends (last 7 days vs previous 7 days)
    recentTrend: (() => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const recent = data.filter(item => new Date(item.created_at) >= sevenDaysAgo);
      const previous = data.filter(item =>
        new Date(item.created_at) >= fourteenDaysAgo && new Date(item.created_at) < sevenDaysAgo
      );

      const recentRate = recent.length > 0 ? (recent.filter(item => item.approved).length / recent.length) * 100 : 0;
      const previousRate = previous.length > 0 ? (previous.filter(item => item.approved).length / previous.length) * 100 : 0;

      return {
        recentCount: recent.length,
        previousCount: previous.length,
        trend: recentRate - previousRate
      };
    })()
  } : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-rose-400 mb-4">⚠️ Error loading statistics</div>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tighter italic text-indigo-400 uppercase">Statistics Dashboard</h1>
          <p className="text-sm font-medium text-slate-400">Comprehensive analytics and insights</p>
        </div>

        {stats && (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-center">
                <div className="text-3xl font-black text-indigo-400 mb-2">{stats.totalApps}</div>
                <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Applications</div>
              </div>
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-center">
                <div className="text-3xl font-black text-emerald-400 mb-2">{stats.approvalRate}%</div>
                <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Approval Rate</div>
              </div>
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-center">
                <div className="text-3xl font-black text-blue-400 mb-2">{stats.avgScore}%</div>
                <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Average Score</div>
              </div>
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-center">
                <div className={`text-3xl font-black mb-2 ${stats.recentTrend.trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stats.recentTrend.trend >= 0 ? '+' : ''}{stats.recentTrend.trend.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Trend (7d)</div>
              </div>
            </div>

            {/* Risk Level Distribution */}
            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
              <h2 className="text-2xl font-bold text-indigo-400 mb-6 text-center">Risk Level Distribution</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-black text-emerald-400 mb-2">{stats.riskLevels.low}</div>
                  <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Low Risk</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {stats.totalApps > 0 ? ((stats.riskLevels.low / stats.totalApps) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-yellow-400 mb-2">{stats.riskLevels.medium}</div>
                  <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Medium Risk</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {stats.totalApps > 0 ? ((stats.riskLevels.medium / stats.totalApps) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-rose-400 mb-2">{stats.riskLevels.high}</div>
                  <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">High Risk</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {stats.totalApps > 0 ? ((stats.riskLevels.high / stats.totalApps) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* Score Distribution */}
            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
              <h2 className="text-2xl font-bold text-indigo-400 mb-6 text-center">Credit Score Distribution</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-black text-emerald-400 mb-2">{stats.scoreRanges.excellent}</div>
                  <div className="text-sm font-medium text-slate-400">Excellent (80-100%)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-blue-400 mb-2">{stats.scoreRanges.good}</div>
                  <div className="text-sm font-medium text-slate-400">Good (60-79%)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-yellow-400 mb-2">{stats.scoreRanges.fair}</div>
                  <div className="text-sm font-medium text-slate-400">Fair (40-59%)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-rose-400 mb-2">{stats.scoreRanges.poor}</div>
                  <div className="text-sm font-medium text-slate-400">Poor (0-39%)</div>
                </div>
              </div>
            </div>

            {/* Recent Activity Summary */}
            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
              <h2 className="text-2xl font-bold text-indigo-400 mb-6 text-center">Recent Activity</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-black text-indigo-400 mb-2">{stats.recentTrend.recentCount}</div>
                  <div className="text-sm font-medium text-slate-400">Applications (Last 7 days)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-slate-300 mb-2">{stats.recentTrend.previousCount}</div>
                  <div className="text-sm font-medium text-slate-400">Applications (Previous 7 days)</div>
                </div>
              </div>
            </div>
          </>
        )}

        {data.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg">No data available yet</div>
            <p className="text-slate-500 mt-2">Submit some applications to see statistics</p>
          </div>
        )}
      </div>
    </div>
  );
}