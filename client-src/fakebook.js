function randomString(len){
    return Math.random().toString(36).substr(2, len);
}

function generateCategories(len){
    let res = [];

    for (let i = 0; i < len; i++) {
        let pos = Math.ceil(Math.random()*res.length + 5);
        if (pos >= res.length)
            res.push(randomString(4));
        else
            res.push(res[pos] + randomString(2));
    }

    res.sort();

    return res.map((e) => ({ccode: e, mb: Math.random(), mc: Math.random(), md: Math.random()}));
    
}

let cate = generateCategories(500);
