/**
 * Array.prototype.dictionarize
 * ============================
 * This method suppose all its elements are object with same shape, which means
 * same keys with same order. And the function will extract one key/property of
 * each object as key, and finally forms an object.
 * 
 * Note: mistake not with Array.prototype.gather.
 */
Array.prototype.dictionarize = function(field){

    let dict = {};
    for (let i = 0; i < this.length; i++){
        let key = this[i][field];
        delete this[i][field];
        dict[key] = this[i];
    }
    return dict;
}

/**
 * Array.prototype.same
 * ====================
 * return true if all element are identical after applying operator.
 */
Array.prototype.same = function(op){
    op = op ? op : (e) => e;
    return this.every((v, i, a) => op(v) === op(a[0]));
}

Array.prototype.groupBy = function(labelFunc) {  
    let grouped = this.reduce((grouped, item) => {
        let key = labelFunc(item);
        grouped[key] = grouped[key] || [];
        grouped[key].push(item);
        return grouped;
    }, {});

    return grouped;
};

Array.prototype.columnFilter = function(crit) {
    return this.map(entry=>entry.filter(crit));
}

Array.prototype.gather = function(){
    let dict = {};

    for (let key in this[0]){
        dict[key] = {children: this.map(row => row[key])};
    }

    Object.defineProperty(dict, "gid", {
        value: this.map((_, i) => i),
        writable: false,
        enumerable: false
    })
    
    return dict;
}

Array.prototype.split = function(crit){
    let selected = [], rest = [];
    while(this.length > 0){
        let last = this.pop();
        if(crit(last)) selected.push(last);
        else rest.push(last);
    }
    selected.reverse();
    rest.reverse();

    return {selected, rest};
}

console.log(Array(10).fill(0).map((e, i) => i).split((e) => e>5));

Array.prototype.gatherBy = function(col, label, colAttr, currRow) {
    
    currRow = currRow ? currRow : 0;

    let labelFunc = colAttr[col].label ? 
                    colAttr[col].label :
                    (row) => row[col].data ? row[col].data : row[col];

    let {selected, rest} = this.split(row=>labelFunc(row)===label);

    rest.reverse()
        .splice(currRow, 0, selected.gather().summary(colAttr, {[col]: label}));

    return rest;
}

Array.prototype.expandAt = function(currRow){
    
    let gathered = this[currRow];

    this.splice(currRow, 1, gathered.expand());
}

Array.prototype.gatherAll = function(col, colAttr){

    let labelFunc = colAttr[col].label ? 
                    colAttr[col].label :
                    (col) => col.data ? col.data : col;

    let sortFunc = colAttr[col].sort ? 
                   colAttr[col].sort :
                   (a, b) => a > b ? 1 : a < b ? -1 : 0;


    let grouped = this.groupBy(row => labelFunc(row[col]))
        .map((key, group) => (group.length > 1) ? group.gather().summary(colAttr, {[col]: key}) : group);

    return grouped.values().sort(sortFunc)

}

Array.prototype.expandAll = function(){
    this.map(row => row.expand()).flat();
}
