from os import listdir
from os.path import isfile, join
import pandas as pd 

# Path to output file
out_path = '....../out/results.xlsx'
# Path to folder with exported reports
data_path = '....../data/'

onlyfiles = [f for f in listdir(data_path) if isfile(join(data_path, f))]

res = pd.DataFrame()

for file_name in onlyfiles:  
    df = pd.read_excel(join(data_path,file_name), sheet_name='Dataset1',dtype=str)
    df['file_name'] = file_name
    res = res.append(df, ignore_index=True)

res = res.drop_duplicates('Client ID', keep="first")
res = res.sort_values('file_name')

res.to_excel(out_path, sheet_name='Dataset1', index = False)

