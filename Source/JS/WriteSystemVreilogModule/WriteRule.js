function GetTheRule(RuleID,RuleBase,MappingOutputBus,OutLogic) {
    return  "//The Rule ID :" + RuleID + " \r\n                       \
            if("+RuleBase+") \r\n                                     \
                OutputBus["+MappingOutputBus+"] = " + OutLogic +"\r\n \
            \r\n                                                      \
            \r\n";
}

// Panel.DesignRuleView.RuleList
function GetRuleBase(RuleObject) {
    TmpStr = "";
    for (let i = 0; i < RuleObject.length; i++) {
        for (let j = 0; j < RuleObject[i].length; i++) {
            if(RuleObject[i][j].ConnectLogic == "0"){
                TmpStr = ""
            }else{
                //MF FN <=> Value 1/0 logic
                
                TmpStr += ""
            }
        }
        
    }
}