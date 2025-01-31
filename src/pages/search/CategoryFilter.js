import React from "react";

const CategoryFilter = ({ filters, selectedFilters, handleFilterChange }) => {
  return (
    <div className="category-filter">
      <div className="category-buttons">
        {filters.storeCategories.map((category, index) => (
          <div key={index} className="category-container">
            <button
              className={`category-button ${
                selectedFilters.category === category.name ? "selected" : ""
              }`}
              onClick={() => {
                handleFilterChange("category", category.name);
              }}
            >
              {category.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
