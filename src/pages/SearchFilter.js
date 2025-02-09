import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css"; // 기본 스타일
import HeaderV2 from "./HeaderV2";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useNavigate } from "react-router-dom";
import "./css/SearchFilter.css";
import RegionFilter from "./search/RegionFilter";
import AllergyFilter from "./search/AllergyFilter";
import CategoryFilter from "./search/CategoryFilter";
import PriceFilter from "./search/PriceFilter";

const FilterScreen = () => {
  const navigate = useNavigate();
  const [selectedFilters, setSelectedFilters] = useState({
    searchWord: null,
    region: null,
    price: null,
    category: null,
    allergies: [],
  });

  const [filters, setFilters] = useState({
    regions: [],
    storeCategories: [],
    allergyCategories: [],
    allergyStuff: [],
  });
  const token = localStorage.getItem("accessToken");
  useEffect(() => {
    // API 호출하여 필터 데이터 받아오기
    axios
      .get("https://api.earlytable.kr/users/search/init", {
        headers: {
          Authorization: `Bearer ${token}`, // 토큰을 Authorization 헤더에 추가
        },
      })
      .then((response) => {
        setFilters({
          regions: response.data.regions,
          storeCategories: response.data.storeCategories,
          allergyCategories: response.data.allergy,
          allergyStuff: response.data.allergyStuff,
        });
      })
      .catch((error) => {
        console.error("필터 데이터 로드 실패:", error);
        navigate("/login");
      });
  }, [navigate, token]);

  const handleFilterChange = (type, value) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [type]: value || null,
    }));
  };

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedAllergyCategory, setSelectedAllergyCategory] = useState("");

  const [activeIndex, setActiveIndex] = useState(0);

  const swiperRef = useRef(null); // Swiper 인스턴스 참조

  const handleSearch = async () => {
    const region = selectedFilters.region || null; // selectedFilters.region 값을 가져옵니다.
    let priceRange = selectedFilters.price || null;
    const storeCategory = selectedFilters.category || null;

    // priceRange를 문자열로 강제 변환
    priceRange = String(priceRange);

    let regionTop = null;
    let regionBottom = null;

    if (region) {
      // region이 null이 아닌 경우에만 처리
      const regionParts = region.split(" - ");
      regionTop = regionParts[0] ? regionParts[0].split(" (")[0] : null;
      regionBottom = regionParts[1] ? regionParts[1].split(" (")[0] : null;
    }

    let minPrice = null;
    let maxPrice = null;

    if (typeof priceRange === "string" && priceRange) {
      const manWonMatch = priceRange.match(/(\d+)\s*만원대/);
      if (manWonMatch) {
        const price = Number(manWonMatch[1]);
        if (!isNaN(price)) {
          minPrice = price * 10000;
          maxPrice = (price + 1) * 10000 - 1;
        }
      } else if (priceRange.includes("~")) {
        const rangeMatch = priceRange.match(/(\d+)\s*만원\s*~\s*(\d+)\s*만원/);
        if (rangeMatch) {
          const min = Number(rangeMatch[1]);
          const max = Number(rangeMatch[2]);
          if (!isNaN(min) && !isNaN(max)) {
            minPrice = min * 10000;
            maxPrice = max === 0 ? null : max * 10000 - 1;
          }
        }
      } else {
        const aboveMatch = priceRange.match(/(\d+)\s*만원\s*이상/);
        if (aboveMatch) {
          const min = Number(aboveMatch[1]);
          if (!isNaN(min)) {
            minPrice = min * 10000;
            maxPrice = null;
          }
        }
      }
    }

    const storeCategoryObj = filters.storeCategories.find(
      (category) => category.name === storeCategory
    );
    const storeCategoryCode = storeCategoryObj ? storeCategoryObj.code : null;

    const allergyCategories = selectedFilters.allergies.map(
      (allergy) => allergy.category
    );
    const allergySubstances = selectedFilters.allergies.map(
      (allergy) => allergy.stuff
    );

    // 필터 값들을 서버에 보낼 데이터 객체로 변환
    const requestData = {
      searchWord: selectedFilters.searchWord || null,
      regionTop: regionTop || null,
      regionBottom: regionBottom || null,
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
      storeCategory: storeCategoryCode || null,
      allergyCategory: allergyCategories || null, // 알러지 카테고리 배열
      allergyStuff: allergySubstances || null,
    };

    console.log("보낼 데이터:", requestData);

    navigate("/searchResult", { state: requestData });
  };

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.activeIndex); // 슬라이드 변경 시 activeIndex 업데이트
  };

  const handleTextClick = (index) => {
    // 텍스트 클릭 시 해당 슬라이드로 이동
    if (swiperRef.current) {
      swiperRef.current.swiper.slideTo(index); // 클릭한 인덱스로 슬라이드 이동
      setActiveIndex(index); // 현재 슬라이드 상태 업데이트
    }
  };

  const handleRegionSelect = (region) => {
    // 상위 지역을 클릭했을 때
    setSelectedRegion(region);
  };

  const handleBottomRegionDoubleClick = (topRegion, bottomRegion) => {
    const fullRegion = `${topRegion} - ${bottomRegion}`;
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      region: fullRegion,
    }));
  };

  const handleFilterRemove = (type) => {
    // 특정 필터를 삭제하는 함수
    setSelectedFilters((prev) => ({
      ...prev,
      [type]: null,
    }));
  };

  const handleAllergyCategorySelect = (category) => {
    setSelectedAllergyCategory(category);
  };

  const handleAllergyStuffDoubleClick = (category, stuff) => {
    setSelectedFilters((prevFilters) => {
      const allergiesArray = Array.isArray(prevFilters.allergies)
        ? prevFilters.allergies
        : [];
      const existingIndex = allergiesArray.findIndex(
        (item) => item.category === category && item.stuff === stuff
      );

      if (existingIndex !== -1) {
        // 이미 선택된 항목이 있으면 제거
        return {
          ...prevFilters,
          allergies: allergiesArray.filter(
            (item, index) => index !== existingIndex
          ),
        };
      } else {
        // 새로운 선택 항목 추가
        return {
          ...prevFilters,
          allergies: [...allergiesArray, { category, stuff }],
        };
      }
    });
  };

  const [customPrice, setCustomPrice] = useState({ min: "", max: "" });

  // 가격대 선택 버튼 처리
  const handlePriceButtonClick = (price) => {
    // 가격이 10인 경우 "10만원 이상", 그 외에는 "만원대"로 설정
    const priceLabel = price === 10 ? "10만원 이상" : `${price}만원대`;

    // 새 가격대만 반영 (기존 선택된 값 삭제 후 새로 추가)
    setSelectedFilters((prev) => ({
      ...prev,
      price: [priceLabel], // 가격대 필터를 새로 선택된 가격대만 반영하도록 설정
    }));
  };

  // 가격 입력 필드 처리
  const handleCustomPriceChange = (e, field) => {
    let value = e.target.value;

    // 비어있으면 0으로 설정하고, 값이 숫자가 아닌 경우 처리
    if (value === "") {
      value = "0";
    } else if (isNaN(value)) {
      value = value.slice(0, -1); // 숫자가 아닌 문자는 제거
    }

    setCustomPrice((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  // 필터 설정하기 버튼 클릭 처리
  const handleSetFilter = () => {
    const filterPrices = [];

    // 최소 가격과 최대 가격이 모두 비어있다면 기본값 0으로 설정
    const minPrice = customPrice.min ? parseInt(customPrice.min, 10) : 0;
    const maxPrice = customPrice.max ? parseInt(customPrice.max, 10) : null;

    // 가격 유효성 검사
    if (maxPrice === null || minPrice <= maxPrice) {
      // maxPrice가 null일 때 적절하게 처리
      if (maxPrice === null) {
        filterPrices.push(`${minPrice}만원 이상`);
      } else {
        filterPrices.push(`${minPrice}만원 ~ ${maxPrice}만원`);
      }
    } else {
      // 유효하지 않은 가격일 경우 경고
      alert("최대 가격은 최소 가격보다 낮을 수 없습니다.");
      return;
    }

    // 기존 가격대 필터를 비우고 새 가격대 필터 추가
    setSelectedFilters((prev) => ({
      ...prev,
      price: filterPrices, // 기존 값을 지우고 새로 설정된 가격대만 반영
    }));
  };
  const handleFocus = (field) => {
    // 필드가 선택되면 해당 가격을 초기화
    setCustomPrice((prevState) => ({
      ...prevState,
      [field]: "",
    }));
  };

  // 입력 필드 상태 업데이트
  const handleInputChange = (event) => {
    const value = event.target.value;
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      searchWord: value,
    }));
  };

  // 엔터키를 누를 때 동작
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && selectedFilters.searchWord.trim() !== "") {
      // 입력 필드 초기화
      setSelectedFilters((prevFilters) => ({
        ...prevFilters,
        searchWord: null,
      }));
    }
  };
  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
          <HeaderV2 />
        </div>
        <div className="container">
          <div className="input-container">
            <input
              type="text"
              className="text-input"
              value={selectedFilters.searchWord || ""}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* 상단 필터 텍스트 */}
          <div className="filters">
            <div
              className={activeIndex === 0 ? "active" : ""}
              onClick={() => handleTextClick(0)} // 클릭 시 첫 번째 슬라이드로 이동
            >
              지역
            </div>
            <div
              className={activeIndex === 1 ? "active" : ""}
              onClick={() => handleTextClick(1)} // 클릭 시 두 번째 슬라이드로 이동
            >
              가격대
            </div>
            <div
              className={activeIndex === 2 ? "active" : ""}
              onClick={() => handleTextClick(2)} // 클릭 시 세 번째 슬라이드로 이동
            >
              카테고리
            </div>
            <div
              className={activeIndex === 3 ? "active" : ""}
              onClick={() => handleTextClick(3)} // 클릭 시 네 번째 슬라이드로 이동
            >
              알러지
            </div>
          </div>

          {/* 슬라이드 필터 영역 */}
          <Swiper
            ref={swiperRef}
            spaceBetween={10}
            slidesPerView={1}
            onSlideChange={handleSlideChange} // 슬라이드가 변경될 때마다 호출
          >
            {/* 지역 필터 */}
            <SwiperSlide>
              <RegionFilter
                filters={filters}
                selectedRegion={selectedRegion}
                handleRegionSelect={handleRegionSelect}
                handleBottomRegionDoubleClick={handleBottomRegionDoubleClick}
              />
            </SwiperSlide>

            {/* 가격대 필터 */}
            <SwiperSlide>
              <PriceFilter
                customPrice={customPrice}
                handleCustomPriceChange={handleCustomPriceChange}
                handleSetFilter={handleSetFilter}
                handleFocus={handleFocus}
                handlePriceButtonClick={handlePriceButtonClick}
              />
            </SwiperSlide>

            {/* 카테고리 필터 */}
            <SwiperSlide>
              <CategoryFilter
                filters={filters}
                selectedFilters={selectedFilters}
                handleFilterChange={handleFilterChange}
              />
            </SwiperSlide>

            {/* 알러지 필터 */}
            <SwiperSlide>
              <AllergyFilter
                filters={filters}
                selectedAllergyCategory={selectedAllergyCategory}
                handleAllergyCategorySelect={handleAllergyCategorySelect}
                handleAllergyStuffDoubleClick={handleAllergyStuffDoubleClick}
              />
            </SwiperSlide>
          </Swiper>
          {/* 하단 버튼 영역 */}

          {/* 선택된 필터 버튼들이 나타날 공간 */}
          <div className="selected-filters">
            {Object.entries(selectedFilters).map(([key, value]) => {
              if (key !== "searchWord" && value) {
                if (key === "allergies" && Array.isArray(value)) {
                  // 알러지 배열을 개별 요소로 렌더링
                  return value.map((allergy, index) => (
                    <div
                      key={`${key}-${index}`}
                      className="filter-value-button"
                    >
                      {`${allergy.category} - ${allergy.stuff}`}
                      <button
                        className="remove-filter-button"
                        onClick={() =>
                          handleAllergyStuffDoubleClick(
                            allergy.category,
                            allergy.stuff
                          )
                        }
                      >
                        ✖
                      </button>
                    </div>
                  ));
                } else if (typeof value === "string" && value.includes(" (")) {
                  // 지역 정보를 가진 경우, 한국어만 추출
                  const formattedValue = value
                    .split(" - ")
                    .map((regionPair) => {
                      return regionPair.split(" (")[1].slice(0, -1); // 한국어 이름만 추출
                    })
                    .join(" - "); // 상위-하위 지역을 '-'로 연결

                  return (
                    <div key={key} className="filter-value-button">
                      {formattedValue}
                      <button
                        className="remove-filter-button"
                        onClick={() => handleFilterRemove(key)}
                      >
                        ✖
                      </button>
                    </div>
                  );
                } else {
                  // 지역 정보가 아닌 경우, 기존 value 그대로 사용
                  return (
                    <div key={key} className="filter-value-button">
                      {value}
                      <button
                        className="remove-filter-button"
                        onClick={() => handleFilterRemove(key)}
                      >
                        ✖
                      </button>
                    </div>
                  );
                }
              }
              return null;
            })}
          </div>
        </div>
        <div className="buttons-container">
          <button className="filter-button" onClick={handleSearch}>
            조회하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterScreen;
