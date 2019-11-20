import React from 'react';

import Autosuggest from 'react-autosuggest';

const displayStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    lineHeight: '25px',
    overflow: 'hidden',
    fontWeight: '400',
}

const toCurrency = (number) => {
    return number.toLocaleString({
        style:'currency',
        minimumFractionDigits:2,
        maximumFractionDigits:2
    })
}

const titleStyle = (level=1) => {
    return {
        fontSize: `${100+(3 - level)*10}%`,
        fontWeight: 'bold'
    }
}

const dataStyle = (type='NORMAL') => {
    let color = {
        'WARN'   : '#ffc017',
        'ERROR'  : '#dc3545',
        'NORMAL' : '#f8f9fa'
    }[type];

    return {
        fontSize: '110%',
        borderRadius: '5px',
        textAlign: 'right',
        minWidth: '50px' ,
        padding: '0 5px',
        fontWeight: 'bold',
        fontFamily: 'Arial Narrow',
        background: color,
    };
}

export default class RefString extends React.Component{

    constructor(props){
        super(props);

        this.state = {
            string : props.data.string,
            suggestions: []
        }
    }

    getSuggestions = (value) => {

        let {paths} = this.props;

        if(value.match(/\/(.*)$/)){
            let path = value.split('/').slice(1),
                {list} = paths.findBy('ccode_name', path);

            let candidates = list.map(({cols:{ccode_name}}) => ccode_name.valueOf()),
                accurated = path.length === 0 ? [] : path[path.length - 1].split('').map(char => candidates.filter(e => e.includes(char))).flat();
            
            return accurated.length === 0 ? candidates : accurated;

        } else if (value.endsWith(':')){
            return [
                '借方', '贷方', '借方-贷方', '贷方-借方', '期初', '期末', '期初+借方-贷方', '期初+贷方-借方'
            ]
        } else {
            return []
        }
    }

    renderSuggestion = (sugg) => <div>{sugg.toString()}</div>

    getSuggestionValue = (sugg) => sugg;

    onChange = (e, {newValue}) => {
        if(e.type == 'keydown'){
            // preventing the options replaces all text during selecting
            // with up/down key;
            return;
        }
        this.props.data.string = newValue;
        this.setState({
            string: newValue
        })
    }

    onSuggestionsFetchRequested = ({ value }) => {
        this.setState({
            suggestions: this.getSuggestions(value)
        });
    };
    
      // Autosuggest will call this function every time you need to clear suggestions.
    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });
    };

    onSuggestionSelected = (e, {suggestionValue}) => {
        
        this.props.data.string += suggestionValue;

        let {string} = this.state;

        this.setState({
            string: string + suggestionValue
        });
    }
    render() {
    
        let {data, isRowEditing} = this.props;
        let {string, suggestions} = this.state;
    
        let res;
        if(!isRowEditing){

            let title = data.desc
                    ? <div style={titleStyle(data.desc.match(/#/g).length)}>{data.desc.replace(/#/g, '')}</div>
                    : <div>{data.string}</div>

            res = <div style={displayStyle} key={'disp'}>
                {title}
                <div style={dataStyle(data.type)}>{!isNaN(data.value) ? toCurrency(data.value): data.value}</div>
            </div>

        } else {

            res = <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                onSuggestionSelected={this.onSuggestionSelected}
                getSuggestionValue={this.getSuggestionValue}
                renderSuggestion={this.renderSuggestion}
                inputProps={{
                    placeholder: '请按引用字串的约定进行修改',
                    onChange: this.onChange,
                    value: string
                }}
              />;
        }

        return res;
    }
}
