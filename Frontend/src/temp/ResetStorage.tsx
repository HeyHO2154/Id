import React from "react";

const ResetStorage: React.FC = () => {
  const clearLocalStorage = () => {
    localStorage.clear(); // 로컬 스토리지의 모든 데이터 초기화
    alert("로컬 스토리지의 모든 데이터가 초기화되었습니다.");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>로컬 스토리지 초기화</h1>
      <button
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#f44336",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={clearLocalStorage}
      >
        초기화
      </button>
    </div>
  );
};

export default ResetStorage;
