import os
import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel

MODEL_PATH = os.path.join(os.path.dirname(__file__), "tat_model.pkl")

app = FastAPI(title="Eluno TAT Prediction Service")

_model_bundle = None

def get_model_bundle():
    global _model_bundle
    if _model_bundle is None:
        _model_bundle = joblib.load(MODEL_PATH)
    return _model_bundle


class OrderFeatures(BaseModel):
    lens_type: str
    lens_index: str
    coatings_count: int
    lens_availability: str
    store_location: str
    current_stage_index: int
    total_stages: int
    reorder_count: int
    hours_elapsed: float
    hours_until_deadline: float
    sla_hours: float


class PredictionResponse(BaseModel):
    breach_probability: float
    predicted_remaining_hours: float


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictionResponse)
def predict(features: OrderFeatures):
    bundle = get_model_bundle()
    preprocessor = bundle["preprocessor"]
    regressor = bundle["regressor"]
    classifier = bundle["classifier"]
    cat_cols = bundle["categorical_cols"]
    num_cols = bundle["numeric_cols"]

    row = {
        "lens_type": features.lens_type,
        "lens_index": features.lens_index,
        "lens_availability": features.lens_availability,
        "store_location": features.store_location,
        "coatings_count": features.coatings_count,
        "current_stage_index": features.current_stage_index,
        "total_stages": features.total_stages,
        "reorder_count": features.reorder_count,
        "hours_elapsed": features.hours_elapsed,
        "sla_hours": features.sla_hours,
    }

    df = pd.DataFrame([row])[cat_cols + num_cols]
    X = preprocessor.transform(df)

    predicted_total_hours = float(regressor.predict(X)[0])
    breach_proba = float(classifier.predict_proba(X)[0][1])

    # Remaining hours of work = predicted total - hours already elapsed (floor at 0)
    predicted_remaining_hours = max(0.0, predicted_total_hours - features.hours_elapsed)

    return PredictionResponse(
        breach_probability=round(breach_proba, 3),
        predicted_remaining_hours=round(predicted_remaining_hours, 1),
    )
