import React, { useState, useEffect } from "react";
import Autosuggest from "react-autosuggest";
import { useSharedContext } from "../SharedContextProvider";
import { msearch } from "../utils";

export default function Rule({ fields, operators, combinators, ...props }) {
  const [{ url, headers }] = useSharedContext();
  const [combinator, setCombinator] = useState(props.combinator);
  const [field, setField] = useState(props.field);
  const [operator, setOperator] = useState(props.operator);
  const [value, setValue] = useState(props.value);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    props.onChange({ field, operator, value, combinator, index: props.index });
  }, [field, operator, value, combinator]);

  const combinatorElement = props.index ? (
    <select
      className="react-es-rule-combinator"
      value={combinator}
      onChange={e => setCombinator(e.target.value)}
    >
      {combinators.map(c => (
        <option key={c.value} value={c.value}>
          {c.text}
        </option>
      ))}
    </select>
  ) : null;

  const deleteButton = props.index ? (
    <button className="react-es-rule-delete" onClick={() => props.onDelete(props.index)}>
      x
    </button>
  ) : null;

  let input = null;
  if (operators.find(o => o.value === operator && o.useInput)) {
    // Autocomplete zone.
    if (props.autoComplete) {
      input = (
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={async ({ value }) => {
            const terms = { field, include: `.*${value}.*`, order: { _count: "desc" }, size: 10 };
            const query = { query: { match_all: {} }, aggs: { [field]: { terms } }, size: 0 };

            const suggestions = await msearch(
              url,
              [{ queries: [query], id: "queryBuilder" }],
              headers
            );
            console.log("suggestions", suggestions);
            setSuggestions(suggestions.responses[0].aggregations[field].buckets.map(e => e.key));
          }}
          onSuggestionsClearRequested={() => setSuggestions([])}
          getSuggestionValue={suggestion => suggestion}
          renderSuggestion={suggestion => <div>{suggestion}</div>}
          inputProps={{
            value,
            onChange: (event, { newValue }) => setValue(newValue),
            className: "react-es-rule-value",
            autoComplete: "new-password"
          }}
        />
      );
    } else {
      input = (
        <input
          className="react-es-rule-value"
          value={value}
          autoComplete="new-password"
          onChange={e => setValue(e.target.value)}
        />
      );
    }
  }
  return (
    <div className="react-es-rule">
      {combinatorElement}
      <select
        className="react-es-rule-field"
        value={field}
        onChange={e => setField(e.target.value)}
      >
        {fields.map(f => {
          return (
            <option key={f.value} value={f.value}>
              {f.text}
            </option>
          );
        })}
      </select>
      <select
        className="react-es-rule-operator"
        value={operator}
        onChange={e => setOperator(e.target.value)}
      >
        {operators.map(o => {
          return (
            <option key={o.value} value={o.value}>
              {o.text}
            </option>
          );
        })}
      </select>
      {input}
      <button className="react-es-rule-add" onClick={props.onAdd}>
        +
      </button>
      {deleteButton}
    </div>
  );
}
