import Table from './table.js';

/**
 * Balance class extends Table by adding some rendering
 * features.
 */

export default class Balance extends Table {
    constructor(data, colsTypeDict, typeDefault, name){
        super(data, colsTypeDict, typeDefault, name);
    }


    render(spec, title, parentDom){

        let select = (id, options) => `
            <select class="select" id="${id}"> ${options.map(e=>`<option ="${e}">${e}</option>`).join("")}</select>
        `       

        if ($(`#table-wrapper-${this.name}`).length == 0){
            $(parentDom).append(`
            <div id="table-wrapper-${this.name}" class="table-wrapper">
            </div>`)
        }
        let $wrapper = $(`#table-wrapper-${this.name}`);



        $wrapper.empty().append(`
            <div id="table-${this.name}-title" class="table-title">${title}</div>
            <div class="select-wrapper">
            会计期间 ${select(`period-${this.name}-start`, Array(12).fill(0).map((_, i)=>i+1))}
            到 ${select(`period-${this.name}-end`, Array(12).fill(0).map((_, i)=>i+1))}
            </div>
            <div class="select-wrapper">
            科目级别 ${select(`category-level-${this.name}`, [1,2,3])}
            </div>
            <div id="table-${this.name}" class="table-outer"></div>
            <div id="table-${this.name}-pagin" class="paginator"></div>
        `);

        $(`#period-${this.name}-start`).change((e)=>{
            let currStartVal = $(`#period-${this.name}-start`).val(),
                currEndVal = $(`#period-${this.name}-end`).val();
            if (currEndVal < currStartVal){
                currStartVal = currEndVal;
            }
            $(`#period-${this.name}-start`).val(currStartVal);
            
            console.log("start", currStartVal, currEndVal);

            this.filter((data)=>{
                let rowNumber = this.colDict.iperiod;
                return data.filter((row) => currStartVal <= row[rowNumber] && currEndVal >= row[rowNumber]);
            })

            console.log(this.bodyDisplay);

            this.render(spec, title);
        })

        $(`#period-${this.name}-end`).change((e)=>{
            let currStartVal = $(`#period-${this.name}-start`).val(),
                currEndVal = $(`#period-${this.name}-end`).val();
            if (currEndVal < currStartVal){
                currEndVal = currStartVal;
            }
            $(`#period-${this.name}-end`).val(currEndVal);
            
            console.log("end", currStartVal, currEndVal);

            this.filter((data)=>{
                let rowNumber = this.colDict.iperiod;
                console.log(this.colDict.iperiod);
                let returnData = data.filter((row) => currStartVal <= row[rowNumber].data && currEndVal >= row[rowNumber].data);
                returnData.sort((a, b) => a[rowNumber].data - b[rowNumber].data);
                return returnData;
            });

            console.log(this.bodyDisplay.map(row => row[this.colDict.iperiod].data).sort());

            this.render(spec, title);
        })


        $(`#table-${this.name}-pagin`).pagination({
            dataSource: this.bodyDisplay,
            pageSize: 50,
            showGoInput: true,
            showGoButton: true,
            showPageNumbers: false,
            showNavigator: true,

            callback: (data) => {

                let table = this.renderPage(data, spec);
                $(`#table-${this.name}`).empty();
                $(`#table-${this.name}`).append(table);
                this.bindEvents();
            }
        })
    }

}