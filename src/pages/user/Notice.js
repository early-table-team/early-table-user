import Header from "../HeaderV3";
import Footer from "../Footer";

const Notice = () => {
  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
          <Header navText="공지사항" navLink="/mypage" />
        </div>

        <div className="home"></div>

        <div className="footer-container">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Notice;
