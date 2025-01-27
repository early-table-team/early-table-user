import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import instance from "../../api/axios";
import Header from "../Header";
import "../css/WriteReview.css";

const ModifyReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    storeName,
    reviewId,
    rating: initialRating,
    reviewContent: initialReviewContent,
    reviewImageList: initialReviewImageList,
  } = location.state;

  const [rating, setRating] = useState(initialRating);
  const [reviewContent, setReviewContent] = useState(initialReviewContent);
  const [fileUrlList, setFileUrlList] = useState(initialReviewImageList);
  const [newReviewImageList, setNewReviewImageList] = useState([]);

  // 별점 선택 핸들러
  const handleRating = (score) => setRating(score);

  // 리뷰 내용 수정 핸들러
  const handleContentChange = (e) => setReviewContent(e.target.value);

  // 기존 이미지 삭제 핸들러
  const handleImageRemove = (indexToRemove) => {
    setFileUrlList((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setNewReviewImageList((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  // 새로운 이미지 추가 핸들러
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => URL.createObjectURL(file));
    const newFileNames = files.map((file) => file.name);

    setNewReviewImageList((prev) => [...prev, ...files]);
    setFileUrlList((prev) => [...prev, ...newFileNames]);
  };

  // 드래그 종료 핸들러
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedFileUrlList = Array.from(fileUrlList);
    const [movedItem] = reorderedFileUrlList.splice(result.source.index, 1);
    reorderedFileUrlList.splice(result.destination.index, 0, movedItem);

    setFileUrlList(reorderedFileUrlList);

    const reorderedNewReviewImageList = Array.from(newReviewImageList);
    const [movedImage] = reorderedNewReviewImageList.splice(
      result.source.index,
      1
    );
    reorderedNewReviewImageList.splice(result.destination.index, 0, movedImage);

    setNewReviewImageList(reorderedNewReviewImageList);
  };

  // 서버로 리뷰 수정 요청
  const handleReviewSubmit = async () => {
    if (!rating || !reviewContent) {
      alert("별점과 리뷰 내용을 작성해주세요.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("rating", rating);
      formData.append("reviewContent", reviewContent);
      newReviewImageList.forEach((file) =>
        formData.append("newReviewImageList", file)
      );
      fileUrlList.forEach((url) => formData.append("fileUrlList", url));

      await instance.put(`/reviews/${reviewId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("리뷰가 수정되었습니다!");
      navigate("/home");
    } catch (error) {
      console.error("Failed to update review:", error);
      alert("리뷰 수정에 실패했습니다.");
    }
  };

  return (
    <div className="app">
      <div className="review-write-container">
        <div className="header-container">
          <Header />
        </div>
        <div className="review-write">
          <h2>{storeName}</h2>
          {/* 별점 */}
          <div className="review-rating-container">
            {[1, 2, 3, 4, 5].map((score) => (
              <span
                key={score}
                className={`star ${score <= rating ? "filled" : ""}`}
                onClick={() => handleRating(score)}
              >
                ★
              </span>
            ))}
          </div>

          {/* 리뷰 내용 */}
          <textarea
            className="review-textarea"
            placeholder="리뷰 내용을 작성해주세요."
            value={reviewContent}
            onChange={handleContentChange}
          />

          {/* 이미지 업로드 */}
          <div className="review-images">
            <label className="review-image-upload-label">
              이미지 추가
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="review-image-upload-input"
              />
            </label>
          </div>

          {/* 이미지 프리뷰 드래그 앤 드롭 */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="imageList" direction="horizontal">
              {(provided) => (
                <div
                  className="review-image-preview-container"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {fileUrlList.map((src, index) => (
                    <Draggable
                      key={index}
                      draggableId={`${index}`}
                      index={index}
                    >
                      {(provided) => (
                        <img
                          src={
                            src.startsWith("http")
                              ? src
                              : URL.createObjectURL(src)
                          }
                          alt={`review-${index}`}
                          className="review-image-preview"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => handleImageRemove(index)}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        <button
          className="store-detail-reserve-button"
          onClick={handleReviewSubmit}
        >
          수정하기
        </button>
      </div>
    </div>
  );
};

export default ModifyReview;
