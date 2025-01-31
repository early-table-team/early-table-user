import React from "react";

const PriceFilter = ({
  customPrice,
  handleCustomPriceChange,
  handleSetFilter,
  handleFocus,
  handlePriceButtonClick,
}) => {
  return (
    <div className="price-filter">
      {/* 상단의 가격대 버튼들 */}
      <div className="price-buttons">
        <button
          className="price-button"
          onClick={() => handlePriceButtonClick(1)}
        >
          1만원대
        </button>
        <button
          className="price-button"
          onClick={() => handlePriceButtonClick(3)}
        >
          3만원대
        </button>
        <button
          className="price-button"
          onClick={() => handlePriceButtonClick(5)}
        >
          5만원대
        </button>
        <button
          className="price-button"
          onClick={() => handlePriceButtonClick(10)}
        >
          10만원 이상
        </button>
      </div>

      {/* 가격 입력 필드 */}
      <div className="custom-price">
        <label>최소 가격</label>
        <div className="input-container-min">
          <input
            type="text"
            value={customPrice.min}
            onChange={(e) => handleCustomPriceChange(e, "min")}
            onFocus={() => handleFocus("min")}
            min="0"
            pattern="\d*"
          />
          <span>만원</span>
        </div>

        <label>최대 가격</label>
        <div className="input-container-max">
          <input
            type="text"
            value={customPrice.max}
            onChange={(e) => handleCustomPriceChange(e, "max")}
            onFocus={() => handleFocus("max")}
            min="0"
            pattern="\d*"
          />
          <span>만원</span>
        </div>
      </div>

      {/* 설정하기 버튼 */}
      <button className="set-filter-button" onClick={handleSetFilter}>
        설정하기
      </button>
    </div>
  );
};

export default PriceFilter;
