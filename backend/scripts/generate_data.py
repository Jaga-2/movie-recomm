import os
from pathlib import Path
import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = PROJECT_ROOT / "backend"


def main():
    print("Generating synthetic water quality dataset...")
    # Set seed for reproducibility
    np.random.seed(42)
    num_samples = 3000

    # Generate feature distributions mimicking the Kaggle water potability dataset
    ph = np.random.normal(7.08, 1.47, num_samples)
    ph = np.clip(ph, 0, 14)

    hardness = np.random.normal(196.37, 32.87, num_samples)
    
    solids = np.random.normal(22014.09, 8767.23, num_samples)
    solids = np.clip(solids, 320, None)

    chloramines = np.random.normal(7.12, 1.58, num_samples)
    chloramines = np.clip(chloramines, 0.3, None)

    sulfate = np.random.normal(333.78, 36.14, num_samples)
    sulfate = np.clip(sulfate, 120, None)

    conductivity = np.random.normal(426.21, 80.81, num_samples)
    conductivity = np.clip(conductivity, 150, None)

    organic_carbon = np.random.normal(14.28, 3.31, num_samples)
    organic_carbon = np.clip(organic_carbon, 2.0, None)

    trihalomethanes = np.random.normal(66.40, 15.77, num_samples)
    trihalomethanes = np.clip(trihalomethanes, 0.7, None)

    turbidity = np.random.normal(3.97, 0.78, num_samples)
    turbidity = np.clip(turbidity, 0.5, None)

    # Compute sub-scores (0 to 100) based on distance from ideal drinking water values
    ph_score = np.maximum(0, 100 - 50 * np.abs(ph - 7.2))
    hardness_score = np.maximum(0, 100 - 0.4 * np.abs(hardness - 170))
    solids_score = np.maximum(0, 100 - 0.003 * np.maximum(0, solids - 12000))
    chloramines_score = np.maximum(0, 100 - 18 * np.maximum(0, chloramines - 4.5))
    sulfate_score = np.maximum(0, 100 - 0.6 * np.maximum(0, sulfate - 250))
    conductivity_score = np.maximum(0, 100 - 0.25 * np.maximum(0, conductivity - 400))
    organic_carbon_score = np.maximum(0, 100 - 6.0 * np.maximum(0, organic_carbon - 8.0))
    trihalomethanes_score = np.maximum(0, 100 - 1.5 * np.maximum(0, trihalomethanes - 80))
    turbidity_score = np.maximum(0, 100 - 22 * np.maximum(0, turbidity - 1.5))

    # Weighted Water Quality Score (0 - 100)
    wqs = (
        ph_score * 0.15 +
        hardness_score * 0.10 +
        solids_score * 0.10 +
        chloramines_score * 0.12 +
        sulfate_score * 0.12 +
        conductivity_score * 0.08 +
        organic_carbon_score * 0.10 +
        trihalomethanes_score * 0.10 +
        turbidity_score * 0.13
    )

    # Sigmoid function to convert WQS to potability probability (with noise)
    # This ensures a non-linear relationship that classifiers can learn, but not too trivially.
    prob = 1.0 / (1.0 + np.exp(-0.16 * (wqs - 66.0)))
    
    # Bernoulli trial
    potability = (np.random.rand(num_samples) < prob).astype(int)

    # Create dataframe
    # Use lowercase headers to match typical Python dataframe usage
    df = pd.DataFrame({
        "ph": ph,
        "Hardness": hardness,
        "Solids": solids,
        "Chloramines": chloramines,
        "Sulfate": sulfate,
        "Conductivity": conductivity,
        "Organic_carbon": organic_carbon,
        "Trihalomethanes": trihalomethanes,
        "Turbidity": turbidity,
        "Potability": potability
    })

    # Ensure directories exist
    data_dir = BACKEND_DIR / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    
    # Save train dataset
    train_path = data_dir / "water_potability_train.csv"
    df.to_csv(train_path, index=False)
    print(f"Dataset generated with {num_samples} samples.")
    print(f"Potability distribution: {np.bincount(potability)}")
    print(f"Saved to: {train_path}")

    # Generate a sample user upload dataset (without Potability column) for testing the UI
    df_sample = df.drop(columns=["Potability"]).sample(20, random_state=42)
    sample_path = data_dir / "water_quality_sample.csv"
    df_sample.to_csv(sample_path, index=False)
    print(f"Sample user upload dataset saved to: {sample_path}")

if __name__ == "__main__":
    main()
