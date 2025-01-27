import React from "react";
import { useNavigate } from "react-router-dom";

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();

  // 클릭 핸들러
  const handleCardClick = () => {
    navigate("/stores/keyword", { state: { keyword: category.name } });
  };

  return (
    <div className="category-card" onClick={handleCardClick}>
      <img
        src={category.image}
        alt={category.name}
        className="category-image"
      />
      <p className="category-name">{category.name}</p>
    </div>
  );
};

export default CategoryCard;
