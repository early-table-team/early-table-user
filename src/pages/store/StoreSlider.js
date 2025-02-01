import React from "react";

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
        <p className="home-store-name">{store.name}</p>
        <p className="home-store-start">
          ⭐{store.starPoint}
          {"("}
          {store.reviewCount}
          {")"}
          {"  "} {store.category}
        </p>
      </div>
    ))}
  </div>
);

export default StoreSlider;
