import React, { useEffect, useRef, useState } from "react";

const StoreName = ({ name }) => {
  const nameRef = useRef(null);
  const [fontSize, setFontSize] = useState(18); // 기본 폰트 크기

  useEffect(() => {
    const adjustFontSize = () => {
      if (nameRef.current) {
        let parentWidth = nameRef.current.parentElement.offsetWidth;
        let elementWidth = nameRef.current.scrollWidth;

        let newFontSize = 18; // 기본 폰트 크기
        while (elementWidth > parentWidth && newFontSize > 12) {
          newFontSize -= 1; // 폰트 크기 1씩 줄이기
          nameRef.current.style.fontSize = `${newFontSize}px`;
          elementWidth = nameRef.current.scrollWidth;
        }
        setFontSize(newFontSize);
      }
    };

    adjustFontSize();
    window.addEventListener("resize", adjustFontSize);
    return () => window.removeEventListener("resize", adjustFontSize);
  }, [name]);

  return (
    <p
      ref={nameRef}
      style={{
        marginTop: "6px",
        marginBottom: "0px",
        fontSize: `${fontSize}px`,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        fontWeight: "bold",
      }}
    >
      {name}
    </p>
  );
};

export default StoreName;
