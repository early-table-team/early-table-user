import React, { useState } from "react";

const AllergyFilter = ({
  filters,
  selectedAllergyCategory,
  handleAllergyCategorySelect,
  handleAllergyStuffDoubleClick,
}) => {
  const [expandedAllergyCategory, setExpandedAllergyCategory] = useState(null);

  return (
    <div className="allergy-filter">
      <div className="allergy-buttons">
        {filters.allergyStuff.map((allergy, index) => (
          <div key={index} className="allergy-container">
            <button
              className={`allergy-button ${
                selectedAllergyCategory === allergy.Category ? "selected" : ""
              }`}
              onClick={() => {
                handleAllergyCategorySelect(allergy.Category);
                const newExpandedAllergyCategory = allergy.Category;
                setExpandedAllergyCategory(newExpandedAllergyCategory);
              }}
            >
              {allergy.Category}
            </button>
          </div>
        ))}
      </div>

      {/* 알러지 카테고리를 클릭했을 때 하위 원재료 버튼들이 표시됨 */}
      {filters.allergyStuff.map((allergy, index) =>
        expandedAllergyCategory === allergy.Category ? (
          <div key={index} className="sub-allergy-section">
            <div className="allergy-substances-wrapper">
              {Array.isArray(allergy.Stuff) ? (
                allergy.Stuff.length > 0 ? (
                  <div className="allergy-substances-container">
                    {allergy.Stuff.map((stuff, stuffIndex) => (
                      <button
                        key={stuffIndex}
                        className="substance-button"
                        onClick={() =>
                          handleAllergyStuffDoubleClick(allergy.Category, stuff)
                        }
                      >
                        {stuff}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="no-substances">알러지 원재료가 없습니다</div>
                )
              ) : allergy.Stuff ? (
                allergy.Stuff.split(", ").map((stuff, stuffIndex) => (
                  <button
                    key={stuffIndex}
                    className="substance-button"
                    onClick={() =>
                      handleAllergyStuffDoubleClick(allergy.Category, stuff)
                    }
                  >
                    {stuff}
                  </button>
                ))
              ) : (
                <div className="no-substances">알러지 원재료가 없습니다</div>
              )}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
};

export default AllergyFilter;
