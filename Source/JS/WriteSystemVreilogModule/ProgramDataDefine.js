
/*
 * |=====================================================================
 * | [FS] Write Text Flag Define
 * |=====================================================================
 * | Date   : 2019-08-17 
 * | Writer : lian0123
 * | About  : 寫檔Header設定
 * |
 */
var FilePath = "";
var FileName = "";
var WrtieString = "";

/*
 * |=====================================================================
 * | [FS] Write Text Flag Define
 * |=====================================================================
 * | Date   : 2019-08-17 
 * | Writer : lian0123
 * | About  : 寫檔功能的Flag設定
 * |
 */
var AsciiWrite = {encoding: 'ascii',flag:'w'};
var UTF8Write  = {flag:'w'};

var WriteFile = function WriteFile(){
    WrtieString += `
    /*
     *  Out Error Bus
     * |----------------------------------------------------------------
     * | [0] | Sensor Get Out Range Error
     * | --- + ---------------------------------------------------------
     * | [1] | Sensor Get Overflow Error
     * | --- + ---------------------------------------------------------
     * | [2] | 
     * |  ~  | Fuzzy Mapping Error (For MF0 to MFn)
     * | [k] |
     * |----------------------------------------------------------------
     */`;

    if(Panel.DesignMumbershipFuncitonView.HasBack){
        WrtieString += `
        module HardFuzzyCtl(clk,clearError,ctlSave,dev1,dev2,dev3,OutBus,OutErrorBus,NeuralBus);`;
    }else{
        WrtieString += `
        module HardFuzzyCtl(clk,clearError,ctlSave,dev1,dev2,dev3,OutBus,OutErrorBus);`;
    }

    WrtieString += `
        parameter FixValue    = ` + Panel.DesignMumbershipFuncitonView.Offset + `;
        parameter RateValue   = ` + Panel.DesignRuleView.AxisRateArray.length + `;
        
        //==========================================================
        // Prot Define
        //==========================================================
        input  bit      clk;
        input  bit      clearError;
        input  [1:0]    ctlSave;
        `+ GetDevInputStr() +`
        output [`+(Panel.DesignRuleView.RuleList.length-1)+`:0]    OutBus;
        output [4:0]    OutErrorBus;`;
        
    if(Panel.DesignMumbershipFuncitonView.HasBack){
        WrtieString +=`
        output [4*RateValue-1:0] NeuralBus;`;
    }

    WrtieString += `
	
        //==========================================================
        // SensorGet Wire
        //==========================================================
        ` + GetDevInputWireStr() + `
        
        
        //==========================================================
        // FuzzyMapping Wire
        //==========================================================
        ` + FuzzyMappingWireStr() + `
        
        `;

    if(Panel.DesignDownDimView.DimList.length > 0){
        WrtieString += `
        //==========================================================
        // DownDim Wire
        //==========================================================
        ` + GetDownDimWireStr() + `
        
        `;
    }

    if(Panel.DesignMumbershipFuncitonView.HasBack){     
        WrtieString += `
        //==========================================================
        // NeuralNetwork Regs
        //==========================================================
        ` + NeuralNetworkRegsStr() + `
        
        reg       [6:0] BeforeSate;
        reg		  [5:0] BeforeLossValue;
        reg       [`+ Panel.LayerList.length +`:0] subclk;
        reg       [0:5*`+Panel.DesignNeuralNetworkView.MatrixRow+`*`+Panel.DesignNeuralNetworkView.MatrixRow+`-1] TmpNN;
        reg       [0:5*`+Panel.DesignNeuralNetworkView.MatrixRow+`*`+Panel.DesignNeuralNetworkView.MatrixRow+`-1] TmpNN2;
        reg       [0:5*`+Panel.DesignNeuralNetworkView.MatrixRow+`*`+Panel.DesignNeuralNetworkView.MatrixRow+`-1] SaveNN;

        wire      [6:0] BeforeSateWire;
        wire	  [5:0] BeforeLossValueWire;
        wire      [0:5*`+Panel.DesignNeuralNetworkView.MatrixRow+`*`+Panel.DesignNeuralNetworkView.MatrixRow+`-1] SaveNNWire;
        wire      [0:5*`+Panel.DesignNeuralNetworkView.MatrixRow+`*`+Panel.DesignNeuralNetworkView.MatrixRow+`-1] OutNNWire;
      
        `;
    }

    WrtieString += `
        //==========================================================
        // SensorGet Layer
        //==========================================================
        ` + GetSensorGetStr() + `
        
        //==========================================================
        // FuzzyMapping Layer
        //==========================================================
        ` + GetFuzzyMappingStr() + `
        `;
        
    if(Panel.DesignDownDimView.DimList.length > 0){
        WrtieString += `
        //==========================================================
        // DownDim Layer
        //==========================================================
        ` + GetDownDimStr() + `
        `;
    }
    
    if(Panel.DesignMumbershipFuncitonView.HasBack){ 
        WrtieString += `
        //==========================================================
        // Self-Computing
        //==========================================================
        ` + GetSelfComputingStr() +`
        
        //==========================================================
        // Self-Computing
        //==========================================================
        Divide          #(.subclk_limit(`+Panel.LayerList.length+`))   DivideCLK(.clk(clk),.subclk(subclk));
        FristPool       #(.Row_Limit(`+Panel.DesignNeuralNetworkView.MatrixRow+`),.WindowsSize(2),.ComputRow(`+(Panel.DesignNeuralNetworkView.MatrixRow-2)+`)) FristPool(.clk(subclk[0]),.InData({`+GetAllMFArray()+GetExtraBits()+`}),.TmpNN(TmpNN));
        `;
    }
    
};

var GetDevInputStr = function GetDevInputWireStr(){
    let ReturnStr = "";
    for(let i=0; i<Panel.DesignRuleView.MFArray.length; i++){
        ReturnStr += "input  [RateValue-1:0] dev"+(i+1)+";\n";
    }

    return ReturnStr;
};

var GetDevInputWireStr = function GetDevInputWireStr(){
    let ReturnStr = "";
    for(let i=0; i<Panel.DesignRuleView.MFArray.length; i++){
        ReturnStr += "wire      [1:0] SensorGetMF"+(i+1)+"Tester;\nwire      [RateValue-1:0] MF"+(i+1)+"FixValue;\n";
    }

    return ReturnStr;
};

var FuzzyMappingWireStr = function FuzzyMappingWireStr() {
    let ReturnStr = "";
    for(let i=0; i<Panel.DesignRuleView.MFArray.length; i++){
        for(let j=0; j<Panel.DesignRuleView.MFArray[i].FN.length; j++){
            ReturnStr += "wire      [0:1+3+2+RateValue-1] MF"+(i+1)+"FN"+(j+1)+"Mapping;\n";
        }
    }

    return ReturnStr;
};

var GetDownDimWireStr = function GetDownDimWireStr() {
    let ReturnStr = "";/*
    for(let i=0; i<Panel.DesignDownDimView.DimList.length; i++){
        ReturnStr += "wire      [0:1+3+2+RateValue-1]";
        for(let j=0; j<Panel.DesignDownDimView.DimList[i].length; j++){
            ReturnStr += "MF2FN3";
            if(j != Panel.DesignDownDimView.DimList[i].length-1){
                ReturnStr += "_";
            }
            
        }
        ReturnStr += Mapping;\n"
    }*/
    return ReturnStr;
};

var NeuralNetworkRegsStr= function NeuralNetworkRegsStr() {
    let ReturnStr = "";
    for(let i=0; i<Panel.DesignRuleView.MFArray.length; i++){
        for(let j=0; j<Panel.DesignRuleView.MFArray[i].FN.length; j++){
            ReturnStr += "reg       [RateValue-1:0] TmpMF"+(i+1)+"FN"+(j+1)+"MappingData;\nreg       [10-1:0] CtlMF1FN1MappingData;\n";
        }
    }

    return ReturnStr;
};

var GetSensorGetStr = function GetSensorGetStr() {
    let ReturnStr = "";
    for(let i=0; i<Panel.DesignRuleView.MFArray.length; i++){
        ReturnStr += "SensorGet #(.SensorGet_LimitBit(RateValue),.BaseUpBound(" + Panel.DesignMumbershipFuncitonView.UpSafe + "),.BaseDownBound(" + Panel.DesignMumbershipFuncitonView.DownSafe + "),.ShiftVlaue(FixValue)) SensorGetLayerForMF"+(i+1)+"(.SensorGetValue(dev"+(i+1)+"),.FixedValue(MF"+(i+1)+"FixValue),.ErrorReturn(SensorGetMF"+(i+1)+"Tester));";
    }

    return ReturnStr;
};

var GetFuzzyMappingStr = function GetFuzzyMappingStr() {
    let ReturnStr = "";
    for(let i=0; i<Panel.DesignRuleView.MFArray.length; i++){
        for(let j=0; j<Panel.DesignRuleView.MFArray[i].FN.length; j++){
            ReturnStr += "FuzzyMapping #(.InData_limit(4),.LongBit_limit(RateValue),.Node0("+Panel.DesignRuleView.MFArray[i].FN[j][0]+"),.Node1("+Panel.DesignRuleView.MFArray[i].FN[j][1]+"),.Node2("+Panel.DesignRuleView.MFArray[i].FN[j][2]+"),.Node3("+Panel.DesignRuleView.MFArray[i].FN[j][3]+")) FuzzyMappingLayerForMF"+(i+1)+"FN"+(j+1)+"(.InFixed(MF"+(i+1)+"FixValue),.IsHit(MF"+(i+1)+"FN"+(j+1)+"Mapping[0]),.LoaclFlag(MF"+(i+1)+"FN"+(j+1)+"Mapping[1:3]),.LongBitData(MF"+(i+1)+"FN"+(j+1)+"Mapping[5:10+5-1]),.ErrorReturn(MF"+(i+1)+"FN"+(j+1)+"Mapping[4]));";
        }
    }

    return ReturnStr;
};

var GetDownDimStr = function GetDownDimStr() {
    let ReturnStr = "";
    
    return ReturnStr;
};

var GetSelfComputingStr = function GetSelfComputingStr() {
    let ReturnStr = "";
    
    for(let i=0; i<Panel.DesignRuleView.MFArray.length; i++){
        for(let j=0; j<Panel.DesignRuleView.MFArray[i].FN.length; j++){
            ReturnStr += "BaseCutLine #(.LongBits_limit(RateValue)) MF"+(i+1)+"FN"+(j+1)+"BSelfCompute(.cut_line(CtlMF"+(i+1)+"FN"+(j+1)+"MappingData),.x(TmpMF"+(i+1)+"FN"+(j+1)+"MappingData),.y(MF"+(i+1)+"FN"+(j+1)+"Mapping[5:RateValue+5-1]),.z(TmpMF"+(i+1)+"FN"+(j+1)+"MappingData));";
        }
    }
    return ReturnStr;
};

var GetAllMFArray = function GetAllMFArray() {
    let ReturnStr = "";

    for(let i=0; i<Panel.DesignRuleView.MFArray.length-1; i++){
        for(let j=0; j<Panel.DesignRuleView.MFArray[i].FN.length; j++){
            ReturnStr += "TmpMF"+(i+1)+"FN"+(j+1)+"MappingData";
            if(i < Panel.DesignRuleView.MFArray.length-1 && j < Panel.DesignRuleView.MFArray[i].FN.length-1){
                ReturnStr += ",";
            }
        }
    }

    //Last Layer
    return ReturnStr;
};

var GetExtraBits = function GetExtraBits() {
    let ReturnStr   = "";
    let TmpExtraStr = "";

    if(Panel.DesignNeuralNetworkView.MatrixRow-Math.sqrt(TmpMatrixSum*(this.DesignRuleView.AxisRateArray.length-1)) != 0){
        TmpExtraStr = Panel.DesignNeuralNetworkView.MatrixRow*Panel.DesignNeuralNetworkView.MatrixRow-TmpMatrixSum*(this.DesignRuleView.AxisRateArray.length-1);
        if(TmpExtraStr>0){
            ReturnStr += ","+String(TmpExtraStr)+"'b";
            for(let i=0;i<TmpExtraStr;i++){
                ReturnStr += "0";
            }
        }
    }

    return ReturnStr;
};

var GetNeuralNetworkLayer = function GetExtraBits() {
    let ReturnStr = "";

    for(let i=0;i<Panel.DesignNeuralNetworkView.LayerList.length;i++){
        if(Panel.DesignNeuralNetworkView.LayerList[i].SelectLayerType == 0){
            let FutureMappingSum = Math.floor(Panel.DesignNeuralNetworkView.LayerList[i].WindowSize / SelectLayerSum)*Math.floor(Panel.DesignNeuralNetworkView.LayerList[i].WindowSize / SelectLayerSum);
            for(let j=0;j<FutureMappingSum;j++){
                ReturnStr += `
                ConvolutionUnit #(.Row_Limit(`+Panel.DesignNeuralNetworkView.MatrixRow+`),.WindowsSize(`+Panel.DesignNeuralNetworkView.LayerList[i].WindowSize+`)) Layer`+(i+1)+`ID1(.clk(subclk[`+(i+1)+`]),
                    .InMatrix(
                        `+TestInTmpNN(i+1)+`
                    ),
                    .EigenMatrix(
                        `+GetEigenMatrixStr(i)+`
                    ),
                    .OutMatrix({
                        TmpNN2[(10*10*0)+(10*0)+0:(10*10*0)+(10*0)+5-1],TmpNN2[(10*10*0)+(10*1)+0:(10*10*0)+(10*1)+5-1],TmpNN2[(10*10*0)+(10*2)+0:(10*10*0)+(10*2)+5-1],TmpNN2[(10*10*0)+(10*3)+0:(10*10*0)+(10*3)+5-1],TmpNN2[(10*10*0)+(10*4)+0:(10*10*0)+(10*4)+5-1],
                        TmpNN2[(10*10*1)+(10*0)+0:(10*10*1)+(10*0)+5-1],TmpNN2[(10*10*1)+(10*1)+0:(10*10*1)+(10*1)+5-1],TmpNN2[(10*10*1)+(10*2)+0:(10*10*1)+(10*2)+5-1],TmpNN2[(10*10*1)+(10*3)+0:(10*10*1)+(10*3)+5-1],TmpNN2[(10*10*1)+(10*4)+0:(10*10*1)+(10*4)+5-1],
                        TmpNN2[(10*10*2)+(10*0)+0:(10*10*2)+(10*0)+5-1],TmpNN2[(10*10*2)+(10*1)+0:(10*10*2)+(10*1)+5-1],TmpNN2[(10*10*2)+(10*2)+0:(10*10*2)+(10*2)+5-1],TmpNN2[(10*10*2)+(10*3)+0:(10*10*2)+(10*3)+5-1],TmpNN2[(10*10*2)+(10*4)+0:(10*10*2)+(10*4)+5-1],
                        TmpNN2[(10*10*3)+(10*0)+0:(10*10*3)+(10*0)+5-1],TmpNN2[(10*10*3)+(10*1)+0:(10*10*3)+(10*1)+5-1],TmpNN2[(10*10*3)+(10*2)+0:(10*10*3)+(10*2)+5-1],TmpNN2[(10*10*3)+(10*3)+0:(10*10*3)+(10*3)+5-1],TmpNN2[(10*10*3)+(10*4)+0:(10*10*3)+(10*4)+5-1],
                        TmpNN2[(10*10*4)+(10*0)+0:(10*10*4)+(10*0)+5-1],TmpNN2[(10*10*4)+(10*1)+0:(10*10*4)+(10*1)+5-1],TmpNN2[(10*10*4)+(10*2)+0:(10*10*4)+(10*2)+5-1],TmpNN2[(10*10*4)+(10*3)+0:(10*10*4)+(10*3)+5-1],TmpNN2[(10*10*4)+(10*4)+0:(10*10*4)+(10*4)+5-1]
                    })
                );`
            }
        }else if(Panel.DesignNeuralNetworkView.LayerList[i].SelectLayerType == 1){
            
        }else if(Panel.DesignNeuralNetworkView.LayerList[i].SelectLayerType == 2){
            
        }
    }

    return ReturnStr;
};

var GetEigenMatrixStr = function GetEigenMatrixStr(LayerID){
    let ReturnStr = "";

    ReturnStr += "" + (Panel.DesignNeuralNetworkView.LayerList[LayerID].SelectLayerSum*Panel.DesignNeuralNetworkView.LayerList[LayerID].SelectLayerSum) + "'b";
    for(let i=0;i<(Panel.DesignNeuralNetworkView.LayerList[LayerID].SelectLayerSum*Panel.DesignNeuralNetworkView.LayerList[LayerID].SelectLayerSum);i++){
        ReturnStr += "0";
    }

    return ReturnStr;
};

var GetOutMatrixStr = function GetOutMatrixStr(LayerID){
    //TmpNN2[(10*10*0)+(10*0)+0:(10*10*0)+(10*0)+5-1],TmpNN2[(10*10*0)+(10*1)+0:(10*10*0)+(10*1)+5-1],TmpNN2[(10*10*0)+(10*2)+0:(10*10*0)+(10*2)+5-1],TmpNN2[(10*10*0)+(10*3)+0:(10*10*0)+(10*3)+5-1],TmpNN2[(10*10*0)+(10*4)+0:(10*10*0)+(10*4)+5-1],
};

var TestInTmpNN = function TestInTmpNN(LayerID){
    if(LayerID%2 == 0){
        return "TmpNN2";
    }
    
    return "TmpNN";
};

var TestOutTmpNN = function TestOutTmpNN(LayerID){
    if(LayerID%2 == 0){
        return "TmpNN";
    }
    
    return "TmpNN2";
};