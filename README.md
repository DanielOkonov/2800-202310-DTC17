# Heart Wise

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
9. Here is our [testing plan] (https://docs.google.com/spreadsheets/d/12ZFcGtFpCMN1wZ5vDrhNiNGaxBmXxR2ixeeSjZpjWRk/edit#gid=394496370). You can view our testing history and even contribute to a bug fix!



## Authors
Amir Eskandari: https://github.com/am-eskandari

Cadan Glass: https://github.com/CadanGlass

Daniel Okonov: https://github.com/DanielOkonov

Jas Randhawa: https://github.com/jasr1