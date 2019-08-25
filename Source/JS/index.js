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
        IsBaseView  : true  ,
        ViewCounter : 0     ,
        TilteText   : "首頁" ,
        FuzzyNumberView:{},
        //首頁
        IndexView  :{
            IsView: true,
        },
        //建立專案用界面
        MakeProjectView: {
            IsView             : true            ,
            DateTime           : null            ,
        },
        //建立MF值域界面
        DesignMumbershipFuncitonView:{
            IsView             : true              ,
        },
        //建立FN值域界面
        DesignFuzzyNumberView:{
            IsView             : true              ,
        },
        //設計各規則界面
        DesignRuleView:{
            IsView             : true              ,
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
        this.intervalId = setInterval(() => {
            this.FuzzyNumberView 
            =c3.generate({
                bindto: "#FuzzyNumberView",
                data: {
                    colors:{
                        data1:"#86C166",
                        data2:"#fff782",
                        data3:"#f00782",
                    },
                    x: 'x',
                    columns: [
                        ['x', '0','1', '5', '30', '90', '123'],
                        ['data1', 0, 1, 1, 0, 0,0],
                        ['data2', 0, 0, 0, 1, 1, 0],
                        ['data3', 0, 0, 0,0,0, 0, 0],
                    ],
                    types: {
                        data1: 'area',
                        data2: 'area',
                        data3: 'area',
                    },
                }
            }),
              console.log("upadte")
        }, 5000)
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
                    this.IndexView.IsView = true;
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
                    this.TilteText                    = "STEP4 建立Fuzzy Number" ;
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
        },
        BackViewEvent:function(){
            ViewCounter--;
        },
        NextViewEvent:function(){
            ViewCounter++;
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
        GetProjectNameTextEvent:function(GetText) {
            this.MakeProjectView.GetProjectNameText = GetText;
        },
        GetFuzzyInputPortSelect:function(GetSelect) {
            
        },
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


/*

var Panel = new Vue({
    el:"#particles-js",
    data:{
        IsBaseView: true,
        HasSubListChick: false,
        NowChick: -1,
        TextList: [
            { Text: "ArchLabs相關", IsClick:false},
            { Text: "Manjaro相關", IsClick:false},
            { Text: "LinuxMint相關", IsClick:false},
            { Text: "基礎Linux相關", IsClick:false},
            { Text: "C語言相關", IsClick:false},
            { Text: "FML相關", IsClick:false},
            { Text: "其他技術相關", IsClick:false}, 
        ],
        ProgramList: [
            { Text: "Image-Audio-Player", IsClick:false},
            { Text: "GLSL_Example", IsClick:false},
            { Text: "UnknownClang", IsClick:false},
            { Text: "TextArt", IsClick:false},
            { Text: "107-02-IOT-Project", IsClick:false},
            { Text: "FMiCa-TW.sh", IsClick:false},
            { Text: "twcall", IsClick:false},
          
        ],
    },
    methods:{
        ClickPanelEvent: function (GetID) {
            if(GetID==this.NowChick){
                this.NowChick = -1;
                this.HasSubListChick = false;
            }else{
                    
                this.NowChick = GetID;
                this.HasSubListChick = true;
            }
        },
        //控制子面板顯示
        ClickEvent: function (GetSubID) {
            this.IsBaseView = false;

            for (let i = 0; i < this.TextList.length; i++)
                this.TextList[i].IsClick = false;                  

            for (let i = 0; i < this.ProgramList.length; i++)
                this.ProgramList[i].IsClick = false;                   

            if(this.NowChick == 0)
                this.TextList[GetSubID].IsClick = true;
            else if(this.NowChick == 1)
                this.ProgramList[GetSubID].IsClick = true;
            
        }
    }
});*/