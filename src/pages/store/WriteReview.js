import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import instance from "../../api/axios";
import Header from "../Header";
import "../css/WriteReview.css";

const WriteReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { storeName, targetId, targetObject } = location.state;
  const storeId = 1; // 서버에서 사용하는 storeId (예제용)

  const [rating, setRating] = useState(0);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewImageList, setReviewImageList] = useState([]);

  // 별점 선택 핸들러
  const handleRating = (score) => setRating(score);

  // 이미지 삭제 핸들러
  const handleImageRemove = (indexToRemove) => {
    const fileToRemove = reviewImageList[indexToRemove];
    URL.revokeObjectURL(fileToRemove);
    setReviewImageList((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  // 리뷰 이미지 추가 핸들러
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setReviewImageList((prev) => [...prev, ...files]);
  };

  // 드래그 종료 핸들러
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedList = Array.from(reviewImageList);
    const [movedItem] = reorderedList.splice(result.source.index, 1);
    reorderedList.splice(result.destination.index, 0, movedItem);

    setReviewImageList(reorderedList);
  };

  // 서버로 리뷰 등록
  const handleReviewSubmit = async () => {
    if (!rating || !reviewContent) {
      alert("별점과 리뷰 내용을 작성해주세요.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("rating", rating);
      formData.append("reviewContent", reviewContent);
      formData.append("targetId", targetId);
      formData.append("targetObject", targetObject);

      // 파일 리스트 추가 (인덱스 없이 동일한 키로 추가)
      reviewImageList.forEach((file) => {
        formData.append("reviewImageList", file);
      });

      await instance.post(`/stores/${storeId}/reviews`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("리뷰가 등록되었습니다!");
      navigate("/home");
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("리뷰 등록에 실패했습니다.");
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
            onChange={(e) => setReviewContent(e.target.value)}
          />

          {/* 리뷰 이미지 업로드 */}
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
                  {reviewImageList.map((file, index) => (
                    <Draggable
                      key={file.name}
                      draggableId={file.name}
                      index={index}
                    >
                      {(provided) => (
                        <img
                          src={URL.createObjectURL(file)}
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
        {/* 등록하기 버튼 */}
        <button
          className="store-detail-reserve-button"
          onClick={handleReviewSubmit}
        >
          등록하기
        </button>
      </div>
    </div>
  );
};

export default WriteReview;
