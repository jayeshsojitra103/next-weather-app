import React, { useState, useEffect } from "react";
import cities from "../lib/city.list.json";
import Link from "next/link";
import Router from "next/router";


const SearchBox = ({ placeholder }) => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState([]);

  useEffect(() => {
    const clearQuery = () => setQuery("");
    Router.events.on("routeChangeComplete", clearQuery);

    return () => {
      Router.events.on("routeChangeComplete", clearQuery);
    };
  }, []);

  //Search City name
  const onSearchCityChange = (e) => {
    const { value } = e.target;
    setQuery(value);
    let matchingCities = [];
    if (value.length > 3) {
      for (let city of cities) {
        if (matchingCities.length >= 5) {
          break;
        }
        const match = city?.name
          ?.toLowerCase()
          ?.startsWith(value?.toLowerCase());

        if (match) {
          const cityData = {
            ...city,
            slug: `${city.name.toLowerCase().replace(/ /g, "-")}-${city.id}`,
          };
          matchingCities.push(cityData);
        }
      }
    }
    return setResult(matchingCities);
  };


  return (
    <div className="search">
      <input
        placeholder={placeholder ? placeholder : ""}
        type="text"
        value={query}
        onChange={onSearchCityChange}
      />
      {query?.length > 3 && (
        <ul>
          {result?.length > 0 ? (
            result.map((city) => {
              return (
                <li key={city?.slug}>
                  <Link href={`/location/${city?.slug}`}>
                    <a>
                      {city?.name}
                      {city?.state ? `-,${city?.state}` : ""}
                      -
                      <span>{city?.country}</span>
                    </a>
                  </Link>
                </li>
              );
            })
          ) : (
            <li className="search__no_results">No Results found</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default SearchBox;