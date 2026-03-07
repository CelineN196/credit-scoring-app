import os
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

# 1. Khởi tạo
load_dotenv()
app = FastAPI()

# 2. Kết nối Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL else None

# 3. Load Model AI (Phải có đủ 10 trường)
try:
    model = joblib.load("credit_model.pkl")
    print("✅ Model AI đã sẵn sàng!")
except Exception as e:
    print(f"❌ Lỗi nạp model: {e}")

# 4. Cấu hình CORS for Deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "http://localhost:3001",  # Alternative local port
        "https://*.vercel.app",    # Vercel deployment (wildcard for all Vercel apps)
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# 5. Schema 10 trường chuẩn Phase 2/4
class CreditData(BaseModel):
    income: float
    age: int
    employment_years: int
    loan_amount: float
    loan_term: int
    credit_history_length: int
    num_credit_lines: int
    num_delinquencies: int
    debt_to_income_ratio: float
    savings_balance: float

@app.get("/health")
async def health_check():
    model_status = "loaded" if 'model' in globals() else "not loaded"
    db_status = "connected" if supabase else "not connected"
    return {"status": "healthy", "model": model_status, "database": db_status}

@app.post("/predict")
async def predict(data: CreditData):
    try:
        # ===== HARD RULES (Expert System - Applied First) =====
        rejection_reasons = []
        hard_reject = False
        risk_level = "Low"  # Default
        approved = True     # Default

        # Age limit hard rule
        if data.age > 75:
            hard_reject = True
            rejection_reasons.append("🚩 Age Limit Exceeded")
            risk_level = "Extreme"
            approved = False

        # High DTI hard rule
        if data.debt_to_income_ratio > 0.5:
            hard_reject = True
            rejection_reasons.append("🚩 High DTI")
            if risk_level != "Extreme":  # Don't override age-based extreme
                risk_level = "High"
            approved = False

        # Delinquencies hard rule
        if data.num_delinquencies > 2:
            hard_reject = True
            rejection_reasons.append("🚩 Poor Credit History")
            if risk_level not in ["Extreme", "High"]:  # Don't override higher risks
                risk_level = "High"
            approved = False

        # If hard rejected, return immediately with specific recommendations
        if hard_reject:
            recommendation = "Application rejected due to: " + ", ".join([r.replace("🚩 ", "") for r in rejection_reasons])

            # Safe zone suggestion for loan amount if rejected due to DTI
            if data.debt_to_income_ratio > 0.5:
                max_safe_loan = data.income * 0.3  # Suggest loan that keeps DTI under 30%
                recommendation += f" 💡 Safe Zone: Consider reducing loan amount to ${max_safe_loan:,.0f} or less for better approval chances."

            return {
                "approval_score": 0.1,
                "approved": False,
                "risk_level": risk_level,
                "recommendation": recommendation,
                "rejection_reasons": rejection_reasons
            }

        # ===== ML MODEL PREDICTION =====
        input_df = pd.DataFrame([data.model_dump()])
        prob = float(model.predict_proba(input_df)[0][1])

        # ===== ENHANCED SCORING LOGIC =====
        final_score = prob
        risk_adjustments = []

        # Disposable income calculation and penalty
        disposable_income = data.income * (1 - data.debt_to_income_ratio)
        if disposable_income < 1000:
            final_score *= 0.8  # Reduce score by 20%
            risk_adjustments.append("🚩 Low Disposable Income")

        # Employment stability check
        if data.employment_years < 1:
            risk_adjustments.append("🚩 Short Employment")

        # ===== FINAL APPROVAL DECISION =====
        approved = final_score > 0.65

        # Risk level determination with employment consideration
        if final_score > 0.8 and not risk_adjustments:
            risk_level = "Low"
        elif final_score > 0.5 or (final_score > 0.4 and len(risk_adjustments) <= 1):
            risk_level = "Medium"
        else:
            risk_level = "High"

        # Override risk level for short employment (makes it harder to get Low risk)
        if "🚩 Short Employment" in risk_adjustments and risk_level == "Low":
            risk_level = "Medium"

        # ===== DYNAMIC RECOMMENDATIONS =====
        if approved:
            recommendation = "Congratulations! Your application has been approved. Please proceed with the next steps."
            if risk_adjustments:
                notes = [r.replace("🚩 ", "") for r in risk_adjustments]
                recommendation += f" Note: {', '.join(notes)} may affect future approvals."
        else:
            recommendation_parts = ["Unfortunately, your application has been rejected."]
            if risk_adjustments:
                reasons = [r.replace("🚩 ", "") for r in risk_adjustments]
                recommendation_parts.append(f"Key factors: {', '.join(reasons)}")
                if "Low Disposable Income" in reasons:
                    recommendation_parts.append("Consider increasing income or reducing debt obligations.")
                if "Short Employment" in reasons:
                    recommendation_parts.append("Building longer employment history may improve approval chances.")
            recommendation = " ".join(recommendation_parts)

        # ===== DATABASE STORAGE =====
        if supabase:
            supabase.table("applications").insert({
                "input_data": data.model_dump(),
                "score": final_score,
                "approved": approved,
                "risk_level": risk_level
            }).execute()

        return {
            "approval_score": final_score,
            "approved": approved,
            "risk_level": risk_level,
            "recommendation": recommendation,
            "rejection_reasons": risk_adjustments if not approved else []
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/applications")
async def get_applications(limit: int = 10, offset: int = 0):
    if not supabase: return []
    # Lấy lịch sử với pagination
    return supabase.table("applications").select("*").order("created_at", desc=True).range(offset, offset + limit - 1).execute().data