@echo off
echo Starting PrintShop Backend...
cd /d %~dp0

if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
)

call .venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt -q

echo Seeding database...
python -m seeds.seed_data

echo Starting FastAPI server...
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
