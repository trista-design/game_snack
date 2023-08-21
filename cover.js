const cover = document.getElementById("gameCover");

// 確保JS程式碼在頁面載入時立即被執行
document.addEventListener("DOMContentLoaded", function () {
  // 遊戲封面設置
  let title = document.querySelector(".title");
  let sub = document.querySelector(".subtitle");

  const time_line = new TimelineMax();

  time_line
    .fromTo(title, 2, { opacity: 0 }, { opacity: 1, ease: Power2.easeInout })
    .fromTo(
      sub,
      2,
      { opacity: 0 },
      { opacity: 1, ease: Power2.easeInout },
      "-=1.5"
    );
  window.addEventListener("keydown", (e) => {
    //  key: " "
    if (e.key == " " && e.target == document.body) {
      // 確保空白鍵按下時不是在輸入文字的狀態
      e.preventDefault();
      // 執行頁面跳轉
      window.location.href = document.getElementById("myGame").href;
    }
  });
});
