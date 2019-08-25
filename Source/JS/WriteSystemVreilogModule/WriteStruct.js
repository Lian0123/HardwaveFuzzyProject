var StructList = {
    PackedData     : [] ,
    StructType     : "" ,
};

StructList.PackedData,push({PackedHeader:"bit",BitHead:10,BitEnd:0,DataName:"FN1"});

// ---


function WriteStruct(StructList) {
    /* 錯誤測試 */
    if(StructList.PackedData.length == 0){
        return new error("資料量錯誤");
    }else{
        fs.writeFile(FilePath + FileName, GetStructStruct(StructList), UTF8Write, function(error){
            if (error) return error;
        });
    }
    
}

//0
function GetStructStruct(StructList) {
    return String("typedef struct packed {\n"+GetStructPacked(StructList)+"}"+StructList.StructType+";\n");
}

//2
function GetStructPacked(PackedDataList) {
    let TmpString = "";

    for (let i = 0; i < PackedDataList.length; i++) {
        TmpString = "\t" + String(PackedDataList.PackedType[i] + " ["+Number(PackedDataList.PackBitHead[i]) + ":"+Number(PackedDataList.PackBitEnd[i])+"]"+String(PackedDataList.PackedDataName[i])+";/n");
    }

    return TmpString;
}

