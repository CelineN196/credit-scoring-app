# 🏦 VTI CREDIT AI PRO - Backend API

Hệ thống phân tích và dự đoán rủi ro tín dụng dựa trên Machine Learning (XGBoost & SMOTE).

## 🚀 Tính năng chính
- **Credit Prediction**: API dự đoán khả năng duyệt hồ sơ vay dựa trên các chỉ số tài chính.
- **Model Training**: Tích hợp mô hình đã được train với độ chính xác cao (MNIST & Bank Marketing context).
- **Supabase Integration**: Lưu trữ lịch sử hồ sơ và dữ liệu thống kê thời gian thực.
- **Swagger UI**: Tài liệu API tự động.

## 🛠️ Công nghệ sử dụng
- Python (FastAPI)
- Scikit-learn, XGBoost (Model inference)
- Supabase (Database)
- Render (Deployment)

## 📥 Hướng dẫn cài đặt (Local)
1. Clone repo: `git clone [URL]`
2. Tạo môi trường ảo: `python -m venv .venv`
3. Kích hoạt: 
   - Windows: `.venv\Scripts\activate`
   - Mac/Linux: `source .venv/bin/activate`
4. Cài đặt thư viện: `pip install -r requirements.txt`
5. Chạy app: `uvicorn main:app --reload`

## 🌐 API Endpoints
- `GET /applications`: Lấy danh sách hồ sơ (có hỗ trợ limit/offset).
- `POST /predict`: Gửi dữ liệu tài chính để nhận kết quả phân tích AI.
- `GET /docs`: Truy cập Swagger UI.