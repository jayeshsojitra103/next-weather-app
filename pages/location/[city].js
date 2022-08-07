import React from "react";
import cities from "../../lib/city.list.json";
import moment from "moment-timezone";
import Link from "next/link";
import Error from 'next/error'
import TodaysWeather from "../../component/TodaysWeather";
import HourlyWeather from "../../component/HourlyWeather";
import WeeklyWeather from "../../component/WeeklyWeather";
import SearchBox from "../../component/SearchBox";
import Head from "next/head";

export async function getServerSideProps(context) {
  const city = getCity(context?.params?.city);
  if (!city) {
    return {
      notFound: true,
    };
  }
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${city?.lat}&lon=${city?.lng}&appid=${process.env.API_KEY}&exclude=minutely&units=metric`
  );
  const data = await res?.json();
  const errorCode = res?.ok ? false : res?.status;

  if (!data) {
    return {
      notFound: true,
    };
  }

  const hourlyWeather = getHourlyWeather(data?.hourly, data?.timezone);
  return {
    props: {
      errorCode,
      errorMessage: res?.statusText,
      city: city,
      dailyWeather: data?.daily || {},
      hourlyWeather: hourlyWeather || {},
      timezone: data?.timezone || '',
    }
  };
}


const getCity = (param) => {
  const cityParam = param.trim();
  // get the id of the city
  const splitCity = cityParam.split("-");
  const id = splitCity[splitCity.length - 1];
  if (!id) {
    return null;
  }
  const city = cities.find((city) => city.id.toString() === id);
  if (city) {
    return city;
  } else {
    return null;
  }
};

const getHourlyWeather = (hourlyData, timezone) => {
  if (timezone) {
    const endofDay = moment().tz(timezone).endOf("day").valueOf();
    const endTimeStamp = Math.floor(endofDay / 1000);

    const todaysData = hourlyData.filter((data) => data.dt < endTimeStamp);

    return todaysData;
  }

};

const City = ({ city, timezone, dailyWeather, hourlyWeather, errorCode, errorMessage }) => {

  if (errorCode) {
    return <Error statusCode={errorCode} title={errorMessage} />;
  }
  return (
    <div>
      <Head>
        <title>{city.name} Weather - Next Weather App</title>
      </Head>
      <div className="page-wrapper">
        <div className="container">
          <Link href="/">
            <span className="back-link">&larr; Home</span>
          </Link>
          <SearchBox placeholder="Search for another location" />

          <TodaysWeather
            city={city}
            weather={dailyWeather[0]}
            timezone={timezone}
          />
          <HourlyWeather hourlyWeather={hourlyWeather} timezone={timezone} />
          <WeeklyWeather weeklyWeather={dailyWeather} timezone={timezone} />
        </div>
      </div>
    </div>
  );
}
export default City;