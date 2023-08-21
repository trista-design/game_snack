// 遊戲畫面設置
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
// getContext()會回傳canvas的drawing context，可用來畫圖
// 可去查RenderingContext2D - MDN 看如何畫圖
const unit = 30;
const row = canvas.height / unit; // 列：500/25 = 20 , X
const column = canvas.width / unit; // 行：800/25 = 32 , Y
const radian = Math.PI / 180;

// 按F5回到cover
window.addEventListener("keydown", (e) => {
  if (e.code == "F5") {
    e.preventDefault(); // 取消默認行為（重新整理）
    // 導向到其他頁面
    window.location.href = document.getElementById("myCover").href;
  }
  if (e.code === "KeyR" && e.metaKey) {
    e.preventDefault(); // 取消默認行為（重新整理）
    // 導向到其他頁面
    window.location.href = document.getElementById("myCover").href;
  }
});

window.addEventListener("keydown", changeDirection);
let d = "Right";
// key:ArrowDown , ArrowRight , ArrowUp , ArrowLeft
function changeDirection(e) {
  if (e.key == "ArrowRight" && d != "Left") {
    d = "Right";
  } else if (e.key == "ArrowLeft" && d != "Right") {
    d = "Left";
  } else if (e.key == "ArrowDown" && d != "Up") {
    d = "Down";
  } else if (e.key == "ArrowUp" && d != "Down") {
    d = "Up";
  }

  // 每次按下上下左右鍵之後，在下一幀被畫出來之前，
  // 不接受任何keydown事件
  // 這樣可以防止連續按鍵導致蛇在邏輯上自殺
  window.removeEventListener("keydown", changeDirection);
}

let score = 0;

class Snake {
  constructor() {
    this.createS = [
      { x: unit * 3, y: unit * 1, tL: 0, tR: 0, bR: 0, bL: 0 },
      { x: unit * 2, y: unit * 1, tL: 0, tR: 0, bR: 0, bL: 0 },
      { x: unit * 1, y: unit * 1, tL: 0, tR: 0, bR: 0, bL: 0 },
    ];
    this.Fruit = {
      x: Math.floor(Math.random() * column) * unit,
      y: Math.floor(Math.random() * row) * unit,
    };
    this.highestScore = 0; // 初始化最高分數為0
    this.loadHighestScore(); // 載入最高分數
  }

  // 網格
  grid() {
    // X
    for (let i = 0; i < column; i++) {
      ctx.beginPath();
      ctx.moveTo(unit * i - 0.5, 0);
      ctx.lineTo(unit * i - 0.5, canvas.height);
      ctx.strokeStyle = "#263EB5";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    // Y
    for (let i = 0; i < row; i++) {
      ctx.beginPath();
      ctx.moveTo(0, unit * i - 0.5);
      ctx.lineTo(canvas.width, unit * i - 0.5);
      ctx.strokeStyle = "#263EB5";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  // 開始畫蘋果
  drawFruit() {
    let { x, y } = this.Fruit;
    let grd = ctx.createRadialGradient(
      x + unit * 0.5,
      y + unit * 0.5,
      0,
      x + unit * 0.5,
      y + unit * 0.5,
      15
    );
    ctx.save();
    // 背景放射光
    ctx.beginPath();
    ctx.rect(x, y, unit, unit);
    grd.addColorStop(0.5, "rgba(255,255,255,0.4)");
    grd.addColorStop(1, "rgba(0,120,210,0.3)");
    ctx.fillStyle = grd;
    ctx.fill();
    // 蘋果身體
    ctx.beginPath();
    ctx.lineWidth = 0.5;
    ctx.arc(x + unit * 0.5, y + unit * 0.5, unit / 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#F23838";
    ctx.fill();
    //反光
    ctx.beginPath();
    ctx.roundRect(x + unit * 0.25, y + unit * 0.25, 8, 8, [50, 50, 50, 50]);
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(x + unit * 0.15, y + unit * 0.3, 8, 8, [50, 50, 50, 50]);
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fill();
    // 蘋果梗
    ctx.beginPath();
    ctx.strokeStyle = "#562A37";
    ctx.lineWidth = 1.5;
    ctx.arc(x + unit * 0.4, y - unit * 0.1, unit / 2, 45, radian * 100);
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = "#562A37";
    ctx.lineWidth = 1.5;
    ctx.arc(
      x + unit * 0.1,
      y + unit * 0.2,
      unit * 0.4,
      0.1 * Math.PI,
      radian * -45,
      true
    );
    ctx.stroke();
    // 蘋果葉子
    ctx.beginPath();
    ctx.fillStyle = "#3AAD3A";
    ctx.roundRect(x + unit * 0.1, y - unit * 0.05, 8, 6, [0, 50, 0, 50]);
    ctx.fill();

    ctx.restore();
  }

  // 如果碰到蘋果
  checkOverlap(newX, newY) {
    for (let i = 0; i < this.createS.length; i++) {
      if (newX == this.createS[0].x && newY == this.createS[0].y) {
        console.log("overlapping...");
        return true;
      }
    }
    return false; // 將return false移出for迴圈
  }

  // 重新選位置
  pickALocation() {
    let newX;
    let newY;
    let overlapping;

    do {
      console.log("蘋果的新座標：", this.Fruit.x, this.Fruit.y);
      newX = Math.floor(Math.random() * column) * unit;
      newY = Math.floor(Math.random() * row) * unit;
      overlapping = this.checkOverlap(newX, newY);
    } while (overlapping);

    this.Fruit.x = newX;
    this.Fruit.y = newY;
  }

  // 畫蛇部分
  // 蛇頭
  sHead(x, y) {
    // 蛇舌頭
    ctx.beginPath();
    ctx.moveTo(x + 25, y + 8);
    ctx.lineTo(x + 35, y + 8);
    ctx.lineTo(x + 25, y + 14);
    ctx.closePath();
    ctx.fillStyle = "#EF6262";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 25, y + 10);
    ctx.lineTo(x + 35, y + 16);
    ctx.lineTo(x + 25, y + 16);
    ctx.closePath();
    ctx.fillStyle = "#EF6262";
    ctx.fill();
    ctx.beginPath();
    ctx.rect(x + 25, y + 8, 3, 8);
    ctx.fillStyle = "#EF6262";
    ctx.fill();

    // 蛇頭
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, unit, unit, [0, 50, 50, 0]);
    ctx.fillStyle = "lightblue";
    ctx.fill();
    // 蛇眼(Left)
    ctx.beginPath();
    ctx.arc(
      x + unit * 0.5 - 0.5,
      y + unit * 0.2 + 0.5,
      unit / 5,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      x + unit * 0.6 - 0.5,
      y + unit * 0.2 + 0.5,
      unit / 10,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "black";
    ctx.fill();

    // 蛇眼(Right)
    ctx.beginPath();
    ctx.arc(
      x + unit * 0.5 - 0.5,
      y + unit * 0.8 - 0.5,
      unit / 5,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      x + unit * 0.6 - 0.5,
      y + unit * 0.8 - 0.5,
      unit / 10,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "black";
    ctx.fill();

    ctx.restore();
  }
  // 蛇身
  sBody(x, y) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, unit, unit);
    ctx.fillStyle = "lightBlue";
    ctx.fill();
    ctx.restore();
  }
  // 畫畫
  draw() {
    // 每次畫圖前，先確認蛇有沒有咬到自己
    for (let i = 1; i < this.createS.length; i++) {
      if (
        this.createS[i].x == this.createS[0].x &&
        this.createS[i].y == this.createS[0].y
      ) {
        clearInterval(myGame);
        alert("遊戲結束");
        return;
      }
    }

    // 背景填滿
    ctx.fillStyle = "#010256";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 網格
    this.grid();

    // 畫蛇
    for (let i = 0; i < this.createS.length; i++) {
      let { x, y, tL, tR, bR, bL } = this.createS[i];
      if (i == 0) {
        this.sHead(x, y);
      } else {
        this.sBody(x, y);
      }
    }
    this.move();
    this.drawFruit();
  }
  // 轉向
  rotate(x, y, r) {
    ctx.save();
    ctx.translate(x + unit, y);
    ctx.rotate(r * radian);
    ctx.translate(-x, -y);
    this.sHead(x, y); // 繪製新的蛇頭
    ctx.restore();
  }

  hide(x, y, c) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, unit, unit);
    ctx.fillStyle = c;
    ctx.fill();
    ctx.restore();
  }

  hideLine(x, y, c) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, unit - 12.5, unit - 8);
    ctx.fillStyle = c;
    ctx.fill();
    ctx.restore();
  }

  // 移動
  move() {
    let newX = this.createS[0].x;
    let newY = this.createS[0].y;
    let newX1 = this.createS[1].x;
    let newY1 = this.createS[1].y;
    // 前進方向
    if (d == "Right") {
      newX += unit;
    } else if (d == "Down") {
      this.hide(newX, newY, "#010256");
      this.hideLine(newX + unit, newY, "#010256");
      this.rotate(newX, newY, 90);
      this.sBody(newX1, newY1);
      newY += unit;
    } else if (d == "Up") {
      this.hide(newX, newY, "#010256");
      this.hideLine(newX + unit, newY, "#010256");
      this.rotate(newX - unit, newY + unit, 270);
      this.sBody(newX1, newY1);
      newY -= unit;
    } else if (d == "Left") {
      this.hide(newX, newY, "#010256");
      this.hideLine(newX + unit, newY, "#010256");
      this.rotate(newX, newY + unit, 180);
      this.sBody(newX1, newY1);
      newX -= unit;
    }
    // 穿牆
    if (newX >= canvas.width) {
      newX = 0;
    } else if (newX < 0) {
      newX = canvas.width - unit;
    } else if (newY >= canvas.height) {
      newY = 0;
    } else if (newY < 0) {
      newY = canvas.height - unit;
    }

    let newHead = { x: newX, y: newY };

    // 確認蛇是否有吃到蘋果
    if (
      this.createS[0].x == this.Fruit.x &&
      this.createS[0].y == this.Fruit.y
    ) {
      // 如吃到蘋果，蘋果換位置
      this.pickALocation();
      // 加分數
      score++;
      // 保留最高分數
      this.setHighestScore(score);
      // 分數更新在頁面
      document.getElementById("myScore").innerHTML = "SCORE：";
      document.getElementById("myScore2").innerHTML = score;
      document.getElementById("highestScore").innerHTML = "BEST：";
      document.getElementById("highestScore2").innerHTML = this.highestScore;
    } else {
      // 沒吃到，往前跑就扣一格尾巴
      this.createS.pop();
    }
    // 往前跑就加一格蛇頭
    this.createS.unshift(newHead);
    window.addEventListener("keydown", changeDirection);
  }

  // 算最高分數
  loadHighestScore() {
    if (localStorage.getItem("highestScore") == null) {
      this.highestScore = 0;
    } else {
      this.highestScore = Number(localStorage.getItem("highestScore"));
    }
  }
  // 存最高分
  setHighestScore(score) {
    if (score > this.highestScore) {
      localStorage.setItem("highestScore", score);
      this.highestScore = score;
    }
  }
}

let mySnake = new Snake();

mySnake.loadHighestScore();
document.getElementById("myScore").innerHTML = "SCORE：";
document.getElementById("myScore2").innerHTML = score;
document.getElementById("highestScore").innerHTML = "BEST：";
document.getElementById("highestScore2").innerHTML = mySnake.highestScore;

let myGame = setInterval(() => {
  mySnake.draw();
}, 100);
