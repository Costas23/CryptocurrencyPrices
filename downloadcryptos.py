import kaggle
import os.path
import sys
from Naked.toolshed.shell import muterun_js


kaggle.api.authenticate()

class KaggleFile:
    def __init__(self,name,size):
        self.name=name
        self.size=size
        self.nameTest = False

class TxtFile:
    def __init__(self,name,size):
        self.name=name
        self.size=size


kagglenames = []
txtnames = []
kagglesizes = []
txtsizes = []

kagglefiles = kaggle.api.dataset_list_files('sudalairajkumar/cryptocurrencypricehistory')

for f in kagglefiles.files:
    kfile = KaggleFile(str(f),str(f.size))
    kagglenames.append(kfile)



if os.path.exists("csvnames.txt"):
    print('it exists')
    # print("The files in csvnames.txt:")
    with open("csvnames.txt", "r") as ins:
        line = ins.read().splitlines()
        for l in line:
            spl = l.split(" ")
            for s in range(0,len(spl),2):
                txtfile = TxtFile(spl[s],spl[s+1])
                txtnames.append(txtfile)
        for i in txtnames:
            print(i.name + " " + i.size)

    testing = True
    for item in kagglenames:
        for item2 in txtnames:
            if item.name == item2.name and item.size==item2.size:
                item.nameTest=True
                print(item.name + " " + item.size + " " + str(item.nameTest))


    for item in kagglenames:
        if item.nameTest == False:
            testing = False

    if testing:

        print("They are the same")
        if os.path.exists("csvupdate.txt"):
            os.remove("csvupdate.txt")
        else:
            print("The file does not exist")
    else:
        print("They are not the same")
        text_file = open('csvnames.txt','w')
        for item in kagglenames:
            text_file.write(item.name + " " + item.size)
            text_file.write("\n")
        text_file.close()
        text_file2 = open('csvupdate.txt','w')
        for item in kagglenames:
            if item.nameTest==False:
                text_file2.write(item.name + " "+ item.size)
                text_file2.write("\n")
                kaggle.api.dataset_download_file('sudalairajkumar/cryptocurrencypricehistory',item.name, path='./crypto',force=True)
        text_file2.close()
        response = muterun_js('createcollections.js')
        if response.exitcode == 0:
            print(response.stdout)

        else:
            sys.stderr.write(response.stderr)

else:
    print("it doesnt exist")
    text_file = open('csvnames.txt','w')
    text_file2 = open('csvupdate.txt','w')
    for item in kagglenames:
        text_file.write(item.name + " " + item.size)
        text_file.write("\n")
        text_file2.write(item.name + " " + item.size)
        text_file2.write("\n")
    text_file.close()
    text_file2.close()

    kaggle.api.dataset_download_files('sudalairajkumar/cryptocurrencypricehistory', path='./crypto')

    response = muterun_js('createcollections.js')
    if response.exitcode == 0:
        print(response.stdout)

    else:
        print(str(response.stderr))
