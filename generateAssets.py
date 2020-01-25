import os, json

directory = os.fsencode('assets/')
assetsList = ''

for file in os.listdir(directory):
    filename = 'assets/' + str(os.fsencode(file))[2:-1]
    assetsList += filename + '\n'

with open('assetsList.txt', 'w', encoding='utf-8') as f:
    f.write(assetsList)
    f.close()