import React from "react";

const StoreSlider = ({ stores, handleCardClick }) => (
  <div className="stores-slider">
    {stores.map((store, index) => (
      <div
        key={index}
        className="store-card"
        onClick={() => handleCardClick(store)}
        style={{ cursor: "pointer" }}
      >
        <img src={store.image} alt={store.name} className="store-image" />
        <p className="home-store-name">{store.name}</p>
      </div>
    ))}
  </div>
);

export default StoreSlider;
