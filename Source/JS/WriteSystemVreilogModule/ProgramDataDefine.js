
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
    module HardFuzzyCtl(clk,clearError,ctlSave,`+GetAllDevPortStr()+`OutBus,OutErrorBus,NeuralBus);`;
    }else{
        WrtieString += `
    module HardFuzzyCtl(clk,clearError,ctlSave,`+GetAllDevPortStr()+`OutBus,OutErrorBus);`;
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
        output [`+(Panel.DesignRuleView.MFArray.length+1)+`:0]    OutErrorBus;`;
        
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
        reg       [`+ Panel.DesignNeuralNetworkView.LayerList.length +`:0] subclk;
        reg       [0:5*`+(Panel.DesignNeuralNetworkView.MatrixRow+1)+`*`+(Panel.DesignNeuralNetworkView.MatrixRow+1)+`-1] Tmp;
        reg       [0:5*`+(Panel.DesignNeuralNetworkView.MatrixRow+1)+`*`+(Panel.DesignNeuralNetworkView.MatrixRow+1)+`-1] Tmp2;
        reg       [0:5*`+(Panel.DesignNeuralNetworkView.MatrixRow+1)+`*`+(Panel.DesignNeuralNetworkView.MatrixRow+1)+`-1] SaveNN;

        wire      [6:0] BeforeSateWire;
        wire	  [5:0] BeforeLossValueWire;
        wire      [0:5*`+(Panel.DesignNeuralNetworkView.MatrixRow+1)+`*`+(Panel.DesignNeuralNetworkView.MatrixRow+1)+`-1] SaveNNWire;
        wire      [0:5*`+(Panel.DesignNeuralNetworkView.MatrixRow+1)+`*`+(Panel.DesignNeuralNetworkView.MatrixRow+1)+`-1] OutNNWire;
      
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
            /*
            * ---------------------------------------------------------------------
            * [*] MDownDim Layer
            * ---------------------------------------------------------------------
            *  [*] The Part Need To Designer To Design 
            * 	 For The Example (Down Dim Event Wuth 2D~nD):
            *		 BaseCutLine #(.LongBits_limit(LongBits_limit_Sum)) Layer_i_Node_j_DownDim(.cut_line(Ctl_Signal),.Dim1Flag(Input_Signal_Area),.Dim2Flag(Input_Signal_Area),.Dim1(Input_Signal),.Dim2(Input_Signal),.OutDownFlag(Output_Comb_Signal_Area),.OutDownDim(Output_Comb_Signal))
            *		 ......
            *
            * [*] Just Like The This Code:
            *    DownDim #(.Offset(0),.InData_limit(10)) Layer1Node1DownDim(.CutLine(10'b0000011111),.Dim1Flag(MF2FN1Mapping[1:3]),.Dim2Flag(MF3FN1Mapping[1:3]),.Dim1(MF2FN1Mapping[5:10+5-1]),.Dim2(MF3FN1Mapping[5:10+5-1]),.OutDownFlag(MF2MF1_MF3FN1Mapping[1:3]),.OutDownDim(MF2MF1_MF3FN1Mapping[5:10+5-1]));
            */
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
        Divide          #(.subclk_limit(`+Panel.DesignNeuralNetworkView.LayerList.length+`))   DivideCLK(.clk(clk),.subclk(subclk));
        FristPool       #(.Row_Limit(`+Panel.DesignNeuralNetworkView.MatrixRow+`),.WindowsSize(2),.ComputRow(`+(Panel.DesignNeuralNetworkView.MatrixRow-2)+`)) FristPool(.clk(subclk[0]),.InData({`+GetAllMFArray()+GetExtraBits()+`}),.TmpNN(TmpNN));
        
        //==========================================================
        // FakeNN Layer
        //==========================================================
` + GetNeuralNetworkLayer() + `

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
        * [*] Just Like The This Code (for Node1):
        *		 BaseCutLine #(.LongBits_limit(5)) Layer1Node1_1_1Compute(.cut_line(5'b00111),.x({TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*1)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2]}),.y(5'b01111),.z(Layer1Node1_1_1));
        *        BaseCutLine #(.LongBits_limit(5)) Layer1Node1_1_2Compute(.cut_line(5'b00111),.x({TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*1)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2]}),.y(5'b00011),.z(Layer1Node1_1_2));
        *        BaseCutLine #(.LongBits_limit(5)) Layer1Node1_1_3Compute(.cut_line(5'b00111),.x({TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*1)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2]}),.y(5'b11111),.z(Layer1Node1_1_3));
        *        BaseCutLine #(.LongBits_limit(5)) Layer1Node1_1_4Compute(.cut_line(5'b00111),.x({TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*1)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2]}),.y(5'b00001),.z(Layer1Node1_1_4));
        *        
        *        BaseCutLine #(.LongBits_limit(5)) Layer1Node1_2_1Compute(.cut_line(5'b00111),.x({TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*1)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2]}),.y(5'b00111),.z(Layer1Node1_2_1));
        *        BaseCutLine #(.LongBits_limit(5)) Layer1Node1_2_2Compute(.cut_line(5'b00111),.x({TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*1)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2]}),.y(5'b00011),.z(Layer1Node1_2_2));
        *        
        *        BaseCutLine #(.LongBits_limit(5)) Layer1Node1_3_1Compute(.cut_line(5'b00111),.x({TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*1)+(10*0)+(5*10)+(2*10)+5+2],TmpNN[(10*10*0)+(10*0)+(5*10)+(2*10)+5+2]}),.y(5'b01111),.z(Layer1Node1_3_1));
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
            OutErrorBus = 0;`

    if(Panel.DesignMumbershipFuncitonView.HasBack){ 
        WrtieString += `
            NeuralBus = 0;`
    }
        WrtieString += `
        end

        //==========================================================================================================
        // Clk Event
        //==========================================================================================================
        always@(posedge clk) begin
`+(GetUpdateTmpsMapping());

        if(Panel.DesignMumbershipFuncitonView.HasBack){
            
            WrtieString += `
            if(subclk[`+Panel.DesignNeuralNetworkView.LayerList.length+`] == 1'b1) begin
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


var GetAllDevPortStr = function GetAllDevPortStr(){
    let ReturnStr = "";
    for(let i=0; i<Panel.DesignRuleView.MFArray.length; i++){
        ReturnStr += "dev"+(i+1)+",";
    }

    return ReturnStr;
};

var GetDevInputStr = function GetDevInputStr(){
    let ReturnStr = "";
    for(let i=0; i<Panel.DesignRuleView.MFArray.length; i++){
        ReturnStr += "\t\tinput  [DevValue-1:0] dev"+(i+1)+"; //"+Panel.DesignRuleView.MFArray[i].Name+" \n";
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
    console.log("--Write GetDownDimWireStr--");
    
    let ReturnStr  = "";
    let TmpSum     =  0;
    let TmpCounter =  0;

    for (let i = 0; i < Panel.DesignDownDimView.DimList.length; i++) {
        for (let j = 0; j < Panel.DesignDownDimView.DimList[i].length; j++) {
            TmpSum += Panel.DesignRuleView.MFArray[Panel.DesignDownDimView.DimList[i][j].SelectMFList].FN.length;
        }
    }
    
    for(;TmpSum>0;TmpSum=Math.floor(TmpSum/2)+(TmpSum%2)){
        TmpCounter+=Math.floor(TmpSum/2);
        if(TmpSum == 1){
            TmpCounter+=1;
            break;
        }
    }

    for (let i = 0; i < TmpCounter; i++) {
        ReturnStr += "\t\twire      [RateValue-1:0] DownDimNode"+(i+1)+";\n";
    }
    
    return ReturnStr;
};

var NeuralNetworkRegsStr = function NeuralNetworkRegsStr() {
    console.log("--Write NeuralNetworkRegsStr--");
    let ReturnStr = "";
    for(let i=0; i<Panel.DesignRuleView.MFArray.length; i++){
        for(let j=0; j<Panel.DesignRuleView.MFArray[i].FN.length; j++){
            ReturnStr += "\t\treg       [RateValue-1:0] TmpMF"+(i+1)+"FN"+(j+1)+"MappingData;\n"
            ReturnStr += "\t\treg       [RateValue-1:0] CtlMF"+(i+1)+"FN"+(j+1)+"MappingData;\n";
        }
    }

    return ReturnStr;
};

var GetANNWireStr = function GetANNWireStr() {
    console.log("--Write GetANNWireStr--");
    
    let ReturnStr  = "";
    let TmpSum     =  Panel.DesignNeuralNetworkView.ANNSum;
    let TmpCounter =  0;

    
    for(;TmpSum>0;TmpSum=Math.floor(TmpSum/2)+(TmpSum%2)){
        TmpCounter+=Math.floor(TmpSum/2);
        if(TmpSum == 1){
            TmpCounter+=1;
            break;
        }
    }

    for (let i = 0; i < TmpCounter; i++) {
        ReturnStr += "\t\twire      [RateValue-1:0] ANNNode"+(i+1)+";\n";
    }
    
    return ReturnStr;
};

var GetSensorGetStr = function GetSensorGetStr() {
    console.log("--Write GetSensorGetStr--");
    let ReturnStr = "";
    for(let i=0; i<Panel.DesignRuleView.MFArray.length; i++){
        ReturnStr += "\t\tSensorGet #(.SensorGet_LimitBit(DevValue),.BaseUpBound(" + Panel.DesignMumbershipFuncitonView.UpSafe + "),.BaseDownBound(" + Panel.DesignMumbershipFuncitonView.DownSafe + "),.ShiftVlaue(FixValue)) SensorGetLayerForMF"+(i+1)+"(.SensorGetValue(dev"+(i+1)+"),.FixedValue(MF"+(i+1)+"FixValue),.ErrorReturn(SensorGetMF"+(i+1)+"Tester)); \n";
    }

    return ReturnStr;
};

var GetFuzzyMappingStr = function GetFuzzyMappingStr() {
    console.log("--Write GetFuzzyMappingStr--");
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
    console.log("--Write GetSelfComputingStr--");
    let ReturnStr = "";
    
    for(let i=0; i<Panel.DesignRuleView.MFArray.length; i++){
        for(let j=0; j<Panel.DesignRuleView.MFArray[i].FN.length; j++){
            ReturnStr += "\t\tBaseCutLine #(.LongBits_limit(RateValue)) MF"+(i+1)+"FN"+(j+1)+"BSelfCompute(.cut_line(CtlMF"+(i+1)+"FN"+(j+1)+"MappingData),.x(TmpMF"+(i+1)+"FN"+(j+1)+"MappingData),.y(MF"+(i+1)+"FN"+(j+1)+"Mapping[5:RateValue+5-1]),.z(TmpMF"+(i+1)+"FN"+(j+1)+"MappingData));\n";
        }
    }
    return ReturnStr;
};

var GetAllMFArray = function GetAllMFArray() {
    console.log("--Write GetAllMFArray--");
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
    console.log("--Write GetExtraBits--");
    let ReturnStr   = "";
    let TmpExtraStr = "";

    let TmpMatrixSum = 0;

    for (let i = 0; i < Panel.DesignFuzzyNumberView.MFArray.length; i++) {
        TmpMatrixSum += Panel.DesignFuzzyNumberView.MFArray[i].FN.length
    }

    if(Panel.DesignNeuralNetworkView.MatrixRow-Math.sqrt(TmpMatrixSum*(Panel.DesignRuleView.AxisRateArray.length-1)) != 0){
        TmpExtraStr = Panel.DesignNeuralNetworkView.MatrixRow*Panel.DesignNeuralNetworkView.MatrixRow-TmpMatrixSum*(Panel.DesignRuleView.AxisRateArray.length-1);
        if(TmpExtraStr>0){
            ReturnStr += ","+String(TmpExtraStr)+"'b";
            for(let i=0;i<TmpExtraStr;i++){
                ReturnStr += "0";
            }
        }
    }

    return ReturnStr;
};

var GetNeuralNetworkLayer = function GetNeuralNetworkLayer() {
    console.log("--Write GetNeuralNetworkLayer--");
    let ReturnStr = "";
    let BeforeBranchSum = 1;
    let ConvCounter  = 0;
    let TmpRegStr   = ["Tmp","Tmp2"];
    let NextMappMatrixStr = "Tmp2";
    
    for(let i=0;i<Panel.DesignNeuralNetworkView.LayerList.length;i++){
        let TmpRegStr    = GetTmpInOut(i);
        ReturnStr += `
                //Layer : `+ (i+1) +`
        `;
        //Conv
        if(Panel.DesignNeuralNetworkView.LayerList[i].SelectLayerType == 0){
            
            //let FutureMappingSum = Math.floor(Panel.DesignNeuralNetworkView.LayerList[i].WindowSize / Panel.DesignNeuralNetworkView.LayerList[i].SelectLayerAllSum[Panel.DesignNeuralNetworkView.LayerList[i].SelectLayerSum])*Math.floor(Panel.DesignNeuralNetworkView.LayerList[i].WindowSize / Panel.DesignNeuralNetworkView.LayerList[i].SelectLayerAllSum[Panel.DesignNeuralNetworkView.LayerList[i].SelectLayerSum]);
            let FutureMappingSum =  Math.pow(Math.floor(Panel.DesignNeuralNetworkView.LayerList[i].ThisHave / Panel.DesignNeuralNetworkView.LayerList[i].Offset),2);

            if(FutureMappingSum == 0){
                FutureMappingSum += 1;
            }

            BeforeBranchSum *= FutureMappingSum;
            console.log(BeforeBranchSum);

            ReturnStr += `                //All Conv Future Mapping Sum: `+ BeforeBranchSum +`
            `;

            for(let j=0;j<BeforeBranchSum;j++){
                let ConvInMatrixStr,ConvOutMatrixStr;

                if(ConvCounter==0){
                    ConvInMatrixStr  = GetInConvMatrixStr(i,ConvCounter,0,TmpRegStr[0]);
                }else{
                    ConvInMatrixStr  = GetInConvMatrixStr(i,ConvCounter,j%Panel.DesignNeuralNetworkView.ConvArray[ConvCounter-1].length,TmpRegStr[0]);
                }
                ConvOutMatrixStr = GetOutConvMatrixStr(i,ConvCounter,j,TmpRegStr[1]);
                
                ReturnStr += `
                ConvolutionUnit #(.Row_Limit(`+Panel.DesignNeuralNetworkView.MatrixRow+`),.WindowsSize(`+Panel.DesignNeuralNetworkView.LayerList[i].WindowSize+`)) Layer`+(i+1)+`ID`+(j+1)+`(.clk(subclk[`+(i+1)+`]),
                    .InMatrix({
                        `+ConvInMatrixStr+`
                    }),
                    .EigenMatrix(
                        `+GetEigenMatrixStr(i)+`
                        ),
                    .OutMatrix({
                        `+ConvOutMatrixStr+`
                    })
                ); \n\n`;
                        
            }
                  
            ConvCounter++;

        //ReLu
        }else if(Panel.DesignNeuralNetworkView.LayerList[i].SelectLayerType == 1){
            let TmpRegStr    = GetTmpInOut(i);
            ReturnStr += `\t\tReLuUnit        #(.Row_Limit(`+Panel.DesignNeuralNetworkView.MatrixRow+`)) Layer`+(i+1)+`ID1(.clk(subclk[`+(i+1)+`]),.InMatrix(`+TmpRegStr[0]+`),.OutMatrix(`+TmpRegStr[1]+`));\n\n`;
        
        //Pool
        }else if(Panel.DesignNeuralNetworkView.LayerList[i].SelectLayerType == 2){
            TmpRegStr   =  GetTmpInOut(i);
            console.log(ConvCounter);
            
            for(let j=0;j<BeforeBranchSum;j++){
                ReturnStr += `
                PoolUnit        #(.Row_Limit(`+Panel.DesignNeuralNetworkView.MatrixRow+`),.WindowsSize(`+Panel.DesignNeuralNetworkView.LayerList[i].SelectLayerAllSum[Panel.DesignNeuralNetworkView.LayerList[i].SelectLayerSum]+`),.ComputRow(`+(Panel.DesignNeuralNetworkView.MatrixRow-Panel.DesignNeuralNetworkView.LayerList[i].SelectLayerAllSum[Panel.DesignNeuralNetworkView.LayerList[i].SelectLayerSum]+1)+`)) Layer`+(i+1)+`ID`+(j+1)+`(.clk(subclk[`+(i+1)+`]),
                    .InMatrix({
                        `+GetPoolInOutMatrixStr(i,ConvCounter,j,TmpRegStr[0])+`
                    }),.OutMatrix({
                        `+GetPoolInOutMatrixStr(i,ConvCounter,j,TmpRegStr[1])+`
                    })
                );\n\n`
            }

        //ReLu
        }
    }

    return ReturnStr;
};


var GetEigenMatrixStr = function GetEigenMatrixStr(LayerID){
    //console.log("--Write GetEigenMatrixStr--");
    let ReturnStr = "";

    ReturnStr += "" + (Panel.DesignNeuralNetworkView.LayerList[LayerID].SelectLayerAllSum[Panel.DesignNeuralNetworkView.LayerList[LayerID].SelectLayerSum]*Panel.DesignNeuralNetworkView.LayerList[LayerID].SelectLayerAllSum[Panel.DesignNeuralNetworkView.LayerList[LayerID].SelectLayerSum]) + "'b";
    for(let i=0;i<(Panel.DesignNeuralNetworkView.LayerList[LayerID].SelectLayerAllSum[Panel.DesignNeuralNetworkView.LayerList[LayerID].SelectLayerSum]*Panel.DesignNeuralNetworkView.LayerList[LayerID].SelectLayerAllSum[Panel.DesignNeuralNetworkView.LayerList[LayerID].SelectLayerSum]);i++){
        ReturnStr += "0";
    }

    return ReturnStr;
};

var GetInConvMatrixStr  = function GetInConvMatrixStr(LayerID,ConvCounter,MappingCounter,OutTmpStr){
    let ReturnStr  = "";

    if(ConvCounter == 0){
        return OutTmpStr;
    }

    for(let n=0;n<5;n++){
        for(let m=0;m<Panel.DesignNeuralNetworkView.LayerList[LayerID-1].WindowSize;m++){
            ReturnStr  += OutTmpStr + "["+((Panel.DesignNeuralNetworkView.MatrixRow*Panel.DesignNeuralNetworkView.MatrixRow*n) + (Panel.DesignNeuralNetworkView.LayerList[LayerID-1].WindowSize*m) + Panel.DesignNeuralNetworkView.AllOffsetArray[LayerID-1][MappingCounter]) + ":" 
                                        + ((Panel.DesignNeuralNetworkView.MatrixRow*Panel.DesignNeuralNetworkView.MatrixRow*n) + (Panel.DesignNeuralNetworkView.LayerList[LayerID-1].WindowSize*m) + Panel.DesignNeuralNetworkView.AllOffsetArray[LayerID-1][MappingCounter] + (Panel.DesignNeuralNetworkView.LayerList[LayerID-1].WindowSize))+"-1]";            
            if(n < 4 || m < Panel.DesignNeuralNetworkView.LayerList[LayerID-1].WindowSize-1){
                ReturnStr  += ",";
            }
        }
    }

    return ReturnStr;
};

var GetOutConvMatrixStr = function GetOutConvMatrixStr(LayerID,ConvCounter,MappingCounter,OutTmpStr){
    let ReturnStr  = "";
    for(let n=0;n<5;n++){
        for(let m=0;m<Panel.DesignNeuralNetworkView.LayerList[LayerID].WindowSize;m++){
            ReturnStr  += OutTmpStr + "["+((Panel.DesignNeuralNetworkView.MatrixRow*Panel.DesignNeuralNetworkView.MatrixRow*n) + (Panel.DesignNeuralNetworkView.LayerList[LayerID].WindowSize*m) + Panel.DesignNeuralNetworkView.AllOffsetArray[LayerID][MappingCounter]) + ":" 
                                        + ((Panel.DesignNeuralNetworkView.MatrixRow*Panel.DesignNeuralNetworkView.MatrixRow*n) + (Panel.DesignNeuralNetworkView.LayerList[LayerID].WindowSize*m) + Panel.DesignNeuralNetworkView.AllOffsetArray[LayerID][MappingCounter] + (Panel.DesignNeuralNetworkView.LayerList[LayerID].WindowSize))+"-1]";            
            if(n < 4 || m < Panel.DesignNeuralNetworkView.LayerList[LayerID].WindowSize-1){
                ReturnStr  += ",";
            }
        }
    }

    return ReturnStr;
};

/*
GetOutConvMatrixStr = function GetOutConvMatrixStr(LayerID,ConvCounter,MappingCounter,OutTmpStr){
    //console.log("--Write GetOutConvMatrixStr--");
    let ReturnStr  = "";
    for(let n=0;n<5;n++){
        for(let m=0;m<Panel.DesignNeuralNetworkView.LayerList[LayerID-1].WindowSize;m++){
            ReturnStr  += OutTmpStr + "["+((Panel.DesignNeuralNetworkView.MatrixRow*Panel.DesignNeuralNetworkView.MatrixRow*n) + (Panel.DesignNeuralNetworkView.LayerList[LayerID-1].WindowSize*m) + Panel.DesignNeuralNetworkView.AllConvArray[ConvCounter][MappingCounter]) + ":" + ((Panel.DesignNeuralNetworkView.MatrixRow*Panel.DesignNeuralNetworkView.MatrixRow*n) + (Panel.DesignNeuralNetworkView.LayerList[LayerID-1].WindowSize*m) + Panel.DesignNeuralNetworkView.AllConvArray[ConvCounter][MappingCounter] + (Panel.DesignNeuralNetworkView.LayerList[LayerID-1].WindowSize))+"-1]";            
            if(n != Panel.DesignNeuralNetworkView.LayerList[LayerID-1].Offset-1 && m != Panel.DesignNeuralNetworkView.LayerList[LayerID-1].Offset-1){
                ReturnStr  += ",";
            }
        }
    }
    
    if(ConvCounter == 0){
        return OutTmpStr;
    }
    
    return ReturnStr;
}
*/


var GetPoolInOutMatrixStr = function GetPoolInOutMatrixStr(LayerID,ConvCounter,MappingCounter,MatrixType){
    //console.log("--Write GetPoolInMatrixStr--");
    let ReturnStr  = "";

    if(ConvCounter == 0){
        return MatrixType;
    }

    for(let n=0;n<5;n++){
        for(let m=0;m<Panel.DesignNeuralNetworkView.LayerList[LayerID].WindowSize;m++){
            ReturnStr  += MatrixType + "["+((Panel.DesignNeuralNetworkView.MatrixRow*Panel.DesignNeuralNetworkView.MatrixRow*n) + (Panel.DesignNeuralNetworkView.LayerList[LayerID].WindowSize*m) + Panel.DesignNeuralNetworkView.AllOffsetArray[LayerID][MappingCounter]) + ":" 
                                        + ((Panel.DesignNeuralNetworkView.MatrixRow*Panel.DesignNeuralNetworkView.MatrixRow*n) + (Panel.DesignNeuralNetworkView.LayerList[LayerID].WindowSize*m) + Panel.DesignNeuralNetworkView.AllOffsetArray[LayerID][MappingCounter] + (Panel.DesignNeuralNetworkView.LayerList[LayerID].WindowSize))+"-1]";            
            if(n < 4 || m < Panel.DesignNeuralNetworkView.LayerList[LayerID].WindowSize-1){
                ReturnStr  += ",";
            }
        }
    }


    return ReturnStr;
};

/*
var GetPoolInOutMatrixStr = function GetPoolInOutMatrixStr(LayerID,ConvCounter,MappingCounter,MatrixType){
    //console.log("--Write GetPoolInMatrixStr--");
    let ReturnStr  = "";
    for(let n=0;n<5;n++){
        for(let m=0;m<Panel.DesignNeuralNetworkView.LayerList[LayerID].WindowSize;m++){
            ReturnStr  += MatrixType+"["+((Panel.DesignNeuralNetworkView.MatrixRow*Panel.DesignNeuralNetworkView.MatrixRow*n) + (Panel.DesignNeuralNetworkView.LayerList[LayerID].WindowSize*m) + Panel.DesignNeuralNetworkView.AllConvArray[ConvCounter][MappingCounter]) + ":" + ((Panel.DesignNeuralNetworkView.MatrixRow*Panel.DesignNeuralNetworkView.MatrixRow*n) + (Panel.DesignNeuralNetworkView.LayerList[LayerID].WindowSize*m) + Panel.DesignNeuralNetworkView.AllConvArray[ConvCounter][MappingCounter] + (Panel.DesignNeuralNetworkView.LayerList[LayerID].WindowSize))+"-1]";            
            if(n != Panel.DesignNeuralNetworkView.LayerList[LayerID].Offset-1 && m != Panel.DesignNeuralNetworkView.LayerList[LayerID].Offset-1){
                ReturnStr  += ",";
            }
        }
    }

    if(ConvCounter == 0){
        return MatrixType;
    }

    return ReturnStr;
}
*/
/*
var GetPoolInOutMatrixStr = function GetPoolInOutMatrixStr(LayerID,MatrixType){
    console.log("--Write GetPoolInOutMatrixStr--");
    let ReturnStr = "";
    let TmpBlockStr = "Tmp";

    if(MatrixType == "IN"){
        TmpBlockStr = TestInTmpNN(i);
    }else{
        TmpBlockStr = TestOutTmpNN(i);
    }


    return ReturnStr;
};
*/

var GetUpdateTmpsMapping = function GetUpdateTmpsMapping(){
    return "";
};

var GetOutErrorBusStr = function GetOutErrorBusStr(){
    console.log("--Write GetOutErrorBusStr--");
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
    console.log("--Write GetFuzzyRuleStr--");
    let ReturnStr  = "";
    let CommentStr = "";
    let CodeStr    = "";
    for (let i = 0; i < Panel.DesignRuleView.RuleList.length; i++) {
        for (let j = 0; j < Panel.DesignRuleView.RuleList[i].length; j++) {
            if(j == 0){
                CommentStr += `\n\t\t//IF`;
                CodeStr    += `\t\tif(` ;
            }
            
            if(Panel.DesignRuleView.RuleList[i][j].ConnectLogic != 0){
                CommentStr += ` MF`+((Panel.DesignRuleView.RuleList[i][j].SelectMFList)+1)+`_FN`+((Panel.DesignRuleView.RuleList[i][j].SelectFNList)+1)+` `+Panel.ProjectCheckView.PointLogicMap[Panel.DesignRuleView.RuleList[i][j].SelectPointLogic]+` `+Panel.DesignRuleView.AxisRateArray[Panel.DesignRuleView.RuleList[i][j].SelectBaseValue]+` `+Panel.ProjectCheckView.ConnectLogicOutMap[Panel.DesignRuleView.RuleList[i][j].ConnectLogic];
                
            }else{
                CommentStr += ` MF`+((Panel.DesignRuleView.RuleList[i][j].SelectMFList)+1)+`_FN`+(Panel.DesignRuleView.RuleList[i][j].SelectFNList+1)+` `+Panel.ProjectCheckView.PointLogicMap[Panel.DesignRuleView.RuleList[i][j].SelectPointLogic]+` `+Panel.DesignRuleView.AxisRateArray[Panel.DesignRuleView.RuleList[i][j].SelectBaseValue];
            }

            if(Panel.DesignRuleView.RuleList[i][j].SelectPointLogic == 0){
                if(Panel.DesignRuleView.RuleList[i][j].SelectBaseValue == Panel.DesignRuleView.AxisRateArray.length-1){
                    CodeStr    += `(MF`+((Panel.DesignRuleView.RuleList[i][j].SelectMFList)+1)+`FN`+((Panel.DesignRuleView.RuleList[i][j].SelectFNList)+1)+`Mapping[5+`+Panel.DesignRuleView.RuleList[i][j].SelectBaseValue+`] == 1'b1) `;
                }else{
                    CodeStr    += `(MF`+((Panel.DesignRuleView.RuleList[i][j].SelectMFList)+1)+`FN`+((Panel.DesignRuleView.RuleList[i][j].SelectFNList)+1)+`Mapping[5+`+Panel.DesignRuleView.RuleList[i][j].SelectBaseValue+`+1] == 1'b1) `;
                }
            }else if(Panel.DesignRuleView.RuleList[i][j].SelectPointLogic == 1){
                if(Panel.DesignRuleView.RuleList[i][j].SelectBaseValue == Panel.DesignRuleView.AxisRateArray.length-1){
                    CodeStr    += `(MF`+((Panel.DesignRuleView.RuleList[i][j].SelectMFList)+1)+`FN`+((Panel.DesignRuleView.RuleList[i][j].SelectFNList)+1)+`Mapping[5+`+Panel.DesignRuleView.RuleList[i][j].SelectBaseValue+`] == 1'b1) `;
                }else if(Panel.DesignRuleView.RuleList[i][j].SelectBaseValue == 0){
                    CodeStr    += `(MF`+((Panel.DesignRuleView.RuleList[i][j].SelectMFList)+1)+`FN`+((Panel.DesignRuleView.RuleList[i][j].SelectFNList)+1)+`Mapping[5+0] == 1'b1 && MF`+((Panel.DesignRuleView.RuleList[i][j].SelectMFList)+1)+`FN`+((Panel.DesignRuleView.RuleList[i][j].SelectFNList)+1)+`Mapping[5+1] == 1'b0) `;
                }else{
                    CodeStr    += `(MF`+((Panel.DesignRuleView.RuleList[i][j].SelectMFList)+1)+`FN`+((Panel.DesignRuleView.RuleList[i][j].SelectFNList)+1)+`Mapping[5+`+Panel.DesignRuleView.RuleList[i][j].SelectBaseValue+`] == 1'b1 && MF`+((Panel.DesignRuleView.RuleList[i][j].SelectMFList)+1)+`FN`+((Panel.DesignRuleView.RuleList[i][j].SelectFNList)+1)+`Mapping[5+`+Panel.DesignRuleView.RuleList[i][j].SelectBaseValue+`+1] == 1'b0) `;
                }
            }else{
                CodeStr        += `(MF`+((Panel.DesignRuleView.RuleList[i][j].SelectMFList)+1)+`FN`+((Panel.DesignRuleView.RuleList[i][j].SelectFNList)+1)+`Mapping[5+`+Panel.DesignRuleView.RuleList[i][j].SelectBaseValue+`] == 1'b0) `;
            }


            if(j != Panel.DesignRuleView.RuleList[i].length-1){
                CodeStr +=  Panel.ProjectCheckView.ConnectLogicOutMap[Panel.DesignRuleView.RuleList[i][j].ConnectLogic] + ` `;
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

var GetTmpInOut = function GetTmpInOut(LayerID){
    if(LayerID%2 == 0){
        return ["Tmp","Tmp2"];
    }
    return ["Tmp2","Tmp"];
};