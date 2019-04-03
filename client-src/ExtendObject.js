/**
 * Object.prototype.map
 * ====================
 * Apply function over each value of the property, with both key and value as
 * parameter. Returns a new Object.
 */
Object.defineProperty(Object.prototype, "map", {
    value: function(func){
        let newObject = {},
            keys = Object.keys(this);
        for (let i = 0; i < keys.length; i++)
            newObject[keys[i]] = func(keys[i], this[keys[i]]);        
        return newObject;
    }
})

/**
 * Object.prototype.forEach
 * ========================
 * The in-place version of Object.prototype.map, slightly different to Array's
 * forEach. The function passed into should always return a value, which will
 * be assigned to corresponding property.
 */
Object.defineProperty(Object.prototype, "forEach", {
    value: function(func){
        let keys = Object.keys(this);
        for (let i = 0; i < keys.length; i++)
            this[keys[i]] = func(keys[i], this[keys[i]]);
        return this;
    }
})

Object.defineProperty(Object.prototype, 'some', {
    value: function(func){
        let values = Object.values(this);
        return values.some(func);
    }
})

/**
 * Object.prototype.values
 * =======================
 * copy the static method Object.values into prototype.
 */
Object.defineProperty(Object.prototype, 'values', {
    value: function(){
        return Object.values(this);
    }
})

Object.defineProperty(Object.prototype, 'keys', {
    value: function(){
        return Object.keys(this);
    }
})

/**
 * Object.prototype.filter
 * =======================
 * Returns a new Object with desired properties from original Object. Order will
 * be preserved.
 */
Object.defineProperty(Object.prototype, 'filter', {
    value: function(func){
        let newObject = {},
            keys = Object.keys(this);

        func = func ? func : () => true; 

        for (let i = 0; i < keys.length; i++)
            if (func(keys[i], this[keys[i]])) 
                newObject[keys[i]] = this[keys[i]];

        return newObject;
    },
    writable : true
})

/**
 * Object.prototype.rewrite
 * ========================
 * rewrite an object with given key order. Non-existed keys will be omitted.
 */
Object.defineProperty(Object.prototype, 'rewrite', {
    value: function(keys){
        let newObject = {};

        for (let i = 0; i < keys.length; i++){
            // console.log(keys[i]);
            if (this[keys[i]] !== undefined){
                newObject[keys[i]] = this[keys[i]];
            }
        }

        return newObject;
    }
})

/**
 * Object.prototype.merge
 * ======================
 * return a new Object that merged from two objects.
 */
Object.defineProperty(Object.prototype, 'merge', {
    value: function(that, inPlace){
        return inPlace ? Object.assign(this, that) : Object.assign({}, this, that);
    }
})

/**
 * Object.prototype.summary
 * ========================
 * Summary takes two arguments, the colAttr and labels.
 * For each column, this function finds corresponding sum function in colAttr, and
 * apply to children, and write the result as the label. So this function is a total
 * in-place operation, though it returns the Object reference.
 * 
 * If labels is given, and contains any key that appear in the object, then the value
 * will be directly used as the label of the column.
 * 
 * Note: If the current Object is nested-gathered, which means the object is gathered
 *       from an array that already contains gathered object, the handling should left
 *       to the columnwise sum function.
 */
Object.defineProperty(Object.prototype, 'summary', {
    value: function(colAttr, labels) {

        if(!this.gid)
            throw TypeError('summary should be applied to objects created from Array.prototype.transform only');

        labels = labels ? labels : {};

        for (let key in this){
            if (labels[key] !== undefined)
                this[key].data = labels[key];
            else if(colAttr[key] && colAttr[key].sum)
                this[key].data = colAttr[key].sum(this[key].children);
            else if(this[key].children.same())
                this[key].data = this[key].children[0];
            else
                this[key].data = "...";
        }

        return this;
    }
})

/**
 * Object.prototype.unzip
 * ==========================
 * unzip an object created from Array.prototype.zip.
 * When unzipping, the value calculated by the user-defined sum function
 * will be omitted.
 * 
 * @returns {Array} the array before applying transform.
 */
Object.defineProperty(Object.prototype, 'unzip', {
    value : function(){
        return this.gid.map((e, i) => {
            let record = this.map((k, v) => v.children[i]);
            if (Array.isArray(e))
                record.gid = e;
        })
    },
    writable: false // Array have function with same name.
})