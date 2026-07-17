# Fish-waste Fermentation AI

Predictive monitoring system for fish-waste fermentation used to produce Liquid Organic Fertilizer (POC).

## Objective

Predict three fermentation outcomes using sensor data:

| Target | Description |
|--------|-------------|
| **NH3_ppm** | Ammonia concentration |
| **H2S_ppm** | Hydrogen sulfide concentration |
| **fermentation_quality_score** | Overall fermentation quality |

Two models share the same preprocessing pipeline for fair comparison:

1. **XGBoost** (baseline) — with GridSearchCV hyperparameter tuning
2. **ANN** (TensorFlow/Keras) — with EarlyStopping and learning rate scheduling