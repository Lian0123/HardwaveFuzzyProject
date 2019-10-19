ForPart = 3;

function GetFNMacro(MFID,FNID,MFBitSum,FNBitSum,LongBitSum) {
    return "bit ["+MFBitSum+":0] MF"+MFID+"_FN"+FNID+"_MFID; \r\n \
            bit ["+FNBitSum+":0] MF"+MFID+"_FN"+FNID+"_FNID; \r\n \
            bit [2:0] MF"+MFID+"_Part; \
            bit ["+LongBitSum+":0] MF"+MFID+"_FN"+FNID+"_Longbits;";
}
