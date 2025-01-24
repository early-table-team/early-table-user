import React from "react";

const CategoryCard = ({ category }) => (
  <div className="category-card">
    <img src={category.image} alt={category.name} className="category-image" />
    <p className="category-name">{category.name}</p>
  </div>
);

export default CategoryCard;
