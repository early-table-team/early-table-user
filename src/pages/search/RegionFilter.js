import React, { useState } from "react";

const RegionFilter = ({
  filters,
  selectedRegion,
  handleRegionSelect,
  handleBottomRegionDoubleClick,
}) => {
  const [expandedRegion, setExpandedRegion] = useState(null);

  return (
    <div className="region-filter">
      <div className="region-buttons">
        {filters.regions.map((region, index) => (
          <div key={index} className="region-container">
            <button
              className={`region-button ${
                selectedRegion === region.topRegion ? "selected" : ""
              }`}
              onClick={() => {
                handleRegionSelect(region.topRegion);
                const newExpandedRegion = region.topRegion;
                setExpandedRegion(newExpandedRegion);
              }}
            >
              {region.topRegion.split(" (")[1].slice(0, -1)}{" "}
              {/* 한국어 이름만 추출 */}
            </button>
          </div>
        ))}
      </div>

      {/* 상위 지역을 클릭했을 때 새로운 영역에 하위 지역 버튼들이 표시됨 */}
      {filters.regions.map((region, index) =>
        expandedRegion === region.topRegion ? (
          <div key={index} className="sub-region-section">
            <div className="sub-regions-wrapper">
              {Array.isArray(region.bottomRegions) ? (
                region.bottomRegions.length > 0 ? (
                  <div className="sub-regions-container">
                    {region.bottomRegions.map((subRegion, subIndex) => (
                      <button
                        key={subIndex}
                        className="sub-region-button"
                        onClick={() =>
                          handleBottomRegionDoubleClick(
                            region.topRegion,
                            subRegion
                          )
                        }
                      >
                        {subRegion.split(" (")[1].slice(0, -1)}{" "}
                        {/* 한국어 이름만 추출 */}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="no-sub-regions">하위 지역이 없습니다</div>
                )
              ) : region.bottomRegions ? (
                region.bottomRegions.split(", ").map((subRegion, subIndex) => (
                  <button
                    key={subIndex}
                    className="sub-region-button"
                    onClick={() =>
                      handleBottomRegionDoubleClick(region.topRegion, subRegion)
                    }
                  >
                    {subRegion.split(" (")[1].slice(0, -1)}{" "}
                    {/* 한국어 이름만 추출 */}
                  </button>
                ))
              ) : (
                <div className="no-sub-regions">하위 지역이 없습니다</div>
              )}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
};

export default RegionFilter;
