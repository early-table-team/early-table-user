import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./css/Banner.css";

import banner1 from "../assets/banner1.jpg";
import banner2 from "../assets/banner2.jpg";
import banner3 from "../assets/banner3.jpg";

const Banner = () => {
  const bannerImages = [
    { id: 1, src: banner1, alt: "배너 1" },
    { id: 2, src: banner2, alt: "배너 2" },
    { id: 3, src: banner3, alt: "배너 3" },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: false, // 화살표 비활성화
    draggable: true, // 드래그 가능하도록 설정
  };

  return (
    <div className="banner-container">
      <Slider {...settings}>
        {bannerImages.map((image) => (
          <div key={image.id}>
            <img src={image.src} alt={image.alt} className="banner-image" />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Banner;
