"use client";
import { useState, useEffect } from 'react';
import { motion, animate } from 'framer-motion';
import { CheckCircle, AlertTriangle, AlertCircle, TrendingUp, Info, Loader2, BarChart3 } from 'lucide-react';

// Model Comparison Component (for model_scores data)
const ModelComparisonCard = ({
  modelScores
}: {
  modelScores: { xgboost: number; random_forest: number; ensemble_average: number };
}) => {
  const xgboost = { approved: modelScores.xgboost > 0.5, probability: modelScores.xgboost };
  const randomForest = { approved: modelScores.random_forest > 0.5, probability: modelScores.random_forest };
  const ensembleAverage = modelScores.ensemble_average;
  const hasConflict = xgboost.approved !== randomForest.approved;
  const finalVerdict = ensembleAverage > 0.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">AI Model Comparison</h3>
      </div>

      {hasConflict && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Model Conflict Detected</span>
          </div>
          <p className="text-xs text-amber-700 mt-1">
            Models disagree on this application. Ensemble average used for final decision.
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* XGBoost Model */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">XGBoost Model</span>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Boosting Algorithm - Combines weak learners sequentially
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                xgboost.approved
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {xgboost.approved ? 'Approved' : 'Rejected'}
              </span>
              <span className="text-sm text-gray-600">
                {(xgboost.probability * 100).toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xgboost.probability * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-2 rounded-full ${
                xgboost.approved ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
          </div>
        </div>

        {/* Random Forest Model */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Random Forest Model</span>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Bagging Algorithm - Combines multiple decision trees
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                randomForest.approved
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {randomForest.approved ? 'Approved' : 'Rejected'}
              </span>
              <span className="text-sm text-gray-600">
                {(randomForest.probability * 100).toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${randomForest.probability * 100}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className={`h-2 rounded-full ${
                randomForest.approved ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Ensemble Average */}
      <div className="border-t pt-4 mt-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Ensemble Average</span>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                finalVerdict
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {finalVerdict ? 'Approved' : 'Rejected'}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {(ensembleAverage * 100).toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${ensembleAverage * 100}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
              className={`h-3 rounded-full ${
                finalVerdict ? 'bg-green-600' : 'bg-red-600'
              }`}
            />
          </div>
          <p className="text-xs text-gray-600 text-center">
            Final decision based on average of both models
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-pulse">
    <div className="flex items-center gap-2 mb-6">
      <div className="w-5 h-5 bg-gray-300 rounded"></div>
      <div className="h-4 bg-gray-300 rounded w-48"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-300 rounded w-32"></div>
          <div className="h-6 bg-gray-300 rounded w-20"></div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2"></div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-300 rounded w-32"></div>
          <div className="h-6 bg-gray-300 rounded w-20"></div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2"></div>
      </div>
    </div>
    <div className="border-t pt-4 mt-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-300 rounded w-32"></div>
          <div className="h-6 bg-gray-300 rounded w-20"></div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3"></div>
      </div>
    </div>
  </div>
);

// Model Verdict Section Component
function ModelVerdictSection({ xgboostScore, randomForestScore }: { xgboostScore: number; randomForestScore: number }) {
  const xgboostApproves = xgboostScore > 0.65;
  const randomForestApproves = randomForestScore > 0.65;
  const modelsAgree = xgboostApproves === randomForestApproves;
  const disagreementLevel = Math.abs(xgboostScore - randomForestScore);

  return (
    <div className={`p-8 rounded-[2rem] border-2 backdrop-blur-sm transition-all ${
      modelsAgree 
        ? 'bg-blue-500/5 border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.1)]'
        : 'bg-amber-500/5 border-amber-500/50 shadow-[0_0_40px_rgba(217,119,6,0.1)]'
    }`}>
      <div className="flex items-center gap-3 mb-6">
        {modelsAgree ? (
          <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        )}
        <h3 className={`text-2xl font-black italic tracking-tighter ${
          modelsAgree 
            ? 'text-blue-700 dark:text-blue-300' 
            : 'text-amber-700 dark:text-amber-300'
        }`}>
          MODELS VERDICT
        </h3>
      </div>

      <div className="space-y-4">
        {modelsAgree ? (
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <p className="text-blue-800 dark:text-blue-200 font-bold text-center">
              ✓ Models in complete agreement
            </p>
            <p className="text-blue-700 dark:text-blue-300 text-sm text-center mt-2">
              Both models recommend to <span className={xgboostApproves ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-rose-600 dark:text-rose-400 font-black'}>
                {xgboostApproves ? 'APPROVE' : 'REJECT'}
              </span> this application
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <p className="text-amber-800 dark:text-amber-200 font-black">
                  HIGH UNCERTAINTY
                </p>
              </div>
              <p className="text-amber-700 dark:text-amber-300 text-sm">
                Manual Review Recommended - Models disagree by {(disagreementLevel * 100).toFixed(1)}%
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg border ${
                xgboostApproves 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-rose-500/10 border-rose-500/30'
              }`}>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">XGBoost Says:</p>
                <p className={`text-lg font-black ${
                  xgboostApproves 
                    ? 'text-emerald-700 dark:text-emerald-300' 
                    : 'text-rose-700 dark:text-rose-300'
                }`}>
                  {xgboostApproves ? '✓ APPROVE' : '✗ REJECT'}
                </p>
              </div>
              <div className={`p-3 rounded-lg border ${
                randomForestApproves 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-rose-500/10 border-rose-500/30'
              }`}>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Random Forest Says:</p>
                <p className={`text-lg font-black ${
                  randomForestApproves 
                    ? 'text-emerald-700 dark:text-emerald-300' 
                    : 'text-rose-700 dark:text-rose-300'
                }`}>
                  {randomForestApproves ? '✓ APPROVE' : '✗ REJECT'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
  const [displayScore, setDisplayScore] = useState(0);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
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
      const formPayload = Object.fromEntries(Object.entries(formData).map(([k, v]) => [k, Number(v)]));
      
      // Call /predict-compare endpoint (now the primary endpoint)
      const res = await fetch(`${apiUrl}/predict-compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formPayload),
      });
      
      if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      setComparisonData(data);
      
      // Also call /predict for backward compatibility (to get the full response with recommendations)
      try {
        const predictRes = await fetch(`${apiUrl}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formPayload),
        });
        
        if (predictRes.ok) {
          const predictData = await predictRes.json();
          setResult(predictData);
        }
      } catch (predictErr) {
        console.log('Predict endpoint not available, using comparison data only.');
        // Create a basic result from comparison data
        const ensembleAverage = (data.xgboost.probability + data.random_forest.probability) / 2;
        setResult({
          approval_score: ensembleAverage,
          approved: ensembleAverage > 0.5,
          risk_level: ensembleAverage > 0.8 ? 'Low' : ensembleAverage > 0.5 ? 'Medium' : 'High',
          recommendation: ensembleAverage > 0.5 ? 'Application approved based on ensemble average.' : 'Application rejected based on ensemble average.',
          rejection_reasons: [],
          model_used: 'ensemble',
          model_scores: {
            xgboost: data.xgboost.probability,
            random_forest: data.random_forest.probability,
            ensemble_average: ensembleAverage
          }
        });
      }
      
      // Fetch updated history
      const historyRes = await fetch(`${apiUrl}/applications`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
      }
      
      // Trigger statistics update
      localStorage.setItem('statsLastUpdate', Date.now().toString());
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while processing your request';
      // Check if it's a connection/server startup error
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('500')) {
        setError('Server is starting up, please try again in a moment');
      } else {
        setError(errorMessage);
      }
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

        {/* MODEL COMPARISON SECTION */}
        {result && result.model_scores && (!result.rejection_reasons || result.rejection_reasons.length === 0) && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black tracking-tighter italic text-slate-900 dark:text-white uppercase">AI Model Comparison</h2>
            
            {/* Side-by-Side Model Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* XGBoost Model */}
              <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-sm hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black italic tracking-tight text-slate-900 dark:text-white">XGBoost</h3>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        Boosting Algorithm - Combines weak learners sequentially
                      </div>
                    </div>
                  </div>
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Confidence Score</span>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{(result.model_scores.xgboost * 100).toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${result.model_scores.xgboost * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${result.model_scores.xgboost > 0.65 ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-rose-500/10 border border-rose-500/30'}`}>
                    {result.model_scores.xgboost > 0.65 ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                    )}
                    <span className={`text-sm font-bold ${result.model_scores.xgboost > 0.65 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                      {result.model_scores.xgboost > 0.65 ? 'APPROVE' : 'REJECT'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Random Forest Model */}
              <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-sm hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black italic tracking-tight text-slate-900 dark:text-white">Random Forest</h3>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        Bagging Algorithm - Combines multiple decision trees
                      </div>
                    </div>
                  </div>
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Confidence Score</span>
                    <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{(result.model_scores.random_forest * 100).toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${result.model_scores.random_forest * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${result.model_scores.random_forest > 0.65 ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-rose-500/10 border border-rose-500/30'}`}>
                    {result.model_scores.random_forest > 0.65 ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                    )}
                    <span className={`text-sm font-bold ${result.model_scores.random_forest > 0.65 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                      {result.model_scores.random_forest > 0.65 ? 'APPROVE' : 'REJECT'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* VERDICT SECTION */}
            <ModelVerdictSection 
              xgboostScore={result.model_scores.xgboost}
              randomForestScore={result.model_scores.random_forest}
            />
          </div>
        )}
      </div>

      {/* MODEL COMPARISON SECTION (from /predict-compare endpoint) */}
      <div className="mt-20 border-t-2 border-slate-200 dark:border-slate-800 pt-20">
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">Processing your request...</span>
            </div>
            <p className="text-center text-gray-600 mt-2">Please wait while we analyze your financial data</p>
          </div>
        ) : error ? (
          <div className={`border rounded-xl p-6 ${error === 'Server is starting up, please try again in a moment' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-3">
              {error === 'Server is starting up, please try again in a moment' ? (
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
              <div>
                <h3 className={`text-lg font-semibold ${error === 'Server is starting up, please try again in a moment' ? 'text-amber-800' : 'text-red-800'}`}>
                  {error === 'Server is starting up, please try again in a moment' ? 'Server Starting Up' : 'Server Connection Error'}
                </h3>
                <p className={`mt-1 ${error === 'Server is starting up, please try again in a moment' ? 'text-amber-700' : 'text-red-700'}`}>{error}</p>
                {error !== 'Server is starting up, please try again in a moment' && (
                  <p className="text-sm text-red-600 mt-2">
                    Please check if the backend server is running and try again.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : result && result.rejection_reasons && result.rejection_reasons.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 border border-gray-200 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">AI Analysis Skipped</h3>
            </div>
            <p className="text-gray-700">
              AI Analysis was skipped because the application violates bank policy ({result.rejection_reasons.join(', ')}).
            </p>
          </motion.div>
        ) : comparisonData ? (
          <ModelComparisonCard
            modelScores={{
              xgboost: comparisonData.xgboost.probability,
              random_forest: comparisonData.random_forest.probability,
              ensemble_average: comparisonData.ensemble_average
            }}
          />
        ) : result && result.model_scores ? (
          <ModelComparisonCard
            modelScores={result.model_scores}
          />
        ) : null}
      </div>
    </div>
  );
}