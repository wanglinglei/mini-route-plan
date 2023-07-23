let context;
let canvas;
let x = 0;
let y = 0;
let speedX = 1;
let speedY = 1;
let totalLength = 0;
const points = [{ x: 10, y: 10 }, { x: 30, y: 50 }, { x: 80, y: 130 }, { x: 200, y: 200 }, { x: 300, y: 300 }, { x: 150, y: 400 }];
let segmentsLengths = [];// 分段长度集合
let lengthsUpToPoint = [];// 每段长度累加集合
let segment = 0;
let amount = 0;
let targetPercent = 0.5; // 目标百分比
let animationId;
let image;
Page({
  onLoad(query) {
    // 页面加载
    console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
  },
  onReady() {
    // 页面加载完成
  },
  onShow() {
    // 页面显示
  },
  move() {
    if (x > 380 || x < 0) {
      speedX = -speedX;
    }
    if (y > 380 || y < 0) {
      speedY = -speedY;
    }
    x += speedX;
    y += speedY;

    context.clearRect(0, 0, 400, 400);
    context.fillStyle = '#658473';
    context.fillRect(x, y, 20, 20);
    // context.draw();

  },

  /**
   * @description: canvas 初始化回调
   * @return {*}
   */
  onCanvasReady() {
    // this.move()
    my.createSelectorQuery().select('#canvas').node().exec((res) => {
      canvas = res[0].node
      const ctx = canvas.getContext('2d')
      context = ctx;
      console.log('%ccanvas-ctx', 'color:red', ctx);
      ctx.fillStyle = "blue";
      ctx.fillRect(10, 10, 100, 100);
      // this.move();
      //       setInterval(() => {
      //   this.move();
      // }, 1)
      this.createCharacterImage()
      this.createRouteLine(points);
      this.calculateRouteTotalLength(points);
      this.calculateSegmentsLengths(points);
      this.getCurrentSegment(targetPercent);

      setTimeout(()=>{
      this.createAnimation();

      },3000)
    })
  },
  /**
   * @description: 创建人物图片
   * @return {*}
   */
  createCharacterImage() {
    image = context.createImage();
    image.src = 'https://cdn-esport-pro.hangzhou2022.cn/h22/20200903112929302100120023700968.png';
    image.onload = () => {
      // let tempX = points[0].x/2;
      // let tempY = points[0].y/2;
      let tempX = points[0].x / 2;
      let tempY = points[0].y / 2;
    this.drawCharacterImage(tempX,tempY);
    }
  },
  drawCharacterImage(tempX,tempY){
    context.drawImage(image, tempX, tempY, image.width * 0.1, image.height * 0.1);
    console.log('%c人物图片绘制完成', 'color:red')
  },
  /**
   * @description: 绘制路线路径
   * @param {*} points
   * @return {*}
   */
  createRouteLine(points) {
    if (points.length) {
      for (let i = 0; i < points.length - 1; i++) {
        context.beginPath();
        context.moveTo(points[i].x, points[i].y);
        context.lineTo(points[i + 1].x, points[i + 1].y);
        context.stroke();
      }
      console.log('%c路线路径绘制完成', 'color:green')
    }
  },
  /**
   * @description: 计算路线总长度
   * @param {*} points
   * @return {*}
   */
  calculateRouteTotalLength(points) {
    for (let i = 0; i < points.length - 1; i++) {
      totalLength += this.calculatePointLength(points[i], points[i + 1]);
    }
    console.log('%c计算路线长度:', 'color:gold', totalLength)
  },
  /**
   * @description: 计算每段长度
   * @param {*} points
   * @return {*}
   */
  calculateSegmentsLengths(points) {
    segmentsLengths = points.slice(1).map((point, i) => {
      return this.calculatePointLength(points[i], point)
    })
    lengthsUpToPoint = segmentsLengths.reduce((acc, cur) => [...acc, cur + acc[acc.length - 1]], [0]);
    console.log('%c计算每段长度:', 'color:skyblue', segmentsLengths, lengthsUpToPoint)
  },
  /**
   * @description: 找到目标百分比对应的长度
   * @param {*} targetPercent
   * @return {*}
   */
  getCurrentSegment(targetPercent) {
    for (let i = 0; i < lengthsUpToPoint.length; i++) {
      if (lengthsUpToPoint[i] >= totalLength * targetPercent) {
        segment = i - 1;
        amount = (totalLength * targetPercent - lengthsUpToPoint[segment]) / segmentsLengths[segment];
        break;
      }
    }
    console.log('%c计算百分比对应长度:', 'color:yellow', segment, amount)
  },
  /**
   * @description: 计算坐标点之间的长度
   * @param {*} points
   * @return {*}
   */
  calculatePointLength(point1, point2) {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  },

  createAnimation() {
    context.clearRect(0, 0, 600, 600);
    this.createRouteLine(points);
    console.error("createAnimation",points,segment,amount)

    let tempX = points[segment].x + (points[segment + 1].x - points[segment].x) * amount;
    let tempY = points[segment].y + (points[segment + 1].y - points[segment].y) * amount;
    this.drawCharacterImage(tempX,tempY);
    if(segment===points.length-2){
      canvas.cancelAnimationFrame(animationId)
      return 
    }
    if (segment <= points.length - 2 || amount !== 1) {
      amount += 0.005;
      if (amount > 1) {
        amount = 0;
        segment++;
      }
      animationId=canvas.requestAnimationFrame(this.createAnimation.bind(this))
    }else{
      canvas.cancelAnimationFrame(animationId)

    }
  }
});
