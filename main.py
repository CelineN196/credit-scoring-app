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

# 3. Load Multiple ML Models for Comparison
model_xgb = None
model_rf = None

@app.on_event("startup")
async def load_models():
    """Load both XGBoost and Random Forest models on server startup"""
    global model_xgb, model_rf
    
    models_loaded = 0
    
    # Load XGBoost Model (credit_model.pkl is the XGBoost model)
    try:
        model_xgb = joblib.load("credit_model.pkl")
        models_loaded += 1
        print("✅ XGBoost model loaded successfully!")
    except FileNotFoundError:
        print(f"❌ Error: credit_model.pkl not found")
    except Exception as e:
        print(f"❌ Error loading XGBoost model: {e}")
    
    # Load Random Forest Model
    try:
        model_rf = joblib.load("credit_model_rf.pkl")
        models_loaded += 1
        print("✅ Random Forest model loaded successfully!")
    except FileNotFoundError:
        print(f"❌ Error: credit_model_rf.pkl not found")
    except Exception as e:
        print(f"❌ Error loading Random Forest model: {e}")
    
    # Print final status
    if models_loaded == 2:
        print("✅✅ Both models are ready for predictions!")
    else:
        print(f"⚠️  Only {models_loaded}/2 models loaded. Server will continue but predictions may be limited.")

# 4. Cấu hình CORS for Deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# 5. Schema 10 trường chuẩn Phase 2/4
class CreditData(BaseModel):
    # original fields with default values
    income: float = 0.0
    age: int = 0
    employment_years: int = 0
    loan_amount: float = 0.0
    loan_term: int = 0
    credit_history_length: int = 0
    num_credit_lines: int = 0
    num_delinquencies: int = 0
    debt_to_income_ratio: float = 0.0
    savings_balance: float = 0.0

    # Kaggle dataset fields with default values
    DebtRatio: float | None = None
    MonthlyIncome: float | None = None
    NumberOfOpenCreditLinesAndLoans: int | None = None
    NumberOfTime30_59DaysPastDueNotWorse: int | None = None
    NumberOfTime60_89DaysPastDueNotWorse: int | None = None
    NumberOfTimes90DaysLate: int | None = None
    NumberRealEstateLoansOrLines: int | None = None
    NumberOfDependents: int | None = None

    model_config = {"extra": "allow"}

# Define feature sets for each model type
# Both models use the same 10 features; this structure allows for future flexibility
MODEL_FEATURES = {
    "xgboost": [
        'income', 'age', 'employment_years', 'loan_amount', 'loan_term',
        'credit_history_length', 'num_credit_lines', 'num_delinquencies',
        'debt_to_income_ratio', 'savings_balance'
    ],
    "random_forest": [
        'income', 'age', 'employment_years', 'loan_amount', 'loan_term',
        'credit_history_length', 'num_credit_lines', 'num_delinquencies',
        'debt_to_income_ratio', 'savings_balance'
    ]
}

def get_model_features(model_type: str = "xgboost") -> list:
    """Get the feature list for a specific model type"""
    return MODEL_FEATURES.get(model_type.lower(), MODEL_FEATURES["xgboost"])

def prepare_model_input(data: CreditData, model_type: str = "xgboost") -> pd.DataFrame:
    """
    Prepare input data for a specific model type.
    Ensures correct feature order and handles model-specific transformations.
    """
    features = get_model_features(model_type)
    
    # Create input data dictionary with all required features
    input_dict = {
        'income': data.income,
        'age': data.age,
        'employment_years': data.employment_years,
        'loan_amount': data.loan_amount,
        'loan_term': data.loan_term,
        'credit_history_length': data.credit_history_length,
        'num_credit_lines': data.num_credit_lines,
        'num_delinquencies': data.num_delinquencies,
        'debt_to_income_ratio': data.debt_to_income_ratio,
        'savings_balance': data.savings_balance
    }
    
    # Return DataFrame with features in correct order
    return pd.DataFrame([{feature: input_dict[feature] for feature in features}])

def normalize_data(data: CreditData) -> CreditData:
    """Normalize Kaggle fields to standard fields if standard fields are empty"""
    if data.income == 0 and data.MonthlyIncome is not None:
        data.income = data.MonthlyIncome * 12
    if data.debt_to_income_ratio == 0 and data.DebtRatio is not None:
        data.debt_to_income_ratio = data.DebtRatio
    if data.num_credit_lines == 0 and data.NumberOfOpenCreditLinesAndLoans is not None:
        data.num_credit_lines = data.NumberOfOpenCreditLinesAndLoans
    
    # Combine late payments as delinquencies
    late = 0
    if data.NumberOfTime30_59DaysPastDueNotWorse is not None:
        late += data.NumberOfTime30_59DaysPastDueNotWorse
    if data.NumberOfTime60_89DaysPastDueNotWorse is not None:
        late += data.NumberOfTime60_89DaysPastDueNotWorse
    if data.NumberOfTimes90DaysLate is not None:
        late += data.NumberOfTimes90DaysLate
    if late > 0:
        data.num_delinquencies = late
    
    return data

@app.get("/health")
async def health_check():
    model_xgb_status = "loaded" if model_xgb is not None else "not loaded"
    model_rf_status = "loaded" if model_rf is not None else "not loaded"
    db_status = "connected" if supabase else "not connected"
    return {
        "status": "healthy",
        "model_xgb": model_xgb_status,
        "model_rf": model_rf_status,
        "database": db_status
    }

@app.post("/predict")
async def predict(data: CreditData, model_type: str = "xgboost"):
    try:
        # Normalize model_type and select the appropriate model
        model_type = model_type.lower().strip()
        
        # Map model selection
        model_mapping = {
            "xgboost": model_xgb,
            "random_forest": model_rf,
            "rf": model_rf,
        }
        
        # Select model, default to xgboost if invalid type
        selected_model = model_mapping.get(model_type, model_xgb)
        if model_type not in model_mapping:
            model_type = "xgboost"  # Default to xgboost
        
        # Normalize Kaggle fields to standard fields
        data = normalize_data(data)
        
        # ===== HARD RULES (Expert System - Applied First) =====
        rejection_reasons = []
        hard_reject = False
        risk_level = "Low"
        approved = True

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
            if risk_level != "Extreme":
                risk_level = "High"
            approved = False

        # Delinquencies hard rule
        if data.num_delinquencies > 2:
            hard_reject = True
            rejection_reasons.append("🚩 Poor Credit History")
            if risk_level not in ["Extreme", "High"]:
                risk_level = "High"
            approved = False

        # If hard rejected, return immediately with specific recommendations
        if hard_reject:
            recommendation = "Application rejected due to: " + ", ".join([r.replace("🚩 ", "") for r in rejection_reasons])

            if data.debt_to_income_ratio > 0.5:
                max_safe_loan = data.income * 0.3
                recommendation += f" 💡 Safe Zone: Consider reducing loan amount to ${max_safe_loan:,.0f} or less for better approval chances."

            return {
                "approval_score": 0.1,
                "approved": False,
                "risk_level": risk_level,
                "recommendation": recommendation,
                "rejection_reasons": rejection_reasons,
                "model_used": model_type
            }

        # ===== ML MODEL PREDICTION =====
        # Prepare input data with correct features for the selected model
        input_df = prepare_model_input(data, model_type)
        
        # Get predictions from both models for comparison
        prob_xgb = None
        prob_rf = None
        
        if model_xgb:
            input_df_xgb = prepare_model_input(data, "xgboost")
            prob_xgb = float(model_xgb.predict_proba(input_df_xgb)[0][1])
        if model_rf:
            input_df_rf = prepare_model_input(data, "random_forest")
            prob_rf = float(model_rf.predict_proba(input_df_rf)[0][1])
        
        # Use selected model for final prediction
        if selected_model is not None:
            prob = float(selected_model.predict_proba(input_df)[0][1])
        elif prob_xgb is not None:
            prob = prob_xgb
            model_type = "xgboost"
        elif prob_rf is not None:
            prob = prob_rf
            model_type = "random_forest"
        else:
            raise HTTPException(status_code=500, detail="No models available for prediction")

        # ===== ENHANCED SCORING LOGIC =====
        final_score = prob
        risk_adjustments = []

        # Disposable income calculation and penalty
        disposable_income = data.income * (1 - data.debt_to_income_ratio)
        if disposable_income < 1000:
            final_score *= 0.8
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

        # Override risk level for short employment
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

        # Calculate ensemble average when both models are available
        ensemble_average = None
        if prob_xgb is not None and prob_rf is not None:
            ensemble_average = (prob_xgb + prob_rf) / 2

        return {
            "approval_score": final_score,
            "approved": approved,
            "risk_level": risk_level,
            "recommendation": recommendation,
            "rejection_reasons": risk_adjustments if not approved else [],
            "model_used": model_type,
            "model_scores": {
                "xgboost": prob_xgb,
                "random_forest": prob_rf,
                "ensemble_average": ensemble_average
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-compare")
async def predict_compare(data: CreditData):
    """
    Compare predictions from both XGBoost and Random Forest models side-by-side.
    Returns predictions, probabilities, and ensemble average from both models.
    """
    try:
        # Normalize Kaggle fields to standard fields
        data = normalize_data(data)
        
        # Initialize response
        comparison = {
            "xgboost": None,
            "random_forest": None,
            "ensemble_average": 0.0
        }
        
        probabilities = []
        
        # Get XGBoost predictions
        if model_xgb:
            input_df_xgb = prepare_model_input(data, "xgboost")
            prediction_xgb = int(model_xgb.predict(input_df_xgb)[0])
            probability_xgb = float(model_xgb.predict_proba(input_df_xgb)[0][1])
            comparison["xgboost"] = {
                "approved": bool(prediction_xgb),
                "probability": probability_xgb
            }
            probabilities.append(probability_xgb)
        
        # Get Random Forest predictions
        if model_rf:
            input_df_rf = prepare_model_input(data, "random_forest")
            prediction_rf = int(model_rf.predict(input_df_rf)[0])
            probability_rf = float(model_rf.predict_proba(input_df_rf)[0][1])
            comparison["random_forest"] = {
                "approved": bool(prediction_rf),
                "probability": probability_rf
            }
            probabilities.append(probability_rf)
        
        # Calculate ensemble average
        if probabilities:
            comparison["ensemble_average"] = float(sum(probabilities) / len(probabilities))
        
        # Ensure at least one model is available
        if comparison["xgboost"] is None and comparison["random_forest"] is None:
            raise HTTPException(status_code=500, detail="No models available for comparison")
        
        return comparison

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/applications")
async def get_applications(limit: int = 1000, offset: int = 0):
    if not supabase:
        return []
    # Get all records without range limitation for full dataset
    result = supabase.table("applications").select("*", count="exact").order("created_at", desc=True).execute()
    return result.data