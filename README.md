# Heart Wise
![Heart Wise Banner](/public/images/heartwise.png)

Heart Wise is an **AI-powered diagnostic tool** to help healthcare professionals accurately predict and manage heart failure risks, revolutionizing early detection and intervention for cardiovascular diseases with cutting-edge algorithms and predictive analytics.

## Technologies Used
1. Front End:
    - JavaScript
    - BootStrap
    - JQuery
    - HTML/CSS
2. Back End:
    - Node.js
    - Express
    - Python
    - MongoDB

## Project Directory

```
|--- database-connection.js
|--- index.js
|--- package-lock.json
|--- package.json
|--- patient.js
|--- README.md
|--- server.js
|--- utils.js
|--- controllers
     |--- deletePatientCollection.js
     |--- dummyDataGenerator.js
|--- models
     |--- user.js
|--- public
     |--- images
          |--- aihealth.jpg
          |--- Doctor.jpg
          |--- doctor2.jpg
          |--- Heart.jpg
          |--- heartwise.png
          |--- patient.jpg
     |--- styles
          |--- 404.css
          |--- analysis-result.css
          |--- analyze.css
          |--- bottom-navbar.css
          |--- doctor-profile.css
          |--- dropdown.css
          |--- header.css
          |--- index.css
          |--- login.css
          |--- patient-list.css
          |--- result.css
          |--- share.css
|--- scripts
     |--- analysis.py
     |--- heart_failure_clinical_records_dataset.csv
|--- uploads
|--- views
     |--- templates
          |--- bottom-navbar.ejs
          |--- header.ejs
          |--- pagination.ejs
          |--- search-bar.ejs
          |--- sorting-pills.ejs
     |--- 404.ejs
     |--- add-patient.ejs
     |--- analysis-result.ejs
     |--- analyze.ejs
     |--- doctor-profile.ejs
     |--- error.ejs
     |--- forgot-password.ejs
     |--- index.ejs
     |--- login.ejs
     |--- patient-list.ejs
     |--- patient-profile.ejs
     |--- patient-risk-history.ejs
     |--- patient-search.ejs
     |--- register.ejs
     |--- reset-password.ejs
     |--- result.ejs
     |--- success.ejs
     |--- under-construction.ejs
```
## How to Install
### Download Requirements
To get this project up and running, you will need to create the following accounts and install the following software:
1. Github Account
2. MongoDB Account
3. A Google Mail Account (for sending password reset links to users)
4. Node.js
3. Visual Studio Code
4. Python and PIP
5. Google Chrome / Firefox

### Steps to Get Started
1. Clone this repository on your computer through Visual Studio Code (VSC). 
2. In the top navigation bar on VSC, click on 'Terminal' -> 'New Terminal'.
3. A terminal window is now visible at the bottom of VSC. Type in `npm install`. This command will ensure the dependent node modules are installed to get the project running.
4. In order to get analysis.py working, in the same terminal window as Step 3, type in `pip install pandas`. Once completed, type in `pip install scikit-learn`. Installing these two modules will ensure the python script runs.
5. In the root directory of this project, create a file called '.env'. 
6. Copy and paste the following code inside .env:
```
MONGODB_CLUSTER = <Enter your MongoDB cluster url>
MONGODB_USER = <Enter your MongoDB user name for your database - it is not the same as your MongoDB account email>
MONGODB_PASSWORD = <Enter your MongoDB password for your database - it is not the same as your MongoDB account password>
MONGODB_DATABASE = <Enter your database name>
MONGODB_COLLECTION = Patients
NODE_SESSION_SECRET = <Generate a GUID from guidgenerator.com and paste here>
MONGODB_SESSION_SECRET = <Generate another GUID from guidgenerator.com and paste here>
MONGODB_USERCOLLECTION = Users
MONGODB_PATIENTCOLLECTION = Patients
EMAIL_ADDRESS = <Google Mail account email address>
EMAIL_PASSWORD = <Google Mail account password>
```
7. In the same terminal from Steps 3 and 4 (the terminal window located at the bottom of VSC), type in `node index.js`.
8. If set up correctly, in the terminal window, a message will appear containing a link to where the application is hosted. It will be in the form of 'localhost:3000'. Click on that link to view the application in your browser.
9. Here is our [testing plan](https://docs.google.com/spreadsheets/d/12ZFcGtFpCMN1wZ5vDrhNiNGaxBmXxR2ixeeSjZpjWRk/edit#gid=394496370). You can view our testing history and even contribute to a bug fix!

## AI Incorporation 

We used AI extensively in our application. The core component of our app is a logistic regression model, an AI algorithm, which we trained to predict the risk of heart failure. This model takes two health indicator values (Serum Creatinine and Ejection Fraction) and provides a probability of a death event occurring. We trained our model using a dataset from Kaggle, optimizing its accuracy through a process called k-fold cross-validation with 10 folds. The AI model forms the backbone of our risk prediction feature, providing users with potential insights into their heart health.

While we didn't use AI to create or clean datasets, the logistic regression model we used inherently assists in identifying and handling outliers and missing values in the dataset. This is part of the training and validation process, where we fine-tuned our model to handle the given heart failure datasets from Kaggle efficiently and accurately.

Our linear regression model, trained using Kaggle datasets, allows us to predict the risk of heart failure based on health indicators. It's this AI model that allows us to generate risk predictions and offer data-driven insights to our users. 

### Limitations

One of the challenges we faced was the initial lower accuracy of our model, around 60%. However, we were able to overcome this limitation by implementing k-fold cross-validation with 10 folds, which improved the accuracy to about 75%. Another limitation was the potential for overfitting, considering the high dimensionality of medical data. We addressed this by using logistic regression, which is less prone to overfitting in comparison to other complex models. Furthermore, ensuring the quality and relevance of the data used for training was critical, so we chose a reliable source, Kaggle, for our dataset.

## Authors
[Amir Eskandari](https://github.com/am-eskandari)

[Cadan Glass](https://github.com/CadanGlass)

[Daniel Okonov](https://github.com/DanielOkonov)

[Jas Randhawa](https://github.com/jasr1)