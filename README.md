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

## How to use Heart Wise (Features)

Input Patient Data: As a healthcare professional, you can input your patient's data into the system. The required data fields are designed to capture critical information that will inform the system's risk analysis.

Processing Data: Once the data is inputted, the system utilizes cutting-edge AI algorithms to process and analyze it. This results in accurate risk predictions that will aid in your decision-making process.

View Risk Analysis Results: The system presents the analyzed results in an easy-to-understand format. This allows you to make informed decisions based on the predicted risks for each patient.

Access Historical Data: The application provides a feature to view historical input data. This allows you to track a patient's heart data over time and observe any trends or changes that may occur.

Secure Data Storage: The system securely stores all patient data in compliance with data protection regulations. You can be confident that all sensitive information is safe and secure.

Patient Data Management: You can easily search, access, and update patient records. This provides flexibility and efficiency in managing your patients' data.

Collaboration: The platform provides real-time collaboration features. You and your colleagues can discuss the AI-driven analysis results, make decisions, and provide timely care to your patients.

Secure Sharing: You can securely share the AI-driven analysis results with your colleagues through the platform. This allows for effective collaboration while maintaining patient confidentiality.

Export Results: The system provides an option to export the AI-driven analysis results in a universally accessible format. This can facilitate sharing findings with colleagues outside the platform or saving the results for future reference.

Adaptive User Interface: The user interface adapts to different screen sizes. Whether you are on a desktop, laptop, tablet, or mobile device, you can effectively navigate and use the tool.


## Credits, References, Licenses
### Open Source Libraries
Express: Fast, unopinionated, minimalist web framework for Node.js (https://expressjs.com/)
JQuery: Fast, small, and feature-rich JavaScript library (https://jquery.com/)
Pandas: High-performance, easy-to-use data structures and data analysis tools for the Python programming language (https://pandas.pydata.org/)
Scikit-learn (sklearn): Simple and efficient tools for predictive data analysis, built on NumPy, SciPy, and matplotlib (https://scikit-learn.org/stable/)
### Tools
Node.js: JavaScript runtime built on Chrome's V8 JavaScript engine (https://nodejs.org/en)
MongoDB: Source-available cross-platform document-oriented database program (https://www.mongodb.com/)
MongoDB Atlas: Database as a Service - DBaaS on AWS, Azure, & GCP (https://www.mongodb.com/atlas/database)

### External Resources
MDN Web Docs: In-depth tutorials and articles on HTML, CSS, JavaScript, and more (https://developer.mozilla.org/en-US/)
Stack Overflow: Question and answer site for professional and enthusiast programmers (https://stackoverflow.com/)
Dataset used: https://www.kaggle.com/datasets/andrewmvd/heart-failure-clinical-data

See [LICENCSE.txt](LICENSE.txt) file for licensing.

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