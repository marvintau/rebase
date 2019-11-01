import React from 'react';
import styled from 'styled-components';
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete";

const Display = styled.div`
    line-height: 25px;
    overflow: hidden;
    font-family: 'TheSansMono Office', 'Consolas', 'Pingfang SC', 'Microsoft Yahei', monospace;
    ${({isTitle}) => isTitle ? 'font-size: 100%; font-weight: 700;' : 'font-weight: 300;'}
`

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
`

const Item = ({ entity: name }) => <div style={{margin: '5px'}}>{name}</div>;

export default class RefString extends React.Component{

    render() {
    
        let {paths, data, isRowEditing} = this.props;
    
        const display = (data) => {

            let ast = data.display();
    
            let refName = <b>{ast.refName}{ast.refName ? '@' : ''}</b>;
    
            let refBody;
            if('func' in ast.refBody){
                refBody = <b style={{color: 'red'}}>{ast.refBody.func}</b>
            } else if ('path' in ast.refBody){
                let path;
                if(ast.refBody.path){
                    path = ast.refBody.path.map((e,i) => {
                        let jux = e.map((el, j) => <span key={j}>{j == 0 ? '' : '&'}<b style={{color: 'blue'}}>{el}</b></span>);
                        return <span key={i}>/{jux}</span>
                    })
                }
                
                let valExpr = <span key={'expr'}><b>{ast.refBody.valExpr}</b></span>;
    
                refBody = [path, path ? ':' : '', valExpr].flat();
            }
    
            return <Display key={'disp'}>{refName}{refBody}</Display>
        }
    
        let res = [display(this.props.data)];

        if(isRowEditing){
            let text = <ReactTextareaAutocomplete
            key={'text'}
            style={{width: '80%', height: '80%', border:'1px solid black', borderRadius:'5px', outline:'none', resize: 'none', padding: '10px', fontSize: '110%', fontFamily: 'TheSansMono Office', marginBottom:'5px'}}
            dropdownStyle={{width: '80%', height: '300px', overflowY: 'scroll', border: '1px solid black', borderRadius: '5px', backgroundColor: 'white',  zIndex: 99999}}
            containerStyle={{width: '100%', height: '100px', zIndex:99999}}
            loadingComponent={() => <span>Loading</span>}
            trigger={{
                ':' : {
                    dataProvider: token => {
                        return ['借方', '贷方', '借方-贷方', '贷方-借方']
                    },
                    component: Item,
                    output: (item, trigger) => `:${item}`
                },
                '/' : {
                    dataProvider: token => {

                        // 这里我们提供路径搜索的方法较为复杂，不是很直观。解释如下：

                        // 1. 我们先获得当前的字符串，textarea里获得不到，我们要找data.string
                        //    按/划分后去掉第一个（肯定为空的字符串），就得到了一个路径的array
                        //    of string，也就是path
                        let path = data.string.replace(/\s/g, '').split('/').slice(1);
                        console.log(path);
                        // 2. 现在沿着这个path来寻找。如果path中的第一级出现在一级科目中，
                        //    那么向path提供的suggestion就应该是path所指的一级科目下属的
                        //    二级科目。以此类推。
                        let options = paths, found;
                        for (let elem of path){
                            found = paths.find(e => e.get('ccode_name') == elem);
                            console.log(paths.map(e => e.get('ccode_name')), elem, found, 'found');
                            if(found === undefined){
                                break;
                            } else {
                                options = found.heir;
                            }
                        }
                        options = options.map(e => e.get('ccode_name'));
                        
                        // 3. 当得到了path所指的当前级别的所有科目名称后，如果存在关键字匹配
                        //    我们只保留匹配的科目，否则提供全部的科目。
                        let filtered = options.filter(e => [...token].some(t=>e.includes(t)));

                        if (filtered.length > 0){
                            options = filtered;
                        }

                        return options;
                    },
                    component: Item,
                    output: (item, trigger) => `/${item}`
                }
            }}
            ref={(rta) => { this.rta = rta; } }
            onInput={e => {
                data.string = e.target.value;
            }}
          />
            res.push(text);
        }

        return <Wrapper>{res}</Wrapper>;
    }
}
