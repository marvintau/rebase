import React from 'react';
import styled from 'styled-components';
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete";

const Wrapper = styled.div`
    line-height: 25px;
    font-family: 'TheSansMono Office', 'Consolas', 'Pingfang SC', 'Microsoft Yahei', monospace;
    ${({isTitle}) => isTitle ? 'font-size: 100%; font-weight: 700;' : 'font-weight: 300;'}
`

const Item = ({ entity: name }) => <div style={{margin: '5px'}}>{name}</div>;

export default class RefString extends React.Component{

    render() {
    
        let {paths, data, isRowEditing} = this.props;
    
        const display = (data) => {
            let ast = data.display();
    
            let refName = <b>{ast.refName}{ast.refName ? ' @ ' : ''}</b>;
    
            let refBody;
            if('func' in ast.refBody){
                refBody = <b style={{color: 'red'}}>{ast.refBody.func}</b>
            } else if ('path' in ast.refBody){
                let path;
                if(ast.refBody.path){
                    path = ast.refBody.path.map((e,i) => {
                        let jux = e.map((el, j) => <span key={j}>{j == 0 ? '' : ' & '}<b style={{color: 'blue'}}>{el}</b></span>);
                        return <span key={i}> / {jux}</span>
                    })
                }
                
                let valExpr = <span key={'expr'}><b>{ast.refBody.valExpr}</b></span>;
    
                refBody = [path, path ? ' : ' : '', valExpr];
            }
    
            return <Wrapper>{refName}{refBody}</Wrapper>
        }
    
        if(!isRowEditing){
            return display(data);
        } else {
            return <ReactTextareaAutocomplete
            style={{width: '80%', height: '80%', border:'1px solid black', borderRadius:'5px', outline:'none', resize: 'none', padding: '10px', fontSize: '110%', fontFamily: 'TheSansMono Office'}}
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

                        let options = paths.map(e => e.get('ccode_name')),
                            filtered = options.filter(e => e.includes(token));

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
            value={data.valueOf()}
            onChange={e => {
                data.string = e.target.value;
            }}
          />
        }
    }
}
