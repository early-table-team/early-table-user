import React from "react";
import StoreName from "./StoreName";

const StoreSlider = ({ stores, handleCardClick }) => (
  <div className="stores-slider">
    {stores.map((store, index) => (
      <div
        key={index}
        className="store-card"
        onClick={() => handleCardClick(store.id)}
        style={{ cursor: "pointer" }}
      >
        <img src={store.image} alt={store.name} className="store-image" />
        <StoreName name={store.name} />
        <p className="home-store-start">
          ⭐{store.starPoint}
          {"("}
          {store.reviewCount}
          {")"}
          {"  "} <span className="store-category-box">{store.category}</span>
        </p>
      </div>
    ))}
  </div>
);

export default StoreSlider;
