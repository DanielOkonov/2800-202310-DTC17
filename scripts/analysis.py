import pandas as pd
from sklearn.linear_model import LogisticRegression

def main():
    df = pd.read_csv('scripts/heart_failure_clinical_records_dataset.csv')

    X = df[['serum_creatinine', 'ejection_fraction']]
    y = df['DEATH_EVENT']

    model = LogisticRegression()
    model.fit(X, y)

    serum_creatinine = float(input("Enter Serum Creatinine value: "))
    ejection_fraction = float(input("Enter Ejection Fraction value: "))

    input_data = pd.DataFrame({'serum_creatinine': [serum_creatinine], 'ejection_fraction': [ejection_fraction]})
    death_event_probability = model.predict_proba(input_data)[0][1]
    death_event_percentage = round(death_event_probability * 100, 2)

    print("Percentage of Death Event:", death_event_percentage)

if __name__ == '__main__':
    main()
