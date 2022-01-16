# Python and puppeteer examples how to delete PII from Google Analytics using Deletion API

Google Analytics has a special API for [user deletion](https://developers.google.com/analytics/devguides/config/userdeletion/v3), but:

- You need GA client id (or user id) to delete user
- You can delete only 500 users per day

These code samples show how to delete users if you don't have custom dimensions with clientId.

## 1. Download clientId from GA User Explorer report (Audience / User Explorer) using Puppeteer.

- Install [Puppeteer](https://www.npmjs.com/package/puppeteer).
- In **client_id_download.js** change **url** to url of User Explorer report. Don't forget to add custom segment to get users you want to delete. For example users with emails in visited urls. Also set report parameter "maximum raws per page" equal to 250 before copy report url.
- In **client_id_download.js** change variable **startDate** value to first date of report. For example startDate = new Date("02/23/2021")
- In **client_id_download.js** change variable **daysStep** value to amount of days User Explorer Report has without sampling. 2 days by default.

- Run client_id_download.js
  ```sh
  node client_id_download.js
  ```
- Script will open Chromium on Google Account page. You have to enter login and password to get Puppeteer access to your GA. Script will wait 5 seconds and try to open User Explorer report and download all users.

## 2. Combine all .xlsx files in one file

- Install venv:

  ```sh
  python -m venv .venv
  ```

- Activate it:

  ```sh
  source .venv/bin/activate
  ```

- [Install Pandas](https://pandas.pydata.org/docs/getting_started/install.html)
  ```sh
  pip install pandas
  ```
- Change **out_path** to destination path
- Change **data_path** to folder with all exported files
- Run script
  ```sh
  python merge_xlsx.py
  ```

## 3. Use Google Colab notebook to call GA Deletion API and save status in Google Cloud Storage.

- Create a copy of [Colab notebook](https://colab.research.google.com/drive/1zwRBdwC2saNfWBQyDHbaHe4AWqe5Kxb9?usp=sharing)
- In GCP create **client_secrets.json** or use existing one
- Create a Storage bucket or use existing one.
- In Colab notebook change **bucket_name** to name of bucket from the previous step.
- In Colab notebook change variable **web_property_id** to GA property id.
- Copy to storage **client_secrets.json**, **service.py** and **results.xlsx** - with all clientIds from step 2
- Run copy of Colab notebook
