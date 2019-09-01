var d3 = require("d3");
var c3 = require("c3");
//var FuzzyNumberView = 
var jsonUri = "data:text/plain;base64,"+window.btoa(JSON.stringify(partJson));

particlesJS.load('particles-js', jsonUri, function() {
    console.log('callback - particles.js config loaded');
});

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
            IsView: true,
        },
        //建立專案用界面
        MakeProjectView: {
            IsView      : true , //頁面是否顯示
            DateTime    : null , //日期資訊
            ProjectName : ""   , //專案名稱
        },
        //建立MF值域界面
        DesignMumbershipFuncitonView:{
            IsView    : true , //是否顯示
            MFArray   : []   , //MF陣列
            AxisRate  : 0.1  , //預設Rate值
        },
        //建立FN值域界面
        DesignFuzzyNumberView:{
            IsView  : true , //是否顯示
            MFArray : []   , // MF對應FN的Array 
        },
        //設計各規則界面
        DesignRuleView:{
            IsView   : true , //
            MFArray  : []   , //
            RuleList : []   , //
        },
        //降低資料維度界面
        DesignDownDimView:{
            IsView             : true              ,
        },
        //設定神經網路界面
        DesignNeuralNetworkView:{
            IsView             : true              ,
        },
        //專案確認界面
        ProjectCheckView:{
            IsView             : true            ,
        },
        //輸出專案檔案頁面
        ExportProjectView:{
            IsView             : true            ,
        },
        //錯誤訊息頁面
        ErrorView:{
            IsView             : true      ,

        },
        //FuzzyNumberView:
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
                    this.TilteText                = "STEP6 降低資料維度設定" ;
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
        BackViewEvent:function(){
            if(this.ViewCounter>0){
                this.ViewCounter--;
                this.ChangeViewEvent(this.ViewCounter)
            }
        },
        NextViewEvent:function(){
            this.ViewCounter++;
            this.ChangeViewEvent(this.ViewCounter);
        },
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
        GetProjectNameTextEvent:function(GetText) {
            this.MakeProjectView.ProjectName = GetText;
        },
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
            this.DesignMumbershipFuncitonView.MFArray.push({MFName:"_"+GetText, Name:"溫度", Type:"一般輸入", FN:[], X0Tmp:0, X1Tmp:0, X2Tmp:0, X3Tmp:0,C3:(Object)});
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

            this.DesignFuzzyNumberView.MFArray = this.DesignMumbershipFuncitonView.MFArray;
            this.NextViewEvent();
        },
        //----
        SetFNEvent:function(index) {
            /*
            if(!((this.DesignFuzzyNumberView.MFArray[index].X0Tmp>0&&this.DesignFuzzyNumberView.MFArray[index].X1Tmp>0&&this.DesignFuzzyNumberView.MFArray[index].X2Tmp>0&&this.DesignFuzzyNumberView.MFArray[index].X3Tmp>0)&&(this.DesignFuzzyNumberView.MFArray[index].X0Tmp<=this.DesignFuzzyNumberView.MFArray[index].X1Tmp)&&(this.DesignFuzzyNumberView.MFArray[index].X1Tmp<=this.DesignFuzzyNumberView.MFArray[index].X2Tmp)&&(this.DesignFuzzyNumberView.MFArray[index].X2Tmp<=this.DesignFuzzyNumberView.MFArray[index].X3Tmp)&&(this.DesignFuzzyNumberView.MFArray[index].X0Tmp!=this.DesignFuzzyNumberView.MFArray[index].X3Tmp))){
                alert("不可需要為梯行函數","錯誤");
                return;
            }*/

            this.DesignFuzzyNumberView.MFArray[index].FN.push({X0:this.DesignFuzzyNumberView.MFArray[index].X0Tmp,X1:this.DesignFuzzyNumberView.MFArray[index].X1Tmp,X2:this.DesignFuzzyNumberView.MFArray[index].X2Tmp,X3:this.DesignFuzzyNumberView.MFArray[index].X3Tmp});

            this.DesignFuzzyNumberView.MFArray[index].X0Tmp = 0;
            this.DesignFuzzyNumberView.MFArray[index].X1Tmp = 0;
            this.DesignFuzzyNumberView.MFArray[index].X2Tmp = 0;
            this.DesignFuzzyNumberView.MFArray[index].X3Tmp = 0;

            let TmpCol  = [];
            let TmpAxis = ['x'];
            let TmpIn   = [];
            let LockUp  = false;

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
                    if(this.DesignFuzzyNumberView.MFArray[index].FN[k].X1 == TmpAxis[j]){
                        TmpCol[k+1][j] = 1;
                        if(this.DesignFuzzyNumberView.MFArray[index].FN[k].X1 != this.DesignFuzzyNumberView.MFArray[index].FN[k].X2)
                        LockUp = true;
                    }else if(this.DesignFuzzyNumberView.MFArray[index].FN[k].X2 == TmpAxis[j]){
                        TmpCol[k+1][j] = 1;
                        LockUp = false;
                    }else if(LockUp){
                        TmpCol[k+1][j] = 1;
                    }else{
                        TmpCol[k+1][j] = 0;
                    }
                }
            }


            console.log(TmpCol);

            this.DesignFuzzyNumberView.MFArray[index].C3 = c3.generate({
                bindto: "#"+this.DesignFuzzyNumberView.MFArray[index].MFName,
                data: {
                    /*colors:{
                        data1:"#86C166",
                        data2:"#fff782",
                        data3:"#f00782",
                        data4:"#f00782",
                        data5:"#f00782",
                        data6:"#f00782",
                        data7:"#f00782",
                        data8:"#f00782",
                    },*/
                    x: 'x',
                    columns: TmpCol,
                    types: 'area',
                }
            });


        },
        FinDesignFuzzyNumberViewEvent:function() {
            this.NextViewEvent();
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
                            ['x', '0','1', '2', '3', '4', '5'],
                            ['data1', 0, 0, 0, 0, 0,0],
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