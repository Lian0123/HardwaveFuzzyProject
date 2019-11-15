
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
    
    WrtieString += 
    '`define Quartus_Module "ON" \n\n';
    
    WrtieString += 
    '`ifndef Quartus_Module \n' +
    '    `include "Divide.sv" \n' +
    '\n' +
    '    `include "SensorGet.sv" \n' +
    '    `include "BaseCutLine.sv" \n' +
    '    `include "DownDim.sv" \n' +
    '    `include "FuzzyMapping.sv" \n' +
    '\n' +
    '    `include "FristPool.sv" \n' +
    '    `include "ConvolutionUnit.sv" \n' +
    '    `include "PoolUnit.sv" \n' +
    '    `include "ReLuUnit.sv" \n' +
    '\n' +
    '    $display("Is Include Module\\n"); \n' +
    '`endif \n\n';

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
        parameter FixValue    = ` + Panel.DesignMumbershipFuncitonView.Offset   + `;
        parameter RateValue   = ` + Panel.DesignRuleView.AxisRateArray.length   + `;
        parameter DevValue    = ` + Panel.DesignMumbershipFuncitonView.DevValue + `;
        
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
      
        `+GetANNWireStr()+`
        
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
        
        
        //==========================================================
        // ANN Layer
        //==========================================================
        /*
        * [*] The Part Need To Designer To Design 
        * 	 For The Example (Fake Of Artificial Neural Network):
        *                                                                         (Layer1 Node1 = Σ|&|(After Fake CNN(i) |&| Layer1 Node1 Weight(i))        (Out[0] = Layer2 Node1 = Σ|&|( Layer1 Node(i) |&| Layer2 Node1 Weight(i))
        *		(After Fake CNN)1 → ( Layer1 Node1 Weight) → (Layer1 Node1)    Layer1 Node1 → ( Layer2 Node1 Weight) → (Layer2 Node1)
        *			              ↘ ( Layer1 Node2 Weight) → (Layer1 Node2)                 ↘ ( Layer2 Node2 Weight) → (Layer2 Node2)
        *			              ↘ ( Layer1 Node3 Weight) → (Layer1 Node3)                 ↘ ( Layer2 Node3 Weight) → (Layer2 Node3)
        *			              ↘ ( Layer1 Node4 Weight) → (Layer1 Node4)    
        *
        *                                                                         (Layer1 Node2 = Σ|&|(After Fake CNN(i) |&| Layer1 Node2 Weight(i))        (Out[1] = Layer2 Node1 = Σ|&|( Layer1 Node(i) |&| Layer2 Node3 Weight(i))
        *		(After Fake CNN)2 → ( Layer1 Node1 Weight) → (Layer1 Node1)    Layer1 Node2 → ( Layer2 Node1 Weight) → (Layer2 Node1)
        *			              ↘ ( Layer1 Node2 Weight) → (Layer1 Node2)                 ↘ ( Layer2 Node2 Weight) → (Layer2 Node2)
        *			              ↘ ( Layer1 Node3 Weight) → (Layer1 Node3)                 ↘ ( Layer2 Node3 Weight) → (Layer2 Node3)
        *			              ↘ ( Layer1 Node4 Weight) → (Layer1 Node4)
        *
        *                                                                         (Layer1 Node3 = Σ|&|(After Fake CNN(i) |&| Layer1 Node3 Weight(i))        (Out[2] = Layer2 Node1 = Σ|&|( Layer1 Node(i) |&| Layer2 Node3 Weight(i))
        *		(After Fake CNN)3 → ( Layer1 Node1 Weight) → (Layer1 Node1)    Layer1 Node3 → ( Layer2 Node1 Weight) → (Layer2 Node1)
        *			              ↘ ( Layer1 Node2 Weight) → (Layer1 Node2)                 ↘ ( Layer2 Node2 Weight) → (Layer2 Node2)
        *			              ↘ ( Layer1 Node3 Weight) → (Layer1 Node3)                 ↘ ( Layer2 Node3 Weight) → (Layer2 Node3)
        *			              ↘ ( Layer1 Node4 Weight) → (Layer1 Node4)
        *
        *                                                                         (Layer1 Node4 = Σ|&|(After Fake CNN(i) |&| Layer1 Node4 Weight(i))
        *		(After Fake CNN)4 → ( Layer1 Node1 Weight) → (Layer1 Node1)    Layer1 Node4 → ( Layer2 Node1 Weight) → (Layer2 Node1)
        *			              ↘ ( Layer1 Node2 Weight) → (Layer1 Node2)                 ↘ ( Layer2 Node2 Weight) → (Layer2 Node2)
        *			              ↘ ( Layer1 Node3 Weight) → (Layer1 Node3)                 ↘ ( Layer2 Node3 Weight) → (Layer2 Node3)
        *			              ↘ ( Layer1 Node4 Weight) → (Layer1 Node4)
        *			
        *
        * [*] Just Like The This Code:
        *		 if(TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2] == 1'b1)
        *		 	MF1FN1MappingData = MF1FN1MappingData <<< 1;
        *		 else
        *			MF1FN1MappingData = MF1FN1MappingData >> 1;
        *
        */
       `;
        WrtieString += `
        assign OutNNWire  = TmpNN;
        assign SaveNNWire = SaveNN;

        `;
    }

        WrtieString += `
        //==========================================================================================================
        // Init Event
        //==========================================================================================================
        initial begin
            OutBus = 0;
            OutErrorBus = 0;
            NeuralBus = 0;
        end

        //==========================================================================================================
        // Clk Event
        //==========================================================================================================
        always@(posedge clk) begin
`+(GetUpdateTmpsMapping());

        if(Panel.DesignMumbershipFuncitonView.HasBack){
            
            WrtieString += `
            if(subclk[`+Panel.LayerList.length+`] == 1'b1) begin
                if(ctlSave == 2'b01) 
                    SaveNN = TmpNN;
                else if(ctlSave == 2'b10)
                    SaveNN = 0;
                
                /*
                 * ---------------------------------------------------------------------
                 * [*] Move Rule
                 * ---------------------------------------------------------------------
                 *  [*] The Part Need To Designer To Design 
                 * 	 For The Example (Fake Of Convolution Neural Network):
                 *		 if(Last_NN_Layer_Some_Data Is Some_Logic) 
                 *			Ctl_Some_MappingData = Ctl_Some_MappingData Left  Shifting;
                 *		 else
                 *			Ctl_Some_MappingData = Ctl_Some_MappingData Right Shifting;
                 *			
                 *
                 * [*] Just Like The This Code:
                 *		 if(TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2] == 1'b1)
                 *		 	MF1FN1MappingData = MF1FN1MappingData <<< 1;
                 *		 else
                 *			MF1FN1MappingData = MF1FN1MappingData >> 1;
                 *
                 */
            
            end`
        }

        WrtieString += `
`+GetOutErrorBusStr()+`

        //Rule Connect
`+GetFuzzyRuleStr()+`
        
        end

    endmodule`
    
};

var GetDevInputStr = function GetDevInputStr(){
    let ReturnStr = "";
    for(let i=0; i<Panel.DesignRuleView.MFArray.length; i++){
        ReturnStr += "\t\tinput  [DevValue-1:0] dev"+(i+1)+";\n";
    }

    return ReturnStr;
};

var GetDevInputWireStr = function GetDevInputWireStr(){
    let ReturnStr = "";
    for(let i=0; i<Panel.DesignRuleView.MFArray.length; i++){
        ReturnStr += "\t\twire      [1:0] SensorGetMF"+(i+1)+"Tester;\n\t\twire      [RateValue-1:0] MF"+(i+1)+"FixValue;\n";
    }

    return ReturnStr;
};

var FuzzyMappingWireStr = function FuzzyMappingWireStr() {
    let ReturnStr = "";
    for(let i=0; i<Panel.DesignRuleView.MFArray.length; i++){
        for(let j=0; j<Panel.DesignRuleView.MFArray[i].FN.length; j++){
            ReturnStr += "\t\twire      [0:1+3+2+RateValue-1] MF"+(i+1)+"FN"+(j+1)+"Mapping;\n";
        }
    }

    return ReturnStr;
};

var GetDownDimWireStr = function GetDownDimWireStr() {
    let ReturnStr = "";
    let TmpNode  = 0;
    if(Panel.DesignDownDimView.DimList.length > 2){
        // % Add Tmp Computing Node(wire)
        if(Panel.DesignDownDimView.DimList.length % 2 != 0){
            // Base 
        }else{
            // Base -1 Up Node
        }
    }
    for(let i=0; i<Panel.DesignDownDimView.DimList.length; i++){ //1
        for(let j=0; j<Panel.DesignDownDimView.DimList[i].length; j++){ //1
            for(let m=0; m<Panel.DesignRuleView.MFArray.FN[Panel.DesignDownDimView.DimList[i].SelectMFList].length; m++){ //3
                ReturnStr += "MF"+(i+1)+"FN"+(j+1);
                for(let n=0; n<Panel.DesignRuleView.MFArray.FN[Panel.DesignDownDimView.DimList[j].SelectMFList].length; n++){ //3
                    if(n != Panel.DesignRuleView.MFArray.FN[Panel.DesignDownDimView.DimList[j].SelectMFList].length-1){
                        ReturnStr += "_"
                    }
                    ReturnStr += "MF"+(j+1)+"FN"+(n+1);
                }
                
                if(j!= Panel.DesignDownDimView.DimList[i].length -1){
                    ReturnStr += "_";
                }
            }
            ReturnStr += "Mapping;\n";
        }
        if(Panel.DesignDownDimView.DimList[i].length > 1){
            TmpNode += 1;
        }
    }

    return ReturnStr;
};

var NeuralNetworkRegsStr = function NeuralNetworkRegsStr() {
    let ReturnStr = "";
    for(let i=0; i<Panel.DesignRuleView.MFArray.length; i++){
        for(let j=0; j<Panel.DesignRuleView.MFArray[i].FN.length; j++){
            ReturnStr += "\t\treg       [RateValue-1:0] TmpMF"+(i+1)+"FN"+(j+1)+"MappingData;\nreg       [10-1:0] CtlMF1FN1MappingData;\n";
        }
    }

    return ReturnStr;
};

var GetANNWireStr = function GetANNWireStr() {

};

var GetSensorGetStr = function GetSensorGetStr() {
    let ReturnStr = "";
    for(let i=0; i<Panel.DesignRuleView.MFArray.length; i++){
        ReturnStr += "\t\tSensorGet #(.SensorGet_LimitBit(DevValue),.BaseUpBound(" + Panel.DesignMumbershipFuncitonView.UpSafe + "),.BaseDownBound(" + Panel.DesignMumbershipFuncitonView.DownSafe + "),.ShiftVlaue(FixValue)) SensorGetLayerForMF"+(i+1)+"(.SensorGetValue(dev"+(i+1)+"),.FixedValue(MF"+(i+1)+"FixValue),.ErrorReturn(SensorGetMF"+(i+1)+"Tester)); \n";
    }

    return ReturnStr;
};

var GetFuzzyMappingStr = function GetFuzzyMappingStr() {
    let ReturnStr = "";
    for(let i=0; i<Panel.DesignRuleView.MFArray.length; i++){
        for(let j=0; j<Panel.DesignRuleView.MFArray[i].FN.length; j++){
            ReturnStr += "\t\tFuzzyMapping #(.InData_limit(DevValue),.LongBit_limit(RateValue),.Node0("+Panel.DesignRuleView.MFArray[i].FN[j].X0+"),.Node1("+Panel.DesignRuleView.MFArray[i].FN[j].X1+"),.Node2("+Panel.DesignRuleView.MFArray[i].FN[j].X2+"),.Node3("+Panel.DesignRuleView.MFArray[i].FN[j].X3+")) FuzzyMappingLayerForMF"+(i+1)+"FN"+(j+1)+"(.InFixed(MF"+(i+1)+"FixValue),.IsHit(MF"+(i+1)+"FN"+(j+1)+"Mapping[0]),.LoaclFlag(MF"+(i+1)+"FN"+(j+1)+"Mapping[1:3]),.LongBitData(MF"+(i+1)+"FN"+(j+1)+"Mapping[5:10+5-1]),.ErrorReturn(MF"+(i+1)+"FN"+(j+1)+"Mapping[4])); \n";
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
            ReturnStr += "\t\tBaseCutLine #(.LongBits_limit(RateValue)) MF"+(i+1)+"FN"+(j+1)+"BSelfCompute(.cut_line(CtlMF"+(i+1)+"FN"+(j+1)+"MappingData),.x(TmpMF"+(i+1)+"FN"+(j+1)+"MappingData),.y(MF"+(i+1)+"FN"+(j+1)+"Mapping[5:RateValue+5-1]),.z(TmpMF"+(i+1)+"FN"+(j+1)+"MappingData));\n";
        }
    }
    return ReturnStr;
};

var GetAllMFArray = function GetAllMFArray() {
    let ReturnStr = "";

    for(let i=0; i<Panel.DesignRuleView.MFArray.length; i++){
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
        //Conv
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
        //Pool
        }else if(Panel.DesignNeuralNetworkView.LayerList[i].SelectLayerType == 1){
            
        //ReLu
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
var GetUpdateTmpsMapping = function GetUpdateTmpsMapping(){
    return "";
};

var GetOutErrorBusStr = function GetOutErrorBusStr(){
    OutRangeError    = "\t\t\tOutErrorBus[0] = (";
    OutOverflowError = "\t\t\tOutErrorBus[1] = (";
    OutMappingError  =  "";
    for(let i=0; i<Panel.DesignRuleView.MFArray.length; i++){
        OutRangeError    += `SensorGetMF`+(i+1)+`Tester[0]`;
        OutOverflowError += `SensorGetMF`+(i+1)+`Tester[1]`;
        OutMappingError  += `\t\t\tOutErrorBus[`+(i+2)+`] = (`;

        if(i != Panel.DesignRuleView.MFArray.length-1){
            OutRangeError    += ` | `;
            OutOverflowError += ` | `;
        }

        for(let j=0; j<Panel.DesignRuleView.MFArray[i].FN.length; j++){
            OutMappingError += `MF`+(i+1)+`FN`+(j+1)+`Mapping[4]`;
            if(j != Panel.DesignRuleView.MFArray[i].FN.length-1){
                OutMappingError += ` | `;
            }
        }

        OutMappingError += `) & ~(clearError);\n`;
    }
    OutRangeError    += `) & ~(clearError);\n`;
    OutOverflowError += `) & ~(clearError);\n`;
    return OutRangeError+OutOverflowError+OutMappingError;
};

var GetFuzzyRuleStr = function GetFuzzyRuleStr(){
    let ReturnStr  = "";
    let CommentStr = "";
    let CodeStr    = "";
    for (let i = 0; i < Panel.DesignRuleView.RuleList.length; i++) {
        for (let j = 0; j < Panel.DesignRuleView.RuleList[i].length; j++) {
            if(j == 0){
                CommentStr += `\n\t\t\t//IF`;
                CodeStr    += `\t\t\tif(` ;
            }
            
            if(Panel.DesignRuleView.RuleList[i][j].ConnectLogic != 0){
                CommentStr += ` MF`+((Panel.DesignRuleView.RuleList[i][j].SelectMFList)+1)+`_FN`+((Panel.DesignRuleView.RuleList[i][j].SelectFNList)+1)+` `+Panel.ProjectCheckView.PointLogicMap[Panel.DesignRuleView.RuleList[i][j].SelectPointLogic]+` `+Panel.DesignRuleView.AxisRateArray[Panel.DesignRuleView.RuleList[i][j].SelectBaseValue]+` `+Panel.ProjectCheckView.ConnectLogicOutMap[Panel.DesignRuleView.RuleList[i][j].ConnectLogic];
                
            }else{
                CommentStr += ` MF`+(Panel.DesignRuleView.RuleList[i][j].SelectMFList)+`_FN`+(Panel.DesignRuleView.RuleList[i][j].SelectFNList)+` `+Panel.ProjectCheckView.PointLogicMap[Panel.DesignRuleView.RuleList[i][j].SelectPointLogic]+` `+Panel.DesignRuleView.AxisRateArray[Panel.DesignRuleView.RuleList[i][j].SelectBaseValue];
            }

            if(Panel.DesignRuleView.RuleList[i][j].SelectPointLogic == 0){
                if(Panel.DesignRuleView.RuleList[i][j].SelectBaseValue == Panel.DesignRuleView.AxisRateArray.length-1){
                    CodeStr    += `(MF`+(i+1)+`FN`+(j+1)+`Mapping[5+`+Panel.DesignRuleView.RuleList[i][j].SelectBaseValue+`] == 1'b1) `;
                }else{
                    CodeStr    += `(MF`+(i+1)+`FN`+(j+1)+`Mapping[5+`+Panel.DesignRuleView.RuleList[i][j].SelectBaseValue+`+1] == 1'b1) `;
                }
            }else if(Panel.DesignRuleView.RuleList[i][j].SelectPointLogic == 1){
                if(Panel.DesignRuleView.RuleList[i][j].SelectBaseValue == Panel.DesignRuleView.AxisRateArray.length-1){
                    CodeStr    += `(MF`+(i+1)+`FN`+(j+1)+`Mapping[5+`+Panel.DesignRuleView.RuleList[i][j].SelectBaseValue+`] == 1'b1) `;
                }else if(Panel.DesignRuleView.RuleList[i][j].SelectBaseValue == 0){
                    CodeStr    += `(MF`+(i+1)+`FN`+(j+1)+`Mapping[5+0] == 1'b1 && MF`+(i+1)+`FN`+(j+1)+`Mapping[5+1] == 1'b0) `;
                }else{
                    CodeStr    += ` MF`+(i+1)+`FN`+(j+1)+`Mapping[5+`+Panel.DesignRuleView.RuleList[i][j].SelectBaseValue+`] == 1'b1 && MF`+(i+1)+`FN`+(j+1)+`Mapping[5+`+Panel.DesignRuleView.RuleList[i][j].SelectBaseValue+`+1] == 1'b0) `;
                }
            }else{
                CodeStr        += `(MF`+(i+1)+`FN`+(j+1)+`Mapping[5+`+Panel.DesignRuleView.RuleList[i][j].SelectBaseValue+`] == 1'b0) `;
            }


            if(j != Panel.DesignRuleView.RuleList[i].length-1){
                CodeStr +=  Panel.ProjectCheckView.PointLogicMap[Panel.DesignRuleView.RuleList[i][j].ConnectLogic] + ` `;
            }
        }

        CommentStr += ` THEN ` + Panel.DesignRuleView.RuleList[i][0].OutLogic + `\n`; 
        if(Panel.DesignRuleView.RuleList[i][0].OutLogic == 1){
            CodeStr += `)
                OutBus[`+i+`] = 1'b1;
            else
                OutBus[`+i+`] = 1'b0;
            `;
        }else{
            CodeStr += `)
                OutBus[`+i+`] = 1'b0;
            else
                OutBus[`+i+`] = 1'b1;
            `;
        }
        ReturnStr  += CommentStr + CodeStr;

        CommentStr = "";
        CodeStr    = "";
    }
    return ReturnStr;
};

var GetLossStr = function GetLossStr(){

}

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
