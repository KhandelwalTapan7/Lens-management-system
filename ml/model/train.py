import pandas as pd
import joblib
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split

DATA_PATH = "../data/order_history.csv"
MODEL_PATH = "tat_model.pkl"

CATEGORICAL_COLS = ["lens_type", "lens_index", "lens_availability", "store_location"]
NUMERIC_COLS = [
    "coatings_count",
    "current_stage_index",
    "total_stages",
    "reorder_count",
    "hours_elapsed",
    "sla_hours",
]

def build_preprocessor():
    return ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_COLS),
            ("num", StandardScaler(), NUMERIC_COLS),
        ]
    )

def main():
    df = pd.read_csv(DATA_PATH)

    X = df[CATEGORICAL_COLS + NUMERIC_COLS]
    y_hours = df["actual_total_hours"]
    y_breach = df["breached"]

    preprocessor = build_preprocessor()
    X_transformed = preprocessor.fit_transform(X)

    X_train, X_test, y_hours_train, y_hours_test, y_breach_train, y_breach_test = train_test_split(
        X_transformed, y_hours, y_breach, test_size=0.2, random_state=42
    )

    # Regression model: predicted total hours
    reg = RandomForestRegressor(n_estimators=100, random_state=42)
    reg.fit(X_train, y_hours_train)
    print("Regressor R^2 on test set:", reg.score(X_test, y_hours_test))

    # Classification model: breach probability
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_breach_train)
    print("Classifier accuracy on test set:", clf.score(X_test, y_breach_test))

    joblib.dump(
        {
            "preprocessor": preprocessor,
            "regressor": reg,
            "classifier": clf,
            "categorical_cols": CATEGORICAL_COLS,
            "numeric_cols": NUMERIC_COLS,
        },
        MODEL_PATH,
    )
    print(f"Model saved to {MODEL_PATH}")

if __name__ == "__main__":
    main()
