import Table from './table.js';

/**
 * Balance class extends Table by adding some rendering
 * features.
 */

export default class Balance extends Table {
    constructor(data, colsTypeDict, typeDefault, name){
        super(data, colsTypeDict, typeDefault, name);

        // Both the starting and ending period should be 
        // within 1 to 12;
        this.periodStart = 1;
        this.periodEnd = 12;
        
        // The category level to be displayed. 0 Means 
        // all levels. 
        this.categoryLevel = 0;
    }

    refresh(){

        let periodRow = this.colDict.iperiod,
            levelRow = this.colDict.ccode;

        this.bodyDisplay = this.body.filter(row => {
            let currPeriod = parseInt(row[periodRow].data),
                currLevel = row[levelRow].data.split('-')[0],
                isPeriodWithin = currPeriod >= this.periodStart && currPeriod <= this.periodEnd,
                isLevelWithin = this.categoryLevel == 0 || (currLevel.length - 2)/2 <= this.categoryLevel;
            
            return isPeriodWithin && isLevelWithin;
        })

        this.bodyDisplay.sort((a, b) => {
            return (a[levelRow].data < b[levelRow].data) ? -1 : 1;
        }).sort((a, b) => {
            return parseInt(a[periodRow].data) - parseInt(b[periodRow].data);
        })
    }

    render(title, parentDom){

        let select = (id, options) => `
            <select class="select" id="${id}"> ${options.map(e=>`<option ="${e}">${e}</option>`).join("")}</select>
        `       

        if ($(`#table-wrapper-${this.name}`).length == 0){
            $(parentDom).append(`
            <div id="table-wrapper-${this.name}" class="table-wrapper">
                <div id="table-${this.name}-title" class="table-title">${title}</div>
                <div class="select-wrapper">
                会计期间 ${select(`period-${this.name}-start`, Array(12).fill(0).map((_, i)=>i+1))}
                到 ${select(`period-${this.name}-end`, Array(12).fill(0).map((_, i)=>i+1))}
                </div>
                <div class="select-wrapper">
                科目级别 ${select(`category-level-${this.name}`, [0, 1,2,3])}
                </div>
                <div id="table-${this.name}" class="table-outer"></div>
                <div id="table-${this.name}-pagin" class="paginator"></div>
            </div>`)
        }

        $(`#period-${this.name}-start`).change((e)=>{
            let currStartVal = $(`#period-${this.name}-start`).val(),
                currEndVal = $(`#period-${this.name}-end`).val();
            if (currEndVal < currStartVal){
                currStartVal = currEndVal;
            }
            $(`#period-${this.name}-start`).val(currStartVal);
            
            this.periodStart = currStartVal;
            this.periodEnd = currEndVal;

            this.refresh();
            this.render();
        })

        $(`#period-${this.name}-end`).change((e)=>{
            let currStartVal = $(`#period-${this.name}-start`).val(),
                currEndVal = $(`#period-${this.name}-end`).val();
            if (currEndVal < currStartVal){
                currEndVal = currStartVal;
            }
            $(`#period-${this.name}-end`).val(currEndVal);
            
            this.periodStart = currStartVal;
            this.periodEnd = currEndVal;

            this.refresh();
            this.render();
        })

        $(`#category-level-${this.name}`).change(e => {
            
            let categoryLevel = $(`#category-level-${this.name}`).val();

            this.categoryLevel = categoryLevel;

            this.refresh();
            this.render();
        })


        $(`#table-${this.name}-pagin`).pagination({
            dataSource: this.bodyDisplay,
            pageSize: 50,
            showGoInput: true,
            showGoButton: true,
            showPageNumbers: false,
            showNavigator: true,

            callback: (data) => {

                let table = this.renderPage(data);
                $(`#table-${this.name}`).empty();
                $(`#table-${this.name}`).append(table);
                this.bindEvents();
            }
        })
    }

}