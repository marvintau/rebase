/**
 *  LOCUS
 *  ============
 *  a toolset for manipulating primitive javascript data.
 */

/**
     * Flatten a nested object structure into single-layer, by preserving the 
     * path by concatenating the keys with delimiter.
     * 
     * @example {a: {b: 1, c: 2, f: {d:4, g: 5}}} -> {a-b:1, a-c:2, a-f-d:4, a-f-g:5}
     * 
     * @param {Object} obj the data object
     * @param {string} prefix prefix
     * @param {string} delim delimiter
     * @returns {Object} a "flattened" object.
     */

 export function flat (data, prefix, delim){
    
    let newPrefix = (prefix ? prefix + delim : "");
     
    let result = {};
    for (let key in data) {
        if (data[key] && data[key].constructor === Object)
            Object.assign(result, flat(data[key], newPrefix+key, delim));
        else
            Object.assign(result, {[newPrefix +key] : data[key]})
    }

    return result;
}

/**
 * 
 * @param {Object} data 
 */
export function layer(data) {

    let delim = "-",
        flatObj = flat(data, "", delim);

    let keys    = Object.keys(flatObj),
        layers  = [],
        allDone = array => array.every(e => e.lastIndexOf(delim) < 0);
    
    // split the string into two parts at the last delimiter
    let splitAtLastDelim = (str, delim, pos) =>
        (pos = str.indexOf(delim)) == -1 ? 
        {most: str, rest: str} :
        {most: str.slice(0, pos), rest:str.slice(pos+1)};

    for(;!allDone(keys);){
        let splits = keys.map(e => splitAtLastDelim(e, delim));
        layers.push(splits.map(e=>e.most));
        keys = splits.map(e => e.rest);
    }
    layers.push(keys);

    return layers;
}
