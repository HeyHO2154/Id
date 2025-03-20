import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif !important; /* 폰트 전체 강제 */
    font-size: 16px; /* 원하는 크기로 변경 가능 */
    line-height: 1.4; /* 가독성을 위해 줄 간격 조절 */
  }

  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    background-color:rgb(240, 240, 240); /* 원하는 배경색으로 변경 */
  }

  #root {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .app-container {
    width: 100%;
    max-width: 600px;
    height: var(--app-height, 100vh);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid #ddd;
    position: relative;
    transition: height 0.3s ease-in-out;
    background-color: white; /* 원하는 배경색으로 변경 */
  }

  .navbar {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 600px;
    background-color: white;
    z-index: 100;
    padding-bottom: env(safe-area-inset-bottom);
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  }

  .navbar.hidden {
    transform: translateX(-50%) translateY(100%); /* 터치하지 않을 때 숨김 */
  }
`;

export default GlobalStyle;
