"use client";
import { useState, useEffect } from 'react';
import { animate } from 'framer-motion';

export default function Home() {
  const [formData, setFormData] = useState({
    DebtRatio: '0.2',
    MonthlyIncome: '4000',
    NumberOfOpenCreditLinesAndLoans: '5',
    NumberOfTime30_59DaysPastDueNotWorse: '0',
    NumberOfTime60_89DaysPastDueNotWorse: '0',
    NumberOfTimes90DaysLate: '0',
    NumberRealEstateLoansOrLines: '1',
    NumberOfDependents: '0',
    age: '35',
    employment_years: '5',
    loan_amount: '15000',
    loan_term: '24'
  });
  const [result, setResult] = useState<any>(null);
  const [displayScore, setDisplayScore] = useState(0);  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clean label mapping for professional UI
  const labelMap: { [key: string]: string } = {
    DebtRatio: 'DEBT RATIO (%)',
    MonthlyIncome: 'MONTHLY INCOME ($)',
    NumberOfOpenCreditLinesAndLoans: 'OPEN CREDIT LINES',
    NumberOfTime30_59DaysPastDueNotWorse: 'LATE PAYMENTS (30-59 DAYS)',
    NumberOfTime60_89DaysPastDueNotWorse: 'LATE PAYMENTS (60-89 DAYS)',
    NumberOfTimes90DaysLate: 'SERIOUS DELINQUENCY (90+ DAYS)',
    NumberRealEstateLoansOrLines: 'REAL ESTATE LOANS',
    NumberOfDependents: 'DEPENDENTS',
    age: 'AGE',
    employment_years: 'EMPLOYMENT YEARS',
    loan_amount: 'LOAN AMOUNT ($)',
    loan_term: 'LOAN TERM (MONTHS)'
  };

  // animate score when a new result arrives
  useEffect(() => {
    if (result) {
      const endValue = result.approval_score * 100;
      const controls = animate(0, endValue, {
        duration: 1,
        onUpdate(value) {
          setDisplayScore(value);
        }
      });
      return () => controls.stop();
    }
  }, [result]);
  const quickFill = () => setFormData({
    DebtRatio: '0.1',
    MonthlyIncome: '7000',
    NumberOfOpenCreditLinesAndLoans: '6',
    NumberOfTime30_59DaysPastDueNotWorse: '0',
    NumberOfTime60_89DaysPastDueNotWorse: '0',
    NumberOfTimes90DaysLate: '0',
    NumberRealEstateLoansOrLines: '1',
    NumberOfDependents: '1',
    age: '30',
    employment_years: '8',
    loan_amount: '10000',
    loan_term: '12'
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(Object.entries(formData).map(([k, v]) => [k, Number(v)]))),
      });
      
      if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      setResult(data);
      
      // Fetch updated history
      const historyRes = await fetch(`${apiUrl}/applications`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
      }
      
      // Trigger statistics update
      localStorage.setItem('statsLastUpdate', Date.now().toString());
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing your request');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05070a] text-slate-900 dark:text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tighter italic text-indigo-600 dark:text-indigo-400 uppercase">Credit Analyzer</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Submit your financial data for AI-powered risk assessment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Form nhập liệu (Application Data) */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4">
            <div className="col-span-2 flex justify-between items-center mb-2">
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-300 italic">APPLICATION DATA</span>
              <button type="button" onClick={quickFill} className="text-[9px] font-bold bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/30">⚡ QUICK FILL</button>
            </div>
            {Object.keys(formData).map((key) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1">
                  {labelMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                </label>
                <input required type="number" step="any" value={(formData as any)[key]} 
                  onChange={(e) => setFormData({...formData, [key]: e.target.value})}
                  className="w-full h-12 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm outline-none focus:border-indigo-500 transition-all font-bold" />
              </div>
            ))}
            <button 
              disabled={loading}
              className="col-span-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed py-4 rounded-xl font-black text-white dark:text-white mt-2 transition-transform active:scale-95 shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
                  ANALYZING...
                </>
              ) : (
                'SUBMIT ANALYSIS'
              )}
            </button>
            {error && (
              <div className="col-span-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-sm text-center">
                {error}
              </div>
            )}
          </form>

          {/* Cột hiển thị Result với Gauge Chart (F10) */}
          <div className="h-full">
            {result ? (
              <div className={`p-10 rounded-[2.5rem] border-2 text-center h-full flex flex-col items-center justify-center transition-all duration-700 backdrop-blur-sm ${result.approved ? 'bg-emerald-500/5 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.1)]' : 'bg-rose-500/5 border-rose-500/50 shadow-[0_0_40px_rgba(244,63,94,0.1)]'}`}>
                <div className="relative w-48 h-48 mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-300 dark:text-slate-800" />
                    <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" 
                      strokeDasharray={502.4} 
                      strokeDashoffset={502.4 - (result.approval_score * 502.4)} 
                      strokeLinecap="round"
                      className={`transition-all duration-1000 ease-out ${result.approved ? 'text-emerald-500' : 'text-rose-500'}`} 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black italic text-slate-900 dark:text-white">{displayScore.toFixed(0)}%</span>
                    <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest text-slate-600 dark:text-slate-400">Credit Score</span>
                  </div>
                </div>
                <h3 className={`text-4xl font-black italic tracking-tighter ${result.approved ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {result.approved ? 'PASSED' : 'REJECTED'}
                </h3>
                <div className="mt-4 px-4 py-1 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-black uppercase tracking-[0.2em]">
                  Risk Level: {result.risk_level}
                </div>
                {result.rejection_reasons && result.rejection_reasons.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {result.rejection_reasons.map((reason: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-full border border-rose-500/30">
                        {reason}
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 italic text-center px-4">
                  {result.recommendation}
                </p>
              </div>
            ) : (
              <div className="h-full min-h-[400px] border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-500 dark:text-slate-600 font-black uppercase tracking-widest text-sm italic animate-pulse text-center p-10">
                Ready to analyze<br/>your financial data
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}