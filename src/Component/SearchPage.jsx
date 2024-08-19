import React, { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { FiMapPin, FiSearch, FiChevronDown } from "react-icons/fi";
import axios from "axios";
import WWButton from "./WWbutton";
import GymCard from "./GymCard";

import data from "../../data";
import cityData from "../../cityData";

// import api from "../../api/axios";

let BASEAPI = `https://ww-backend-btb7.onrender.com/`;
let sortedBy = `gyms?sort_by=`;

const SearchPage = () => {
  const [gyms, setGyms] = useState([]);
  const [error, setError] = useState("");
  const [loaded, setIsLoaded] = useState(false);

  const dataRef = useRef({});

  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [citiesLoaded, setCitiesLoaded] = useState(false); // New state variable
  // const [selectedPosition, setSelectedPosition] = useState(null);
  const [currentPosition, setCurrentPosition] = useState({});
  const dropdownRef = useRef(null);

  //set the height of the dropdown
  const divRef = useRef(null);

  const [page, setPage] = useState(1);
  const bottom = useRef(null);

  // useEffect(() => {
  //   fetchCities();
  // }, []);

  // --------------------------

  useEffect(() => {
    dataRef.current = gyms;
  }, [gyms]);

  //

  // this will fetch the data on the basis of current position
  useEffect(() => {
    // if (selectedCity) fetchGymsInTheCity();
    // setGyms(data.slice(0, page));
    fetchData();
  }, [currentPosition]);

  useEffect(() => {
    // if (selectedCity) fetchGymsInTheCity();
    // setGyms(data.slice(0, page));
    fetchNextData();
  }, [page]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  async function fetchMorePosts(dataRef) {
    if (dataRef.current.totalPages > 1)
      flushSync(() => {
        setPage((no) => no + 1);
      });
  }

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchMorePosts(dataRef);
      }
    });
    observer.observe(bottom.current);
  }, []);

  // -----------------------------
  // useEffect(() => {
  //   if (citiesLoaded) {
  //     getCurrentLocation();
  //   }
  // }, [citiesLoaded]);

  //to handle the dropdown close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    if (divRef.current) {
      divRef.current.style.height = `${window.innerHeight - 150}px`;
    }
  }, [dropdownOpen]);

  const searchGymsByName = (e) => {
    const name = e.target.value;
    if (name) {
      const filtered = gyms.gyms.filter((gym) =>
        gym.gym_name.toLowerCase().includes(name.toLowerCase())
      );
      setFilteredGyms(filtered);
    } else setFilteredGyms(gyms);
  };

  const fetchCities = async () => {
    // try {
    //   const res = await api.get(`/cities`);
    //   setCities(res.data);
    //   setCitiesLoaded(true);
    // } catch (error) {
    //   console.log(error);
    // }
    setCities(cityData);
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setSelectedPosition({ latitude: city.latitude, longitude: city.longitude });
    setDropdownOpen(false);
    // Add any additional logic for when a city is selected
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // findNearestCity(latitude, longitude);
          setCurrentPosition({ latitude: 19.076, longitude: 72.8777 });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const findNearestCity = (latitude, longitude) => {
    const nearestCity = cities.reduce((prev, curr) => {
      const prevDistance = haversineDistance(
        latitude,
        longitude,
        prev.latitude,
        prev.longitude
      );
      const currDistance = haversineDistance(
        latitude,
        longitude,
        curr.latitude,
        curr.longitude
      );
      return prevDistance < currDistance ? prev : curr;
    });

    setSelectedCity(nearestCity);
  };

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchData = async (filterByattribute = false, targetAttribute = "") => {
    try {
      let response;

      const { latitude, longitude } = currentPosition;
      if (filterByattribute) {
        // response = await axios.get(
        //   `${BASEAPI}gyms?latitude=${latitude}&longitude=${longitude}&sort_by=${targetAttribute}`
        // );
        response = await axios.get(
          `${BASEAPI}gyms?sort_by=${targetAttribute}&order_by=asc`
        );
        setPage(1);
      } else {
        response = await axios.get(`${BASEAPI}gyms?order_by=asc`);
        // response = await axios.get(
        //   `${BASEAPI}gyms?latitude=${latitude}&longitude=${longitude}&order_by=asc`
        // );
      }

      if (response.data.total) {
        setGyms(response.data);

        setError("");
      } else {
        throw new Error("Sorry ! There is No gym near your location");
      }
    } catch (e) {
      console.log("error:", e.message);
      setError(e.message);
    } finally {
      setIsLoaded(true);
    }
  };

  const fetchNextData = async () => {
    if (loaded) {
      let response = await axios.get(
        `${BASEAPI}gyms?page=${page}&order_by=asc`
      );
      let responseGymData = response.data.gyms;
      setGyms({ ...response.data, gyms: [...gyms.gyms, ...responseGymData] });
    }
  };

  const sortedByAttribute = (e) => {
    let tragetAttribute = e.target.name.toLowerCase();
    fetchData(true, tragetAttribute);
  };

  return (
    <div className="searchPage w-full min-h-screen bg-black mx-auto px-4">
      <div className="w-11/12 flex mx-auto items-center justify-between p-3 bg-black flex-col lg:flex-row">
        <div
          className="flex items-center justify-between space-x-2 p-3 "
          style={{ flexBasis: "50%" }}
        >
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-red-600 no-scrollbar text-white py-2 px-4 flex justify-center items-center lg:min-w-60"
            >
              <FiMapPin className="w-5 h-5 mr-2" />
              <span className="text-white">{selectedCity.name}</span>
              <FiChevronDown className="w-5 h-5 ml-2" />
            </button>
            {dropdownOpen && (
              <div
                ref={divRef}
                className="absolute mt-2 w-full bg-red-600 shadow-lg z-10 overflow-auto"
              >
                {cities.map((city) => (
                  <div
                    key={city.id}
                    onClick={() => handleCityChange(city)}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-800 hover:text-white"
                  >
                    {city.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative w-full">
            <input
              type="text"
              id="gymName"
              name="gymName"
              placeholder="Search GYM"
              className="w-full px-3 py-2 pr-10 border bg-wwbg text-white focus:outline-none focus:border-red-500"
              onChange={searchGymsByName}
            />
            <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
          </div>
        </div>
        <div
          className="sort-by flex items-center gap-3"
          style={{ flexBasis: "30%" }}
        >
          <WWButton variant="v1" minWidth="8rem" text="Sort By" />
          <WWButton
            variant="v3"
            minWidth="4rem"
            text="Distance"
            className="rounded-full"
            onClick={(e) => sortedByAttribute(e)}
          />
          <WWButton
            variant="v3"
            minWidth="4rem"
            text="Time"
            className="rounded-full"
            onClick={(e) => sortedByAttribute(e)}
          />
          <WWButton
            variant="v3"
            minWidth="4rem"
            text="Price"
            className="rounded-full"
            onClick={(e) => sortedByAttribute(e)}
          />
          <WWButton
            variant="v3"
            minWidth="4rem"
            text="Rating"
            className="rounded-full"
            onClick={(e) => sortedByAttribute(e)}
          />
        </div>
      </div>
      {!loaded && (
        <div className="text-red-600 font-bold flex justify-center ">
          loading...
        </div>
      )}
      {error && (
        <div className="text-red-600 font-bold flex justify-center ">
          {error}
        </div>
      )}
      {loaded && !error && (
        <div className="w-11/12 mx-auto grid lg:grid-cols-3 md:grid-cols-2 gap-x-5 gap-y-8 md:mt-8">
          {gyms?.gyms?.map((gym, index) => (
            <GymCard
              key={index}
              gymName={gym.gym_name}
              imageSrc={gym.images[0]}
              rating={gym.average_rating}
              gymId={gym._id}
            />
          ))}
          {gyms?.totalPages > page && (
            <div className="text-red-600 font-bold">loading...</div>
          )}
        </div>
      )}
      <div ref={bottom} />
    </div>
  );
};

export default SearchPage;
