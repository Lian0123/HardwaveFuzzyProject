var d3 = require("d3");
var c3 = require("c3");
var fs = require("fs");
/*
var jsonUri = "data:text/plain;base64,"+window.btoa(JSON.stringify(partJson));

particlesJS.load('particles-js', jsonUri, function() {
    console.log('callback - particles.js config loaded');
});
*/

var ALI = Vue.component('al-input', {
    template: '<input v-bind:class="GetComponentInputClass" type="text" v-model.trim="InputText"  v-bind:placeholder="holdertext" />',
    props: ['holdertext'],
    data: function () {
        return {
            ComponentInputClass : "ABLINPUT"  , //CSS樣式
            InputText           : ""          , //輸入字串內容
            IsEdit              : false       , //是否已進行編輯事件
        }
    },
    //在mounted狀態時，進行初始的傳送"input輸入值"給其Parent物件
    mounted() {
        this.SendValueToParent();
    },
    //當"input輸入值"進行變更時自動將變更值傳給其Parent物件
    updated() {
        this.IsEdit = true;
        this.SendValueToParent();
    },
    //底下的方法
    methods: {
        //使用$emit傳遞input輸入值給Parent物件的v-on監控
        SendValueToParent:function() {
            this.$emit('get-child-input-text',this.InputText);
        },
        ClearInput:function(){
            this.InputText = "";
            this.IsEdit = false;
        }
    },
    //Computed呼叫
    computed: {
        //獲取其現態資料是為錯誤：則將其樣式改為Error版的CSS樣式
        GetComponentInputClass(){
            return this.InputText == "" && this.IsEdit ? "ERRABLINPUT" : "ABLINPUT";
        }
    }
    
});

var ALIP = Vue.component('al-input-panel', {
    template: ' <div v-bind:class="ContentCSS"><div v-bind:class="LayerLeft"><div v-bind:class="BlockCSS"><p>{{titlename}}<input v-bind:class="GetComponentInputClass" class="FixedHight30px" type="text" v-model.trim="InputText"  v-bind:placeholder="holdertext" /></p></div></div><div v-bind:class="LayerRight"><div v-bind:class="BlockCSS"><p @click="SendValueToParent()"><br><a href="#"><button v-bind:class="RightCSS" type="button">{{addtext}}</button></a></p></div></div></div>',
    props: ['holdertext','titlename','addtext'],
    data: function () {
        return {
            LayerLeft           : "col12"                      , //
            LayerRight          : "col4"                       , //
            ContentCSS          : "CONTENT A ROW"              , //
            BlockCSS            : "BLOCK_CONTENT"              , //
            RightCSS            : "ABLBTNSMALL FixedHight30px" , //
            ComponentInputClass : "ABLINPUT"                   , //CSS樣式
            InputText           : ""                           , //輸入字串內容
            IsEdit              : false                        , //是否已進行編輯事件
        }
    },
    updated() {
        if(this.InputText != ""){
            this.IsEdit = true;
        }
    },
    //底下的方法
    methods: {
        //使用$emit傳遞input輸入值給Parent物件的v-on監控
        SendValueToParent:function() {

            console.log("-"+this.InputText+"-")
            if(this.InputText==""){
                alert("MF名稱不可為空","錯誤");
                return;
            }
            
            this.$emit('get-child-input-text',this.InputText);
            this.ClearText();
        },
        ClearText:function() {
            this.InputText = ""    ;//
            this.IsEdit    = false ;//
        },
    },
    //Computed呼叫
    computed: {
        //獲取其現態資料是為錯誤：則將其樣式改為Error版的CSS樣式
        GetComponentInputClass(){
            return this.InputText == "" && this.IsEdit ? "ERRABLINPUT" : "ABLINPUT";
        }
    }
    
});

var ALB = Vue.component('al-button',{
    template: '<a href="#"><button v-bind:class="ComponentButtonClass" type="button">{{text}}</button></a>',
    props: ['text'],
    data: function () {
        return {
            ComponentButtonClass: "ABLBTN",
        }
    }
});

var ALI = Vue.component('fuzzy-input-port-al-select', {
    template: '<select v-bind:class="ABLSELECT">< v-for="(item, index) in OptionList" option v-bind:value="item.value">{{Text}}</option></select>',
    data: function () {
        return {
            ComponentSelectClass : "ABLSELECT"                                                   , //CSS樣式
            NowSelect            : "0"                                                           , //選擇選項內容
            IsEdit               : false                                                         , //是否已進行編輯事件
            OptionList           : [{ value: "0", Text:"一般輸入"} ,{ value: "1", Text:"回授輸入"}] , //選項列表
        }
    },
    //在mounted狀態時，進行初始的傳送"Select選擇的Option"給其Parent物件
    mounted() {
        this.SendValueToParent();
    },
    //當"Select選擇的Option"進行變更時自動將變更值傳給其Parent物件
    updated() {
        this.IsEdit = true;
        this.SendValueToParent();
    },
    //底下的方法
    methods: {
        //使用$emit傳遞Select選擇的Option給Parent物件的v-on監控
        SendValueToParent:function() {
            this.$emit('get-fuzzy-input-port-al-select-value',this.OptionList[this.NowSelect].Text);
        },
    }
    
});




var Panel = new Vue({
    el:"#Panel",
    data:{
        IsBaseView  : true        ,
        ViewCounter : 0           ,
        TilteText   : "使用同意書"  ,
        FuzzyNumberView:{},
        //首頁
        IndexView  :{
            IsView: true, //頁面是否顯示
        },
        //建立專案用界面
        MakeProjectView: {
            IsView      : true , //頁面是否顯示
            DateTime    : null , //日期資訊
            ProjectName : ""   , //專案名稱
        },
        //建立MF值域界面
        DesignMumbershipFuncitonView:{
            IsView    : true  , //是否顯示
            MFArray   : []    , //MF陣列 {MFName:編號 Name: 資料名, FN:FN點資料,C3:C3表格物件}
            AxisRate  : 0.1   , //預設Rate值
            Offset    : 0     , //偏移量
            HasBack   : 0     , //有無回授
            UpSafe    : 1024  , //合理上界
            DownSafe  : 0     , //合理下界
            DevValue  : 10    , //位元數
        },
        //建立FN值域界面
        DesignFuzzyNumberView:{
            IsView  : true , //是否顯示
            MFArray : []   , // MF對應FN的Array 
        },
        //設計各規則界面
        DesignRuleView:{
            IsView          : true , //頁面是否顯示
            MFArray         : []   , //MF陣列
            RuleList        : []   , //規則陣列 2維陣列 [{SelectMFList:MF變號,SelectFNList:FN編號,SelectPointLogic:邏輯運算子編號,SelectBaseValue:規則基底值編號,OutLogic:輸出邏輯值,ConnectLogic:連接邏輯編號}]
            AxisRateArray   : []   , //規則刻度陣列
        },
        //降低資料維度界面
        DesignDownDimView:{
            IsView             : true , //頁面是否顯示
            DimList            : []   , //合成維度資訊陣列 2維陣列 [{SelectMFList:選擇MF編號,SelectBaseValue:偏移量}]
        },
        //設定神經網路界面
        DesignNeuralNetworkView:{
            IsView               : true                   , //頁面是否顯示
            LayerList            : []                     , //網路層接資料 {SelectLayerType:選擇該層Type,SelectLayerAllSum:收縮該層的可行層數,SelectLayerSum:選擇的Kernel層數,WindowSize:Layer Size,IsEdit:是否可編輯,Offset：自偏移量}
            LayerTypeArray       : ["Conv","ReLu","Pool"] , //網路層的型別
            MatrixRow            : 0                      , //記憶體上單行Row的總數
            TmpMatrixRow         : 0                      , //剩餘單行Row的暫存
            ConvArray            : []                     , //捲積運算偏移陣列
            AllConvArray         : []                     , //展開的捲積運算資料陣列
            ANNSum               : 0                      , //連線至ANN架構上的總點數
        },
        //專案確認界面
        ProjectCheckView:{
            IsView             : true                   , //頁面是否顯示
            ConnectLogicMap    : [' ','AND','OR','XOR'] , //快速檢測
            ConnectLogicOutMap : [' ','&&','||','^'] , //快速檢測
            PointLogicMap      : ['>','==','<']
        },
        //輸出專案檔案頁面
        ExportProjectView:{
            IsView             : true            , //頁面是否顯示
        },
        //錯誤訊息頁面
        ErrorView:{
            IsView             : true            , //頁面是否顯示

        },
    },
    mounted() {
        //if ...
        
        //this.intervalId = setInterval(() => {}, 5000)
        
        //INIT
        this.CloseAllView();
        this.ChangeViewEvent(this.ViewCounter);
        //設定記練日期
        let NowDate = new Date();
        this.MakeProjectView.DateTime = NowDate.getFullYear() + '-' + (NowDate.getMonth()+1) + '-' + NowDate.getDate();
    },
    methods:{
        //更新步驟之頁面
        ChangeViewEvent:function(index){
            this.ViewCounter = index;
            this.CloseAllView();
            switch (index) {
                case 0:
                    this.IndexView.IsView       = true;
                    this.TilteText              = "使用同意書" ;
                    break;
                case 1:
                    this.MakeProjectView.IsView = true            ;
                    this.TilteText              = "STEP1 建立專案" ;
                    break;
                case 2:
                    this.DesignMumbershipFuncitonView.IsView = true                           ;
                    this.TilteText                           = "STEP2 建立Mumbership Function" ;
                    break;
                case 3:
                    this.DesignFuzzyNumberView.IsView = true;
                    this.TilteText                    = "STEP3 建立Fuzzy Number" ;
                    break;
                case 4:
                    this.DesignRuleView.IsView = true;
                    this.TilteText                    = "STEP4 建立規則" ;
                    break;
                case 5:
                    this.DesignDownDimView.IsView = true;
                    this.TilteText                = "STEP5 降低資料維度設定" ;
                    break;
                case 6:
                    this.DesignNeuralNetworkView.IsView = true;
                    this.TilteText                = "STEP6 使用神經網路設定" ;
                    break;
                case 7:
                    this.ProjectCheckView.IsView = true;
                    this.TilteText                = "STEP7 專案確認" ;
                    break;
                case 8:
                    this.ExportProjectView.IsView = true;
                    this.TilteText                = "STEP8 輸出檔案" ;
                    break;
                default:
                    this.ErrorView.IsView = true;
                    this.TilteText                = "錯誤界面" ;
                    break;
            }

            if(this.DesignFuzzyNumberView.IsView){
                this.intervalId = setTimeout(() => {this.InitC3View()}, 1000)
            }
        },
        //返回前一頁
        BackViewEvent:function(){
            if(this.ViewCounter>0){
                this.ViewCounter--;
                this.ChangeViewEvent(this.ViewCounter)
            }
        },
        //前往下一頁
        NextViewEvent:function(){
            this.ViewCounter++;
            this.ChangeViewEvent(this.ViewCounter);
        },
        //關閉所有頁面檢視
        CloseAllView:function() {
            this.IndexView.IsView                    = false ;
            this.MakeProjectView.IsView              = false ;
            this.DesignMumbershipFuncitonView.IsView = false ;
            this.DesignFuzzyNumberView.IsView        = false ;
            this.DesignRuleView.IsView               = false ;
            this.DesignDownDimView.IsView            = false ;
            this.DesignNeuralNetworkView.IsView      = false ;
            this.ProjectCheckView.IsView             = false ;
            this.ExportProjectView.IsView            = false ;
            this.ErrorView.IsView                    = false ;
        },
        //----
        
        //=============================================================
        //[MakeProjectView]建立專案用界面
        //=============================================================

        
        /* 
         * ------------------------------------------------------------------------
         * |[GetProjectNameTextEvent]取得專案名稱
         * ------------------------------------------------------------------------
         * | 輸入：使用者輸入之文字
         * | 輸出：無
         * | 處理：將輸入文字由Vue元件
         */
        GetProjectNameTextEvent:function(GetText) {
            this.MakeProjectView.ProjectName = GetText;
        },
        //完成專案名稱設置對應檢查
        FinSetProjectNameEvent:function() {
            if(this.MakeProjectView.ProjectName == ""){
                alert("專案名稱不可為空","錯誤");
                return;
            }

            this.NextViewEvent();
        },
        //----
        GetMFNameTextEvent:function(GetText) {
            this.DesignMumbershipFuncitonView.TmpMFName = GetText;
        },
        AddNewMFEvent:function(GetText) {
            for (const item of this.DesignMumbershipFuncitonView.MFArray) {
                if(item.Name == GetText){
                    alert("MF名稱不可重複","錯誤");
                    return;
                }
            }

            if(this.DesignMumbershipFuncitonView.AxisRate<0 || this.DesignMumbershipFuncitonView.AxisRate>1){
                alert("MF名稱不可重複","錯誤");
                return;
            }

            this.DesignMumbershipFuncitonView.MFArray.push({MFName:"MF_"+GetText, Name: GetText, FN:[], X0Tmp:0, X1Tmp:0, X2Tmp:0, X3Tmp:0,C3:(Object)});
        },
        RemoveMFEvent:function(index) {
            if(index == this.DesignMumbershipFuncitonView.MFArray.length){
                this.DesignMumbershipFuncitonView.MFArray.pop();
            }else if(index == 0){
                this.DesignMumbershipFuncitonView.MFArray = this.DesignMumbershipFuncitonView.MFArray.slice(1,this.DesignMumbershipFuncitonView.MFArray.length);
            }else{
                this.DesignMumbershipFuncitonView.MFArray = ([]).concat(this.DesignMumbershipFuncitonView.MFArray.slice(0,index),this.DesignMumbershipFuncitonView.MFArray.slice(index+1,this.DesignMumbershipFuncitonView.MFArray.length))
            }
        },
        FinDesignMumbershipFuncitonEvent:function(){
            if(this.DesignMumbershipFuncitonView.MFArray.length == 0){
                alert("需制定至少一個MF","錯誤");
                return;
            }

            this.DesignMumbershipFuncitonView.AxisRate = Number(this.DesignMumbershipFuncitonView.AxisRate);
            this.DesignMumbershipFuncitonView.Offset = Math.round(this.DesignMumbershipFuncitonView.Offset);
            
            if(isNaN(this.DesignMumbershipFuncitonView.AxisRate) && this.DesignMumbershipFuncitonView.AxisRate > 0){
                alert("單位欄位請輸入正常數值","錯誤");
                return;
            }

            if(isNaN(this.DesignMumbershipFuncitonView.Offset)){
                alert("偏移量欄位請輸入正常數值","錯誤");
                return;
            }

            if(isNaN(this.DesignMumbershipFuncitonView.UpSafe) || this.DesignMumbershipFuncitonView.UpSafe < 0){
                alert("下限值需為大於0的整數","錯誤");
                return;
            }

            if(isNaN(this.DesignMumbershipFuncitonView.DownSafe) || this.DesignMumbershipFuncitonView.DownSafe < 0){
                alert("下限值需為大於0的整數","錯誤");
                return;
            }

            if(this.DesignMumbershipFuncitonView.UpSafe > 2147483647){
                alert("數值上限值需小於2147483647","錯誤");
                return;
            }

            if(this.DesignMumbershipFuncitonView.DownSafe > 2147483647){
                alert("數值下限值需小於2147483647","錯誤");
                return;
            }


            if(this.DesignMumbershipFuncitonView.DownSafe >= this.DesignMumbershipFuncitonView.UpSafe){
                alert("下限值需小於上限值","錯誤");
                return;
            }


            this.DesignMumbershipFuncitonView.DevValue = 0;

            for (let i = this.DesignMumbershipFuncitonView.UpSafe; (i >> 1) > 0 && this.DesignMumbershipFuncitonView.DevValue < 40; i = (i>>1)) {
                this.DesignMumbershipFuncitonView.DevValue++;
            }
            

            this.DesignFuzzyNumberView.MFArray = this.DesignMumbershipFuncitonView.MFArray;
            this.NextViewEvent();
        },
        //----
        SetFNEvent:function(index) {
            this.DesignFuzzyNumberView.MFArray[index].X0Tmp = Number(this.DesignFuzzyNumberView.MFArray[index].X0Tmp);
            this.DesignFuzzyNumberView.MFArray[index].X1Tmp = Number(this.DesignFuzzyNumberView.MFArray[index].X1Tmp);
            this.DesignFuzzyNumberView.MFArray[index].X2Tmp = Number(this.DesignFuzzyNumberView.MFArray[index].X2Tmp);
            this.DesignFuzzyNumberView.MFArray[index].X3Tmp = Number(this.DesignFuzzyNumberView.MFArray[index].X3Tmp);

            if(isNaN(this.DesignFuzzyNumberView.MFArray[index].X0Tmp) || isNaN(this.DesignFuzzyNumberView.MFArray[index].X1Tmp) || isNaN(this.DesignFuzzyNumberView.MFArray[index].X2Tmp) || isNaN(this.DesignFuzzyNumberView.MFArray[index].X3Tmp)){
                alert("FN節點輸入需要為整數","錯誤");
                return;
            }

            if(this.DesignFuzzyNumberView.MFArray[index].X0Tmp < 0 || this.DesignFuzzyNumberView.MFArray[index].X1Tmp < 0 || this.DesignFuzzyNumberView.MFArray[index].X2Tmp < 0 || this.DesignFuzzyNumberView.MFArray[index].X3Tmp < 0){
                alert("FN節點輸入需為大於等於0的整數","錯誤");
                return;
            }

            if(this.DesignFuzzyNumberView.MFArray[index].X0Tmp < this.DesignMumbershipFuncitonView.DownSafe || this.DesignFuzzyNumberView.MFArray[index].X1Tmp < this.DesignMumbershipFuncitonView.DownSafe || this.DesignFuzzyNumberView.MFArray[index].X2Tmp < this.DesignMumbershipFuncitonView.DownSafe || this.DesignFuzzyNumberView.MFArray[index].X3Tmp < this.DesignMumbershipFuncitonView.DownSafe){
                alert("FN節點輸入需皆大於等於設定下界("+this.DesignMumbershipFuncitonView.DownSafe+")","錯誤");
                return;
            }
        
            if(this.DesignFuzzyNumberView.MFArray[index].X0Tmp > this.DesignMumbershipFuncitonView.UpSafe || this.DesignFuzzyNumberView.MFArray[index].X1Tmp > this.DesignMumbershipFuncitonView.UpSafe || this.DesignFuzzyNumberView.MFArray[index].X2Tmp  > this.DesignMumbershipFuncitonView.UpSafe || this.DesignFuzzyNumberView.MFArray[index].X3Tmp  > this.DesignMumbershipFuncitonView.UpSafe){
                alert("FN節點輸入需皆小於等於設定上界("+this.DesignMumbershipFuncitonView.UpSafe+")","錯誤");
                return;
            }

            if(this.DesignFuzzyNumberView.MFArray[index].X0Tmp > this.DesignFuzzyNumberView.MFArray[index].X1Tmp || this.DesignFuzzyNumberView.MFArray[index].X2Tmp > this.DesignFuzzyNumberView.MFArray[index].X3Tmp || this.DesignFuzzyNumberView.MFArray[index].X0Tmp > this.DesignFuzzyNumberView.MFArray[index].X3Tmp || this.DesignFuzzyNumberView.MFArray[index].X1Tmp > this.DesignFuzzyNumberView.MFArray[index].X2Tmp || (this.DesignFuzzyNumberView.MFArray[index].X0Tmp == this.DesignFuzzyNumberView.MFArray[index].X1Tmp && this.DesignFuzzyNumberView.MFArray[index].X1Tmp == this.DesignFuzzyNumberView.MFArray[index].X2Tmp) || (this.DesignFuzzyNumberView.MFArray[index].X3Tmp == this.DesignFuzzyNumberView.MFArray[index].X2Tmp && this.DesignFuzzyNumberView.MFArray[index].X2Tmp == this.DesignFuzzyNumberView.MFArray[index].X1Tmp)){
                alert("不符合FN定義輸入","錯誤");
                return;
            }

            this.DesignFuzzyNumberView.MFArray[index].FN.push({X0:this.DesignFuzzyNumberView.MFArray[index].X0Tmp,X1:this.DesignFuzzyNumberView.MFArray[index].X1Tmp,X2:this.DesignFuzzyNumberView.MFArray[index].X2Tmp,X3:this.DesignFuzzyNumberView.MFArray[index].X3Tmp});
            this.DesignFuzzyNumberView.MFArray[index].FN.sort(function (a, b) {
                return  a.X0 - b.X0
            });

            this.DesignFuzzyNumberView.MFArray[index].X0Tmp = 0;
            this.DesignFuzzyNumberView.MFArray[index].X1Tmp = 0;
            this.DesignFuzzyNumberView.MFArray[index].X2Tmp = 0;
            this.DesignFuzzyNumberView.MFArray[index].X3Tmp = 0;

            this.RenderC3Event(index)
        },
        RenderC3Event:function(index) {
            let TmpCol    = [];
            let TmpAxis   = ['x'];
            let TmpIn     = [];
            let LockUp    = false;
            let LockCore  = false;
            let LockDown  = false;
            let AreaData  = "";

            for (let i = 0; i < this.DesignFuzzyNumberView.MFArray[index].FN.length; i++) {
                if(TmpAxis.indexOf(this.DesignFuzzyNumberView.MFArray[index].FN[i].X0)<0){
                    TmpAxis.push(''+this.DesignFuzzyNumberView.MFArray[index].FN[i].X0);
                    TmpIn.push(0);
                }
                if(TmpAxis.indexOf(this.DesignFuzzyNumberView.MFArray[index].FN[i].X1)<0){
                    TmpAxis.push(''+this.DesignFuzzyNumberView.MFArray[index].FN[i].X1);
                    TmpIn.push(0);
                }
                if(TmpAxis.indexOf(this.DesignFuzzyNumberView.MFArray[index].FN[i].X2)<0){
                    TmpAxis.push(''+this.DesignFuzzyNumberView.MFArray[index].FN[i].X2);
                    TmpIn.push(0);
                }
                if(TmpAxis.indexOf(this.DesignFuzzyNumberView.MFArray[index].FN[i].X3)<0){
                    TmpAxis.push(''+this.DesignFuzzyNumberView.MFArray[index].FN[i].X3);
                    TmpIn.push(0);
                }
                
            }
            //console.log(TmpIn);

            TmpCol = [TmpAxis];
            
            TmpAxis.sort(function (a, b) {
                return a - b
            });

            
            for (let k = 0; k < this.DesignFuzzyNumberView.MFArray[index].FN.length; k++) {
                let Datas = [('data'+(k+1))];
                for (let t = 0; t < TmpIn.length; t++) {
                    Datas.push(TmpIn);
                }
                TmpCol.push(Datas);

                for (let j = 1; j < TmpAxis.length; j++) {
                    if(this.DesignFuzzyNumberView.MFArray[index].FN[k].X0 == TmpAxis[j]){
                        TmpCol[k+1][j] = 0;
                        LockUp = true;
                    }else if(this.DesignFuzzyNumberView.MFArray[index].FN[k].X1 == TmpAxis[j]){
                        TmpCol[k+1][j] = 1;
                        LockUp = false;
                        LockCore = true;
                    }else if(this.DesignFuzzyNumberView.MFArray[index].FN[k].X2 == TmpAxis[j]){
                        TmpCol[k+1][j] = 1;
                        LockCore  = false;
                        LockDown = true;
                    }else if(this.DesignFuzzyNumberView.MFArray[index].FN[k].X3 == TmpAxis[j]){
                        TmpCol[k+1][j] = 0;
                        LockDown = false;
                    }else if(LockUp){
                        TmpCol[k+1][j] = (TmpAxis[j] - this.DesignFuzzyNumberView.MFArray[index].FN[k].X0)*(1/(this.DesignFuzzyNumberView.MFArray[index].FN[k].X1 - this.DesignFuzzyNumberView.MFArray[index].FN[k].X0));
                    }else if(LockCore){
                        TmpCol[k+1][j] = 1;
                    }else if(LockDown){
                        TmpCol[k+1][j] = (this.DesignFuzzyNumberView.MFArray[index].FN[k].X3 - TmpAxis[j])*(1/(this.DesignFuzzyNumberView.MFArray[index].FN[k].X3 - this.DesignFuzzyNumberView.MFArray[index].FN[k].X2));
                    }else{
                        TmpCol[k+1][j] = 0;
                    }
                }

                AreaData += "\"data"+(k+1)+"\":\"area\""
                if(k != this.DesignFuzzyNumberView.MFArray[index].FN.length-1){
                    AreaData += ","
                }
            }

            this.DesignFuzzyNumberView.MFArray[index].C3 = c3.generate({
                bindto: "#"+this.DesignFuzzyNumberView.MFArray[index].MFName,
                data: {
                    x: 'x',
                    columns: TmpCol,
                    types:JSON.parse("{"+AreaData+"}")
                    
                 
                }
            });
        },
        ReomveMumbershipFuncitonEvent:function(index,subindex) {
            console.log(this.DesignFuzzyNumberView.MFArray[index].FN);
            
            if(subindex == this.DesignFuzzyNumberView.MFArray[index].FN.length){
                this.DesignFuzzyNumberView.MFArray[index].FN.pop();
            }else if(subindex == 0){
                this.DesignFuzzyNumberView.MFArray[index].FN = this.DesignFuzzyNumberView.MFArray[index].FN.slice(1,this.DesignFuzzyNumberView.MFArray[index].FN.length);
            }else{
                this.DesignFuzzyNumberView.MFArray[index].FN= ([]).concat(this.DesignFuzzyNumberView.MFArray[index].FN.slice(0,subindex),this.DesignFuzzyNumberView.MFArray[index].FN.slice(subindex+1,this.DesignFuzzyNumberView.MFArray[index].FN.length))
            }
            
            console.log(this.DesignFuzzyNumberView.MFArray[index].FN);
            //強制Vue DOM 進行重新 render
            //this.DesignFuzzyNumberView.MFArray[index].FN.push()
            //強制C3.js 重新更新
            this.RenderC3Event(index)
        },
        FinDesignFuzzyNumberViewEvent:function() {
            for (const item of this.DesignFuzzyNumberView.MFArray) {
                if(item.FN == 0){
                    alert("每個MF中至少需輸入一個FN","錯誤");
                    return;
                }
            }

            this.DesignRuleView.MFArray = this.DesignFuzzyNumberView.MFArray;

            for (let i = 0; i < 1 ; i+=this.DesignMumbershipFuncitonView.AxisRate) {
                //this.DesignRuleView.AxisRateArray.push(Math.round(i*1/(this.DesignMumbershipFuncitonView.AxisRate))/(1/(this.DesignMumbershipFuncitonView.AxisRate)));
                this.DesignRuleView.AxisRateArray.push(Math.round((i*1000))/1000);
            }

            this.NextViewEvent();
        },
        //----
        ClearRule:function() {
            this.DesignRuleView.RuleList = [];
        },
        AddRule:function() {
            this.DesignRuleView.RuleList.push([{SelectMFList:0,SelectFNList:0,SelectPointLogic:0,SelectBaseValue:0,OutLogic:1,ConnectLogic:0}]);
        },
        AddSubRule:function(index) {
            this.DesignRuleView.RuleList[index].push({SelectMFList:0,SelectFNList:0,SelectPointLogic:0,SelectBaseValue:0,OutLogic:1,ConnectLogic:0});
        },
        RemoveSubRule:function(index,subindex) {
            if(this.DesignRuleView.RuleList[index].length == 1){
                if(index == this.DesignRuleView.RuleList.length){
                    this.DesignRuleView.RuleList.pop();
                }else if(index == 0){
                    this.DesignRuleView.RuleList = this.DesignRuleView.RuleList.slice(1,this.DesignRuleView.RuleList.length);
                }else{
                    this.DesignRuleView.RuleList = ([]).concat(this.DesignRuleView.RuleList.slice(0,index),this.DesignRuleView.RuleList.slice(index+1,this.DesignRuleView.RuleList.length))
                }
            }else{
                if(subindex == this.DesignRuleView.RuleList[index].length){
                    this.DesignRuleView.RuleList[index].pop();
                }else if(subindex == 0){
                    this.DesignRuleView.RuleList[index] = this.DesignRuleView.RuleList[index].slice(1,this.DesignRuleView.RuleList[index].length);
                }else{
                    this.DesignRuleView.RuleList[index] = ([]).concat(this.DesignRuleView.RuleList[index].slice(0,subindex),this.DesignRuleView.RuleList[index].slice(subindex+1,this.DesignRuleView.RuleList[index].length))
                }
                //強制Vue DOM 進行重新 render
                this.DesignRuleView.RuleList.push()
            }
        },
        FinDesignRuleViewEvent:function() {
            for (let i = 0; i < this.DesignRuleView.RuleList.length; i++) {
                let TmpLogic = this.DesignRuleView.RuleList[i][0].OutLogic;
                for (let j = 0; j < this.DesignRuleView.RuleList[i].length; j++) {
                    if(this.DesignRuleView.RuleList[i][j].ConnectLogic == 0 && j<this.DesignRuleView.RuleList[i].length-1){
                        alert("Rule"+(i+1)+"第"+(j+1)+"列缺少連接邏輯","錯誤");
                        return;
                    }
                    if(this.DesignRuleView.RuleList[i][j].OutLogic != TmpLogic){
                        alert("Rule"+(i+1)+"輸出邏輯不一致","錯誤");
                        return;
                    }
                }
                
                if(this.DesignRuleView.RuleList[i][this.DesignRuleView.RuleList[i].length-1].ConnectLogic != 0){
                    alert("Rule"+(i+1)+"最後一列有多餘的連結邏輯","錯誤");
                    return;
                }
            }
            
            this.NextViewEvent();
        },
        //----
        ClearDim:function() {
            this.DesignDownDimView.DimList = [];
        },
        AddDim:function() {
            this.DesignDownDimView.DimList.push([{SelectMFList:0,SelectBaseValue:0}]);
        },
        AddSubDim:function(index) {
            this.DesignDownDimView.DimList[index].push({SelectMFList:0,SelectBaseValue:0});
        },
        RemoveSubDim:function(index,subindex) {
            if(this.DesignDownDimView.DimList[index].length == 1){
                if(index == this.DesignDownDimView.DimList.length){
                    this.DesignDownDimView.DimList.pop();
                }else if(index == 0){
                    this.DesignDownDimView.DimList = this.DesignDownDimView.DimList.slice(1,this.DesignDownDimView.DimList.length);
                }else{
                    this.DesignDownDimView.DimList = ([]).concat(this.DesignDownDimView.DimList.slice(0,index),this.DesignDownDimView.DimList.slice(index+1,this.DesignDownDimView.DimList.length));
                }
            }else{
                if(subindex == this.DesignDownDimView.DimList[index].length){
                    this.DesignDownDimView.DimList[index].pop();
                }else if(subindex == 0){
                    this.DesignDownDimView.DimList[index] = this.DesignDownDimView.DimList[index].slice(1,this.DesignDownDimView.DimList[index].length);
                }else{
                    this.DesignDownDimView.DimList[index] = ([]).concat(this.DesignDownDimView.DimList[index].slice(0,subindex),this.DesignDownDimView.DimList[index].slice(subindex+1,this.DesignDownDimView.DimList[index].length))
                }
                //強制Vue DOM 進行重新 render
                this.DesignDownDimView.DimList.push();
            }
        },
        FinDimDesignViewEvent:function() {
            for (let i = 0; i < this.DesignDownDimView.DimList.length; i++) {
                if(this.DesignDownDimView.DimList[i].length < 2){
                    alert("維度資料至少需要2筆以上","錯誤");
                    return;
                }
            }

            this.ClearLayer();
            let TmpMatrixSum = 0;

            for (let i = 0; i < this.DesignFuzzyNumberView.MFArray.length; i++) {
                TmpMatrixSum += this.DesignFuzzyNumberView.MFArray[i].FN.length;
            }

            this.DesignNeuralNetworkView.MatrixRow    = Math.ceil(Math.sqrt(TmpMatrixSum*(this.DesignRuleView.AxisRateArray.length-1)));
            this.DesignNeuralNetworkView.TmpMatrixRow =  this.DesignNeuralNetworkView.MatrixRow-2+1;
            this.NextViewEvent();
        },
        FinNotSetDimDesignViewEvent:function() {
            this.ClearLayer();
            let TmpMatrixSum = 0;

            for (let i = 0; i < this.DesignFuzzyNumberView.MFArray.length; i++) {
                TmpMatrixSum += this.DesignFuzzyNumberView.MFArray[i].FN.length
            }

            this.DesignNeuralNetworkView.MatrixRow    = Math.ceil(Math.sqrt(TmpMatrixSum*(this.DesignRuleView.AxisRateArray.length-1)));
            this.DesignNeuralNetworkView.TmpMatrixRow =  this.DesignNeuralNetworkView.MatrixRow-2+1;
            this.NextViewEvent();
        },
        //----
        ClearLayer:function() {
            this.DesignNeuralNetworkView.LayerList = [];
        },
        AddLayer:function() {
            let TmpArray = [];
            if(this.DesignNeuralNetworkView.LayerList.length > 0){

                if(this.DesignNeuralNetworkView.LayerList[this.DesignNeuralNetworkView.LayerList.length-1].SelectLayerType == 1){
                    this.DesignNeuralNetworkView.LayerList[this.DesignNeuralNetworkView.LayerList.length-1].SelectLayerSum = 0;
                   
                    for(let i=this.DesignNeuralNetworkView.LayerList.length-1;i>=0;i--){
                        if(this.DesignNeuralNetworkView.LayerList[i].SelectLayerType != 1){
                            TmpArray = this.DesignNeuralNetworkView.LayerList[i].SelectLayerAllSum.reverse();
                            break;
                        }
                    }

                    //無意義的一致性調整
                    //TmpArray.push("0");

                }else{
                    if(this.DesignNeuralNetworkView.LayerList[this.DesignNeuralNetworkView.LayerList.length-1].SelectLayerSum < 1){
                        alert("前層總行列數不可小於1");
                        return;
                    }

                    for(let i=0;i<=this.DesignNeuralNetworkView.LayerList[this.DesignNeuralNetworkView.LayerList.length-1].SelectLayerSum;i++){
                        TmpArray.push(i+2);
                    }
                    
                    TmpArray.pop();
                }
                
                this.DesignNeuralNetworkView.LayerList[this.DesignNeuralNetworkView.LayerList.length-1].IsEdit = false;

            }else{
                for(let i=0;i<this.DesignNeuralNetworkView.MatrixRow-2+1;i++){
                    TmpArray.push(i+2);
                }
                TmpArray.pop();
            }

            this.DesignNeuralNetworkView.LayerList.push({SelectLayerType:"0",SelectLayerAllSum:TmpArray.reverse(),SelectLayerSum:0,WindowSize:0,ThisHave:TmpArray[0],IsEdit:true,Offset:0});
        },
        RemoveLayer:function(index){
            this.DesignNeuralNetworkView.LayerList.splice(index);
            if(this.DesignNeuralNetworkView.LayerList.length>0)
                this.DesignNeuralNetworkView.LayerList[this.DesignNeuralNetworkView.LayerList.length-1].IsEdit = true;
        },
        FinDesignNeuralNetworkViewEvent:function() {
            for(let i=0;i<this.DesignNeuralNetworkView.LayerList.length;i++){
                let TmpBeforeWindowSize = this.DesignNeuralNetworkView.MatrixRow;
                if(i==0){
                    this.DesignNeuralNetworkView.LayerList[i].WindowSize = this.DesignNeuralNetworkView.MatrixRow -2 +1 - this.DesignNeuralNetworkView.LayerList[i].SelectLayerAllSum[this.DesignNeuralNetworkView.LayerList[i].SelectLayerSum] +1;
                    TmpBeforeWindowSize = this.DesignNeuralNetworkView.LayerList[i].WindowSize;
                }else{
                    if(this.DesignNeuralNetworkView.LayerList[i].SelectLayerType == 1){
                        this.DesignNeuralNetworkView.LayerList[i].WindowSize = TmpBeforeWindowSize;
                    }else{
                        this.DesignNeuralNetworkView.LayerList[i].WindowSize = this.DesignNeuralNetworkView.LayerList[i-1].WindowSize - this.DesignNeuralNetworkView.LayerList[i].SelectLayerAllSum[this.DesignNeuralNetworkView.LayerList[i].SelectLayerSum] + 1;
                        TmpBeforeWindowSize = this.DesignNeuralNetworkView.LayerList[i].WindowSize;
                    }
                }

                if(this.DesignNeuralNetworkView.LayerList[i].SelectLayerType == 0){
                    let BlockArea = 1 + Math.floor((this.DesignNeuralNetworkView.LayerList[i].ThisHave - this.DesignNeuralNetworkView.LayerList[i].SelectLayerAllSum[this.DesignNeuralNetworkView.LayerList[i].SelectLayerSum] + 1) / this.DesignNeuralNetworkView.LayerList[i].WindowSize);
                    let TmpOffsetArray = [];

                    console.log(BlockArea)

                    if(BlockArea > 1){
                        this.DesignNeuralNetworkView.LayerList[i].Offset = BlockArea;
                    }else{
                        this.DesignNeuralNetworkView.LayerList[i].Offset = 0;
                    }

                    if(BlockArea > 1){
                        for(let j=0;j<BlockArea;j++){
                            for(let k=0;k<BlockArea;k++){
                                TmpOffsetArray.push(j*this.DesignNeuralNetworkView.MatrixRow+k*BlockArea);
                            }
                        }
                        this.DesignNeuralNetworkView.ConvArray.push(TmpOffsetArray);
                    }else{
                        this.DesignNeuralNetworkView.ConvArray.push([0]);
                    }
                    TmpOffsetArray = [];
                }
                
            }
            
            let MapArrayValueArray = [];
            let MapArrayValue = 1;

            this.DesignNeuralNetworkView.AllConvArray = [];
            
            for(let i=0;i<this.DesignNeuralNetworkView.ConvArray.length;i++){
                let AllArray = [];

                MapArrayValue *= this.DesignNeuralNetworkView.ConvArray[i].length;
                MapArrayValueArray.push(MapArrayValue);
                
                for(let j=0;j<MapArrayValue;j++){                    
                    AllArray.push(0);
                }

                this.DesignNeuralNetworkView.AllConvArray.push(AllArray);

                // 4 4 9
                for(let j=0;j<this.DesignNeuralNetworkView.ConvArray[i].length;j++){
                    for(let k=0;k<this.DesignNeuralNetworkView.AllConvArray[i].length;k++){
                        this.DesignNeuralNetworkView.AllConvArray[i][k] += this.DesignNeuralNetworkView.ConvArray[Math.floor(MapArrayValue/this.DesignNeuralNetworkView.AllConvArray)];
                    }
                }

            }

            // In
            for(let i=0;i<this.DesignNeuralNetworkView.ConvArray.length;i++){ // 3
                let TmpConv = 0;
                if(i > 0){
                    let Tmps = [];
                    for(let j=0;j<i;j++){ //前a層
                        for(let k=0;k<this.DesignNeuralNetworkView.ConvArray[j].length;k++){ //第1~a層每個offset
                            this.DesignNeuralNetworkView.AllConvArray.push(TmpConv);
                            Tmps += this.DesignNeuralNetworkView.ConvArray[j][k];
                        }
                    }
                }else{
                    this.DesignNeuralNetworkView.AllConvArray.push(this.DesignNeuralNetworkView.ConvArray[0]);
                }
            }
            this.NextViewEvent();
        },
        OutputFile:function(){
            WriteFile();
            fs.writeFileSync(__dirname + "/"+this.MakeProjectView.ProjectName+".sv",WrtieString,{flag:'w'});
            alert("檔案已新增完成","通知");
            this.ChangeViewEvent(0);
            //Clear ALL
        },
        //----
        InitC3View:function(){
            for (let i = 0; i < this.DesignFuzzyNumberView.MFArray.length; i++) {
                console.log("---");
                
                this.DesignFuzzyNumberView.MFArray[i].C3 = c3.generate({
                    bindto: "#"+this.DesignFuzzyNumberView.MFArray[i].MFName,
                    data: {
                        x: 'x',
                        columns: [
                            
                        ],
                        types: {
                            data1: 'area',
                        },
                    }
                });
            }
        }
    },
    //監測
    watch: {
        ViewCounter:function(NewCounter){
            //if(NewCounter>0 && )
        }
    },
    //當程式關閉時
    destroyed() {
        //TODO 
    },
});