import fetch from "unfetch";
import qs from "qs";

// Search with msearch to elasticsearch instance
export function msearch(url, query) {
  return new Promise(async (resolve, reject) => {
    const rawResponse = await fetch(`${url}/_msearch`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/x-ndjson" },
      body: `{}\n${JSON.stringify(query)}\n`
    });
    const response = await rawResponse.json();
    resolve(response);
  });
}

// Build a query from an array of queries
export function queryFrom(queries) {
  return { bool: { must: queries.length === 0 ? [{ match_all: {} }] : queries } };
}

// Convert fields to term queries
export function toTermQueries(fields, selectedValues) {
  const queries = [];
  for (let i in fields) {
    for (let j in selectedValues) {
      queries.push({ term: { [fields[i]]: selectedValues[j] } });
    }
  }
  return queries;
}

export function fromUrlQueryString(str) {
  return new Map([
    ...Object.entries(qs.parse(str.replace(/^\?/, ""))).map(([k, v]) => [
      k,
      { value: JSON.parse(v) }
    ])
  ]);
}

export function toUrlQueryString(params) {
  return qs.stringify(
    Object.fromEntries(new Map(Array.from(params).map(([k, v]) => [k, JSON.stringify(v)])))
  );
}
