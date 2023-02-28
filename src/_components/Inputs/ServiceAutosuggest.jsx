import React from 'react';
import Autosuggest from 'react-autosuggest';
import { Package } from "src/_services";
export class ServiceAutosuggest extends React.Component {
  constructor() {
    super();

    this.state = {
      value: '',
      suggestions: [],
      isLoading: false
    };
    
    this.lastRequestId = null;
    this.getSuggestionValue = this.getSuggestionValue.bind(this);
    this.renderSuggestion = this.renderSuggestion.bind(this);

  }
  componentDidMount() {
    this.setValue()
  }
  getSuggestionValue(suggestion) {
    return suggestion[this.props.objKey || 'label'];
  }
  renderSuggestion(suggestion) {
    return (
      <span>{suggestion[this.props.objKey || 'label']}</span>
    );
  }
  setValue () {
    this.setState({
      value: this.props.defaultValue || ''
    });
  }
  loadSuggestions(value) {
    this.setState({
      isLoading: true
    });
    var query = { Keyword: value }
    new Package({
        ...query,
        Status: -1,
        PageSize: 20,
        pageNumber: 1,
        Limited: -1
      }).noLoading().all()
      .then(response => {
        var suggestions = [].concat(response.Results.map(e => {
          e.value = e.Id
          e.label = e.Code + ' - ' + e.Name
          e.name = e.Name
          e.code = e.Code
          return e
        }))
        this.setState({ suggestions })
        this.setState({
          isLoading: false
        });
      })
  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    });
    this.emitValue({
      target: {
        value: newValue,
        name: this.props.name
      }
    })
  };
  emitValue (val) {
    if (this.props.applyCallback) this.props.applyCallback(val)
    if (this.props.onChange) this.props.onChange(val)
  }
  onSuggestionsFetchRequested = ({ value }) => {
    this.loadSuggestions(value);
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: "Nhập Mã gói",
      value,
      onChange: this.onChange,
      className: 'form-control'
    };
    return (
      <div>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={this.renderSuggestion}
          inputProps={inputProps} />
      </div>
    );
  }
}